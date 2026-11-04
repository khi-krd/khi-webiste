import NextImage from "next/image";
import { Fragment } from "react";
import {
	ScrollReveal,
	ScrollRevealBlock,
	ScrollRevealItem,
} from "@/components/motion/scroll-reveal";
import { BackToIndexLink } from "@/components/ui/back-to-index";
import { CoverLightbox } from "@/components/ui/cover-lightbox";
import { RichText } from "@/components/ui/rich-text";
import { WritingGridCard } from "@/components/writing/writing-grid-card";
import { WritingPdfPreview } from "@/components/writing/writing-pdf-preview";
import { Link as NavLink } from "@/i18n/navigation";
import { homeInsetClass } from "@/lib/layout";
import { formatCount } from "@/lib/platform/format";
import { writingTagHref } from "@/lib/search/taxonomy-href";
import { displayTitleSizeClass } from "@/lib/title-scale";
import { cn } from "@/lib/utils";
import {
	buildWritingGridCards,
	type WritingSeriesCard,
} from "@/lib/writing/catalog";
import {
	personNameConjunction,
	personStripEntries,
} from "@/lib/writing/resolve";
import { buildWritingsHref } from "@/lib/writings-url";
import type {
	ResolvedWritingCard,
	ResolvedWritingDetail,
} from "@/types/writing";

type WritingPostViewProps = {
	detail: ResolvedWritingDetail;
	/** Locale-relative index path this item belongs to. */
	backHref: string;
	/** Visible back-button label — the index page's own title. */
	backLabel: string;
	backAriaLabel?: string;

	seriesCards: WritingSeriesCard[];
	related: ResolvedWritingCard[];
	writerLabel: string;
	bookLanguageLabel: string;

	seriesLabel: string;
	seriesVolumeLabel: (order: number, total: number | null) => string;
	seriesCurrentLabel: string;
	topicLabel: string;
	pagesLabel: string;
	formatLabel: string;
	previewTitle: string;
	relatedLabel: string;
	lightboxCloseLabel: string;
	locale: string;
};

export function WritingPostView({
	detail,
	backHref,
	backLabel,
	backAriaLabel,
	seriesCards,
	related,
	writerLabel,
	bookLanguageLabel,

	seriesLabel,
	seriesVolumeLabel,
	seriesCurrentLabel,
	topicLabel,
	pagesLabel,
	formatLabel,
	previewTitle,
	relatedLabel,
	lightboxCloseLabel,
	locale,
}: WritingPostViewProps) {
	const relatedCards = buildWritingGridCards(related);

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
	const pageCount =
		detail.fileOffers.find(
			(offer) =>
				offer.language === (locale === "ckb" ? "CKB" : "KMR") &&
				offer.pageCount,
		)?.pageCount ??
		detail.fileOffers.find((offer) => offer.pageCount)?.pageCount ??
		null;

	// The byline names are resolved server-side — writer-role people joined
	// with the locale conjunction, else the first person attached.
	const bylineName = detail.writer;

	// Linked values are plain GET links into the writings index — people hit
	// the exact writer filter, topic/location ride the text search (both are
	// in its haystack).
	type StripField = {
		label: string | null;
		value?: string;
		links?: { text: string; href: string }[];
		linkSep?: string;
		ltr?: boolean;
	};
	const stripFields: StripField[] = [
		...personStripEntries(locale, detail.persons).map((entry) => ({
			label: entry.label || writerLabel,
			links: entry.members.map((member) => ({
				text: member.display,
				href: buildWritingsHref({ writer: member.name }),
			})),
			linkSep: personNameConjunction(locale),
		})),
		...(detail.location
			? [
					{
						label: null,
						links: [
							{
								text: detail.location,
								href: buildWritingsHref({ q: detail.location }),
							},
						],
					},
				]
			: []),
		...(detail.bookLanguage
			? [{ label: bookLanguageLabel, value: detail.bookLanguage }]
			: []),
		...(detail.topicNames.length > 0
			? [
					{
						label: topicLabel,
						links: detail.topicNames.map((name) => ({
							text: name,
							href: buildWritingsHref({ q: name }),
						})),
						linkSep: "، ",
					},
				]
			: []),
		...(pageCount
			? [{ label: pagesLabel, value: formatCount(locale, pageCount) }]
			: []),
		...(formatValue
			? [{ label: formatLabel, value: formatValue, ltr: true }]
			: []),
	];

	return (
		<article>
			{/* Liner hero, per the house mock: text column beside the cover
			    plate (physically at the end side), the cover leading on mobile. */}
			<ScrollRevealBlock
				className={cn("pt-8 pb-8 sm:pt-10 sm:pb-10", homeInsetClass)}
			>
				<BackToIndexLink
					href={backHref}
					label={backLabel}
					ariaLabel={backAriaLabel}
					className="mb-6"
				/>

				<div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,25rem)] lg:items-center lg:gap-12">
					<div className="min-w-0 text-start">
						<h1
							className={cn(
								"display-title mt-6 max-w-2xl text-balance",
								displayTitleSizeClass(detail.title),
							)}
						>
							{detail.title}
						</h1>

						{bylineName ? (
							<p className="mt-3 text-body text-muted">
								<span className="font-bold text-foreground">{bylineName}</span>
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
								<span className="relative block aspect-[3/4] w-full overflow-hidden bg-sunken shadow-[0_12px_32px_rgba(23,21,18,0.14)]">
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
								className="flex aspect-[3/4] w-full items-center justify-center bg-sunken"
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
						{stripFields.map((field, index) => (
							<div
								key={field.label ?? index}
								className="flex items-baseline gap-2.5"
							>
								{field.label ? (
									<dt className="label font-medium text-muted">
										{field.label}
									</dt>
								) : null}
								<dd
									dir={field.ltr ? "ltr" : undefined}
									className="text-small font-bold text-foreground"
								>
									{field.links
										? field.links.map((link, index) => (
												<Fragment key={`${link.href}-${index}`}>
													{index > 0 ? (field.linkSep ?? "، ") : null}
													<NavLink
														href={link.href}
														className="text-foreground no-underline transition-colors fine-hover:text-brand"
													>
														{link.text}
													</NavLink>
												</Fragment>
											))
										: field.value}
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

			{seriesCards.length > 0 ? (
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
							className="font-heading text-h2 font-bold text-balance"
						>
							{detail.seriesName
								? `${seriesLabel}: ${detail.seriesName}`
								: seriesLabel}
						</h2>
						<ScrollReveal className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-4">
							{seriesCards.map((card) => (
								<ScrollRevealItem key={card.id}>
									<WritingGridCard
										{...card}
										badgeLabel={seriesVolumeLabel(
											Math.round(card.order),
											detail.seriesTotalBooks,
										)}
										currentLabel={card.current ? seriesCurrentLabel : null}
										isCurrent={card.current}
									/>
								</ScrollRevealItem>
							))}
						</ScrollReveal>
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
