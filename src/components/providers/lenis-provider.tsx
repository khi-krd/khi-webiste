"use client";

import Lenis from "lenis";
import { useEffect } from "react";
import { dispatchAppScroll } from "@/lib/scroll-events";

type Props = {
	children: React.ReactNode;
};

const SNAP_RELEASE_MS = 1050;
const SNAP_WHEEL_THRESHOLD = 10;

export function LenisProvider({ children }: Props) {
	useEffect(() => {
		let isSnapping = false;
		let snapReleaseTimer = 0;

		const getSections = () =>
			Array.from(
				document.querySelectorAll<HTMLElement>("[data-scroll-section]"),
			).filter((section) => section.offsetParent !== null);

		const getClosestSectionIndex = (
			sections: HTMLElement[],
			currentScroll: number,
		) => {
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

		const lenis = new Lenis({
			autoRaf: true,
			smoothWheel: true,
			lerp: 0.1,
			wheelMultiplier: 1,
			virtualScroll: ({ deltaY, event }) => {
				if (
					Math.abs(deltaY) < SNAP_WHEEL_THRESHOLD ||
					event.ctrlKey ||
					isSnapping
				) {
					return true;
				}

				const target = event.target as Element | null;
				if (target?.closest("[data-lenis-prevent]")) return true;

				const sections = getSections();
				if (sections.length < 2) return true;

				const currentIndex = getClosestSectionIndex(sections, lenis.scroll);
				const direction = deltaY > 0 ? 1 : -1;
				const nextIndex = Math.min(
					sections.length - 1,
					Math.max(0, currentIndex + direction),
				);
				const nextSection = sections[nextIndex];
				if (!nextSection || nextIndex === currentIndex) return true;

				isSnapping = true;
				lenis.scrollTo(nextSection, { duration: 1, immediate: false });

				window.clearTimeout(snapReleaseTimer);
				snapReleaseTimer = window.setTimeout(() => {
					isSnapping = false;
				}, SNAP_RELEASE_MS);

				return false;
			},
		});

		lenis.on("scroll", (event) => {
			dispatchAppScroll({
				scroll: event.scroll,
				direction: event.direction,
			});
		});

		return () => {
			window.clearTimeout(snapReleaseTimer);
			lenis.destroy();
		};
	}, []);

	return children;
}
