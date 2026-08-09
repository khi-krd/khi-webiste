import { ScrollRevealItem } from "@/components/motion/scroll-reveal";
import { SectionEyebrow } from "@/components/projects/project-detail-view";
import { ProjectMediaItemBlock } from "@/components/projects/project-media-item";
import type { MediaItem } from "@/types/media";

type ProjectMediaGalleryProps = {
	items: MediaItem[];
	title: string;
	projectTitle: string;
	/** Case-file section number ("02"), assigned by the detail view. */
	number: string;
	closeLabel: string;
};

export function ProjectMediaGallery({
	items,
	title,
	projectTitle,
	number,
	closeLabel,
}: ProjectMediaGalleryProps) {
	if (items.length === 0) return null;

	return (
		<ScrollRevealItem>
			<SectionEyebrow as="h2" number={number} label={title} />
			<div className="grid grid-cols-1 gap-6 pt-6 sm:gap-8 md:grid-cols-2 lg:grid-cols-3">
				{items.map((item) => (
					<ProjectMediaItemBlock
						key={`${item.kind}-${item.url}-${item.sortOrder}`}
						item={item}
						title={projectTitle}
						closeLabel={closeLabel}
					/>
				))}
			</div>
		</ScrollRevealItem>
	);
}
