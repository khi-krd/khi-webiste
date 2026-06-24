import { ProjectCoverImage } from "@/components/projects/project-cover-image";
import { ProjectCoverMedia } from "@/components/projects/project-cover-media";
import { ScrollRevealItem } from "@/components/motion/scroll-reveal";
import { VideoPlayer } from "@/components/ui/video-player";
import type { MediaItem } from "@/types/media";
import { cn } from "@/lib/utils";

type NewsMediaGalleryProps = {
	items: MediaItem[];
	title: string;
	articleTitle: string;
};

type GallerySegment =
	| { type: "images"; items: MediaItem[] }
	| { type: "media"; item: MediaItem };

function frameNo(index: number): string {
	return String(index + 1).padStart(2, "0");
}

/** Preserve API order while grouping consecutive stills into a shared grid. */
function buildSegments(items: MediaItem[]): GallerySegment[] {
	const segments: GallerySegment[] = [];
	let imageBatch: MediaItem[] = [];

	const flushImages = () => {
		if (imageBatch.length === 0) return;
		segments.push({ type: "images", items: imageBatch });
		imageBatch = [];
	};

	for (const item of items) {
		if (item.kind === "IMAGE") {
			imageBatch.push(item);
			continue;
		}
		flushImages();
		segments.push({ type: "media", item });
	}

	flushImages();
	return segments;
}

function ImageGrid({
	items,
	articleTitle,
}: {
	items: MediaItem[];
	articleTitle: string;
}) {
	return (
		<div
			className={cn(
				"grid gap-3 sm:gap-4",
				items.length > 1 ? "sm:grid-cols-2" : "grid-cols-1",
			)}
		>
			{items.map((item) => (
				<figure key={`${item.url}-${item.sortOrder}`} className="min-w-0">
					<div className="relative aspect-[4/3] overflow-hidden border border-border bg-sunken">
						<ProjectCoverImage
							src={item.url}
							alt={item.caption ?? articleTitle}
							className="absolute inset-0"
							sizes="(max-width: 640px) 100vw, 50vw"
						/>
					</div>
					{item.caption ? (
						<figcaption className="mt-3 text-small leading-relaxed text-muted">
							{item.caption}
						</figcaption>
					) : null}
				</figure>
			))}
		</div>
	);
}

function VideoBlock({
	item,
	articleTitle,
}: {
	item: MediaItem;
	articleTitle: string;
}) {
	return (
		<figure className="min-w-0">
			<div className="overflow-hidden border border-border bg-foreground">
				<VideoPlayer
					src={item.url}
					title={item.caption ?? articleTitle}
					poster={item.thumbnailUrl ?? undefined}
					posterAlt={item.caption ?? articleTitle}
					variant="minimal"
					className="aspect-video w-full"
				/>
			</div>
			{item.caption ? (
				<figcaption className="mt-3 text-small leading-relaxed text-muted">
					{item.caption}
				</figcaption>
			) : null}
		</figure>
	);
}

function AudioBlock({
	item,
	articleTitle,
}: {
	item: MediaItem;
	articleTitle: string;
}) {
	return (
		<figure className="min-w-0">
			<ProjectCoverMedia
				url={item.url}
				alt={item.caption ?? articleTitle}
				kind="AUDIO"
				posterUrl={item.thumbnailUrl ?? "/menu/5.jpg"}
				className="min-h-56 w-full sm:min-h-64"
				sizes="100vw"
			/>
			{item.caption ? (
				<figcaption className="mt-3 text-small leading-relaxed text-muted">
					{item.caption}
				</figcaption>
			) : null}
		</figure>
	);
}

export function NewsMediaGallery({
	items,
	title,
	articleTitle,
}: NewsMediaGalleryProps) {
	if (items.length === 0) return null;

	const segments = buildSegments(items);

	return (
		<ScrollRevealItem className="pt-10 sm:pt-12">
			<header className="flex items-baseline justify-between gap-4 border-b border-border pb-4">
				<h2 className="label font-medium text-foreground">
					<span aria-hidden="true" className="me-2">
						{"//"}
					</span>
					{title}
				</h2>
				<p className="label text-muted" aria-hidden="true">
					{frameNo(items.length)}
				</p>
			</header>

			<div className="flex flex-col gap-8 pt-8 sm:gap-10">
				{segments.map((segment) => {
					if (segment.type === "images") {
						return (
							<ImageGrid
								key={segment.items.map((item) => item.sortOrder).join("-")}
								items={segment.items}
								articleTitle={articleTitle}
							/>
						);
					}

					const { item } = segment;
					if (item.kind === "VIDEO") {
						return (
							<VideoBlock
								key={`${item.kind}-${item.url}-${item.sortOrder}`}
								item={item}
								articleTitle={articleTitle}
							/>
						);
					}

					return (
						<AudioBlock
							key={`${item.kind}-${item.url}-${item.sortOrder}`}
							item={item}
							articleTitle={articleTitle}
						/>
					);
				})}
			</div>
		</ScrollRevealItem>
	);
}
