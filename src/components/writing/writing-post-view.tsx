import { ArrowLeftIcon } from "@heroicons/react/24/outline";
import NextImage from "next/image";
import { ScrollRevealBlock } from "@/components/motion/scroll-reveal";
import { Badge } from "@/components/ui/badge";
import { DirectionalIcon } from "@/components/ui/directional-icon";
import { Link } from "@/components/ui/link";
import { RichText } from "@/components/ui/rich-text";
import { buildGenreLabels } from "@/components/writing/writing-card";
import { WritingPdfPreview } from "@/components/writing/writing-pdf-preview";
import { homeInsetClass } from "@/lib/layout";
import { cn } from "@/lib/utils";
import type {
	BookGenre,
	ResolvedSeriesBook,
	ResolvedWritingDetail,
} from "@/types/writing";

type WritingPostViewProps = {
	detail: ResolvedWritingDetail;
	seriesBooks: ResolvedSeriesBook[];
	genreLabels: Record<BookGenre, string>;
	backLabel: string;
	instituteBadgeLabel: string;
	writerLabel: string;
	seriesLabel: string;
	seriesVolumeLabel: (order: number, total: number | null) => string;
	topicLabel: string;
	tagsLabel: string;
	keywordsLabel: string;
	previewTitle: string;
	publishedLabel: string;
	updatedLabel: string;
	locale: string;
};

function MetaCell({
	label,
	children,
	className,
}: {
	label: string;
	children: React.ReactNode;
	className?: string;
}) {
	return (
		<div className={cn("flex flex-col gap-2 py-5 sm:py-6", className)}>
			<dt className="label font-medium">{label}</dt>
			<dd className="text-small text-foreground">{children}</dd>
		</div>
	);
}

function formatDate(locale: string, iso: string): string {
	try {
		return new Intl.DateTimeFormat(locale, {
			year: "numeric",
			month: "long",
			day: "numeric",
		}).format(new Date(iso));
	} catch {
		return iso;
	}
}

export function WritingPostView({
	detail,
	seriesBooks,
	genreLabels,
	backLabel,
	instituteBadgeLabel,
	writerLabel,
	seriesLabel,
	seriesVolumeLabel,
	topicLabel,
	tagsLabel,
	keywordsLabel,
	previewTitle,
	publishedLabel,
	updatedLabel,
	locale,
}: WritingPostViewProps) {
	const genreText = buildGenreLabels(
		detail.genres,
		detail.freeTextGenre,
		(genre) => genreLabels[genre],
	);
	const hasMeta = Boolean(
		detail.writer ||
			detail.topicName ||
			detail.seriesName ||
			detail.tags.length ||
			detail.keywords.length,
	);

	return (
		<article>
			<ScrollRevealBlock
				className={cn("pt-30 pb-10 sm:pt-34 lg:pb-12", homeInsetClass)}
			>
				<Link
					href="/writings"
					className="group inline-flex w-fit items-center gap-2 no-underline"
				>
					<DirectionalIcon
						icon={ArrowLeftIcon}
						className="size-4 text-muted transition-colors group-fine:text-foreground"
					/>
					<span className="label font-medium transition-colors group-fine:text-foreground">
						{backLabel}
					</span>
				</Link>

				<div className="mt-10 grid gap-10 lg:grid-cols-[minmax(0,20rem)_minmax(0,1fr)] lg:items-start lg:gap-14 xl:grid-cols-[minmax(0,24rem)_minmax(0,1fr)] xl:gap-20">
					<div className="relative aspect-[3/4] w-full max-w-sm overflow-hidden border border-border bg-sunken lg:sticky lg:top-32">
						{detail.coverUrl ? (
							<NextImage
								src={detail.coverUrl}
								alt=""
								fill
								priority
								sizes="(max-width: 1024px) 80vw, 24rem"
								className="object-cover brightness-[0.94] saturate-[0.9]"
							/>
						) : (
							<div
								aria-hidden
								className="flex h-full w-full items-center justify-center"
							>
								<span className="font-heading text-display font-bold text-foreground/10">
									{detail.title.charAt(0)}
								</span>
							</div>
						)}
					</div>

					<div className="min-w-0">
						<div className="flex flex-wrap items-center gap-2">
							{detail.publishedByInstitute ? (
								<Badge variant="outline" size="sm">
									{instituteBadgeLabel}
								</Badge>
							) : null}
							{genreText.map((label) => (
								<Badge key={label} variant="subtle" size="sm">
									{label}
								</Badge>
							))}
							{detail.topicName ? (
								<Badge variant="outline" size="sm">
									{detail.topicName}
								</Badge>
							) : null}
						</div>

						<h1 className="display-title mt-5 max-w-3xl text-balance">
							{detail.title}
						</h1>

						{detail.writer ? (
							<p className="mt-4 text-lead text-muted">
								<span className="text-foreground/80">{detail.writer}</span>
							</p>
						) : null}

						{detail.seriesName && detail.isPartOfSeries ? (
							<p className="mt-2 text-small italic text-muted">
								{seriesVolumeLabel(
									Math.round(detail.seriesOrder ?? 1),
									detail.seriesTotalBooks,
								)}
								{detail.seriesName ? ` · ${detail.seriesName}` : null}
							</p>
						) : detail.seriesName ? (
							<p className="mt-2 text-small italic text-muted">
								{detail.seriesName}
							</p>
						) : null}

						{detail.description ? (
							<RichText
								content={detail.description}
								className="mt-8 max-w-2xl"
							/>
						) : null}
					</div>
				</div>

				{hasMeta ? (
					<dl className="mt-12 grid border-y border-border sm:grid-cols-2 lg:grid-cols-3">
						{detail.writer ? (
							<MetaCell label={writerLabel}>{detail.writer}</MetaCell>
						) : null}
						{detail.topicName ? (
							<MetaCell
								label={topicLabel}
								className="border-t border-border sm:border-t-0 sm:border-s sm:ps-6"
							>
								{detail.topicName}
							</MetaCell>
						) : null}
						{detail.seriesName ? (
							<MetaCell
								label={seriesLabel}
								className="border-t border-border lg:border-t-0 lg:border-s lg:ps-6"
							>
								{detail.seriesName}
							</MetaCell>
						) : null}
						{detail.tags.length > 0 ? (
							<MetaCell
								label={tagsLabel}
								className="border-t border-border sm:col-span-2 lg:col-span-1"
							>
								<span className="flex flex-wrap gap-1.5">
									{detail.tags.map((tag) => (
										<Badge key={tag} variant="subtle" size="sm">
											{tag}
										</Badge>
									))}
								</span>
							</MetaCell>
						) : null}
						{detail.keywords.length > 0 ? (
							<MetaCell
								label={keywordsLabel}
								className="border-t border-border sm:col-span-2"
							>
								<span className="flex flex-wrap gap-1.5">
									{detail.keywords.map((keyword) => (
										<Badge key={keyword} variant="outline" size="sm">
											{keyword}
										</Badge>
									))}
								</span>
							</MetaCell>
						) : null}
					</dl>
				) : null}
			</ScrollRevealBlock>

			<ScrollRevealBlock>
				<section
					className={cn(
						"border-t border-border bg-sunken/40 py-12 sm:py-16",
						homeInsetClass,
					)}
					aria-labelledby="writing-preview-heading"
				>
					<h2
						id="writing-preview-heading"
						className="font-heading text-h2 font-bold"
					>
						{previewTitle}
					</h2>
					<div className="mt-6">
						<WritingPdfPreview
							fileOffers={detail.fileOffers}
							locale={locale}
							title={previewTitle}
							coverUrl={detail.coverUrl}
						/>
					</div>
				</section>
			</ScrollRevealBlock>

			{seriesBooks.length > 0 ? (
				<ScrollRevealBlock>
					<section
						className={cn(
							"border-t border-border py-12 sm:py-16",
							homeInsetClass,
						)}
						aria-labelledby="writing-series-heading"
					>
						<h2
							id="writing-series-heading"
							className="font-heading text-h2 font-bold"
						>
							{seriesLabel}
						</h2>
						<ol className="mt-6 divide-y divide-border border border-border">
							{seriesBooks.map((book) => (
								<li key={book.id}>
									{book.isCurrent ? (
										<div className="flex items-center justify-between gap-4 bg-sunken px-5 py-4 sm:px-6">
											<span className="font-heading text-body font-semibold">
												{String(Math.round(book.seriesOrder)).padStart(2, "0")}.{" "}
												{book.title}
											</span>
											<Badge variant="outline" size="sm">
												{seriesVolumeLabel(
													Math.round(book.seriesOrder),
													detail.seriesTotalBooks,
												)}
											</Badge>
										</div>
									) : (
										<Link
											href={`/writings/${book.id}`}
											variant="nav"
											className="flex items-center justify-between gap-4 px-5 py-4 no-underline transition-colors fine-hover:bg-sunken sm:px-6"
										>
											<span className="font-heading text-body font-medium text-foreground">
												{String(Math.round(book.seriesOrder)).padStart(2, "0")}.{" "}
												{book.title}
											</span>
										</Link>
									)}
								</li>
							))}
						</ol>
					</section>
				</ScrollRevealBlock>
			) : null}

			<ScrollRevealBlock>
				<footer
					className={cn(
						"border-t border-border py-8 text-small text-muted sm:py-10",
						homeInsetClass,
					)}
				>
					<p>
						{publishedLabel}: {formatDate(locale, detail.createdAt)}
					</p>
					<p className="mt-1">
						{updatedLabel}: {formatDate(locale, detail.updatedAt)}
					</p>
				</footer>
			</ScrollRevealBlock>
		</article>
	);
}
