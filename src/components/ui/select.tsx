import { ChevronDownIcon } from "@heroicons/react/24/outline";
import { type ComponentPropsWithoutRef, forwardRef } from "react";
import { cn } from "@/lib/utils";

type Size = "md" | "lg";

type SelectProps = {
	fieldSize?: Size;
} & ComponentPropsWithoutRef<"select">;

const sharedClass =
	"w-full appearance-none disabled:opacity-50 disabled:pointer-events-none text-start";

const defaultClass =
	"border border-border-strong bg-surface text-body text-foreground aria-[invalid]:border-foreground";

const sizes: Record<Size, string> = {
	md: "px-3 py-2 pe-9",
	lg: "px-4 py-3 pe-10 text-body",
};

/**
 * Native select styled to match Input — hairline border, square corners,
 * forwarded ref for react-hook-form.
 */
export const Select = forwardRef<HTMLSelectElement, SelectProps>(
	({ fieldSize = "md", className, children, ...props }, ref) => (
		<div className="relative w-full">
			<select
				ref={ref}
				className={cn(sharedClass, defaultClass, sizes[fieldSize], className)}
				{...props}
			>
				{children}
			</select>
			<ChevronDownIcon
				className="pointer-events-none absolute end-2.5 top-1/2 size-4 -translate-y-1/2 text-muted"
				aria-hidden
			/>
		</div>
	),
);
Select.displayName = "Select";

export type { SelectProps };
