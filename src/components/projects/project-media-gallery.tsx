import { ProjectMediaItemBlock } from "@/components/projects/project-media-item";
import { ScrollRevealItem } from "@/components/motion/scroll-reveal";
import type { MediaItem } from "@/types/media";

type ProjectMediaGalleryProps = {
	items: MediaItem[];
	title: string;
	projectTitle: string;
};

export function ProjectMediaGallery({
	items,
	title,
	projectTitle,
}: ProjectMediaGalleryProps) {
	if (items.length === 0) return null;

	return (
		<ScrollRevealItem className="mt-14 border-t border-border pt-12 sm:mt-16 sm:pt-14">
			<h2 className="font-heading text-h2 font-bold text-foreground">{title}</h2>
			<div className="mt-8 grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
				{items.map((item) => (
					<ProjectMediaItemBlock
						key={`${item.kind}-${item.url}-${item.sortOrder}`}
						item={item}
						title={projectTitle}
					/>
				))}
			</div>
		</ScrollRevealItem>
	);
}
