export const SNAP_SECTION_SELECTOR = "[data-snap-section]";

/** Top-level page sections registered as Lenis Snap targets. */
export function discoverSnapSections(
	root: ParentNode = document,
): HTMLElement[] {
	return [...root.querySelectorAll<HTMLElement>(SNAP_SECTION_SELECTOR)].filter(
		(el) => !el.closest("[data-lenis-prevent], [data-lenis-prevent-touch]"),
	);
}
