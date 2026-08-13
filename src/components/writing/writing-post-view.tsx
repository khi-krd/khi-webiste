import { ArrowLeftIcon, ArrowRightIcon } from "@heroicons/react/24/outline";
import NextImage from "next/image";
import {
	ScrollReveal,
	ScrollRevealBlock,
	ScrollRevealItem,
} from "@/components/motion/scroll-reveal";
import { Badge } from "@/components/ui/badge";
import { CoverLightbox } from "@/components/ui/cover-lightbox";
import { DirectionalIcon } from "@/components/ui/directional-icon";
import { Link } from "@/components/ui/link";
import { RichText } from "@/components/ui/rich-text";
import { TaxonomyBadgeLink } from "@/components/ui/taxonomy-badge-link";
import { WritingGridCard } from "@/components/writing/writing-grid-card";
import { WritingPdfPreview } from "@/components/writing/writing-pdf-preview";
import { Link as NavLink } from "@/i18n/navigation";
import { homeInsetClass } from "@/lib/layout";
import { writingGenreHref, writingTagHref } from "@/lib/search/taxonomy-href";
import { displayTitleSizeClass } from "@/lib/title-scale";
import { cn } from "@/lib/utils";
import { buildWritingGridCards } from "@/lib/writing/catalog";
import type {
	BookGenre,
	ResolvedSeriesBook,
	ResolvedWritingCard,
	ResolvedWritingDetail,
} from "@/types/writing";

type WritingNeighbor = Pick<ResolvedWritingCard, "id" | "title">;

type WritingPostViewProps = {
	detail: ResolvedWritingDetail;
	seriesBooks: ResolvedSeriesBook[];
	previous: WritingNeighbor | null;
	next: WritingNeighbor | null;
	related: ResolvedWritingCard[];
	genreLabels: Record<BookGenre, string>;
	writerLabel: string;
	seriesLabel: string;
	seriesVolumeLabel: (order: number, total: number | null) => string;
	topicLabel: string;
	keywordsLabel: string;
	previewTitle: string;
	publishedLabel: string;
	updatedLabel: string;
	navLabel: string;
	previousLabel: string;
	nextLabel: string;
	relatedLabel: string;
	lightboxCloseLabel: string;
	locale: string;
};

function MetaRow({
	label,
	children,
	numeric = false,
}: {
	label: string;
	children: React.ReactNode;
	numeric?: boolean;
}) {
	return (
		<div className="grid gap-1.5 px-4 py-3 sm:grid-cols-[8.5rem_minmax(0,1fr)] sm:gap-4 sm:px-5">
			<dt className="label font-medium">{label}</dt>
			<dd
				className={cn("text-small text-foreground", numeric && "tabular-nums")}
			>
				{children}
			</dd>
		</div>
	);
}

function AdjacentLink({
	item,
	label,
	direction,
}: {
	item: WritingNeighbor;
	label: string;
	direction: "previous" | "next";
}) {
	const isNext = direction === "next";

	return (
		<Link
			href={`/writings/${item.id}`}
			className={cn(
				"group flex flex-col gap-3 py-8 no-underline sm:py-10",
				isNext &&
					"items-end border-t border-border text-end sm:border-t-0 sm:border-s sm:ps-8",
				!isNext && "sm:pe-8",
			)}
		>
			<span className="label flex items-center gap-2 font-medium">
				<DirectionalIcon
					icon={isNext ? ArrowRightIcon : ArrowLeftIcon}
					className="size-3.5"
				/>
				{label}
			</span>
			<span className="font-heading text-h3 font-bold text-foreground underline decoration-transparent decoration-2 underline-offset-4 transition-[text-decoration-color] duration-300 group-fine:decoration-current">
				{item.title}
			</span>
		</Link>
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
	previous,
	next,
	related,
	genreLabels,
	writerLabel,
	seriesLabel,
	seriesVolumeLabel,
	topicLabel,
	keywordsLabel,
	previewTitle,
	publishedLabel,
	updatedLabel,
	navLabel,
	previousLabel,
	nextLabel,
	relatedLabel,
	lightboxCloseLabel,
	locale,
}: WritingPostViewProps) {
	const relatedCards = buildWritingGridCards(related);

	return (
		<article>
			<ScrollRevealBlock
				className={cn("pt-8 pb-8 sm:pt-10 sm:pb-10", homeInsetClass)}
			>
				<div className="grid gap-8 lg:grid-cols-[minmax(0,20rem)_minmax(0,1fr)] lg:items-start lg:gap-12 xl:grid-cols-[minmax(0,23rem)_minmax(0,1fr)]">
					{/* Plated volume: mat frame around a portrait cover, book-on-table */}
					<div className="w-full max-w-sm border border-border bg-surface p-3 sm:p-4 lg:sticky lg:top-32 lg:max-w-none">
						{detail.coverUrl ? (
							<CoverLightbox
								src={detail.coverUrl}
								alt={detail.title}
								caption={detail.title}
								closeLabel={lightboxCloseLabel}
								intrinsicWidth={1200}
								intrinsicHeight={1600}
							>
								<span className="relative block aspect-[3/4] w-full overflow-hidden border border-border bg-sunken">
									<NextImage
										src={detail.coverUrl}
										alt=""
										fill
										priority
										sizes="(max-width: 1024px) 80vw, 23rem"
										className="object-cover brightness-[0.94] saturate-[0.9]"
									/>
								</span>
							</CoverLightbox>
						) : (
							<div
								aria-hidden
								className="flex aspect-[3/4] w-full items-center justify-center border border-border bg-sunken"
							>
								<span className="font-heading text-display font-bold text-foreground/10">
									{detail.title.charAt(0)}
								</span>
							</div>
						)}
					</div>

					<div className="min-w-0">
						<div className="flex flex-wrap items-center gap-2">
							{detail.genres.map((genre) => (
								<TaxonomyBadgeLink
									key={genre}
									href={writingGenreHref(genre)}
									variant="subtle"
									size="sm"
								>
									{genreLabels[genre]}
								</TaxonomyBadgeLink>
							))}
							{detail.freeTextGenre ? (
								<TaxonomyBadgeLink
									href={writingTagHref(detail.freeTextGenre)}
									variant="subtle"
									size="sm"
								>
									{detail.freeTextGenre}
								</TaxonomyBadgeLink>
							) : null}
							{detail.topicName ? (
								<Badge variant="outline" size="sm">
									{detail.topicName}
								</Badge>
							) : null}
						</div>

						<h1
							className={cn(
								"display-title mt-5 max-w-2xl text-balance",
								displayTitleSizeClass(detail.title),
							)}
						>
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

						{/* Narrow manuscript measure for the record's descriptive text */}
						{detail.description ? (
							<RichText
								content={detail.description}
								className="mt-6 max-w-[58ch]"
							/>
						) : null}

						{detail.tags.length > 0 ? (
							<div className="mt-6 flex max-w-[58ch] flex-wrap items-baseline gap-x-4 gap-y-2">
								{detail.tags.map((tag) => (
									<NavLink
										key={tag}
										href={writingTagHref(tag)}
										className="text-body font-bold text-brand no-underline transition-opacity fine-hover:opacity-75"
									>
										#{tag}
									</NavLink>
								))}
							</div>
						) : null}

						{/* Library card: catalog fields as hairline rows on a surface panel */}
						<dl className="mt-8 max-w-2xl divide-y divide-border border border-border bg-surface">
							{detail.writer ? (
								<MetaRow label={writerLabel}>{detail.writer}</MetaRow>
							) : null}
							{detail.topicName ? (
								<MetaRow label={topicLabel}>{detail.topicName}</MetaRow>
							) : null}
							{detail.seriesName ? (
								<MetaRow label={seriesLabel}>{detail.seriesName}</MetaRow>
							) : null}
							{detail.keywords.length > 0 ? (
								<MetaRow label={keywordsLabel}>
									<span className="flex flex-wrap gap-1.5">
										{detail.keywords.map((keyword) => (
											<TaxonomyBadgeLink
												key={keyword}
												href={writingTagHref(keyword)}
												variant="outline"
												size="sm"
											>
												{keyword}
											</TaxonomyBadgeLink>
										))}
									</span>
								</MetaRow>
							) : null}
							<MetaRow label={publishedLabel} numeric>
								{formatDate(locale, detail.createdAt)}
							</MetaRow>
							<MetaRow label={updatedLabel} numeric>
								{formatDate(locale, detail.updatedAt)}
							</MetaRow>
						</dl>
					</div>
				</div>
			</ScrollRevealBlock>

			<ScrollRevealBlock>
				<section
					className={cn(
						"border-t border-border bg-sunken/40 py-8 sm:py-10",
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
							"border-t border-border py-8 sm:py-10",
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

			{(previous || next) && (
				<nav
					aria-label={navLabel}
					className={cn("border-t border-border", homeInsetClass)}
				>
					<div className="grid sm:grid-cols-2">
						{previous ? (
							<AdjacentLink
								item={previous}
								label={previousLabel}
								direction="previous"
							/>
						) : (
							<div aria-hidden className="hidden sm:block" />
						)}
						{next ? (
							<AdjacentLink item={next} label={nextLabel} direction="next" />
						) : null}
					</div>
				</nav>
			)}

			{relatedCards.length > 0 ? (
				<ScrollRevealBlock>
					<section
						aria-labelledby="writing-related-heading"
						className={cn(
							"border-t border-border py-8 sm:py-10",
							homeInsetClass,
						)}
					>
						<h2
							id="writing-related-heading"
							className="font-heading text-h2 font-bold text-balance"
						>
							{relatedLabel}
						</h2>
						<ScrollReveal className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-4">
							{relatedCards.map((card) => (
								<ScrollRevealItem key={card.id}>
									<WritingGridCard {...card} />
								</ScrollRevealItem>
							))}
						</ScrollReveal>
					</section>
				</ScrollRevealBlock>
			) : null}
		</article>
	);
}
