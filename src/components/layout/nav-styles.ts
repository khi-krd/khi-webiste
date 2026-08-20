import { cn } from "@/lib/utils";

/**
 * Shared underline treatment for the "plain text" header links — the hairline
 * grows in brand green (--color-brand) under the label on hover/focus.
 * Applied to the element that carries the text so the rule never underlines the
 * gap next to a chevron.
 */
const navUnderline = cn(
	"underline decoration-transparent decoration-2 underline-offset-[0.22em]",
	"transition-[color,text-decoration-color] duration-200",
);

/** Plain text nav link (ئێمه / خزمەتگوزاریکان) — green underline on hover. */
export const navLinkClass = cn(
	"inline-flex h-11 items-center px-3.5",
	"font-heading text-body font-bold text-foreground",
	navUnderline,
	"fine-hover:decoration-brand focus-visible:decoration-brand",
);

/**
 * بڵاوکراوە trigger. Deliberately NOT a box: it reads as one group with
 * ئێمه/خزمەتگوزاریکان, so it gets the same underline-only hover — the extra
 * gap is just room for the chevron. Pair with `group` on the button and
 * {@link navUnderlineLabelClass} on the label span.
 */
export const navDropdownTriggerClass = cn(
	"group inline-flex h-11 items-center gap-1.5 px-3.5",
	"font-heading text-body font-bold text-foreground",
);

/** Label inside {@link navDropdownTriggerClass} — underlines with the trigger. */
export const navUnderlineLabelClass = cn(
	navUnderline,
	"group-fine:decoration-brand group-focus-visible:decoration-brand",
);

/**
 * ئەرشیف / کتێبخانە — the only header items that get the drawn rectangle.
 * On hover the box fills brand green, the label flips to white and the traced
 * stroke turns white with it (see `.nav-box` in globals.css).
 */
export const navBoxTriggerClass = cn(
	"draw-border-host nav-box group relative isolate inline-flex h-11 items-center gap-1.5 overflow-hidden px-3.5",
	"font-heading text-body font-bold text-foreground transition-colors duration-200",
	"fine-hover:bg-brand fine-hover:text-white focus-visible:bg-brand focus-visible:text-white",
	"[&>:not(svg)]:relative [&>:not(svg)]:z-1",
);

/** Label inside {@link navBoxTriggerClass} — underline rides the white text. */
export const navBoxTriggerLabelClass = cn(
	navUnderline,
	"group-fine:decoration-current group-focus-visible:decoration-current",
);
