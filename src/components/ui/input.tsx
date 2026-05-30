import { type ComponentPropsWithoutRef, forwardRef } from "react";
import { cn } from "@/lib/utils";

type InputProps = ComponentPropsWithoutRef<"input">;

const ltrTypes = new Set(["email", "url", "tel", "number"]);

const controlClass =
	"w-full rounded-md border border-border-strong bg-surface px-3 py-2 " +
	"text-body text-foreground placeholder:text-muted " +
	"disabled:opacity-50 disabled:pointer-events-none " +
	// aria-invalid darkens the border to full ink (monochrome error cue).
	"aria-[invalid]:border-foreground";

/**
 * Native text input. Shared component (no "use client") with a forwarded ref so
 * react-hook-form's `register()` can attach. Hairline border + global focus
 * ring; `text-start` so caret/placeholder follow reading direction.
 * Email/url/tel/number fields force LTR content for natural caret placement in RTL.
 */
export const Input = forwardRef<HTMLInputElement, InputProps>(
	({ type = "text", className, dir, ...props }, ref) => (
		<input
			ref={ref}
			type={type}
			dir={dir ?? (ltrTypes.has(type) ? "ltr" : undefined)}
			className={cn(controlClass, "text-start", className)}
			{...props}
		/>
	),
);
Input.displayName = "Input";
