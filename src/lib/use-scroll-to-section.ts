"use client";

import { useCallback } from "react";
import { scrollToSection } from "@/lib/scroll-to-section";

/** Scroll to a section id or element with native smooth scrolling. */
export function useScrollToSection() {
	return useCallback(
		(target: string | HTMLElement, options?: { immediate?: boolean }) => {
			scrollToSection(target, options);
		},
		[],
	);
}
