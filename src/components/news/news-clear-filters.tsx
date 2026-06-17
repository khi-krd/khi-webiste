"use client";

import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { useRouter } from "@/i18n/navigation";
import { buildNewsHref } from "@/lib/news-url";

export function NewsClearFilters() {
	const t = useTranslations("News");
	const router = useRouter();

	return (
		<Button
			type="button"
			variant="secondary"
			size="md"
			onClick={() => router.replace(buildNewsHref({}), { scroll: false })}
		>
			{t("filter.clear")}
		</Button>
	);
}
