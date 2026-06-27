import type { ComponentPropsWithoutRef } from "react";
import { cn } from "@/lib/utils";

/** Same named-ratio API as the Image component. */
type AspectRatio = "square" | "4/3" | "16/9" | "3/2" | (string & {});

const NAMED_RATIOS: Record<string, string> = {
	square: "1 / 1",
	"4/3": "4 / 3",
	"16/9": "16 / 9",
	"3/2": "3 / 2",
};

function ratioValue(ratio: AspectRatio): string {
	return NAMED_RATIOS[ratio] ?? ratio.replace("/", " / ");
}

type SkeletonProps = {
	/** Ratio box for image/media placeholders (e.g. "16/9"). */
	aspectRatio?: AspectRatio;
	/** Round to a circle (avatars). Otherwise square corners (design default). */
	circle?: boolean;
} & ComponentPropsWithoutRef<"div">;

/**
 * Base placeholder block — flat sunken fill with a surface highlight sweeping
 * across. Server component, `aria-hidden` (decorative; the surrounding region
 * should carry the loading status). Square corners by default to match the
 * squared elements it stands in for.
 *
 * Reduced motion: globals.css drops the highlight to a flat block.
 */
export function Skeleton({
	aspectRatio,
	circle = false,
	className,
	style,
	...props
}: SkeletonProps) {
	return (
		<div
			aria-hidden
			className={cn("skeleton", circle && "rounded-pill", className)}
			style={
				aspectRatio ? { aspectRatio: ratioValue(aspectRatio), ...style } : style
			}
			{...props}
		/>
	);
}

type SkeletonTextProps = {
	/** Number of lines. The last line is shortened for a natural ragged edge. */
	lines?: number;
	className?: string;
};

/** Convenience: stacked text-line placeholders. */
export function SkeletonText({ lines = 3, className }: SkeletonTextProps) {
	return (
		<div className={cn("flex flex-col gap-2.5", className)} aria-hidden>
			{Array.from({ length: lines }, (_, i) => (
				<Skeleton
					// biome-ignore lint/suspicious/noArrayIndexKey: static decorative lines, never reorder
					key={i}
					className={cn("h-4", i === lines - 1 ? "w-3/5" : "w-full")}
				/>
			))}
		</div>
	);
}
