import { BookOpenIcon } from "@heroicons/react/24/outline";
import { getTranslations } from "next-intl/server";
import { EmptyState } from "@/components/ui/empty-state";

/** The کتێبخانە (Koha) source has no API yet — say so honestly. */
export async function LibrarySoon() {
	const t = await getTranslations("Search");

	return (
		<EmptyState
			icon={<BookOpenIcon />}
			title={t("librarySoonTitle")}
			description={t("librarySoonDescription")}
			className="py-20"
		/>
	);
}
