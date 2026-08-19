import NextImage from "next/image";
import {
	ScrollReveal,
	ScrollRevealBlock,
	ScrollRevealItem,
} from "@/components/motion/scroll-reveal";
import { Badge } from "@/components/ui/badge";
import { CoverLightbox } from "@/components/ui/cover-lightbox";
import { Link } from "@/components/ui/link";
import { RichText } from "@/components/ui/rich-text";
import { WritingGridCard } from "@/components/writing/writing-grid-card";
import { WritingPdfPreview } from "@/components/writing/writing-pdf-preview";
import { Link as NavLink } from "@/i18n/navigation";
import { homeInsetClass } from "@/lib/layout";
import {
	writingGenreHref,
	writingKeywordHref,
	writingTagHref,
} from "@/lib/search/taxonomy-href";
import { displayTitleSizeClass } from "@/lib/title-scale";
import { cn } from "@/lib/utils";
import { buildWritingGridCards } from "@/lib/writing/catalog";
import type {
	BookGenre,
	ResolvedSeriesBook,
	ResolvedWritingCard,
	ResolvedWritingDetail,
} from "@/types/writing";

type WritingPostViewProps = {
	detail: ResolvedWritingDetail;
	seriesBooks: ResolvedSeriesBook[];
	related: ResolvedWritingCard[];
	genreLabels: Record<BookGenre, string>;
	writerLabel: string;
	/** "نووسینی" — byline prefix before the bold writer name. */
	byLabel: string;
	seriesLabel: string;
	seriesVolumeLabel: (order: number, total: number | null) => string;
	topicLabel: string;
	keywordsLabel: string;
	formatLabel: string;
	languagesLabel: string;
	previewTitle: string;
	relatedLabel: string;
	lightboxCloseLabel: string;
	locale: string;
};

const chipBase =
	"px-3.5 py-1.5 text-label font-semibold no-underline transition-opacity fine-hover:opacity-85";
const chipSolidClass = cn(chipBase, "bg-brand text-white");
const chipLineClass = cn(
	chipBase,
	"border border-foreground/25 text-foreground",
);

export function WritingPostView({
	detail,
	seriesBooks,
	related,
	genreLabels,
	writerLabel,
	byLabel,
	seriesLabel,
	seriesVolumeLabel,
	topicLabel,
	keywordsLabel,
	formatLabel,
	languagesLabel,
	previewTitle,
	relatedLabel,
	lightboxCloseLabel,
	locale,
}: WritingPostViewProps) {
	const relatedCards = buildWritingGridCards(related);

	// Genre chips — the first reads as the record's primary class (solid
	// brand), the rest as quieter outlined qualifiers, per the house mock.
	const genreChips = [
		...detail.genres.map((genre) => ({
			key: `genre-${genre}`,
			href: writingGenreHref(genre),
			label: genreLabels[genre],
		})),
		...(detail.freeTextGenre
			? [
					{
						key: "free-genre",
						href: writingGenreHref(detail.freeTextGenre),
						label: detail.freeTextGenre,
					},
				]
			: []),
	];

	const volumeLine =
		detail.seriesName && detail.isPartOfSeries
			? seriesVolumeLabel(
					Math.round(detail.seriesOrder ?? 1),
					detail.seriesTotalBooks,
				)
			: detail.seriesName;

	// Spec-strip values sourced from the file offers (PDF · languages).
	const formatValue =
		Array.from(
			new Set(
				detail.fileOffers
					.map((offer) => offer.fileFormat?.toUpperCase())
					.filter(Boolean),
			),
		).join(" · ") || null;
	const languagesValue =
		Array.from(
			new Set(
				detail.fileOffers.map((offer) => offer.languageLabel).filter(Boolean),
			),
		).join(" · ") || null;

	const stripFields = [
		detail.writer ? { label: writerLabel, value: detail.writer } : null,
		detail.topicName ? { label: topicLabel, value: detail.topicName } : null,
		formatValue ? { label: formatLabel, value: formatValue, ltr: true } : null,
		languagesValue ? { label: languagesLabel, value: languagesValue } : null,
	].filter((field): field is NonNullable<typeof field> => field != null);

	return (
		<article>
			{/* Liner hero, per the house mock: text column beside the cover
			    plate (physically at the end side), the cover leading on mobile. */}
			<ScrollRevealBlock
				className={cn("pt-8 pb-8 sm:pt-10 sm:pb-10", homeInsetClass)}
			>
				<div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,25rem)] lg:items-center lg:gap-12">
					<div className="min-w-0 text-start">
						<div className="flex flex-wrap items-center gap-2">
							{genreChips.map((chip, index) => (
								<NavLink
									key={chip.key}
									href={chip.href}
									className={index === 0 ? chipSolidClass : chipLineClass}
								>
									{chip.label}
								</NavLink>
							))}
							{detail.topicName ? (
								<span className={chipLineClass}>{detail.topicName}</span>
							) : null}
						</div>

						<h1
							className={cn(
								"display-title mt-6 max-w-2xl text-balance",
								displayTitleSizeClass(detail.title),
							)}
						>
							{detail.title}
						</h1>

						{detail.writer ? (
							<p className="mt-3 text-body text-muted">
								{byLabel}{" "}
								<span className="font-bold text-foreground">
									{detail.writer}
								</span>
								{volumeLine ? <> · {volumeLine}</> : null}
							</p>
						) : volumeLine ? (
							<p className="mt-3 text-body text-muted">{volumeLine}</p>
						) : null}

						{detail.description ? (
							<RichText
								content={detail.description}
								className="mt-5 max-w-3xl text-justify text-body leading-loose text-foreground/85"
							/>
						) : null}

						{detail.tags.length > 0 ? (
							<div className="mt-6 flex flex-wrap items-baseline gap-x-4 gap-y-2">
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

						{detail.keywords.length > 0 ? (
							<div className="mt-4 flex flex-wrap items-baseline gap-x-3 gap-y-2">
								<span className="text-label font-semibold uppercase tracking-[0.14em] text-muted">
									{keywordsLabel}
								</span>
								{detail.keywords.map((keyword) => (
									<NavLink
										key={keyword}
										href={writingKeywordHref(keyword)}
										className="text-small text-foreground/80 underline decoration-border underline-offset-4 transition-colors fine-hover:text-foreground"
									>
										{keyword}
									</NavLink>
								))}
							</div>
						) : null}
					</div>

					{/* Cover plate — shadowed volume, click to enlarge. */}
					<figure className="w-full max-w-sm max-lg:order-first lg:max-w-none">
						{detail.coverUrl ? (
							<CoverLightbox
								src={detail.coverUrl}
								alt={detail.title}
								caption={detail.title}
								closeLabel={lightboxCloseLabel}
								intrinsicWidth={1200}
								intrinsicHeight={1600}
							>
								<span className="relative block aspect-[3/4] w-full overflow-hidden rounded-md border border-border bg-sunken shadow-[0_12px_32px_rgba(23,21,18,0.14)]">
									<NextImage
										src={detail.coverUrl}
										alt=""
										fill
										priority
										sizes="(max-width: 1024px) 80vw, 25rem"
										className="object-cover brightness-[0.94] saturate-[0.9]"
									/>
								</span>
							</CoverLightbox>
						) : (
							<div
								aria-hidden
								className="flex aspect-[3/4] w-full items-center justify-center rounded-md border border-border bg-sunken"
							>
								<span className="font-heading text-display font-bold text-foreground/10">
									{detail.title.charAt(0)}
								</span>
							</div>
						)}
					</figure>
				</div>
			</ScrollRevealBlock>

			{/* Always-visible spec strip: quiet label beside a confident value. */}
			{stripFields.length > 0 ? (
				<section
					className={cn("border-t border-border bg-sunken", homeInsetClass)}
				>
					<dl className="flex flex-wrap items-baseline gap-x-8 gap-y-2.5 py-4 text-start">
						{stripFields.map((field) => (
							<div key={field.label} className="flex items-baseline gap-2.5">
								<dt className="label font-medium text-muted">{field.label}</dt>
								<dd
									dir={field.ltr ? "ltr" : undefined}
									className="text-small font-bold text-foreground"
								>
									{field.value}
								</dd>
							</div>
						))}
					</dl>
				</section>
			) : null}

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
