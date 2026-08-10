import { getLocale, getTranslations } from "next-intl/server";
import { ProjectsShowcase } from "@/components/home/projects-showcase";
import { getProjects } from "@/lib/api/projects";

export async function ProjectsSection() {
	const locale = await getLocale();
	const t = await getTranslations("Projects");
	const projects = await getProjects(locale);

	return (
		<section
			// `min-h-svh` + flex column: the two card rows stretch to fill exactly
			// one viewport, which is what the section-by-section snap scroll needs.
			className="cv-auto flex min-h-svh w-full flex-col overflow-hidden border-t border-border bg-background pt-8 [--cv-intrinsic:100svh] sm:pt-10 lg:pt-12"
			aria-labelledby="projects-heading"
		>
			<ProjectsShowcase
				projects={projects}
				copy={{
					title: t("title"),
					viewAll: t("viewAll"),
				}}
			/>
		</section>
	);
}
