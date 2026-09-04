import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { cache } from "react";
import { PlatformPostView } from "@/components/search/detail/platform-post-view";
import { RetryButton } from "@/components/search/retry-button";
import { ErrorState } from "@/components/ui/error-state";
import { getPlatformMediaDetail } from "@/lib/api/platform";
import { localeAlternates } from "@/lib/seo/metadata";
import { PLATFORM_MEDIA_KINDS, type PlatformMediaKind } from "@/types/platform";

/** One fetch per request, shared between metadata and the page render. */
const loadDetail = cache(
	async (type: PlatformMediaKind, code: string) =>
		await getPlatformMediaDetail(type, code),
);

function parseKind(value: string): PlatformMediaKind | null {
	return PLATFORM_MEDIA_KINDS.includes(value as PlatformMediaKind)
		? (value as PlatformMediaKind)
		: null;
}

type ArchiveItemPageProps = {
	params: Promise<{ locale: string; type: string; code: string }>;
};

export async function generateMetadata({
	params,
}: ArchiveItemPageProps): Promise<Metadata> {
	const { locale, type, code } = await params;
	const t = await getTranslations({ locale, namespace: "Archive" });

	const kind = parseKind(type);
	const detail = kind ? await loadDetail(kind, code) : null;
	const path = `/archive/${type}/${code}`;

	if (!detail || detail === "not-found") {
		return {
			alternates: localeAlternates(locale, path),
			title: t("pageTitle"),
			description: t("metaDescription"),
		};
	}

	const title = detail.item.title?.trim() || detail.item.code;
	const description = detail.item.description?.trim() || t("metaDescription");

	return {
		alternates: localeAlternates(locale, path),
		title: `${title} — ${t("pageTitle")}`,
		description,
		openGraph: detail.item.thumbnailUrl
			? { images: [{ url: detail.item.thumbnailUrl }] }
			: undefined,
	};
}

/**
 * One item from the پلاتفۆڕم archive — the route every search result card and
 * suggestion opens, whatever kind the item turned out to be.
 */
export default async function ArchiveItemPage({
	params,
}: ArchiveItemPageProps) {
	const { locale, type, code } = await params;
	setRequestLocale(locale);

	const kind = parseKind(type);
	if (!kind) {
		notFound();
	}

	const detail = await loadDetail(kind, code);

	// The platform's 404 deliberately covers unknown, non-public and trashed
	// alike — the honest page for all three is the site's own not-found.
	if (detail === "not-found") {
		notFound();
	}

	if (!detail) {
		const [t, tSearch] = await Promise.all([
			getTranslations("Archive"),
			getTranslations("Search"),
		]);
		return (
			<main className="bg-background">
				<div className="py-20">
					<ErrorState
						framed
						title={t("unavailableTitle")}
						description={t("unavailableDescription")}
						action={<RetryButton label={tSearch("retry")} />}
					/>
				</div>
			</main>
		);
	}

	return (
		<main className="bg-background pb-16 sm:pb-24">
			<PlatformPostView detail={detail} />
		</main>
	);
}
