import { PlayIcon } from "@heroicons/react/24/solid";
import NextImage from "next/image";
import type { CSSProperties } from "react";
import { ScrollRevealBlock } from "@/components/motion/scroll-reveal";
import { Link } from "@/components/ui/link";
import { VideoHoverPreview } from "@/components/video/video-hover-preview";
import { cn } from "@/lib/utils";

export type VideoFilmstripFrame = {
	/** Catalogue id — the row's React key; the caller dedupes before passing. */
	id: number;
	src: string;
	href: string;
	title: string;
	/** Muted loop that plays when the frame is hovered. */
	previewSrc?: string | null;
};

type VideoFilmstripProps = {
	frames: VideoFilmstripFrame[];
	/** Screen-reader name for the strip — it carries no visible text. */
	label: string;
	className?: string;
};

/** Below this the loop reads as an obvious short repeat — render nothing. */
const MIN_FRAMES = 4;

/** Two rows only once each can be filled without reusing a frame. */
const MIN_FRAMES_FOR_TWO_ROWS = 8;

function Frame({
	frame,
	priority,
}: {
	frame: VideoFilmstripFrame;
	priority: boolean;
}) {
	return (
		// `data-preview-host` is the bus VideoHoverPreview drives — it flips
		// `data-previewing` here on play, and the fades below react in pure CSS.
		<Link
			href={frame.href}
			variant="nav"
			aria-label={frame.title}
			data-preview-host
			className="group relative block aspect-video w-56 shrink-0 overflow-hidden border border-border bg-sunken no-underline sm:w-72 lg:w-[22rem]"
		>
			<NextImage
				src={frame.src}
				alt=""
				fill
				priority={priority}
				// Never lazy. Native lazy-loading judges an element by its LAYOUT
				// box, which for a marquee copy sits far outside the viewport even
				// while the transform is holding it in plain sight — the second row
				// rendered as an empty black band because the copy on screen was the
				// one the browser had decided it could skip.
				loading={priority ? undefined : "eager"}
				sizes="(max-width: 640px) 16rem, (max-width: 1024px) 20rem, 22rem"
				className="object-cover brightness-[0.82] saturate-[0.8] transition-[filter,transform] duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-fine:scale-[1.05] group-fine:brightness-100 group-fine:saturate-100 group-data-[previewing]:brightness-100 group-data-[previewing]:saturate-100 motion-reduce:transition-none motion-reduce:group-fine:scale-100"
			/>
			{frame.previewSrc ? <VideoHoverPreview src={frame.previewSrc} /> : null}

			{/* Without this the strip reads as a photo wall. The mark sits quiet
			    at rest, comes forward under the pointer, then steps back once the
			    clip is actually rolling — the affordance yields to the content. */}
			<span
				aria-hidden
				className="pointer-events-none absolute inset-0 z-2 flex items-center justify-center"
			>
				<span className="inline-flex size-11 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-[0_12px_32px_-10px_rgb(0_0_0/0.55)] ring-1 ring-primary-foreground/30 backdrop-blur-[2px] transition-[transform,opacity] duration-[350ms] ease-[cubic-bezier(0.34,1.56,0.64,1)] opacity-75 scale-90 group-fine:scale-100 group-fine:opacity-100 group-data-[previewing]:scale-90 group-data-[previewing]:opacity-0 motion-reduce:transition-none motion-reduce:group-fine:scale-90">
					<PlayIcon className="size-5 translate-x-0.5" />
				</span>
			</span>

			{/* Frame edge lights up as the pointer lands. */}
			<span
				aria-hidden
				className="pointer-events-none absolute inset-0 z-3 ring-0 ring-inset ring-primary/0 transition-[box-shadow] duration-300 group-fine:ring-2 group-fine:ring-primary/70"
			/>
		</Link>
	);
}

function Row({
	frames,
	reverse = false,
	durationSeconds,
	eager = false,
	className,
}: {
	frames: VideoFilmstripFrame[];
	reverse?: boolean;
	durationSeconds: number;
	eager?: boolean;
	className?: string;
}) {
	const trackStyle = {
		"--marquee-duration": `${durationSeconds}s`,
	} as CSSProperties;

	// The track holds the SAME list twice and travels exactly one copy width,
	// so the wrap frame is pixel-identical to frame 0. That only holds while the
	// track itself carries no gap or padding — the spacing is the item's own
	// `pe-2`, which is why it is set here and not on the flex container.
	const copy = (duplicate: boolean) => (
		<div className="flex" aria-hidden={duplicate || undefined}>
			{frames.map((frame, index) => (
				<div key={`${duplicate ? "dup" : "orig"}-${frame.id}`} className="pe-2">
					<Frame frame={frame} priority={eager && !duplicate && index === 0} />
				</div>
			))}
		</div>
	);

	return (
		<div className={cn("overflow-hidden", className)}>
			<div
				className={cn("filmstrip-track", reverse && "filmstrip-track-reverse")}
				style={trackStyle}
			>
				{copy(false)}
				{copy(true)}
			</div>
		</div>
	);
}

/** Sprocket-hole band — the strip's film edge, top and bottom. */
function Perforation() {
	return (
		<div
			aria-hidden
			className="filmstrip-perf h-2.5 w-full bg-foreground sm:h-3"
		/>
	);
}

/**
 * Wordless hero for the film archive: two rows of catalogue frames running in
 * opposite directions between perforated film edges, each frame playing its
 * own muted preview on hover, the whole strip halting while a pointer rests
 * on it.
 *
 * Deliberately unlike the audio archive's hero — that one is a static shelf of
 * square sleeves that stretch open on hover; this one is always in motion, in
 * 16:9, and the motion IS the subject.
 */
export function VideoFilmstrip({
	frames,
	label,
	className,
}: VideoFilmstripProps) {
	if (frames.length < MIN_FRAMES) {
		return null;
	}

	// Each frame appears in exactly one row: a second row that had to reuse
	// frames would show the same still twice on screen at once, which is what
	// the counter-drift is there to avoid.
	const twoRows = frames.length >= MIN_FRAMES_FOR_TWO_ROWS;
	const half = Math.ceil(frames.length / 2);
	const topRow = twoRows ? frames.slice(0, half) : frames;
	const bottomRow = twoRows ? frames.slice(half) : [];

	return (
		<section
			aria-label={label}
			// Physical direction, deliberately. The seamless loop translates each
			// track by exactly one copy width, which only lands where the copies
			// are laid out left-to-right AND the track box starts at the left
			// edge. Under the page's rtl both are false — the box is anchored to
			// the right and overflows leftwards, so the reverse row's visible copy
			// ends up off-screen and the row renders as an empty band. Nothing in
			// here is text, so pinning the whole strip to ltr is free.
			dir="ltr"
			className={cn(
				"filmstrip-zone relative w-full overflow-hidden border-b border-border bg-foreground",
				className,
			)}
		>
			<Perforation />
			<ScrollRevealBlock className="flex flex-col gap-2 py-2">
				<Row frames={topRow} durationSeconds={64} eager />
				{bottomRow.length > 0 ? (
					<Row frames={bottomRow} reverse durationSeconds={82} />
				) : null}
			</ScrollRevealBlock>
			<Perforation />
		</section>
	);
}
