import { ArrowLeftIcon, ArrowRightIcon } from "@heroicons/react/24/outline";
import { GalleryAlbum } from "@/components/gallery/gallery-album";
import type { GalleryAlbumMetadataLabels } from "@/components/gallery/gallery-album-item";
import { ScrollRevealBlock } from "@/components/motion/scroll-reveal";
import { Badge } from "@/components/ui/badge";
import { CoverLightbox } from "@/components/ui/cover-lightbox";
import { DirectionalIcon } from "@/components/ui/directional-icon";
import { Image } from "@/components/ui/image";
import { RichText } from "@/components/ui/rich-text";
import { Link } from "@/i18n/navigation";
import { homeInsetClass } from "@/lib/layout";
import type { GalleryPost, GalleryPostDetail } from "@/lib/mock/gallery";
import { galleryTagHref } from "@/lib/search/taxonomy-href";
import { displayTitleSizeClass } from "@/lib/title-scale";
import { cn } from "@/lib/utils";

type GalleryPostViewProps = {
	detail: GalleryPostDetail;
	/** Pre-translated "{count} photographs" for THIS post. */
	photosLabel: string;
	/** Localized collection-type label (SINGLE / GALLERY / PHOTO_STORY). */
	typeLabel: string;
	/** publishmentDate formatted for the active locale (built in the page). */
	dateLabel?: string;
	locationLabel: string;
	collectedByLabel: string;
	navLabel: string;
	previousLabel: string;
	nextLabel: string;
	closeLabel: string;
	lightboxPreviousLabel: string;
	lightboxNextLabel: string;
	metadataLabels: GalleryAlbumMetadataLabels;
};

/** One museum wall label: hairline-topped placard, tiny label over quiet value. */
function CreditCell({
	label,
	children,
}: {
	label: string;
	children: React.ReactNode;
}) {
	return (
		<div className="flex flex-col gap-1.5 border-t border-border pt-3">
			<dt className="label font-medium">{label}</dt>
			<dd className="text-small text-muted">{children}</dd>
		</div>
	);
}

function AdjacentLink({
	post,
	label,
	direction,
}: {
	post: GalleryPost;
	label: string;
	direction: "previous" | "next";
}) {
	const isNext = direction === "next";

	return (
		<Link
			href={`/gallery/${post.id}`}
			className={cn(
				"group flex flex-col gap-3 py-6 no-underline sm:py-8",
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
				{post.title}
			</span>
		</Link>
	);
}

/**
 * Opened collection as an exhibition-catalog spread: typographic header with
 * an offset cover "plate" beside it (click-to-enlarge via CoverLightbox, with
 * a museum-style label caption), a hashtag row under the description,
 * wall-label credit placards (location, collectedBy),
 * the album as numbered plates, and prev/next collection
 * navigation. Server Component; mirrors in RTL via logical props.
 */
export function GalleryPostView({
	detail,
	photosLabel,
	typeLabel,
	dateLabel,
	locationLabel,
	collectedByLabel,
	navLabel,
	previousLabel,
	nextLabel,
	closeLabel,
	lightboxPreviousLabel,
	lightboxNextLabel,
	metadataLabels,
}: GalleryPostViewProps) {
	const { post, previous, next } = detail;
	const albumImages = [...post.album].sort((a, b) => a.sortOrder - b.sortOrder);
	const hasCredits = Boolean(post.location || post.collectedBy);

	return (
		<article>
			<ScrollRevealBlock
				className={cn("pt-8 pb-5 sm:pt-10 lg:pb-6", homeInsetClass)}
			>
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
									aspectRatio="4/3"
									sizes="(max-width: 1023px) 100vw, 40vw"
									className="border border-border bg-surface"
								/>
							</CoverLightbox>
							{/* Museum label under the plate — photo count only; the title
							    already sits in the adjacent h1. */}
							<figcaption className="mt-2 border-t border-border pt-2">
								<p className="label">{photosLabel}</p>
							</figcaption>
						</figure>
					)}
				</div>

				{hasCredits && (
					<dl className="mt-8 grid gap-x-8 gap-y-5 sm:grid-cols-2 lg:mt-10 lg:grid-cols-3">
						{post.location && (
							<CreditCell label={locationLabel}>{post.location}</CreditCell>
						)}
						{post.collectedBy && (
							<CreditCell label={collectedByLabel}>
								{post.collectedBy}
							</CreditCell>
						)}
					</dl>
				)}
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

			{(previous || next) && (
				<ScrollRevealBlock>
					<nav
						aria-label={navLabel}
						className={cn(
							"grid border-t border-border sm:grid-cols-2",
							homeInsetClass,
						)}
					>
						{previous ? (
							<AdjacentLink
								post={previous}
								label={previousLabel}
								direction="previous"
							/>
						) : (
							<div aria-hidden="true" />
						)}
						{next ? (
							<AdjacentLink post={next} label={nextLabel} direction="next" />
						) : null}
					</nav>
				</ScrollRevealBlock>
			)}
		</article>
	);
}
