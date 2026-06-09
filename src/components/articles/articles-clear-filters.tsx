"use client";

import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { buildArticlesHref } from "@/lib/articles-url";
import { Button } from "@/components/ui/button";

export function ArticlesClearFilters() {
	const t = useTranslations("Articles");
	const router = useRouter();

	return (
		<Button
			type="button"
			variant="secondary"
			size="md"
			onClick={() => router.replace(buildArticlesHref({}), { scroll: false })}
		>
			{t("filter.clear")}
		</Button>
	);
}
