import { NewsCard } from "@/components/home/news-card";
import { NewsCoverMedia } from "@/components/news/news-cover-media";
import { NewsMediaGallery } from "@/components/news/news-media-gallery";
import { ArrowLeftIcon, ArrowRightIcon } from "@heroicons/react/24/outline";
import {
	ScrollReveal,
	ScrollRevealBlock,
	ScrollRevealItem,
} from "@/components/motion/scroll-reveal";
import { DirectionalIcon } from "@/components/ui/directional-icon";
import { RichText } from "@/components/ui/rich-text";
import { TaxonomyBadgeLink } from "@/components/ui/taxonomy-badge-link";
import { Link } from "@/i18n/navigation";
import { newsDetailHref } from "@/lib/content/href";
import { homeInsetClass } from "@/lib/layout";
import {
	type NewsItem,
	newsItemCategoryLabel,
} from "@/lib/mock/news";
import { isRichTextEmpty } from "@/lib/rich-text";
import { newsCategoryHref, newsTagHref } from "@/lib/search/taxonomy-href";
import { cn } from "@/lib/utils";

type NewsPostViewProps = {
	item: NewsItem;
	categoryLabel: string;
	dateLabel: string;
	backLabel: string;
	authorLabel?: string;
	readTimeLabel?: string;
	tagsLabel: string;
	galleryLabel: string;
	closeLabel: string;
	lightboxPreviousLabel: string;
	lightboxNextLabel: string;
	previous: NewsItem | null;
	next: NewsItem | null;
	related: NewsItem[];
	relatedLabel: string;
	navLabel: string;
	previousLabel: string;
	nextLabel: string;
};

function AdjacentLink({
	item,
	label,
	direction,
}: {
	item: NewsItem;
	label: string;
	direction: "previous" | "next";
}) {
	const isNext = direction === "next";

	return (
		<Link
			href={newsDetailHref(item.slug)}
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

/**
 * Blog-style news article — cover beside a long-form rich-text body,
 * tags strip, optional media gallery, prev/next navigation, related by tags.
 */
export function NewsPostView({
	item,
	categoryLabel,
	dateLabel,
	backLabel,
	authorLabel,
	readTimeLabel,
	tagsLabel,
	galleryLabel,
	closeLabel,
	lightboxPreviousLabel,
	lightboxNextLabel,
	previous,
	next,
	related,
	relatedLabel,
	navLabel,
	previousLabel,
	nextLabel,
}: NewsPostViewProps) {
	const coverUrl = item.coverUrl ?? item.image.url;
	const coverKind = item.coverMediaType ?? "IMAGE";
	const mediaGallery = item.mediaGallery ?? [];
	const tags = item.tags ?? [];
	const bodyContent = item.description
		? !isRichTextEmpty(item.description)
			? item.description
			: null
		: item.excerpt;

	return (
		<article className={cn(homeInsetClass, "pb-16 sm:pb-20")}>
			<ScrollRevealBlock className="pt-10 sm:pt-12">
				<Link
					href="/news"
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

				<div className="mt-10 grid gap-10 lg:grid-cols-[minmax(0,32rem)_minmax(0,1fr)] lg:items-start lg:gap-12 xl:grid-cols-[minmax(0,38rem)_minmax(0,1fr)] xl:gap-16">
					<div className="min-w-0 lg:sticky lg:top-32 lg:self-start">
						<div className="overflow-hidden border border-border bg-sunken">
							<NewsCoverMedia
								url={coverUrl}
								alt={item.image.alt ?? item.title}
								kind={coverKind}
								posterUrl={item.coverThumbnailUrl ?? item.image.url}
								priority
								closeLabel={closeLabel}
								previousLabel={lightboxPreviousLabel}
								nextLabel={lightboxNextLabel}
								className={cn(
									coverKind === "IMAGE"
										? "aspect-[4/3] w-full"
										: "min-h-64 w-full sm:min-h-80",
								)}
								sizes="(max-width: 1024px) 100vw, 38rem"
								imageClassName="brightness-[0.94] saturate-[0.9]"
							/>
						</div>
					</div>

					<div className="min-w-0">
						<div className="flex flex-wrap items-center gap-2">
							<TaxonomyBadgeLink
								href={newsCategoryHref(item.category)}
								variant="outline"
								size="sm"
							>
								{categoryLabel}
							</TaxonomyBadgeLink>
							<time className="text-small text-muted">{dateLabel}</time>
							{readTimeLabel ? (
								<span className="text-small text-muted">{readTimeLabel}</span>
							) : null}
						</div>

						<h1 className="news-post-title mt-5 text-balance">{item.title}</h1>

						{authorLabel ? (
							<p className="mt-3 text-lead text-muted">{authorLabel}</p>
						) : null}

						{bodyContent ? (
							<div className="project-article-body news-article-body mt-8 border-t border-border pt-8 sm:mt-10 sm:pt-10">
								{item.description ? (
									<RichText content={item.description} />
								) : (
									<p className="text-body leading-relaxed text-justify text-foreground">
										{item.excerpt}
									</p>
								)}
							</div>
						) : null}
					</div>
				</div>
			</ScrollRevealBlock>

			{(tags.length > 0 || mediaGallery.length > 0) && (
				<ScrollReveal className="mt-12 border-t border-border sm:mt-16">
					{tags.length > 0 && (
						<div className="border-b border-border py-6">
							<p className="label font-medium">{tagsLabel}</p>
							<ul className="mt-3 flex flex-wrap gap-2">
								{tags.map((tag) => (
									<li key={tag}>
										<TaxonomyBadgeLink
											href={newsTagHref(tag)}
											variant="outline"
											size="sm"
										>
											{tag}
										</TaxonomyBadgeLink>
									</li>
								))}
							</ul>
						</div>
					)}

					<NewsMediaGallery
						items={mediaGallery}
						title={galleryLabel}
						articleTitle={item.title}
						closeLabel={closeLabel}
						previousLabel={lightboxPreviousLabel}
						nextLabel={lightboxNextLabel}
					/>
				</ScrollReveal>
			)}

			{(previous || next) && (
				<nav
					aria-label={navLabel}
					className="mt-12 border-t border-border sm:mt-16"
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

			{related.length > 0 ? (
				<section
					aria-labelledby="news-related-heading"
					className="mt-12 border-t border-border pt-10 sm:mt-16 sm:pt-12"
				>
					<h2
						id="news-related-heading"
						className="font-heading text-h2 font-bold text-balance"
					>
						{relatedLabel}
					</h2>
					<ScrollReveal className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3">
						{related.map((relatedItem) => (
							<ScrollRevealItem key={relatedItem.id}>
								<NewsCard
									item={relatedItem}
									variant="square"
									categoryLabel={newsItemCategoryLabel(relatedItem)}
									className="min-h-56 sm:min-h-64"
								/>
							</ScrollRevealItem>
						))}
					</ScrollReveal>
				</section>
			) : null}
		</article>
	);
}
