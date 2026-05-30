import { ArrowRightIcon } from "@heroicons/react/24/outline";
import type { ComponentProps } from "react";
import { Link as IntlLink } from "@/i18n/navigation";
import { cn } from "@/lib/utils";

type Variant = "text" | "nav";

type LinkProps = {
	/** "text" = inline editorial underline; "nav" = quiet header/nav link. */
	variant?: Variant;
	/** Marks the current page → sets aria-current and active styling. */
	active?: boolean;
	/** Append a reading-direction arrow that flips horizontally in RTL. */
	withArrow?: boolean;
} & ComponentProps<typeof IntlLink>;

const variants: Record<Variant, string> = {
	text: "text-foreground underline decoration-border underline-offset-4 hover:decoration-current",
	nav: "text-muted hover:text-foreground aria-[current]:text-foreground aria-[current]:font-medium",
};

/**
 * Locale-aware link. Wraps the next-intl <Link> (NOT raw next/link) so the
 * active locale prefix is added automatically. Server component.
 *
 * The optional arrow uses `rtl:-scale-x-100` so it points toward the reading
 * direction in both scripts (right in ku/LTR, left in ckb/RTL).
 */
export function Link({
	variant = "text",
	active = false,
	withArrow = false,
	className,
	children,
	...props
}: LinkProps) {
	return (
		<IntlLink
			aria-current={active ? "page" : undefined}
			className={cn(
				"inline-flex items-center gap-1 transition-colors",
				variants[variant],
				className,
			)}
			{...props}
		>
			{children}
			{withArrow && (
				<ArrowRightIcon
					className="size-4 shrink-0 rtl:-scale-x-100"
					aria-hidden
				/>
			)}
		</IntlLink>
	);
}
