import NextImage from "next/image";
import { AudioCardTransport } from "@/components/audio/audio-card-transport";
import { Link } from "@/components/ui/link";
import { audioDetailHref } from "@/lib/audio/resolve";
import { cn } from "@/lib/utils";
import type { PlayerTrackPayload } from "@/types/audio";

export type AudioCardProps = {
	id: number;
	title: string;
	coverUrl: string | null;
	hoverCoverUrl: string | null;
	queue: PlayerTrackPayload[];
	className?: string;
};

function CoverImage({
	src,
	fadeOnHover,
}: {
	src: string;
	fadeOnHover: boolean;
}) {
	return (
		<NextImage
			src={src}
			alt=""
			fill
			sizes="(max-width: 640px) 50vw, (max-width: 1280px) 33vw, 25vw"
			className={cn(
				"object-cover brightness-[0.94] saturate-[0.88] transition-[filter,transform,opacity] duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-fine:scale-[1.04] group-fine:brightness-100 group-fine:saturate-100",
				fadeOnHover && "group-fine:opacity-0",
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
	coverUrl,
	hoverCoverUrl,
	queue,
	className,
}: AudioCardProps) {
	const showHoverCover = Boolean(
		hoverCoverUrl && coverUrl && hoverCoverUrl !== coverUrl,
	);

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
						<CoverImage src={coverUrl} fadeOnHover={showHoverCover} />
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
									className="object-cover"
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

				<AudioCardTransport seedId={id} queue={queue} />
			</div>

			<div className="flex flex-1 flex-col gap-1.5 px-4 py-4 sm:px-5 sm:py-5">
				<h3
					title={title}
					className="truncate font-heading text-h3 font-bold leading-snug"
				>
					<Link
						href={audioDetailHref(id)}
						variant="nav"
						className="text-inherit no-underline after:absolute after:inset-0 after:z-1 after:content-['']"
					>
						{title}
					</Link>
				</h3>
			</div>
		</article>
	);
}
