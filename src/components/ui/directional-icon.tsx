import type { ComponentProps, ComponentType } from "react";
import { cn } from "@/lib/utils";

type DirectionalIconProps = {
	/** The icon component (e.g. a Heroicon: ArrowRightIcon, ChevronRightIcon). */
	icon: ComponentType<ComponentProps<"svg">>;
} & ComponentProps<"svg">;

/**
 * Wraps a DIRECTIONAL icon (arrow, chevron, back/next) and flips it
 * horizontally when the document direction is RTL — so a "forward" arrow points
 * toward the reading direction in both scripts (right in ku/LTR, left in
 * ckb/RTL).
 *
 * Drive off the real document `dir` via the `rtl:` variant (which keys off
 * `[dir="rtl"]` on <html>) — no JS, no hardcoded locale, so this stays a Server
 * Component. Authoring an icon with THIS component is the explicit signal that
 * it's directional; non-directional icons (plus, search, download, play) must
 * render plainly and never use this.
 */
export function DirectionalIcon({
	icon: Icon,
	className,
	...props
}: DirectionalIconProps) {
	return (
		<Icon
			aria-hidden="true"
			className={cn("rtl:-scale-x-100", className)}
			{...props}
		/>
	);
}
