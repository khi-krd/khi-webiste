"use client";

import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { useRouter } from "@/i18n/navigation";
import { projectsHref } from "@/lib/projects-url";

export function ProjectsClearFilters() {
	const t = useTranslations("ProjectsPage");
	const router = useRouter();

	return (
		<Button
			type="button"
			variant="secondary"
			size="md"
			onClick={() => router.replace(projectsHref({}), { scroll: false })}
		>
			{t("filter.clear")}
		</Button>
	);
}
