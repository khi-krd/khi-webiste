import {
	DocumentTextIcon,
	PhotoIcon,
	VideoCameraIcon,
} from "@heroicons/react/24/outline";
import { PlayIcon } from "@heroicons/react/24/solid";
import { getLocale, getTranslations } from "next-intl/server";
import { WaveformMotif } from "@/components/search/waveform-motif";
import { Image } from "@/components/ui/image";
import { formatCount } from "@/lib/platform/format";
import type { PlatformHit } from "@/types/platform";

/** Plates above the fold load their still eagerly; the rest wait. */
const EAGER_PLATE_COUNT = 6;

const PLATE_SIZES =
	"(max-width: 640px) 50vw, (max-width: 1024px) 33vw, (max-width: 1536px) 25vw, 20vw";

const PORTRAIT_SIZES = "(max-width: 640px) 16vw, 8vw";

/**
 * A photograph, film still or cover filling the 4:3 box: slightly dimmed at
 * rest so the paper shell stays calm, lit and nudged larger on a fine hover.
 */
function CoverStill({ src, eager }: { src: string; eager: boolean }) {
	return (
		<Image
			src={src}
			alt=""
			aspectRatio="4/3"
			sizes={PLATE_SIZES}
			loading={eager ? "eager" : "lazy"}
			className="absolute inset-0 size-full"
			imageClassName="object-cover brightness-[0.96] saturate-[0.92] transition-[filter,transform] duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-fine:scale-[1.04] group-fine:brightness-100 group-fine:saturate-100 motion-reduce:transition-none motion-reduce:group-fine:scale-100"
		/>
	);
}

/** Ink foot under a playable still so the play chip and duration stay legible. */
function FootGradient() {
	return (
		<span
			aria-hidden
			className="pointer-events-none absolute inset-x-0 bottom-0 h-1/2 bg-linear-to-t from-foreground/70 via-foreground/25 to-transparent opacity-80 transition-opacity duration-[420ms] group-fine:opacity-100"
		/>
	);
}

/**
 * The brand-green round play mark every playable thing on the site carries.
 * Decorative here: the card's one target is its title link, and wiring the
 * chip to the player is a tracked follow-up.
 */
export function PlayChip() {
	return (
		<span
			aria-hidden
			className="pointer-events-none absolute bottom-2 start-2 z-2 inline-flex size-9 items-center justify-center rounded-full bg-primary text-primary-foreground ring-1 ring-primary-foreground/30 shadow-[0_12px_32px_-10px_rgb(0_0_0/0.55)] transition-transform duration-[350ms] ease-[cubic-bezier(0.34,1.56,0.64,1)] group-fine:scale-105 motion-reduce:group-fine:scale-100 sm:size-10"
		>
			{/* Physical nudge on purpose: an unmirrored triangle sits optically
			    centred slightly to the right in either reading direction. */}
			<PlayIcon className="size-4 translate-x-px" />
		</span>
	);
}

function DurationBadge({ duration }: { duration: string }) {
	return (
		<span
			dir="ltr"
			className="pointer-events-none absolute bottom-2 end-2 z-2 bg-foreground/85 px-1.5 py-0.5 text-label tabular-nums leading-none text-primary-foreground"
		>
			{duration}
		</span>
	);
}

/** Ink ground with filmstrip perforations — a video with no still of its own. */
function FilmGround() {
	return (
		<>
			<span aria-hidden className="absolute inset-0 bg-foreground" />
			<span
				aria-hidden
				className="filmstrip-perf absolute inset-x-0 top-1.5 h-2"
			/>
			<span
				aria-hidden
				className="filmstrip-perf absolute inset-x-0 bottom-1.5 h-2"
			/>
			<VideoCameraIcon
				aria-hidden
				className="absolute inset-0 m-auto size-8 text-primary-foreground/60"
			/>
		</>
	);
}

/**
 * Ruled paper sheet(s) with an optional clipped portrait pinned at the top
 * end — the text kind's motif, since documents rarely have a still and their
 * "thumbnail" is usually the author's portrait.
 */
function TextSheet({
	src,
	stacked,
	eager,
}: {
	src: string | null;
	stacked: boolean;
	eager: boolean;
}) {
	return (
		<>
			{stacked ? (
				<span
					aria-hidden
					className="absolute inset-x-[22%] top-[9%] -bottom-px border border-b-0 border-border bg-surface"
				/>
			) : null}
			<span
				aria-hidden
				className="absolute inset-x-[18%] top-[14%] -bottom-px z-1 border border-b-0 border-border bg-surface [background-image:repeating-linear-gradient(to_bottom,transparent_0_11px,var(--color-border)_11px_12px)] [background-position:0_1.5rem]"
			>
				<span className="absolute inset-y-0 start-[12%] w-px bg-border-strong" />
			</span>
			{src ? (
				<span
					aria-hidden
					className="pointer-events-none absolute top-[7%] end-[7%] z-2 w-[30%] rotate-2 overflow-hidden border border-border bg-sunken aspect-3/4"
				>
					<Image
						src={src}
						alt=""
						aspectRatio="3/4"
						sizes={PORTRAIT_SIZES}
						loading={eager ? "eager" : "lazy"}
						className="absolute inset-0 size-full"
						imageClassName="object-cover"
					/>
				</span>
			) : (
				<DocumentTextIcon
					aria-hidden
					className="absolute top-[24%] start-[26%] z-2 size-5 text-muted"
				/>
			)}
		</>
	);
}

type PlateMediaProps = {
	hit: PlatformHit;
	/** The card's display title — the box itself is decorative and unnamed. */
	title: string;
	/** Position in the result list; the first few load their still eagerly. */
	index: number;
};

/**
 * Everything that lives inside a plate's 4:3 media box, minus the kind and
 * trending chips (the card owns those): the still or the kind's motif, the
 * play chip for sounds and films, and the duration / page-count badge.
 * Rendered as a fragment so the card keeps the one `overflow-hidden` box.
 */
export async function PlateMedia({ hit, index }: PlateMediaProps) {
	const t = await getTranslations("Search");
	const locale = await getLocale();

	const eager = index < EAGER_PLATE_COUNT;
	const thumbnailUrl = hit.thumbnailUrl?.trim() || null;
	const duration = hit.duration?.trim() || null;

	switch (hit.type) {
		case "image":
			return thumbnailUrl ? (
				<CoverStill src={thumbnailUrl} eager={eager} />
			) : (
				<PhotoIcon
					aria-hidden
					className="absolute inset-0 m-auto size-8 text-muted/60"
				/>
			);

		case "video":
			return (
				<>
					{thumbnailUrl ? (
						<>
							<CoverStill src={thumbnailUrl} eager={eager} />
							<FootGradient />
						</>
					) : (
						<FilmGround />
					)}
					<PlayChip />
					{duration ? <DurationBadge duration={duration} /> : null}
				</>
			);

		case "audio":
			return (
				<>
					{thumbnailUrl ? (
						<>
							<CoverStill src={thumbnailUrl} eager={eager} />
							<FootGradient />
						</>
					) : (
						<WaveformMotif code={hit.code} />
					)}
					<PlayChip />
					{duration ? <DurationBadge duration={duration} /> : null}
				</>
			);

		case "text": {
			const pageCount = hit.pageCount ?? 0;
			return (
				<>
					<TextSheet src={thumbnailUrl} stacked={pageCount > 1} eager={eager} />
					{pageCount > 0 ? (
						<span className="pointer-events-none absolute bottom-2 end-2 z-2 bg-foreground/85 px-1.5 py-0.5 text-label leading-none text-primary-foreground">
							{t("cardPages", { count: formatCount(locale, pageCount) })}
						</span>
					) : null}
				</>
			);
		}
	}
}
