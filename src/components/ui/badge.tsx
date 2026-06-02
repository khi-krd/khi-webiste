import type { ComponentPropsWithoutRef, ReactNode } from "react";
import { cn } from "@/lib/utils";

type Variant = "solid" | "outline" | "subtle";
type Size = "sm" | "md";

type BadgeProps = {
	variant?: Variant;
	size?: Size;
	/**
	 * Optional icon at the inline-START (flips to the end-side automatically via
	 * flex + dir). If the icon is DIRECTIONAL, wrap it in <DirectionalIcon>.
	 */
	leadingIcon?: ReactNode;
} & ComponentPropsWithoutRef<"span">;

// Square corners (radius tokens are 0). Generic — assumes nothing about content.
const base =
	"inline-flex items-center gap-1  font-medium [&_svg]:shrink-0";

const variants: Record<Variant, string> = {
	solid: "bg-primary text-primary-foreground",
	outline: "border border-border-strong text-foreground",
	// muted on sunken = 4.87:1 → clears AA for small text.
	subtle: "bg-sunken text-muted",
};

const sizes: Record<Size, string> = {
	sm: "px-1.5 py-0.5 text-label [&_svg]:size-3",
	md: "px-2 py-0.5 text-small [&_svg]:size-3.5",
};

/**
 * Small squared label primitive. Server component. Generic only — it never
 * assumes what it labels (content type, year, language come later from taxonomy).
 */
export function Badge({
	variant = "subtle",
	size = "md",
	leadingIcon,
	className,
	children,
	...props
}: BadgeProps) {
	return (
		<span
			className={cn(base, variants[variant], sizes[size], className)}
			{...props}
		>
			{leadingIcon && (
				<span className="inline-flex shrink-0 items-center" aria-hidden>
					{leadingIcon}
				</span>
			)}
			{children}
		</span>
	);
}
