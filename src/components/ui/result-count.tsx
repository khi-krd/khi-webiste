import { getLocale, getTranslations } from "next-intl/server";
import { formatCount } from "@/lib/platform/format";

/**
 * "١٢٣ ئەنجام" — the filtered-result count shown between a section's filter
 * bar and its grid. Server Component; renders nothing when count is null.
 */
export async function ResultCount({ count }: { count?: number | null }) {
	if (count == null) return null;
	const t = await getTranslations("Results");
	const locale = await getLocale();

	return (
		<p className="label mt-4 text-muted sm:mt-5" aria-live="polite">
			{t("count", { count: formatCount(locale, count) })}
		</p>
	);
}
