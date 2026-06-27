import NextImage, { type ImageProps as NextImageProps } from "next/image";
import { cn } from "@/lib/utils";

/** Named ratios + any custom "w/h" string (e.g. "5/4"). */
type AspectRatio = "square" | "4/3" | "16/9" | "3/2" | (string & {});

type ImageProps = Omit<NextImageProps, "className" | "fill"> & {
	/**
	 * Sets a fixed-ratio box and renders the image in `fill` mode inside it —
	 * the graceful path when intrinsic width/height aren't known. Omit to render
	 * an intrinsic image (width/height required by next/image, as usual).
	 */
	aspectRatio?: AspectRatio;
	/** Default "cover" (crops to fill the box); "contain" letterboxes. */
	objectFit?: "cover" | "contain";
	/** Subtle hairline frame for archive/photo content. Off by default. */
	framed?: boolean;
	/** Classes for the wrapper box (ratio mode) or the image (intrinsic mode). */
	className?: string;
	/** Classes for the <img> itself. */
	imageClassName?: string;
};

// Reasonable responsive default; override per usage. Roughly: full width on
// phones, half on tablets, a third on desktop grids.
const DEFAULT_SIZES =
	"(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw";

const NAMED_RATIOS: Record<string, string> = {
	square: "1 / 1",
	"4/3": "4 / 3",
	"16/9": "16 / 9",
	"3/2": "3 / 2",
};

function ratioValue(ratio: AspectRatio): string {
	return NAMED_RATIOS[ratio] ?? ratio.replace("/", " / ");
}

/**
 * Thin wrapper over next/image with KHI defaults: square corners, optional
 * hairline frame, a sensible default `sizes`, and an `aspectRatio` box that
 * uses object-cover. Server component.
 *
 * NOTE: blur placeholders are intentionally omitted for now (they need
 * per-image blurDataURL / a loader) — add as a future option when the media
 * pipeline can supply them.
 */
export function Image({
	aspectRatio,
	objectFit = "cover",
	framed = false,
	sizes,
	className,
	imageClassName,
	alt,
	...props
}: ImageProps) {
	const fit = objectFit === "contain" ? "object-contain" : "object-cover";
	// Square corners everywhere (radius tokens are 0); frame is a hairline.
	const frame = framed ? "rounded-md border border-border" : undefined;

	if (aspectRatio) {
		return (
			<div
				className={cn("relative overflow-hidden", frame, className)}
				style={{ aspectRatio: ratioValue(aspectRatio) }}
			>
				<NextImage
					alt={alt}
					fill
					sizes={sizes ?? DEFAULT_SIZES}
					className={cn(fit, imageClassName)}
					{...props}
				/>
			</div>
		);
	}

	// Intrinsic mode: width/height come through ...props (required by next/image).
	return (
		<NextImage
			alt={alt}
			sizes={sizes ?? DEFAULT_SIZES}
			className={cn("h-auto", fit, frame, className, imageClassName)}
			{...props}
		/>
	);
}
