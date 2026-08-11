import { cn } from "@/lib/utils";

/**
 * "زیاتر" / view-all CTA — the hairline box that wipes full with brand green
 * from the bottom on hover and flips its label to white.
 *
 * Single source of truth: this exact string used to be copy-pasted into every
 * section that renders a زیاتر link, so a color change had to be made in six
 * places or the buttons silently drifted apart.
 *
 * The fill is a ::before wipe rather than a background-color transition so the
 * green rises from the baseline; `motion-reduce` swaps it for an instant fill.
 */
export const viewAllCtaClass = cn(
	"group/viewall relative inline-flex h-10 w-fit shrink-0 items-center gap-2.5 overflow-hidden",
	"border border-foreground px-5 font-heading text-small font-semibold text-foreground no-underline",
	"transition-[color,gap,box-shadow,border-color] duration-300 ease-out",
	"before:absolute before:inset-0 before:z-0 before:origin-bottom before:scale-y-0 before:bg-brand",
	"before:transition-transform before:duration-300 before:ease-[cubic-bezier(0.22,1,0.36,1)]",
	"fine-hover:gap-3.5 fine-hover:border-brand fine-hover:text-white",
	"fine-hover:shadow-[0_8px_24px_-12px_color-mix(in_oklch,var(--color-brand)_55%,transparent)]",
	"fine-hover:before:scale-y-100",
	"motion-reduce:before:transition-none motion-reduce:fine-hover:before:scale-y-100 motion-reduce:fine-hover:gap-2.5",
);

/**
 * Same CTA on a dark / photographic section (sound, film): the resting state is
 * a translucent light box, and hover lands the same brand-green fill with white
 * text so every زیاتر across the site behaves identically.
 */
export const viewAllCtaOnDarkClass = cn(
	"group/viewall relative inline-flex h-10 w-fit shrink-0 items-center gap-2.5 overflow-hidden",
	"border border-primary-foreground/70 bg-primary-foreground/10 px-5",
	"font-heading text-small font-semibold text-primary-foreground no-underline backdrop-blur-[2px]",
	"transition-[color,gap,box-shadow,background-color,border-color] duration-300 ease-out",
	"before:absolute before:inset-0 before:z-0 before:origin-bottom before:scale-y-0 before:bg-brand",
	"before:transition-transform before:duration-300 before:ease-[cubic-bezier(0.22,1,0.36,1)]",
	"fine-hover:gap-3.5 fine-hover:border-brand fine-hover:text-white",
	"fine-hover:shadow-[0_12px_36px_-14px_rgba(0,0,0,0.55)]",
	"fine-hover:before:scale-y-100",
	"focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-foreground",
	"motion-reduce:before:transition-none motion-reduce:fine-hover:before:scale-y-100 motion-reduce:fine-hover:gap-2.5",
);
