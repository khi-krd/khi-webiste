import { ArrowUpRightIcon } from "@heroicons/react/24/outline";
import NextImage from "next/image";
import { DirectionalIcon } from "@/components/ui/directional-icon";
import { Link } from "@/components/ui/link";
import { cn } from "@/lib/utils";
import { formatFileSize } from "@/lib/writing/resolve";
import type { BookGenre } from "@/types/writing";

export type WritingCardProps = {
	id: number;
	title: string;
	writer: string;
	excerpt: string;
	coverUrl: string | null;
	hoverCoverUrl: string | null;
	genreLabels: string[];
	topicName: string | null;
	publishedByInstitute: boolean;
	instituteBadgeLabel: string;
	seriesOrderLabel: string;
	fileUrl: string | null;
	downloadLabel: string;
};

function CoverImage({ src, alt }: { src: string; alt: string }) {
	return (
		<NextImage
			src={src}
			alt={alt}
			fill
			sizes="(max-width: 640px) 82vw, (max-width: 1024px) 48vw, 25vw"
			className="object-cover brightness-[0.94] saturate-[0.88] transition-[filter,opacity,scale] duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-fine:scale-[1.04] group-fine:brightness-100 group-fine:saturate-100"
		/>
	);
}

export function WritingCard({
	id,
	title,
	writer,
	excerpt,
	coverUrl,
	hoverCoverUrl,
	genreLabels,
	topicName,
	publishedByInstitute,
	instituteBadgeLabel,
	seriesOrderLabel,
	downloadLabel,
}: WritingCardProps) {
	const hasHoverCover =
		hoverCoverUrl != null &&
		hoverCoverUrl.length > 0 &&
		hoverCoverUrl !== coverUrl;
	const subtitle = genreLabels[0] ?? topicName ?? null;

	return (
		<article className="group flex h-full w-full flex-col overflow-hidden border border-border bg-surface">
			<div className="relative min-h-[22rem] flex-1 overflow-hidden sm:min-h-[24rem] lg:min-h-[26rem]">
				<div className="absolute inset-0">
					{coverUrl ? (
						<>
							<CoverImage src={coverUrl} alt="" />
							{hasHoverCover ? (
								<div className="absolute inset-0 opacity-0 transition-opacity duration-700 fine-hover:opacity-100">
									<CoverImage src={hoverCoverUrl} alt="" />
								</div>
							) : null}
						</>
					) : (
						<div
							aria-hidden
							className="flex h-full w-full items-center justify-center bg-sunken"
						>
							<span className="font-heading text-display font-bold text-foreground/10">
								{title.charAt(0)}
							</span>
						</div>
					)}
					<div
						aria-hidden
						className="absolute inset-0 bg-linear-to-t from-foreground/92 via-foreground/48 to-foreground/12"
					/>
				</div>

				<div className="relative z-1 flex h-full flex-col justify-between p-5 text-primary-foreground sm:p-6">
					<div className="space-y-2">
						{publishedByInstitute ? (
							<p className="label text-primary-foreground/70">
								{instituteBadgeLabel}
							</p>
						) : null}
						<div>
							<p className="font-heading text-h3 font-bold leading-tight">
								{writer || title}
							</p>
							{subtitle ? (
								<p className="mt-1 text-small text-primary-foreground/72">
									{subtitle}
								</p>
							) : writer ? (
								<p className="mt-1 line-clamp-2 text-small text-primary-foreground/72">
									{title}
								</p>
							) : null}
						</div>
					</div>

					<div className="space-y-4">
						{excerpt ? (
							<p className="line-clamp-4 text-small leading-relaxed text-primary-foreground/88">
								{excerpt}
							</p>
						) : null}

						<div className="flex items-end justify-between gap-4">
							<Link
								href={`/writings/${id}`}
								variant="nav"
								className={cn(
									"inline-flex items-center gap-2 border border-primary-foreground/30 bg-primary-foreground/12 px-4 py-2.5 text-small font-medium text-primary-foreground no-underline backdrop-blur-md transition-[background-color,gap] duration-300 fine-hover:gap-2.5 fine-hover:bg-primary-foreground/22",
								)}
							>
								{downloadLabel}
								<DirectionalIcon icon={ArrowUpRightIcon} className="size-3.5" />
							</Link>
							<span
								aria-hidden
								className="font-heading text-[4rem] leading-none font-bold text-primary-foreground/14 select-none sm:text-[5rem]"
							>
								{seriesOrderLabel}
							</span>
						</div>
					</div>
				</div>
			</div>
		</article>
	);
}

type FileMetaInput = {
	fileFormat: string | null;
	pageCount: number | null;
	fileSizeBytes: number | null;
};

export function buildFileMetaLabel(
	card: FileMetaInput,
	pagesLabel: (count: number) => string,
): string | null {
	const parts: string[] = [];
	if (card.fileFormat) {
		parts.push(card.fileFormat);
	}
	if (card.pageCount != null && card.pageCount > 0) {
		parts.push(pagesLabel(card.pageCount));
	}
	const size = formatFileSize(card.fileSizeBytes);
	if (size) {
		parts.push(size);
	}
	return parts.length > 0 ? parts.join(" · ") : null;
}

/** Grid listing meta — format and page count only (no file size). */
export function buildGridFileMetaLabel(
	card: Pick<FileMetaInput, "fileFormat" | "pageCount">,
	pagesLabel: (count: number) => string,
): string | null {
	const parts: string[] = [];
	if (card.fileFormat) {
		parts.push(card.fileFormat);
	}
	if (card.pageCount != null && card.pageCount > 0) {
		parts.push(pagesLabel(card.pageCount));
	}
	return parts.length > 0 ? parts.join(" · ") : null;
}

export function buildGenreLabels(
	genres: BookGenre[],
	freeTextGenre: string | null,
	translateGenre: (genre: BookGenre) => string,
): string[] {
	const labels = genres.map(translateGenre);
	if (freeTextGenre && !labels.includes(freeTextGenre)) {
		labels.push(freeTextGenre);
	}
	return labels;
}
