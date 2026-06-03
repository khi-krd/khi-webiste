"use client";

import Lenis from "lenis";
import { useEffect } from "react";
import { dispatchAppScroll } from "@/lib/scroll-events";

type Props = {
	children: React.ReactNode;
};

export function LenisProvider({ children }: Props) {
	useEffect(() => {
		const lenis = new Lenis({
			autoRaf: false,
			smoothWheel: true,
			// Softer follow — less “heavy” catch-up when scrolling into image-heavy sections.
			lerp: 0.08,
			wheelMultiplier: 0.9,
		});

		let isSnapping = false;
		let snapReleaseTimer = 0;

		const getSections = () =>
			Array.from(
				document.querySelectorAll<HTMLElement>("[data-scroll-section]"),
			).filter((section) => section.offsetParent !== null);

		const getClosestSectionIndex = (sections: HTMLElement[]) => {
			const currentScroll = window.scrollY;
			let closestIndex = 0;
			let smallestDistance = Number.POSITIVE_INFINITY;

			for (const [index, section] of sections.entries()) {
				const distance = Math.abs(section.offsetTop - currentScroll);
				if (distance < smallestDistance) {
					smallestDistance = distance;
					closestIndex = index;
				}
			}

			return closestIndex;
		};

		const onWheel = (event: WheelEvent) => {
			if (Math.abs(event.deltaY) < 10 || event.ctrlKey || isSnapping) return;

			const target = event.target as Element | null;
			if (target?.closest("[data-lenis-prevent]")) return;

			const sections = getSections();
			if (sections.length < 2) return;

			event.preventDefault();
			const currentIndex = getClosestSectionIndex(sections);
			const direction = event.deltaY > 0 ? 1 : -1;
			const nextIndex = Math.min(
				sections.length - 1,
				Math.max(0, currentIndex + direction),
			);
			const nextSection = sections[nextIndex];
			if (!nextSection || nextIndex === currentIndex) return;

			isSnapping = true;
			lenis.scrollTo(nextSection, { duration: 1, immediate: false });

			window.clearTimeout(snapReleaseTimer);
			snapReleaseTimer = window.setTimeout(() => {
				isSnapping = false;
			}, 1050);
		};

		lenis.on("scroll", (event) => {
			dispatchAppScroll({
				scroll: event.scroll,
				direction: event.direction,
			});
		});

		let rafId = 0;

		const raf = (time: number) => {
			lenis.raf(time);
			rafId = requestAnimationFrame(raf);
		};

		rafId = requestAnimationFrame(raf);
		window.addEventListener("wheel", onWheel, { passive: false });

		return () => {
			window.removeEventListener("wheel", onWheel);
			window.clearTimeout(snapReleaseTimer);
			cancelAnimationFrame(rafId);
			lenis.destroy();
		};
	}, []);

	return children;
}
