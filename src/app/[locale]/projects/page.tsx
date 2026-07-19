import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { ProjectsHero } from "@/components/projects/projects-hero";
import { ProjectsShell } from "@/components/projects/projects-shell";
import { VisuallyHidden } from "@/components/ui/visually-hidden";
import { loadProjectsPageData } from "@/lib/project/page-data";

export async function generateMetadata({
	params,
}: {
	params: Promise<{ locale: string }>;
}): Promise<Metadata> {
	const { locale } = await params;
	const t = await getTranslations({ locale, namespace: "ProjectsPage" });

	return {
		title: t("pageTitle"),
		description: t("metaDescription"),
	};
}

type ProjectsPageProps = {
	params: Promise<{ locale: string }>;
	searchParams: Promise<{
		year?: string;
		tag?: string;
		q?: string;
		page?: string;
	}>;
};

export default async function ProjectsPage({
	params,
	searchParams,
}: ProjectsPageProps) {
	const { locale } = await params;
	const { year, tag, q, page: pageParam } = await searchParams;
	setRequestLocale(locale);

	const t = await getTranslations("ProjectsPage");
	const page = Math.max(1, Number.parseInt(pageParam ?? "1", 10) || 1);

	const pageData = await loadProjectsPageData(locale, {
		year,
		tag,
		query: q,
		page,
	});

	return (
		<main className="bg-background">
			<VisuallyHidden as="h1">{t("pageTitle")}</VisuallyHidden>

			<ProjectsHero
				title={t("hero.title")}
				titleEmphasis={t("hero.titleEmphasis")}
				countLabel={t("hero.count", { count: pageData.allItems.length })}
				years={pageData.years}
				activeYear={pageData.activeYear}
				activeTag={pageData.activeTag}
				activeQuery={pageData.activeQuery}
				allYearsLabel={t("filters.allYears")}
				showEmphasisItalic={locale === "ku"}
			/>

			<ProjectsShell
				items={pageData.items}
				currentPage={pageData.currentPage}
				totalPages={pageData.totalPages}
				tags={pageData.tags}
				activeYear={pageData.activeYear}
				activeTag={pageData.activeTag}
				activeQuery={pageData.activeQuery}
				previewLabel={t("grid.preview")}
				noResultsMessage={t("grid.noResults")}
				paginationLabel={t("pagination.label")}
				previousLabel={t("pagination.previous")}
				nextLabel={t("pagination.next")}
			/>
		</main>
	);
}
