import { getLocale, getTranslations } from "next-intl/server";
import { ProjectsShowcase } from "@/components/home/projects-showcase";
import { getProjects } from "@/lib/api/projects";

export async function ProjectsSection() {
	const locale = await getLocale();
	const t = await getTranslations("Projects");
	const projects = await getProjects(locale);
	const direction = locale === "ckb" ? "rtl" : "ltr";

	return (
		<section
			className="cv-auto w-full overflow-hidden border-t border-border bg-background py-12 [--cv-intrinsic:800px] sm:py-16 lg:py-20"
			aria-labelledby="projects-heading"
			aria-roledescription="carousel"
		>
			<ProjectsShowcase
				projects={projects}
				direction={direction}
				copy={{
					eyebrow: t("eyebrow"),
					title: t("title"),
					description: t("description"),
					viewAll: t("viewAll"),
				}}
			/>
		</section>
	);
}
