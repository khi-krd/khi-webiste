import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type DividerProps = {
	orientation?: "horizontal" | "vertical";
	/** Use the stronger interactive border instead of the hairline default. */
	strong?: boolean;
	/** Centered label between two rules (horizontal only). */
	children?: ReactNode;
	className?: string;
};

/**
 * Hairline separator — borders are a design element here. Server component.
 * Uses the semantic <hr> element (implicit separator role). Horizontal or
 * vertical; optional centered label sits between two rules and mirrors
 * automatically (symmetric layout, logical spacing via the parent).
 */
export function Divider({
	orientation = "horizontal",
	strong = false,
	children,
	className,
}: DividerProps) {
	const line = strong ? "bg-border-strong" : "bg-border";

	if (orientation === "vertical") {
		return (
			<hr
				aria-orientation="vertical"
				className={cn("h-full w-px self-stretch border-0", line, className)}
			/>
		);
	}

	if (children != null) {
		// Decorative rules around a real label (no separator semantics here).
		return (
			<div className={cn("flex items-center gap-3", className)}>
				<span className={cn("h-px flex-1", line)} aria-hidden />
				<span className="label shrink-0">{children}</span>
				<span className={cn("h-px flex-1", line)} aria-hidden />
			</div>
		);
	}

	return <hr className={cn("h-px w-full border-0", line, className)} />;
}
