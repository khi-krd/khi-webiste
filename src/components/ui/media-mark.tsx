import { cn } from "@/lib/utils";

/** Bundled brand mark — same source as the lightbox ImageWatermark. */
const LOGO_SRC = "/logo.png";

type MediaMarkProps = {
	/** Extra classes for the positioned box (e.g. a larger size on heroes). */
	className?: string;
};

/**
 * Static brand mark for INLINE media — cards, thumbnails, video players.
 * Unlike `ImageWatermark` (which measures the rendered picture so it can hug
 * a letterboxed corner inside a lightbox), this simply pins the logo to the
 * bottom-left of its positioned parent, which is correct for the `fill`/
 * `object-cover` frames every card uses.
 *
 * Geometry is PHYSICAL, not logical: bottom-left in Sorani (RTL) exactly as in
 * Kurmanji. Decorative and `pointer-events-none`, so it can sit over links,
 * hover-previews and player controls without intercepting a click.
 */
export function MediaMark({ className }: MediaMarkProps) {
	return (
		<span
			aria-hidden
			className={cn(
				"pointer-events-none absolute bottom-0 left-0 z-10 p-2 sm:p-2.5",
				className,
			)}
		>
			{/* A static <img> — next/image adds no value for a bundled 128px asset. */}
			{/* eslint-disable-next-line @next/next/no-img-element */}
			<img
				src={LOGO_SRC}
				alt=""
				className="size-9 object-contain opacity-90 drop-shadow-[0_2px_6px_rgba(0,0,0,0.45)] sm:size-11"
			/>
		</span>
	);
}
