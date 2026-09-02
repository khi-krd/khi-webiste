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

/* Mosaic rhythm — span pairs cycled over the covers, dense-packed so the board
   reads as three uneven columns of prints (like the reference album wall).
   Phones drop to a 4-column board with two prints per row. `high` prints rest
   a touch further off the board than their neighbours — a real album never
   lies perfectly flat. */
const PRINT_PATTERN = [
	{ span: "col-span-2 row-span-2 sm:col-span-2 sm:row-span-2", high: true },
	{ span: "col-span-2 row-span-3 sm:col-span-2 sm:row-span-3", high: false },
	{ span: "col-span-4 row-span-3 sm:col-span-3 sm:row-span-3", high: false },
	{ span: "col-span-2 row-span-3 sm:col-span-2 sm:row-span-3", high: false },
	{ span: "col-span-2 row-span-2 sm:col-span-3 sm:row-span-2", high: true },
	{ span: "col-span-4 row-span-2 sm:col-span-2 sm:row-span-2", high: false },
	{ span: "col-span-2 row-span-3 sm:col-span-3 sm:row-span-3", high: false },
	{ span: "col-span-2 row-span-2 sm:col-span-2 sm:row-span-2", high: true },
	{ span: "col-span-4 row-span-3 sm:col-span-2 sm:row-span-3", high: false },
] as const;

function coverOf(post: GalleryPost): string | undefined {
	return post.coverUrl ?? post.album.find((item) => item.imageUrl)?.imageUrl;
}

function Print({
	post,
	cover,
	pattern,
}: {
	post: GalleryPrintPost;
	cover: string;
	pattern: (typeof PRINT_PATTERN)[number];
}) {
	return (
		<Link
			href={`/gallery/${post.id}`}
			className={cn(
				"gallery-print group relative block overflow-hidden bg-sunken no-underline",
				pattern.span,
				pattern.high && "gallery-print-high",
			)}
		>
			<NextImage
				src={cover}
				alt={post.title}
				fill
				sizes="(max-width: 639px) 100vw, 45vw"
				className="object-cover"
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
 * Lit-paper mosaic of collection covers. Every print casts down-right (the
 * board is lit from the top-left — see the .gallery-print rules in globals);
 * hovering lifts a print toward the light and reveals its caption.
 */
export function GalleryPrintBoard({
	posts,
	className,
}: GalleryPrintBoardProps) {
	const prints = posts
		.map((post) => ({ post, cover: coverOf(post) }))
		.filter((entry): entry is { post: GalleryPrintPost; cover: string } =>
			Boolean(entry.cover),
		);

	if (prints.length === 0) {
		return null;
	}

	return (
		<div
			className={cn(
				"grid grid-flow-dense grid-cols-4 auto-rows-[clamp(70px,9vw,110px)] gap-4 sm:grid-cols-7",
				className,
			)}
		>
			{prints.map(({ post, cover }, index) => (
				<Print
					key={post.id}
					post={post}
					cover={cover}
					pattern={PRINT_PATTERN[index % PRINT_PATTERN.length]}
				/>
			))}
		</div>
	);
}
