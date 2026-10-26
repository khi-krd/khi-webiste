import NextImage from "next/image";
import { cn } from "@/lib/utils";

type HoverCoverProps = {
	/** The alternate cover editors upload as the entity's "hover image". */
	src: string | null | undefined;
	/** The resting cover — no layer is drawn when both are the same image. */
	coverSrc?: string | null;
	sizes: string;
	/**
	 * Set when the hoverable ancestor is a named group (`group/slice`), as in
	 * the audio cover strip, instead of a plain `.group` card.
	 */
	slice?: boolean;
	className?: string;
};

/**
 * Crossfades an entity's hover image over its cover while the card is hovered
 * (or keyboard-focused). Drop it inside the cover's positioned box, after the
 * resting image; the card must carry the `group` class.
 *
 * The layer eases in with a slight settle (scale 1.06 → 1) so the swap reads
 * as a turn of the page rather than a hard cut, and collapses instantly on
 * hover-out. Touch screens never see it — there is no hover to trigger it.
 */
export function HoverCover({
	src,
	coverSrc,
	sizes,
	slice = false,
	className,
}: HoverCoverProps) {
	const hover = src?.trim();
	if (!hover || hover === coverSrc?.trim()) {
		return null;
	}

	return (
		<div
			aria-hidden
			className={cn(
				"pointer-events-none absolute inset-0 z-0 overflow-hidden opacity-0 transition-opacity duration-200 ease-out",
				slice
					? "group-hover/slice:opacity-100 group-hover/slice:duration-700"
					: "group-fine:opacity-100 group-fine:duration-700 group-has-[:focus-visible]:opacity-100",
				"group-fine:ease-[cubic-bezier(0.22,1,0.36,1)] group-focus-visible:opacity-100 motion-reduce:transition-none",
				className,
			)}
		>
			<NextImage
				src={hover}
				alt=""
				fill
				sizes={sizes}
				className={cn(
					"scale-[1.06] object-cover object-center transition-transform duration-[900ms] ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none",
					slice ? "group-hover/slice:scale-100" : "group-fine:scale-100",
				)}
			/>
		</div>
	);
}
