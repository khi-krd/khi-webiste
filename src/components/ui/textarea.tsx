import { type ComponentPropsWithoutRef, forwardRef } from "react";
import { cn } from "@/lib/utils";

type TextareaProps = ComponentPropsWithoutRef<"textarea">;

const controlClass =
	"w-full rounded-md border border-border-strong bg-surface px-3 py-2 " +
	"text-body text-foreground placeholder:text-muted " +
	"disabled:opacity-50 disabled:pointer-events-none " +
	"aria-[invalid]:border-foreground";

/**
 * Native multi-line input. Shared component with forwarded ref for
 * react-hook-form. Matches Input styling; `text-start` mirrors in RTL.
 */
export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
	({ rows = 4, className, ...props }, ref) => (
		<textarea
			ref={ref}
			rows={rows}
			className={cn(controlClass, "resize-y text-start", className)}
			{...props}
		/>
	),
);
Textarea.displayName = "Textarea";
