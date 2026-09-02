import { GalleryAlbum } from "@/components/gallery/gallery-album";
import type { GalleryAlbumMetadataLabels } from "@/components/gallery/gallery-album-item";
import { galleryPhotoSurfaceClass } from "@/components/gallery/gallery-album-item";
import { ScrollRevealBlock } from "@/components/motion/scroll-reveal";
import { BackToIndexLink } from "@/components/ui/back-to-index";
import { Badge } from "@/components/ui/badge";
import { CoverLightbox } from "@/components/ui/cover-lightbox";
import { Image } from "@/components/ui/image";
import { RichText } from "@/components/ui/rich-text";
import { Link } from "@/i18n/navigation";
import { homeInsetClass } from "@/lib/layout";
import type { GalleryPostDetail } from "@/lib/mock/gallery";
import { galleryTagHref } from "@/lib/search/taxonomy-href";
import { displayTitleSizeClass } from "@/lib/title-scale";
import { cn } from "@/lib/utils";

const sliceEase = "ease-[cubic-bezier(0.22,1,0.36,1)]";

/** One row only — enough square cards to fill it, no overflow scroll. */
const RELATED_GALLERY_VISIBLE = 3;

/** Card-shaped slice of a related collection, labels pre-translated in the page. */
export type GalleryRelatedCard = {
	id: string;
	title: string;
	coverUrl?: string;
	/** Pre-translated "{count} photographs" for that collection. */
	photosLabel: string;
};

type GalleryPostViewProps = {
	detail: GalleryPostDetail;
	/** Locale-relative index path this item belongs to. */
	backHref: string;
	/** Visible back-button label — the index page's own title. */
	backLabel: string;
	backAriaLabel?: string;

	/** Pre-translated "{count} photographs" for THIS post. */
	photosLabel: string;
	/** Localized collection-type label (SINGLE / GALLERY / PHOTO_STORY). */
	typeLabel: string;
	/** publishmentDate formatted for the active locale (built in the page). */
	dateLabel?: string;
	locationLabel: string;
	collectedByLabel: string;
	/** Heading over the other-collections row ("وێنەی تر"). */
	relatedLabel: string;
	related: GalleryRelatedCard[];
	closeLabel: string;
	lightboxPreviousLabel: string;
	lightboxNextLabel: string;
	metadataLabels: GalleryAlbumMetadataLabels;
};

/** Quiet credit pair under the tags — tiny label over value, no hairlines. */
function CreditPair({
	label,
	children,
}: {
	label: string;
	children: React.ReactNode;
}) {
	return (
		<div className="flex flex-col gap-1">
			<dt className="label font-medium">{label}</dt>
			<dd className="text-small text-muted">{children}</dd>
		</div>
	);
}

/** Other collection as a square-cover card in the video page's grid language. */
function RelatedCard({ card }: { card: GalleryRelatedCard }) {
	return (
		<Link
			href={`/gallery/${card.id}`}
			className="group flex h-full min-w-0 flex-col border border-border bg-surface no-underline transition-[border-color,box-shadow] duration-300 fine-hover:border-foreground/30 fine-hover:shadow-[0_8px_24px_-12px_rgba(26,24,19,0.12)]"
		>
			<Image
				src={card.coverUrl ?? ""}
				alt=""
				aspectRatio="square"
				sizes="(max-width: 639px) 100vw, 33vw"
				className="w-full bg-sunken"
				imageClassName={cn(
					"brightness-[0.97] saturate-[0.85] transition-[filter,scale] duration-700 group-fine:scale-[1.04] group-fine:brightness-100 group-fine:saturate-100",
					sliceEase,
				)}
			/>
			<div className="flex w-full flex-1 flex-col gap-1.5 px-4 py-4 text-start sm:px-5">
				<p className="label text-muted">{card.photosLabel}</p>
				<h3 className="font-heading text-h3 font-bold leading-snug text-foreground">
					{card.title}
				</h3>
			</div>
		</Link>
	);
}

/**
 * Opened collection as an exhibition-catalog spread: typographic header with
 * an offset square cover "plate" beside it (click-to-enlarge via
 * CoverLightbox), a hashtag row under the description with the quiet
 * location/collectedBy credits directly beneath it, the album as a uniform
 * square grid, and a "وێنەی تر" row of other collections as square cover
 * cards. Server Component; mirrors in RTL via logical props.
 */
export function GalleryPostView({
	detail,
	backHref,
	backLabel,
	backAriaLabel,
	photosLabel,
	typeLabel,
	dateLabel,
	locationLabel,
	collectedByLabel,
	relatedLabel,
	related,
	closeLabel,
	lightboxPreviousLabel,
	lightboxNextLabel,
	metadataLabels,
}: GalleryPostViewProps) {
	const { post } = detail;
	const albumImages = [...post.album].sort((a, b) => a.sortOrder - b.sortOrder);
	const hasCredits = Boolean(post.location || post.collectedBy);
	const relatedCards = related.slice(0, RELATED_GALLERY_VISIBLE);

	return (
		<article>
			<ScrollRevealBlock
				className={cn("pt-8 pb-5 sm:pt-10 lg:pb-6", homeInsetClass)}
			>
				<BackToIndexLink
					href={backHref}
					label={backLabel}
					ariaLabel={backAriaLabel}
					className="mb-6"
				/>

				{/* Catalog spread: typographic header start, offset cover plate end. */}
				<div className="grid gap-8 lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)] lg:gap-16">
					<div>
						<p className="label flex flex-wrap items-center gap-2 font-medium text-foreground">
							<span>{typeLabel}</span>
							<span aria-hidden="true">·</span>
							<span>{photosLabel}</span>
							{dateLabel && (
								<>
									<span aria-hidden="true">·</span>
									<span>{dateLabel}</span>
								</>
							)}
							{post.topicName && (
								<Badge variant="outline" size="sm" className="ms-1">
									{post.topicName}
								</Badge>
							)}
						</p>
						<h1
							className={cn(
								"display-title mt-3 max-w-4xl",
								displayTitleSizeClass(post.title),
							)}
						>
							{post.title}
						</h1>

						<RichText
							content={post.description}
							className="mt-5 max-w-xl text-justify [&>p]:text-justify [&>p]:text-muted"
						/>

						{post.tags.length > 0 && (
							<div className="mt-6 flex flex-wrap items-baseline gap-x-4 gap-y-2">
								{post.tags.map((tag) => (
									<Link
										key={tag}
										href={galleryTagHref(tag)}
										className="text-body font-bold text-brand no-underline transition-opacity fine-hover:opacity-75"
									>
										#{tag}
									</Link>
								))}
							</div>
						)}

						{/* Location / collectedBy sit right under the tags — quiet
						    pairs, no wall-label hairlines. */}
						{hasCredits && (
							<dl className="mt-6 flex flex-wrap gap-x-10 gap-y-3">
								{post.location && (
									<CreditPair label={locationLabel}>{post.location}</CreditPair>
								)}
								{post.collectedBy && (
									<CreditPair label={collectedByLabel}>
										{post.collectedBy}
									</CreditPair>
								)}
							</dl>
						)}
					</div>

					{post.coverUrl && (
						<figure className="w-full max-w-md lg:mt-14 lg:justify-self-end">
							<CoverLightbox
								src={post.coverUrl}
								alt={post.title}
								caption={post.title}
								closeLabel={closeLabel}
							>
								<Image
									src={post.coverUrl}
									alt=""
									aspectRatio="square"
									sizes="(max-width: 1023px) 100vw, 40vw"
									className={galleryPhotoSurfaceClass}
								/>
							</CoverLightbox>
						</figure>
					)}
				</div>
			</ScrollRevealBlock>

			<ScrollRevealBlock>
				<GalleryAlbum
					items={albumImages}
					coverUrl={post.coverUrl}
					postTitle={post.title}
					photosLabel={photosLabel}
					closeLabel={closeLabel}
					previousLabel={lightboxPreviousLabel}
					nextLabel={lightboxNextLabel}
					metadataLabels={metadataLabels}
				/>
			</ScrollRevealBlock>

			{relatedCards.length > 0 && (
				<ScrollRevealBlock>
					<section
						aria-labelledby="gallery-related-heading"
						className={cn(
							"border-t border-border pt-8 pb-10 sm:pt-10 lg:pb-14",
							homeInsetClass,
						)}
					>
						<h2
							id="gallery-related-heading"
							className="font-heading text-h3 font-bold text-foreground"
						>
							{relatedLabel}
						</h2>

						<div className="mt-4 grid grid-cols-1 gap-4 sm:mt-5 sm:grid-cols-3 sm:gap-5">
							{relatedCards.map((card) => (
								<RelatedCard key={card.id} card={card} />
							))}
						</div>
					</section>
				</ScrollRevealBlock>
			)}
		</article>
	);
}
