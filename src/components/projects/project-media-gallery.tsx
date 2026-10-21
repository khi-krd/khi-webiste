import { getTranslations } from "next-intl/server";
import { ScrollRevealItem } from "@/components/motion/scroll-reveal";
import { SectionEyebrow } from "@/components/projects/project-detail-view";
import { ProjectMediaPlaylist } from "@/components/projects/project-media-playlist";
import type { MediaItem } from "@/types/media";

type ProjectMediaGalleryProps = {
	items: MediaItem[];
	title: string;
	projectTitle: string;
	/** Case-file section number ("02"), assigned by the detail view. */
	number: string;
	closeLabel: string;
};

export async function ProjectMediaGallery({
	items,
	title,
	projectTitle,
	number,
	closeLabel,
}: ProjectMediaGalleryProps) {
	if (items.length === 0) return null;

	const t = await getTranslations("ProjectsPage.detail.media");

	return (
		<ScrollRevealItem>
			<SectionEyebrow as="h2" number={number} label={title} />
			<ProjectMediaPlaylist
				items={items}
				projectTitle={projectTitle}
				labels={{
					playlist: t("playlist"),
					all: t("all"),
					kinds: {
						IMAGE: t("kinds.IMAGE"),
						VIDEO: t("kinds.VIDEO"),
						AUDIO: t("kinds.AUDIO"),
					},
					details: t("details"),
					kind: t("kind"),
					format: t("format"),
					source: t("source"),
					position: t("position"),
					sources: {
						file: t("sources.file"),
						embed: t("sources.embed"),
						external: t("sources.external"),
					},
					open: t("open"),
					enlarge: t("enlarge"),
					previous: t("previous"),
					next: t("next"),
					nowShowing: t("nowShowing"),
					close: closeLabel,
				}}
			/>
		</ScrollRevealItem>
	);
}
