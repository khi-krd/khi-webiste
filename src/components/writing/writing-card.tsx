import NextImage from "next/image";
import { Link } from "@/components/ui/link";
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
	fileUrl: string | null;
};

function CoverImage({ src, alt }: { src: string; alt: string }) {
	return (
		<NextImage
			src={src}
			alt={alt}
			fill
			sizes="(max-width: 640px) 66vw, (max-width: 1024px) 40vw, 22vw"
			className="object-cover brightness-[0.96] saturate-[0.92] transition-[filter,opacity] duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-fine:brightness-100 group-fine:saturate-100"
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
}: WritingCardProps) {
	const hasHoverCover =
		hoverCoverUrl != null &&
		hoverCoverUrl.length > 0 &&
		hoverCoverUrl !== coverUrl;
	const subtitle = genreLabels[0] ?? topicName ?? null;

	return (
		<article className="group relative flex h-full w-full flex-col">
			{/* The book: portrait cover with spine crease at the binding edge and
			    fore-edge corners softly rounded (rounded-e), standing on its own
			    contact shadow. */}
			<div className="relative">
				<div className="book-cover relative aspect-[5/7] w-full overflow-hidden rounded-s-[2px] rounded-e-[6px] bg-sunken">
					{coverUrl ? (
						<>
							<CoverImage src={coverUrl} alt="" />
							{hasHoverCover ? (
								<div className="absolute inset-0 opacity-0 transition-opacity duration-700 group-fine:opacity-100">
									<CoverImage src={hoverCoverUrl} alt="" />
								</div>
							) : null}
						</>
					) : (
						<div
							aria-hidden
							className="flex h-full w-full items-center justify-center"
						>
							<span className="font-heading text-display font-bold text-foreground/10">
								{title.charAt(0)}
							</span>
						</div>
					)}
					<div
						aria-hidden
						className="book-spine pointer-events-none absolute inset-y-0 start-0 w-4"
					/>
					<div
						aria-hidden
						className="book-sheen pointer-events-none absolute inset-0"
					/>
				</div>
				<div
					aria-hidden
					className="book-ground pointer-events-none absolute -bottom-3 inset-x-2 h-6"
				/>
			</div>

			{/* Ink below the cover — the cover art itself carries the title, so the
			    caption leads with the writer, like a shelf card. */}
			<div className="flex flex-1 flex-col pt-6">
				<p className="font-heading text-h3 font-bold leading-tight text-balance">
					{/* Stretched over the whole card: the read button that used
					    to carry this link is gone, and a cover you cannot click
					    is a dead end. */}
					<Link
						href={`/writings/${id}`}
						variant="nav"
						className="text-inherit no-underline after:absolute after:inset-0 after:z-1 after:content-['']"
					>
						{writer || title}
					</Link>
				</p>
				{subtitle ? (
					<p className="mt-1 text-small italic text-muted">{subtitle}</p>
				) : writer ? (
					<p className="mt-1 line-clamp-2 text-small italic text-muted">
						{title}
					</p>
				) : null}
				{excerpt ? (
					<p className="mt-3 line-clamp-3 text-small leading-relaxed text-foreground/75">
						{excerpt}
					</p>
				) : null}
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
