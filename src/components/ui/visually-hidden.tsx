import type { ComponentPropsWithoutRef, ElementType } from "react";
import { cn } from "@/lib/utils";

type VisuallyHiddenProps<T extends ElementType> = {
	/** Element to render. Default "span"; use "a" for a skip link. */
	as?: T;
	/**
	 * Reveal in normal flow when focused (or a child is focused) — for skip
	 * links. Pair with focus:* utilities for the visible styling.
	 */
	focusable?: boolean;
} & Omit<ComponentPropsWithoutRef<T>, "as">;

/**
 * Hides content visually while keeping it in the accessibility tree (the clip/
 * position technique, not display:none). Server component.
 *
 * Logical-property safe: positioning collapses to a 1px box, so there's nothing
 * to mirror; the focusable reveal returns content to normal flow where the
 * document direction governs layout.
 */
export function VisuallyHidden<T extends ElementType = "span">({
	as,
	focusable = false,
	className,
	...props
}: VisuallyHiddenProps<T>) {
	const Comp = (as ?? "span") as ElementType;
	return (
		<Comp
			className={cn(
				"visually-hidden",
				focusable && "visually-hidden-focusable",
				className,
			)}
			{...props}
		/>
	);
}
