import type Lenis from "lenis";

type ScrollToSectionOptions = {
	immediate?: boolean;
};

/** Smooth-scroll to a section element via Lenis, or native fallback. */
export function scrollToSection(
	target: string | HTMLElement,
	lenis: Lenis | null,
	options?: ScrollToSectionOptions,
): void {
	const el =
		typeof target === "string" ? document.getElementById(target) : target;
	if (!el) return;

	if (lenis) {
		lenis.scrollTo(el, {
			offset: 0,
			immediate: options?.immediate,
			lock: true,
		});
		return;
	}

	el.scrollIntoView({
		behavior: options?.immediate ? "auto" : "smooth",
		block: "start",
	});
}
