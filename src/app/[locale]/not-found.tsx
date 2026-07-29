import { getTranslations } from "next-intl/server";
import { ErrorState } from "@/components/ui/error-state";
import { Link } from "@/components/ui/link";

/**
 * Locale-aware 404. Mirrors the layout of `error.tsx`, but the action is a link
 * home rather than a retry — there is nothing to retry on a missing route.
 */
export default async function NotFound() {
	const t = await getTranslations("NotFound");

	return (
		<div className="flex min-h-[60vh] items-center justify-center px-6 py-16">
			<ErrorState
				title={t("title")}
				description={t("description")}
				framed
				action={
					<Link href="/" withArrow>
						{t("backHome")}
					</Link>
				}
			/>
		</div>
	);
}
