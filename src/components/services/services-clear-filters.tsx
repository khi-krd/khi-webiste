"use client";

import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { useRouter } from "@/i18n/navigation";
import { servicesHref } from "@/lib/services-url";

export function ServicesClearFilters() {
	const t = useTranslations("Services");
	const router = useRouter();

	return (
		<Button
			type="button"
			variant="secondary"
			size="md"
			onClick={() => router.replace(servicesHref({}), { scroll: false })}
		>
			{t("filter.clear")}
		</Button>
	);
}
