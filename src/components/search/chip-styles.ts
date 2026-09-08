import { cn } from "@/lib/utils";

/**
 * The kind chip (Row C of /search) — the audio page's `FilterPill` at a 44px
 * touch height, 40px on fine-pointer desktops. Server-safe (no JSX) so the
 * empty state can dress its recovery links in the same clothes.
 *
 * `zero` = a kind with no hits for this query: held in place so the row never
 * reflows, quieted through colour alone (never opacity on text), and never a
 * link to an empty page.
 */
export function kindChipClass(active: boolean, zero = false): string {
	return cn(
		// `relative`: a chip may carry a visually-hidden (absolute) label; it must
		// resolve against the chip, not escape the scroll strip and widen the page.
		"relative inline-flex h-11 shrink-0 items-center gap-2 border px-3.5 font-heading text-small font-medium",
		"transition-[background-color,border-color,color] duration-200 sm:px-4 lg:h-10",
		zero
			? "border-border bg-background text-muted"
			: active
				? "border-primary bg-primary text-primary-foreground"
				: "border-border-strong bg-background text-foreground fine-hover:border-foreground/40 fine-hover:bg-sunken",
	);
}
