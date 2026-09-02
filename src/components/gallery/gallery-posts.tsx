import { GalleryFilterBar } from "@/components/gallery/gallery-filter-bar";
import { GalleryPagination } from "@/components/gallery/gallery-pagination";
import {
	GalleryPrintBoard,
	type GalleryPrintPost,
} from "@/components/gallery/gallery-print-board";
import { homeInsetClass } from "@/lib/layout";
import { cn } from "@/lib/utils";

type TopicOption = {
	id: number;
	name: string;
};

type GalleryPostsProps = {
	/** Page h1 — the wall's own name (وێنە). */
	heading: string;
	/** Quiet subtitle beside the h1 (the collections label). */
	title: string;
	posts: GalleryPrintPost[];
	currentPage: number;
	totalPages: number;
	topics: TopicOption[];
	activeQuery?: string | null;
	activeType?: string | null;
	activeTopicId?: number | null;
	noResultsMessage: string;
	paginationLabel: string;
	previousLabel: string;
	nextLabel: string;
};

/**
 * The وێنە page body: small title + filter up top, then the covers laid out
 * as prints on a lit board (see GalleryPrintBoard). The `.gallery-board`
 * gradient grounds the whole section so the filter and the prints share one
 * light source.
 */
export function GalleryPosts({
	heading,
	title,
	posts,
	currentPage,
	totalPages,
	topics,
	activeQuery,
	activeType,
	activeTopicId,
	noResultsMessage,
	paginationLabel,
	previousLabel,
	nextLabel,
}: GalleryPostsProps) {
	return (
		<section
			id="gallery-content"
			className="gallery-board scroll-mt-26 sm:scroll-mt-30"
		>
			<div className={cn("pb-16 lg:pb-24", homeInsetClass)}>
				<header className="flex flex-wrap items-baseline gap-x-4 gap-y-1 pt-10 lg:pt-14">
					<h1 className="font-heading text-h1 font-semibold">{heading}</h1>
					<span className="text-small text-muted">{title}</span>
				</header>

				<div className="mt-8">
					<GalleryFilterBar
						topics={topics}
						activeQuery={activeQuery}
						activeType={activeType}
						activeTopicId={activeTopicId}
					/>
				</div>

				{posts.length === 0 ? (
					<p className="mt-10 max-w-xl text-body text-muted">
						{noResultsMessage}
					</p>
				) : (
					<GalleryPrintBoard posts={posts} className="mt-10 lg:mt-12" />
				)}

				{totalPages > 1 ? (
					<div className="mt-12 flex justify-center border-t border-border pt-8 lg:pt-10">
						<GalleryPagination
							currentPage={currentPage}
							totalPages={totalPages}
							activeQuery={activeQuery}
							activeType={activeType}
							activeTopicId={activeTopicId}
							label={paginationLabel}
							previousLabel={previousLabel}
							nextLabel={nextLabel}
						/>
					</div>
				) : null}
			</div>
		</section>
	);
}
