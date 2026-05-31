import { cn } from "@/lib/utils";
import { VisuallyHidden } from "./visually-hidden";

type Size = "sm" | "md" | "lg";

type SpinnerProps = {
	size?: Size;
	/**
	 * Visually-hidden status text announced to assistive tech. Pass a TRANSLATED
	 * string (defaults to English "Loading…" as a fallback only).
	 */
	label?: string;
	className?: string;
};

// Border-WIDTH per size (the `.spinner` class supplies color/radius/animation).
const sizeClass: Record<Size, string> = {
	sm: "size-4 border-2",
	md: "size-6 border-2",
	lg: "size-8 border-[3px]",
};

/**
 * Minimal loading glyph — a hairline ring with one border-strong arc that
 * rotates. Server component (pure markup + CSS animation).
 *
 * Accessibility: role="status" wrapper + a <VisuallyHidden> label announced to
 * assistive tech.
 *
 * Reduced motion: the global prefers-reduced-motion handler stops the spin and
 * globals.css swaps the ring to a calm uniform border-strong circle.
 */
export function Spinner({
	size = "md",
	label = "Loading…",
	className,
}: SpinnerProps) {
	return (
		<span
			role="status"
			className={cn("inline-flex items-center justify-center", className)}
		>
			<span className={cn("spinner block", sizeClass[size])} />
			<VisuallyHidden>{label}</VisuallyHidden>
		</span>
	);
}
