import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { ProjectDetailView } from "@/components/projects/project-detail-view";
import { getProjectById } from "@/lib/api/projects";
import { plainTextFromRichContent } from "@/lib/rich-text";

type ProjectDetailPageProps = {
	params: Promise<{ locale: string; id: string }>;
};

function formatProjectDate(locale: string, isoDate: string | null) {
	if (!isoDate) return null;
	try {
		return new Intl.DateTimeFormat(locale, { dateStyle: "long" }).format(
			new Date(isoDate),
		);
	} catch {
		return isoDate;
	}
}

export async function generateMetadata({
	params,
}: ProjectDetailPageProps): Promise<Metadata> {
	const { locale, id } = await params;
	const detail = await getProjectById(locale, id);
	if (!detail) notFound();

	return {
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
				backLabel={t("detail.back")}
				locationLabel={t("detail.location")}
				typeLabel={t("detail.type")}
				statusLabel={t("detail.status")}
				dateLabel={t("detail.date")}
				tagsLabel={t("detail.tags")}
				galleryLabel={t("detail.gallery")}
				navLabel={t("detail.navLabel")}
				previousLabel={t("detail.previous")}
				nextLabel={t("detail.next")}
				statusLabels={{
					ACTIVE: t("detail.statusValues.ACTIVE"),
					ONGOING: t("detail.statusValues.ONGOING"),
					COMPLETED: t("detail.statusValues.COMPLETED"),
					ARCHIVED: t("detail.statusValues.ARCHIVED"),
				}}
				formattedDate={formatProjectDate(locale, detail.projectDate)}
			/>
		</main>
	);
}
