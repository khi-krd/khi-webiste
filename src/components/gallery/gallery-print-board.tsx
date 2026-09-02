import NextImage from "next/image";
import { RichText } from "@/components/ui/rich-text";
import { Link } from "@/i18n/navigation";
import type { GalleryPost } from "@/lib/mock/gallery";
import { cn } from "@/lib/utils";

export type GalleryPrintPost = GalleryPost & {
	photosLabel: string;
	typeLabel: string;
};

type GalleryPrintBoardProps = {
	posts: GalleryPrintPost[];
	className?: string;
};

/* The cover file itself decides the print's shape: the column fixes the
   width, the image's own aspect ratio gives the height — NEVER cropped to a
   preset box (user request: real image size; the container adapts to the
   image). Upload metadata seeds the pre-load reserve; once the file loads,
   `h-auto` lets its true intrinsic ratio win either way. */
type PrintCover = {
	url: string;
	width: number;
	height: number;
};

function coverOf(post: GalleryPost): PrintCover | null {
	const url =
		post.coverUrl ?? post.album.find((item) => item.imageUrl)?.imageUrl;
	if (!url) {
		return null;
	}
	const meta = post.album.find((item) => item.imageUrl === url);
	return {
		url,
		width: meta?.widthPx ?? 1600,
		height: meta?.heightPx ?? 1067,
	};
}

function Print({
	post,
	cover,
	high,
}: {
	post: GalleryPrintPost;
	cover: PrintCover;
	high: boolean;
}) {
	return (
		<Link
			href={`/gallery/${post.id}`}
			className={cn(
				"gallery-print group relative mb-4 block break-inside-avoid overflow-hidden bg-sunken no-underline",
				high && "gallery-print-high",
			)}
		>
			<NextImage
				src={cover.url}
				alt={post.title}
				width={cover.width}
				height={cover.height}
				sizes="(max-width: 639px) 50vw, (max-width: 1023px) 50vw, 33vw"
				className="block h-auto w-full"
			/>

			{/* Light sheen across the upper-left of the print — over the photo,
			    under the caption. */}
			<span
				aria-hidden="true"
				className="gallery-print-sheen pointer-events-none absolute inset-0"
			/>

			{/* Caption slab: hidden until hover/focus so the prints stay quiet.
			    Neutral ink scrim — the single green lives on the type chip. */}
			<span
				className={cn(
					"pointer-events-none absolute inset-0 flex flex-col items-start justify-end gap-2 p-4 sm:p-5",
					"bg-linear-to-t from-foreground/85 via-foreground/35 to-transparent",
					"opacity-0 transition-opacity duration-300 group-fine:opacity-100 group-focus-visible:opacity-100",
				)}
			>
				<span className="bg-primary px-2 py-1 font-heading text-label font-medium text-primary-foreground">
					{post.typeLabel}
				</span>
				<span className="font-heading text-h3 font-semibold text-white">
					{post.title}
				</span>
				{post.description ? (
					<RichText
						content={post.description}
						compact
						className="line-clamp-2 text-small text-white/85"
					/>
				) : null}
				<span className="text-label text-white/70">{post.photosLabel}</span>
			</span>
		</Link>
	);
}

/**
 * Album columns of collection covers at their REAL proportions — equal-width
 * columns, print heights set by each image's own ratio, so the board falls
 * into naturally uneven stacks like the reference album wall. Every print
 * casts down-right (the board is lit from the top-left — see the
 * .gallery-print rules in globals); hovering lifts a print toward the light
 * and reveals its caption. Every third print rests a touch higher.
 */
export function GalleryPrintBoard({
	posts,
	className,
}: GalleryPrintBoardProps) {
	const prints = posts
		.map((post) => ({ post, cover: coverOf(post) }))
		.filter((entry): entry is { post: GalleryPrintPost; cover: PrintCover } =>
			Boolean(entry.cover),
		);

	if (prints.length === 0) {
		return null;
	}

	return (
		<div className={cn("columns-2 gap-4 lg:columns-3", className)}>
			{prints.map(({ post, cover }, index) => (
				<Print key={post.id} post={post} cover={cover} high={index % 3 === 0} />
			))}
		</div>
	);
}
