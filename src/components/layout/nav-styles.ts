import { cn } from "@/lib/utils";

/** Plain text nav link (ئێمه / خزمەتگوزاریکان). */
export const navLinkClass = cn(
	"inline-flex h-11 items-center px-3.5",
	"font-heading text-body font-bold text-foreground",
	"underline decoration-transparent decoration-2 underline-offset-[0.22em]",
	"transition-[color,text-decoration-color] duration-200",
	"fine-hover:decoration-current",
);

// Shared by PublicationsDropdown and the brand-adjacent archive/library
// triggers so بڵاوکراوە/ئەرشیڤ/کتێبخانە read as one unstyled group.
export const navTriggerClass = cn(
	"draw-border-host relative isolate inline-flex h-11 items-center gap-1.5 overflow-hidden rounded-md px-3.5",
	"font-heading text-body font-bold text-foreground transition-colors fine-hover:bg-sunken",
	"[&>:not(svg)]:relative [&>:not(svg)]:z-1",
);

export const navTriggerLabelClass = cn(
	"underline decoration-transparent decoration-2 underline-offset-[0.22em]",
	"transition-[color,text-decoration-color] duration-200",
	"fine-hover:decoration-current",
);
