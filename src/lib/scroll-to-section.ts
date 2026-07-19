type ScrollToSectionOptions = {
	immediate?: boolean;
};

function prefersReducedMotion(): boolean {
	return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/** Smooth-scroll to a section element via native scrollIntoView. */
export function scrollToSection(
	target: string | HTMLElement,
	options?: ScrollToSectionOptions,
): void {
	const el =
		typeof target === "string" ? document.getElementById(target) : target;
	if (!el) return;

	const immediate = options?.immediate || prefersReducedMotion();
	el.scrollIntoView({
		behavior: immediate ? "auto" : "smooth",
		block: "start",
	});
}
