import NextImage from "next/image";
import {
	galleryPhotoSurfaceClass,
	galleryStripTrayClass,
} from "@/components/gallery/gallery-album-item";
import { GalleryFilterBar } from "@/components/gallery/gallery-filter-bar";
import {
	GalleryReveal,
	GalleryRevealItem,
} from "@/components/gallery/gallery-motion";
import { GalleryPagination } from "@/components/gallery/gallery-pagination";
import { Badge } from "@/components/ui/badge";
import { RichText } from "@/components/ui/rich-text";
import { Link } from "@/i18n/navigation";
import { homeInsetClass } from "@/lib/layout";
import type { GalleryPost } from "@/lib/mock/gallery";
import { cn } from "@/lib/utils";

type GalleryPostWithMeta = GalleryPost & {
	photosLabel: string;
	typeLabel: string;
};

type TopicOption = {
	id: number;
	name: string;
};

type GalleryPostsProps = {
	eyebrow: string;
	title: string;
	description: string;
	posts: GalleryPostWithMeta[];
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

const sliceEase = "ease-[cubic-bezier(0.22,1,0.36,1)]";

function PostRow({ post }: { post: GalleryPostWithMeta }) {
	const stripItems = post.album.filter((item) => item.imageUrl).slice(0, 4);

	return (
		<article className="border-t border-border py-10 first:border-t-0 sm:py-12 lg:py-16">
			<GalleryReveal className="grid gap-8 lg:grid-cols-[minmax(0,4fr)_minmax(0,6fr)] lg:items-end lg:gap-14">
				<GalleryRevealItem>
					<p className="label flex flex-wrap items-center gap-2 font-medium">
						<span aria-hidden="true">{"//"}</span>
						<span>{post.typeLabel}</span>
						<span aria-hidden="true">·</span>
						<span>{post.photosLabel}</span>
						{post.topicName && (
							<Badge variant="outline" size="sm" className="ms-1">
								{post.topicName}
							</Badge>
						)}
					</p>
					<h3 className="display-title mt-5 text-display">
						<Link
							href={`/gallery/${post.id}`}
							className="underline decoration-transparent decoration-[3px] underline-offset-[0.16em] transition-[text-decoration-color] duration-300 fine-hover:decoration-current"
						>
							{post.title}
						</Link>
					</h3>
					<RichText
						content={post.description}
						compact
						className="mt-5 line-clamp-3 max-w-md text-justify text-muted"
					/>
				</GalleryRevealItem>

				{/* Strip links through to the collection — title above is the
				    accessible entry; slices are decorative click-through. */}
				<Link
					href={`/gallery/${post.id}`}
					aria-hidden="true"
					tabIndex={-1}
					className={cn(galleryStripTrayClass, "block no-underline")}
				>
					<div className="flex h-72 gap-1 sm:h-96 lg:h-[32rem]">
						{stripItems.map((item) => (
							<GalleryRevealItem
								key={item.id}
								className={cn(
									"relative grow basis-0 overflow-hidden transition-[flex-grow] duration-600 fine-hover:grow-[2.6]",
									galleryPhotoSurfaceClass,
									sliceEase,
								)}
							>
								<NextImage
									src={item.imageUrl as string}
									alt=""
									fill
									sizes="(max-width: 1023px) 25vw, 20vw"
									className={cn(
										"object-cover brightness-[0.97] saturate-[0.85] transition-[filter,scale] duration-700 group-fine:scale-105 group-fine:brightness-100 group-fine:saturate-100",
										sliceEase,
									)}
								/>
							</GalleryRevealItem>
						))}
					</div>
				</Link>
			</GalleryReveal>
		</article>
	);
}

export function GalleryPosts({
	eyebrow,
	title,
	description,
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
			aria-labelledby="gallery-posts-heading"
			className="scroll-mt-26 bg-background sm:scroll-mt-30"
		>
			<div
				className={cn(
					"bg-primary py-12 text-primary-foreground sm:py-16 lg:py-20",
					homeInsetClass,
				)}
			>
				<div className="border-b border-primary-foreground/20 pb-5">
					<p className="label font-medium text-primary-foreground/70">
						<span aria-hidden="true" className="me-2">
							{"//"}
						</span>
						{eyebrow}
					</p>
				</div>
				<h2 id="gallery-posts-heading" className="display-title mt-8">
					{title}
				</h2>
				<p className="mt-6 max-w-xl text-justify text-body leading-relaxed text-primary-foreground/70">
					{description}
				</p>
			</div>

			<div className={cn("pb-16 lg:pb-24", homeInsetClass)}>
				<div className="pt-8 lg:pt-10">
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
					<div>
						{posts.map((post, _index) => (
							<PostRow key={post.id} post={post} />
						))}
					</div>
				)}

				{totalPages > 1 ? (
					<div className="flex justify-center border-t border-border pt-8 lg:pt-10">
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
