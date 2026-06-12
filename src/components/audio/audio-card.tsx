import NextImage from "next/image";
import { AudioPlayButton } from "@/components/audio/audio-play-button";
import { Link } from "@/components/ui/link";
import { audioDetailHref } from "@/lib/audio/resolve";
import { cn } from "@/lib/utils";
import type { PlayerTrackPayload } from "@/types/audio";

export type AudioCardProps = {
	id: number;
	title: string;
	subtitle: string | null;
	coverUrl: string | null;
	hoverCoverUrl: string | null;
	/** Translated soundType (+ album/track count for MULTI), e.g. "Folk · Album — 6 tracks". */
	metaLabel: string;
	instituteLabel: string | null;
	durationLabel: string | null;
	yearLabel: string | null;
	/** Album-of-Memories records get an aged (sepia) cover + corner label. */
	memories?: boolean;
	memoriesLabel?: string | null;
	queue: PlayerTrackPayload[];
	className?: string;
};

/** Aged-photograph tint for Album-of-Memories covers — subtle, archival. */
const memoriesCoverClass = "sepia-[0.3] contrast-[0.96]";

function CoverImage({ src, aged }: { src: string; aged?: boolean }) {
	return (
		<NextImage
			src={src}
			alt=""
			fill
			sizes="(max-width: 640px) 50vw, (max-width: 1280px) 33vw, 25vw"
			className={cn(
				"object-cover brightness-[0.94] saturate-[0.88] transition-[filter,transform] duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-fine:scale-[1.04] group-fine:brightness-100 group-fine:saturate-100",
				aged && memoriesCoverClass,
			)}
		/>
	);
}

/**
 * Cover-forward catalogue card. The title link is stretched over the card
 * (`after:` overlay); the play button sits above it as a sibling so the two
 * interactive targets never nest.
 */
export function AudioCard({
	id,
	title,
	subtitle,
	coverUrl,
	hoverCoverUrl,
	metaLabel,
	instituteLabel,
	durationLabel,
	yearLabel,
	memories = false,
	memoriesLabel,
	queue,
	className,
}: AudioCardProps) {
	const showHoverCover = Boolean(
		hoverCoverUrl && coverUrl && hoverCoverUrl !== coverUrl,
	);
	const footerItems = [durationLabel, yearLabel].filter(Boolean);

	return (
		<article
			className={cn(
				"group relative flex h-full w-full flex-col overflow-hidden border border-border bg-surface transition-colors duration-300 fine-hover:border-foreground/30",
				className,
			)}
		>
			<div className="relative aspect-square w-full overflow-hidden bg-sunken">
				{coverUrl ? (
					<>
						<CoverImage src={coverUrl} aged={memories} />
						{showHoverCover && hoverCoverUrl ? (
							<div
								aria-hidden
								className="absolute inset-0 opacity-0 transition-opacity duration-500 group-fine:opacity-100"
							>
								<NextImage
									src={hoverCoverUrl}
									alt=""
									fill
									sizes="(max-width: 640px) 50vw, (max-width: 1280px) 33vw, 25vw"
									className={cn("object-cover", memories && memoriesCoverClass)}
								/>
							</div>
						) : null}
					</>
				) : (
					<div
						aria-hidden
						className="flex h-full w-full items-center justify-center bg-sunken"
					>
						<span className="font-heading text-h1 font-bold text-foreground/10">
							{title.charAt(0)}
						</span>
					</div>
				)}

				{memories && memoriesLabel ? (
					<span className="label absolute top-0 start-0 z-1 border-b border-e border-border bg-surface/95 px-2 py-1 font-medium text-muted">
						{memoriesLabel}
					</span>
				) : null}

				{queue.length > 0 ? (
					<AudioPlayButton
						queue={queue}
						size="overlay"
						className="absolute bottom-0 start-0 z-2"
					/>
				) : null}
			</div>

			<div className="flex flex-1 flex-col gap-1.5 px-4 py-4 sm:px-5 sm:py-5">
				<p className="label text-muted">{metaLabel}</p>
				<h3 className="font-heading text-h3 font-bold leading-snug text-balance">
					<Link
						href={audioDetailHref(id)}
						variant="nav"
						className="text-inherit no-underline after:absolute after:inset-0 after:z-1 after:content-['']"
					>
						{title}
					</Link>
				</h3>
				{subtitle ? (
					<p className="text-small text-foreground/80">{subtitle}</p>
				) : null}
				{instituteLabel ? (
					<p className="label text-muted">{instituteLabel}</p>
				) : null}
			</div>

			{footerItems.length > 0 ? (
				<p className="label border-t border-border bg-sunken px-4 py-2.5 text-muted sm:px-5">
					{footerItems.join(" · ")}
				</p>
			) : null}
		</article>
	);
}
