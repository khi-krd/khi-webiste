import type { ComponentProps, ComponentType } from "react";
import { cn } from "@/lib/utils";

type DirectionalIconProps = {
	/** The icon component (e.g. a Heroicon: ArrowRightIcon, ChevronRightIcon). */
	icon: ComponentType<ComponentProps<"svg">>;
} & ComponentProps<"svg">;

/**
 * Wraps a DIRECTIONAL icon (arrow, chevron, back/next) and flips it
 * horizontally when the document direction is RTL — so a "forward" arrow points
 * toward the reading direction in both scripts (right in ku·en/LTR, left in
 * ckb/RTL).
 *
 * Flip is driven by the `.directional-flip` class (globals.css), which keys off
 * the document `dir` attribute — NOT Tailwind's `rtl:` variant. Tailwind's
 * `rtl:` matches a hardcoded RTL-language list that includes :lang(ku), but
 * Kurmanji is Latin/LTR; `dir` is the source of truth. No JS, so this stays a
 * Server Component. Authoring an icon with THIS component is the explicit signal
 * that it's directional; non-directional icons (plus, search, download, play)
 * must render plainly and never use this.
 */
export function DirectionalIcon({
	icon: Icon,
	className,
	...props
}: DirectionalIconProps) {
	return (
		<Icon
			aria-hidden="true"
			className={cn("directional-flip", className)}
			{...props}
		/>
	);
}
