import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { ProjectDetailView } from "@/components/projects/project-detail-view";
import { getProjectById } from "@/lib/api/projects";
import { plainTextFromRichContent } from "@/lib/rich-text";
import { localeAlternates } from "@/lib/seo/metadata";

type ProjectDetailPageProps = {
	params: Promise<{ locale: string; id: string }>;
};

export async function generateMetadata({
	params,
}: ProjectDetailPageProps): Promise<Metadata> {
	const { locale, id } = await params;
	const detail = await getProjectById(locale, id);
	if (!detail) notFound();

	return {
		alternates: localeAlternates(locale, `/projects/${id}`),
		title: detail.title,
		description: plainTextFromRichContent(detail.description),
	};
}

export default async function ProjectDetailPage({
	params,
}: ProjectDetailPageProps) {
	const { locale, id } = await params;
	setRequestLocale(locale);

	const detail = await getProjectById(locale, id);
	if (!detail) notFound();

	const t = await getTranslations("ProjectsPage");

	return (
		<main className="bg-background">
			<ProjectDetailView
				detail={detail}
				locale={locale}
				typeLabel={t("detail.type")}
				statusLabel={t("detail.status")}
				dateLabel={t("detail.date")}
				tagsLabel={t("detail.tags")}
				contentLabel={t("detail.content")}
				galleryLabel={t("detail.gallery")}
				lightboxCloseLabel={t("detail.lightboxClose")}
				statusLabels={{
					ACTIVE: t("detail.statusValues.ACTIVE"),
					ONGOING: t("detail.statusValues.ONGOING"),
					COMPLETED: t("detail.statusValues.COMPLETED"),
					ARCHIVED: t("detail.statusValues.ARCHIVED"),
				}}
			/>
		</main>
	);
}
