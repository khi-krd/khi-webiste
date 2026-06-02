import { type ComponentPropsWithoutRef, forwardRef } from "react";
import { cn } from "@/lib/utils";

type Variant = "default" | "overlay";
type Size = "md" | "lg";

type InputProps = {
	/** "default" = cream canvas form control; "overlay" = transparent on dark surfaces. */
	variant?: Variant;
	fieldSize?: Size;
} & ComponentPropsWithoutRef<"input">;

const ltrTypes = new Set(["email", "url", "tel", "number"]);

const sharedClass =
	"w-full disabled:opacity-50 disabled:pointer-events-none text-start";

const defaultClass =
	"rounded-md border border-border-strong bg-surface text-body text-foreground placeholder:text-muted aria-[invalid]:border-foreground";

const overlayClass =
	"rounded-none border border-primary-foreground/30 bg-transparent text-primary-foreground shadow-none placeholder:text-primary-foreground/40 focus-visible:border-primary-foreground/70 focus-visible:outline-none aria-[invalid]:border-primary-foreground";

const defaultSizes: Record<Size, string> = {
	md: "px-3 py-2",
	lg: "px-4 py-3 text-body",
};

const overlaySizes: Record<Size, string> = {
	md: "px-4 py-3 font-sans text-body",
	lg: "px-4 py-4 font-sans text-[clamp(1.125rem,2vw+0.5rem,1.375rem)] leading-snug",
};

/**
 * Native text input. Shared component (no "use client") with a forwarded ref so
 * react-hook-form's `register()` can attach. Hairline border + global focus
 * ring; `text-start` so caret/placeholder follow reading direction.
 * Email/url/tel/number fields force LTR content for natural caret placement in RTL.
 */
export const Input = forwardRef<HTMLInputElement, InputProps>(
	({ type = "text", variant = "default", fieldSize = "md", className, dir, ...props }, ref) => (
		<input
			ref={ref}
			type={type}
			dir={dir ?? (ltrTypes.has(type) ? "ltr" : undefined)}
			className={cn(
				sharedClass,
				variant === "overlay" ? overlayClass : defaultClass,
				variant === "overlay" ? overlaySizes[fieldSize] : defaultSizes[fieldSize],
				className,
			)}
			{...props}
		/>
	),
);
Input.displayName = "Input";

export type { InputProps };
