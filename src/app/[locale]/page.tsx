import { setRequestLocale } from "next-intl/server";
import { use } from "react";
import type { Locale } from "@/i18n/routing";

export default function HomePage({
	params,
}: {
	params: Promise<{ locale: Locale }>;
}) {
	const { locale } = use(params);
	setRequestLocale(locale);

	return null;
}
