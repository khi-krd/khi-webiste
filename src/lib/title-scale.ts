/**
 * Length-adaptive display-title sizing — long titles step down so they hold
 * one line (two at worst) instead of wrapping the full display clamp across
 * three or more rows.
 *
 * Returned classes live in Tailwind's utilities layer, so they override the
 * font-size set by `.display-title` / `.news-post-title` (components layer)
 * while keeping those classes' per-script line-height and casing behavior.
 * An empty string means "keep the class's native display clamp".
 */
export function displayTitleSizeClass(title: string): string {
	const length = title.trim().length;
	if (length <= 24) return "";
	if (length <= 48) return "text-[clamp(1.9rem,2.5vw+1rem,3.25rem)]";
	return "text-[clamp(1.5rem,1.6vw+0.9rem,2.375rem)]";
}

/**
 * Extra push for SHORT titles on pages that give the headline a full column —
 * a two-word title can carry more display weight than the base clamp allows.
 * Returns "" for titles the base/adaptive sizes already handle.
 */
export function heroTitleBoostClass(title: string): string {
	return title.trim().length <= 24
		? "lg:text-[clamp(3.5rem,3.2vw+1.75rem,5.75rem)]"
		: "";
}
