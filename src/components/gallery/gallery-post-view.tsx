import { ArrowLeftIcon, ArrowRightIcon } from "@heroicons/react/24/outline";
import { GalleryAlbum } from "@/components/gallery/gallery-album";
import type { GalleryAlbumMetadataLabels } from "@/components/gallery/gallery-album-item";
import { ScrollRevealBlock } from "@/components/motion/scroll-reveal";
import { Badge } from "@/components/ui/badge";
import { DirectionalIcon } from "@/components/ui/directional-icon";
import { RichText } from "@/components/ui/rich-text";
import { Link } from "@/i18n/navigation";
import { homeInsetClass } from "@/lib/layout";
import type { GalleryPost, GalleryPostDetail } from "@/lib/mock/gallery";
import { cn } from "@/lib/utils";

type GalleryPostViewProps = {
	detail: GalleryPostDetail;
	/** Pre-translated "{count} photographs" for THIS post. */
	photosLabel: string;
	/** Localized collection-type label (SINGLE / GALLERY / PHOTO_STORY). */
	typeLabel: string;
	/** publishmentDate formatted for the active locale (built in the page). */
	dateLabel?: string;
	backLabel: string;
	locationLabel: string;
	collectedByLabel: string;
	tagsLabel: string;
	navLabel: string;
	previousLabel: string;
	nextLabel: string;
	closeLabel: string;
	lightboxPreviousLabel: string;
	lightboxNextLabel: string;
	metadataLabels: GalleryAlbumMetadataLabels;
};

/** One catalog-record cell: tiny label over the value. */
function CreditCell({
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
				{post.title}
			</span>
		</Link>
	);
}

/**
 * Opened collection — the post detail, shaped after the public Image
 * Collection API: type + topic + date meta, Tiptap-HTML description rendered
 * as prose, a catalog-record credits block (location, collectedBy, tags),
 * the album as a dense contact sheet with per-item captions and the API's
 * auto-extracted metadata (dimensions, file size), and prev/next collection
 * navigation. Server Component; mirrors in RTL via logical props.
 */
export function GalleryPostView({
	detail,
	photosLabel,
	typeLabel,
	dateLabel,
	backLabel,
	locationLabel,
	collectedByLabel,
	tagsLabel,
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
	const hasCredits = Boolean(
		post.location || post.collectedBy || post.tags.length,
	);

	return (
		<article>
			<ScrollRevealBlock
				className={cn("pt-30 pb-10 sm:pt-34 lg:pb-12", homeInsetClass)}
			>
				<Link
					href="/gallery"
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

				<p className="label mt-8 flex flex-wrap items-center gap-2 font-medium">
					<span aria-hidden="true">{"//"}</span>
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
				<h1 className="display-title mt-4 max-w-4xl">{post.title}</h1>

				<RichText
					content={post.description}
					className="mt-6 max-w-xl [&>p]:text-muted"
				/>

				{hasCredits && (
					<dl className="mt-10 grid border-y border-border sm:grid-cols-2 lg:grid-cols-3">
						{post.location && (
							<CreditCell label={locationLabel}>{post.location}</CreditCell>
						)}
						{post.collectedBy && (
							<CreditCell
								label={collectedByLabel}
								className="border-t border-border sm:border-t-0 sm:border-s sm:ps-6"
							>
								{post.collectedBy}
							</CreditCell>
						)}
						{post.tags.length > 0 && (
							<CreditCell
								label={tagsLabel}
								className="border-t border-border lg:border-t-0 lg:border-s lg:ps-6"
							>
								<span className="flex flex-wrap gap-1.5">
									{post.tags.map((tag) => (
										<Badge key={tag} variant="subtle" size="sm">
											{tag}
										</Badge>
									))}
								</span>
							</CreditCell>
						)}
					</dl>
				)}
			</ScrollRevealBlock>

			<ScrollRevealBlock>
				<GalleryAlbum
					items={albumImages}
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
							"mt-0 grid border-t border-border sm:grid-cols-2",
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
