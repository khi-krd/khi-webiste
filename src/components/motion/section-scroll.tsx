"use client";

import { animate } from "motion";
import { useEffect } from "react";
import { SCROLL_EASE } from "@/lib/scroll-to-section";

/** A committed section change. The COMMIT is instant (see COMMIT_TRAVEL); this
 *  is only how long the travel itself takes, and it has to stay long enough to
 *  read as a glide rather than a cut. */
const STEP_DURATION = 0.62;

/** Correcting to the nearest section after a scroll that never committed —
 *  a smaller move than a section change, so a shorter one. */
const SETTLE_DURATION = 0.42;

/** Wheel silence that ends a gesture, including its momentum tail. */
const GESTURE_GAP_MS = 130;

/** Scroll silence before we glide to the nearest section. */
const SETTLE_IDLE_MS = 90;

/**
 * How far a continuous gesture has to travel before it commits to the next
 * section, as a share of the viewport.
 *
 * This is the whole feel of the thing. The page follows your fingers for the
 * first stretch, so it never reads as dead; past this point the intent is
 * unambiguous and it takes over and lands the section immediately, instead of
 * drifting on and only tidying up once you stop.
 */
const COMMIT_TRAVEL = 0.12;

/**
 * A wheel event is a discrete mouse notch (rather than a trackpad glide) when
 * it arrives in LINE units, or when a gesture OPENS at full notch size. Trackpad
 * gestures always ramp up from small deltas, so the first event of one is never
 * this large.
 */
const MOUSE_NOTCH_DELTA = 90;

/** Rough pixels per line, for browsers that report wheel deltas in lines. */
const LINE_HEIGHT = 16;

/**
 * Momentum only ever decays; a tail event whose delta GROWS past the previous
 * one by more than this jitter allowance is the user pushing again. That fresh
 * input chains straight into the next section instead of being swallowed with
 * the tail — waiting out a macOS momentum run before the page would listen
 * again is what "the scroll has delay" was.
 */
const TAIL_GROWTH = 4;

/** Tail deltas below this are noise, never a fresh push. */
const TAIL_FLOOR = 12;

/** Minimum ms between chained steps, so a hard wheel spin steps through
 *  sections at a readable pace instead of teleporting across the page. */
const CHAIN_COOLDOWN_MS = 160;

/**
 * Wheel delta in PIXELS, whatever units the browser reports.
 *
 * Firefox sends mouse wheels as lines (`deltaMode` 1, `deltaY` 3) where Chrome
 * sends pixels, so a raw `deltaY` is not comparable across browsers — nor even
 * across input devices in the same one.
 */
function pixelDelta(event: WheelEvent): number {
	if (event.deltaMode === 1) return event.deltaY * LINE_HEIGHT;
	if (event.deltaMode === 2) return event.deltaY * window.innerHeight;
	return event.deltaY;
}

/** Tolerance for "already parked at this edge", in px. */
const EPSILON = 2;

/**
 * How far the nearest section edge may be for a settle to happen, as a share of
 * the viewport. Sections one viewport tall are always within half a viewport of
 * an edge, so they always land; deep inside a LONGER section there is no pull,
 * and the reader is left where they stopped.
 */
const SETTLE_REACH = 0.6;

/**
 * A panel has to overflow by more than this to claim the wheel. A container
 * that is a handful of pixels short of fitting — a queue whose rows round up,
 * a horizontal carousel whose `overflow-x: auto` makes the browser compute
 * `overflow-y: auto` too — is not something anyone is trying to scroll, and
 * letting it swallow the gesture is what made the page refuse to move while the
 * pointer sat over a card.
 */
const SCROLLABLE_SLACK = 24;

/**
 * True when the pointer sits over something with its own scrollbar that has not
 * yet hit the end in this direction — a media carousel, the menu overlay, a
 * scrollable dialog. Those own the gesture.
 *
 * Looks for the nearest ancestor marked `data-wheel-scrollable` rather than
 * walking every ancestor with `getComputedStyle`. This runs on every wheel
 * event anywhere on the page — the listener is on `window` — and the old walk
 * called `getComputedStyle` plus `scrollHeight`/`clientHeight` on each node up
 * to `document.body`. `getComputedStyle` forces a synchronous style-and-layout
 * flush, the exact hot-path cost `useNativeQueueScroll` in video-card.tsx is
 * written to avoid — done here on EVERY notch, over EVERY part of the page,
 * that was the app-wide "two-finger scroll has delay" complaint. `closest()`
 * is a plain DOM-tree walk, so the common case — scrolling over ordinary
 * content with no scrollable ancestor — costs nothing.
 *
 * Any element that wants to claim the wheel over `<SectionScroll/>` (the video
 * queue, the nav drawer's panels, the header search results) carries the
 * marker itself; nothing here discovers it structurally.
 */
function insideScrollable(
	target: EventTarget | null,
	direction: 1 | -1,
): boolean {
	const node = target instanceof Node ? target : null;
	const element =
		node instanceof HTMLElement
			? node.closest<HTMLElement>("[data-wheel-scrollable]")
			: null;
	if (!element) return false;

	const overflow = element.scrollHeight - element.clientHeight;
	if (overflow <= SCROLLABLE_SLACK) return false;

	const room =
		direction === 1 ? overflow - element.scrollTop : element.scrollTop;
	return room > 1;
}

/**
 * Every offset the page is allowed to rest at, in document coordinates.
 *
 * Sections only — the footer is deliberately NOT a landing. The tail of the
 * page (last section → footer) reads as one continuous run, so it is left to
 * scroll freely instead of being snapped through.
 */
function landings(): number[] {
	const main = document.querySelector("main[data-snap-sections]");
	if (!main) return [];

	const elements: Element[] = Array.from(
		main.querySelectorAll(":scope > section"),
	);

	const scrollY = window.scrollY;
	const maxScroll = Math.max(
		0,
		document.documentElement.scrollHeight - window.innerHeight,
	);

	return elements.map((el) =>
		Math.min(maxScroll, Math.round(el.getBoundingClientRect().top + scrollY)),
	);
}

/**
 * Offset one section away from `scrollY`, or null when the browser should just
 * scroll.
 *
 * `scrollY` is passed in rather than read here: it has to be where the gesture
 * is TAKING the page, not where the page has got to. Firefox animates a wheel
 * scroll over ~150ms, so at the moment a gesture commits the document has
 * barely moved — reading the live offset there made every flick resolve against
 * the position it started from and land one header-height away, which is what
 * "the scroll is not working" was.
 */
function stepTarget(direction: 1 | -1, scrollY: number): number | null {
	const tops = landings();
	if (tops.length === 0) return null;

	const viewport = window.innerHeight;
	const documentHeight = document.documentElement.scrollHeight;
	const maxScroll = Math.max(0, documentHeight - viewport);

	// -1 = above the first section. The header sits in flow, so offset 0 is a
	// real resting place one header-height above where section one starts.
	let index = -1;
	for (let i = 0; i < tops.length; i += 1) {
		if (tops[i] <= scrollY + EPSILON) index = i;
	}

	if (direction === 1) {
		if (index === -1) return Math.min(tops[0], maxScroll);

		const nextTop = tops[index + 1];
		const currentBottom = nextTop ?? documentHeight;
		// A section taller than the viewport is read by scrolling THROUGH it.
		if (currentBottom - (scrollY + viewport) > EPSILON) return null;
		if (nextTop === undefined) return null;
		return Math.min(nextTop, maxScroll);
	}

	if (index === -1) return scrollY > EPSILON ? 0 : null;

	const currentTop = tops[index];
	const drift = scrollY - currentTop;
	if (drift > EPSILON) {
		// Once past the last section's head we are in the footer run — free.
		if (index === tops.length - 1) return null;
		// Part-way into a section, going back up means its head — but only when
		// that is a short hop. Deep inside a long section the reader is reading,
		// so leave them to scroll.
		return drift <= viewport ? currentTop : null;
	}

	const previousTop = tops[index - 1];
	if (previousTop === undefined) return scrollY > EPSILON ? 0 : null;

	// A taller previous section is entered at its FOOT, so going back up
	// reverses the way you came instead of teleporting over its content.
	return currentTop - previousTop > viewport + EPSILON
		? currentTop - viewport
		: previousTop;
}

/** Nearest resting offset, or null if none is close enough to pull toward. */
function settleTarget(): number | null {
	const tops = landings();
	if (tops.length === 0) return null;

	const scrollY = window.scrollY;
	const viewport = window.innerHeight;
	const documentHeight = document.documentElement.scrollHeight;
	const maxScroll = Math.max(0, documentHeight - viewport);

	let index = -1;
	for (let i = 0; i < tops.length; i += 1) {
		if (tops[i] <= scrollY + EPSILON) index = i;
	}

	// The last section runs on into the footer as one continuous tail — nothing
	// to snap to down there, so nothing pulls.
	if (index === tops.length - 1) return null;

	// Only the two edges of the section we are actually in are candidates.
	// Above the first section, the document top is the other one.
	const currentTop = index === -1 ? 0 : tops[index];
	const nextTop =
		index === -1
			? tops[0]
			: (tops[index + 1] ?? Math.max(maxScroll, currentTop));

	// Inside a section taller than the viewport the reader is READING, not
	// mis-parked. Pulling them to an edge from here would undo the scroll they
	// just made — which reads as the page refusing to move at all.
	if (nextTop - currentTop > viewport + EPSILON) return null;

	const reach = viewport * SETTLE_REACH;
	let best: number | null = null;
	let bestDistance = Number.POSITIVE_INFINITY;

	for (const candidate of [currentTop, Math.min(nextTop, maxScroll)]) {
		const distance = Math.abs(candidate - scrollY);
		if (distance < bestDistance) {
			bestDistance = distance;
			best = candidate;
		}
	}

	if (best === null || bestDistance <= EPSILON || bestDistance > reach) {
		return null;
	}
	return best;
}

/**
 * Eased section scrolling for the home page.
 *
 * It NEVER blocks a continuous gesture. An earlier version swallowed every
 * wheel event for the length of a step, which on a trackpad meant one swipe
 * moved one section and the remaining second of that swipe — momentum included
 * — did nothing at all. The page felt stuck. Two paths instead:
 *
 *  - A mouse-wheel notch is discrete and means "next section": it is taken over
 *    and animated on the house easing, which is the soft glide native CSS snap
 *    settles too fast to give.
 *  - A trackpad glide is continuous and means "move by this much": it is left
 *    entirely alone. When the gesture stops, the page eases to the nearest
 *    section rather than snapping to it.
 *
 * Native CSS snap stands down while this runs (see globals.css) so the two
 * never correct the same offset at once. Touch and reduced-motion never
 * activate this and keep native snapping.
 *
 * Renders nothing.
 */
export function SectionScroll() {
	useEffect(() => {
		const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
		const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)");
		if (reducedMotion.matches || !finePointer.matches) return;

		const root = document.documentElement;
		root.dataset.sectionScroll = "";

		let playback: { stop: () => void } | null = null;
		let animating = false;
		let settleTimer = 0;
		let lastWheelAt = 0;
		/** Set once a gesture has landed a section — its momentum tail gets
		 *  swallowed, but fresh input inside the tail chains the next step. */
		let steppingGesture = false;
		/** Whether the current gesture opened as a discrete mouse notch. */
		let gestureIsMouse = false;
		/** Where the running step animation is heading — chained steps resolve
		 *  from here, not from wherever the document has scrolled to so far. */
		let lastStepTarget = 0;
		/** |delta| of the previous tail event, to tell a decaying momentum run
		 *  from a fresh push that ramps up. */
		let lastTailMagnitude = 0;
		/** Fresh (growing) wheel travel accumulated inside a momentum tail. */
		let tailDelta = 0;
		/** No chained step before this timestamp. */
		let chainReadyAt = 0;
		/**
		 * Wheel distance this gesture has asked for, in pixels.
		 *
		 * Measured from the WHEEL, not from `window.scrollY`. Firefox animates a
		 * wheel scroll over ~150ms, so the scroll position lags well behind the
		 * gesture — reading travel off the document meant the commit fired late or
		 * not at all there, which is what "the scroll is not working" looked like.
		 * The wheel deltas are the user's intent and arrive immediately.
		 */
		let gestureDelta = 0;
		/** Scroll offset the current gesture started from. */
		let gestureOrigin = 0;
		/** Set once this gesture is known to have nowhere to commit to (a section
		 *  longer than the viewport), so its remaining events skip the geometry
		 *  read instead of measuring every section on every frame of a glide. */
		let gestureFreeScroll = false;

		const stop = () => {
			playback?.stop();
			playback = null;
			animating = false;
			delete root.dataset.sectionStepping;
		};

		const run = (top: number, duration: number) => {
			const from = window.scrollY;
			if (Math.abs(top - from) < 1) return;

			stop();
			window.clearTimeout(settleTimer);
			// Kills any smooth scroll the browser still has in flight. Firefox
			// animates a wheel scroll over ~150ms, so without this its animation and
			// ours push the same offset in different directions and the page judders
			// or appears to stick.
			window.scrollTo({ top: from, left: window.scrollX, behavior: "auto" });
			animating = true;
			// Freezes hover inside the sections for the length of the move. The
			// cursor stays put while the page travels under it, so it sweeps a whole
			// grid of cards and starts every one of their scale/brightness
			// transitions at once — that is what makes the glide stutter.
			root.dataset.sectionStepping = "";

			playback = animate(from, top, {
				duration,
				ease: SCROLL_EASE,
				onUpdate: (latest) => {
					window.scrollTo(window.scrollX, latest);
				},
				onComplete: () => {
					playback = null;
					animating = false;
					delete root.dataset.sectionStepping;
				},
			});
		};

		const scheduleSettle = () => {
			window.clearTimeout(settleTimer);
			settleTimer = window.setTimeout(() => {
				if (animating) return;
				const top = settleTarget();
				if (top !== null) run(top, SETTLE_DURATION);
			}, SETTLE_IDLE_MS);
		};

		const onWheel = (event: WheelEvent) => {
			// Pinch-zoom and horizontal intent are not section navigation.
			if (event.ctrlKey) return;
			if (Math.abs(event.deltaX) > Math.abs(event.deltaY)) return;
			if (event.deltaY === 0) return;

			const now = performance.now();
			const startsGesture = now - lastWheelAt > GESTURE_GAP_MS;
			lastWheelAt = now;

			const direction = event.deltaY > 0 ? 1 : -1;
			if (insideScrollable(event.target, direction)) {
				steppingGesture = false;
				return;
			}

			/** Where this gesture is taking the page once the browser catches up. */
			const projected = () => {
				const maxScroll = Math.max(
					0,
					document.documentElement.scrollHeight - window.innerHeight,
				);
				return Math.min(maxScroll, Math.max(0, gestureOrigin + gestureDelta));
			};

			const commit = () => {
				const top = stepTarget(direction, projected());
				// null = inside a section taller than the viewport. Scroll through it.
				if (top === null) {
					gestureFreeScroll = true;
					scheduleSettle();
					return false;
				}
				event.preventDefault();
				steppingGesture = true;
				lastStepTarget = top;
				tailDelta = 0;
				lastTailMagnitude = Math.abs(pixelDelta(event));
				chainReadyAt = now + CHAIN_COOLDOWN_MS;
				run(top, STEP_DURATION);
				return true;
			};

			if (!startsGesture) {
				if (steppingGesture) {
					// A step has landed. The momentum tail is swallowed — but fresh
					// input inside it must chain the next section, or the page ignores
					// every scroll until the tail dies out, which reads as pure delay.
					event.preventDefault();

					const delta = pixelDelta(event);
					const magnitude = Math.abs(delta);

					const chain = () => {
						if (now < chainReadyAt) return;
						const top = stepTarget(
							direction,
							animating ? lastStepTarget : window.scrollY,
						);
						if (top === null) {
							// Nothing to step to — a section taller than the viewport is
							// read by scrolling through it. Hand the gesture back so the
							// next events scroll natively instead of being swallowed.
							if (!animating) {
								steppingGesture = false;
								gestureFreeScroll = true;
								scheduleSettle();
							}
							return;
						}
						lastStepTarget = top;
						tailDelta = 0;
						chainReadyAt = now + CHAIN_COOLDOWN_MS;
						run(top, STEP_DURATION);
					};

					if (gestureIsMouse) {
						// Every further notch of a wheel spin is another deliberate step.
						chain();
					} else if (
						magnitude > lastTailMagnitude + TAIL_GROWTH &&
						magnitude > TAIL_FLOOR
					) {
						// Momentum only decays — a delta growing past the previous event
						// is the user pushing again. Accumulate that fresh travel and
						// step once it reads as intent, same bar as a first commit.
						if (Math.sign(delta) !== Math.sign(tailDelta)) tailDelta = 0;
						tailDelta += delta;
						if (Math.abs(tailDelta) >= window.innerHeight * COMMIT_TRAVEL) {
							chain();
						}
					}

					lastTailMagnitude = magnitude;
					return;
				}
				if (gestureFreeScroll) {
					scheduleSettle();
					return;
				}
				// A glide in progress. Follow the fingers until the travel makes the
				// intent unambiguous, then land the section rather than drifting on.
				gestureDelta += pixelDelta(event);
				if (Math.abs(gestureDelta) >= window.innerHeight * COMMIT_TRAVEL) {
					commit();
				} else {
					scheduleSettle();
				}
				return;
			}

			steppingGesture = false;
			gestureFreeScroll = false;
			gestureOrigin = window.scrollY;
			gestureDelta = pixelDelta(event);

			// A mouse notch is already a whole "next section" on its own — there is
			// no gesture to follow, so it commits on the spot.
			const isMouseNotch =
				event.deltaMode !== 0 || Math.abs(gestureDelta) >= MOUSE_NOTCH_DELTA;
			gestureIsMouse = isMouseNotch;
			if (isMouseNotch) {
				commit();
				return;
			}

			// Opening frame of a glide: hands off, it has travelled nothing yet.
			stop();
			scheduleSettle();
		};

		const onScroll = () => {
			// Ignore the scrolling we are producing ourselves. A settle scheduled by
			// anything else is harmless after a step: we landed exactly on a
			// section, so settleTarget() finds nothing to move to.
			if (animating) return;
			scheduleSettle();
		};

		// A direct grab of the scrollbar, or a key, hands control straight back.
		const onPointerDown = () => {
			steppingGesture = false;
			stop();
		};
		const onKeyDown = () => {
			steppingGesture = false;
			stop();
			scheduleSettle();
		};

		window.addEventListener("wheel", onWheel, { passive: false });
		window.addEventListener("scroll", onScroll, { passive: true });
		window.addEventListener("pointerdown", onPointerDown, { passive: true });
		window.addEventListener("keydown", onKeyDown, { passive: true });

		return () => {
			stop();
			window.clearTimeout(settleTimer);
			window.removeEventListener("wheel", onWheel);
			window.removeEventListener("scroll", onScroll);
			window.removeEventListener("pointerdown", onPointerDown);
			window.removeEventListener("keydown", onKeyDown);
			delete root.dataset.sectionScroll;
			delete root.dataset.sectionStepping;
		};
	}, []);

	return null;
}
