import { NewsCard } from "@/components/home/news-card";
import {
	ScrollReveal,
	ScrollRevealBlock,
	ScrollRevealItem,
} from "@/components/motion/scroll-reveal";
import { NewsCoverMedia } from "@/components/news/news-cover-media";
import { NewsMediaGallery } from "@/components/news/news-media-gallery";
import { NewsPostLightboxProvider } from "@/components/news/news-post-lightbox";
import { RichText } from "@/components/ui/rich-text";
import { Link } from "@/i18n/navigation";
import { homeInsetClass } from "@/lib/layout";
import { type NewsItem, newsItemCategoryLabel } from "@/lib/mock/news";
import { isRichTextEmpty } from "@/lib/rich-text";
import { newsTagHref } from "@/lib/search/taxonomy-href";
import { cn } from "@/lib/utils";

/**
 * News headlines run smaller than the other detail pages' display titles —
 * length-adaptive like displayTitleSizeClass, just scaled down a tier.
 */
function newsTitleSizeClass(title: string): string {
	const length = title.trim().length;
	if (length <= 24) return "text-[clamp(1.75rem,3vw+1rem,3rem)]";
	if (length <= 48) return "text-[clamp(1.5rem,1.8vw+0.9rem,2.25rem)]";
	return "text-[clamp(1.3rem,1.2vw+0.8rem,1.875rem)]";
}

type NewsPostViewProps = {
	item: NewsItem;
	authorLabel?: string;
	galleryLabel: string;
	closeLabel: string;
	lightboxPreviousLabel: string;
	lightboxNextLabel: string;
	related: NewsItem[];
	relatedLabel: string;
};

/**
 * Broadsheet front page — full-width masthead (dateline strip, headline,
 * byline) above a cover + justified-body spread, then tags/gallery and
 * related by tags.
 */
export function NewsPostView({
	item,
	authorLabel,
	galleryLabel,
	closeLabel,
	lightboxPreviousLabel,
	lightboxNextLabel,
	related,
	relatedLabel,
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
	const coverItem = {
		url: coverUrl,
		kind: coverKind,
		thumbnailUrl: item.coverThumbnailUrl ?? item.image.url,
		caption: null,
		sortOrder: 0,
	};

	return (
		<NewsPostLightboxProvider
			coverItem={coverItem}
			galleryItems={mediaGallery}
			articleTitle={item.title}
			closeLabel={closeLabel}
			previousLabel={lightboxPreviousLabel}
			nextLabel={lightboxNextLabel}
		>
			<article className={cn(homeInsetClass, "pb-10 sm:pb-12")}>
				<ScrollRevealBlock className="pt-10 sm:pt-12">
					<header className="pb-6 sm:pb-7">
						<h1
							className={cn("news-post-title", newsTitleSizeClass(item.title))}
						>
							{item.title}
						</h1>

						{authorLabel ? (
							<p className="mt-4 text-lead text-muted">{authorLabel}</p>
						) : null}
					</header>

					<div
						className={cn(
							"mt-6 sm:mt-8",
							bodyContent &&
								"news-post-spread flex flex-col gap-8 lg:flex-row lg:items-start lg:gap-12 xl:gap-16",
						)}
					>
						<div
							className={cn(
								"min-w-0",
								bodyContent
									? "lg:sticky lg:top-32 lg:w-[32rem] lg:shrink-0 lg:self-start xl:w-[38rem]"
									: "lg:max-w-xl",
							)}
						>
							<div className="overflow-hidden border border-border bg-sunken">
								<NewsCoverMedia
									url={coverUrl}
									alt={item.image.alt ?? item.title}
									kind={coverKind}
									posterUrl={item.coverThumbnailUrl ?? item.image.url}
									priority
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

						{bodyContent ? (
							<div className="project-article-body news-article-body min-w-0 flex-1">
								{item.description ? (
									<RichText content={item.description} />
								) : (
									<p className="text-body leading-relaxed text-justify text-foreground">
										{item.excerpt}
									</p>
								)}

								{tags.length > 0 && (
									<div className="mt-8 flex flex-wrap items-baseline gap-x-4 gap-y-2 sm:mt-10">
										{tags.map((tag) => (
											<Link
												key={tag}
												href={newsTagHref(tag)}
												className="text-body font-bold text-brand no-underline transition-opacity fine-hover:opacity-75"
											>
												#{tag}
											</Link>
										))}
									</div>
								)}
							</div>
						) : null}
					</div>
				</ScrollRevealBlock>

				{((!bodyContent && tags.length > 0) || mediaGallery.length > 0) && (
					<ScrollReveal className="mt-10 space-y-8 border-t border-border pt-6 sm:mt-12 sm:pt-8">
						{!bodyContent && tags.length > 0 && (
							<div>
								<ul className="flex flex-wrap items-baseline gap-x-4 gap-y-2">
									{tags.map((tag) => (
										<li key={tag}>
											<Link
												href={newsTagHref(tag)}
												className="text-body font-bold text-brand no-underline transition-opacity fine-hover:opacity-75"
											>
												#{tag}
											</Link>
										</li>
									))}
								</ul>
							</div>
						)}

						<NewsMediaGallery
							items={mediaGallery}
							title={galleryLabel}
							articleTitle={item.title}
						/>
					</ScrollReveal>
				)}

				{related.length > 0 ? (
					<section
						aria-labelledby="news-related-heading"
						className="mt-10 border-t border-border pt-6 sm:mt-12 sm:pt-8"
					>
						<h2
							id="news-related-heading"
							className="font-heading text-h2 font-bold text-balance"
						>
							{relatedLabel}
						</h2>
						<ScrollReveal className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3">
							{related.map((relatedItem) => (
								<ScrollRevealItem key={relatedItem.id}>
									<NewsCard
										item={relatedItem}
										variant="square"
										categoryLabel={newsItemCategoryLabel(relatedItem)}
										className="min-h-56 sm:min-h-64 2xl:min-h-[17rem]"
									/>
								</ScrollRevealItem>
							))}
						</ScrollReveal>
					</section>
				) : null}
			</article>
		</NewsPostLightboxProvider>
	);
}
