import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { AudioHero } from "@/components/audio/audio-hero";
import { AudioMemoriesStrip } from "@/components/audio/audio-memories-strip";
import { AudioShell } from "@/components/audio/audio-shell";
import { getAlbumOfMemories } from "@/lib/api/audio";
import { loadAudioPageData } from "@/lib/audio/page-data";
import { homeInsetClass } from "@/lib/layout";
import { cn } from "@/lib/utils";

export async function generateMetadata({
	params,
}: {
	params: Promise<{ locale: string }>;
}): Promise<Metadata> {
	const { locale } = await params;
	const t = await getTranslations({ locale, namespace: "Audio" });

	return {
		title: t("pageTitle"),
		description: t("metaDescription"),
	};
}

type AudioPageProps = {
	params: Promise<{ locale: string }>;
	searchParams: Promise<{
		type?: string;
		state?: string;
		topic?: string;
		q?: string;
		page?: string;
	}>;
};

export default async function AudioPage({
	params,
	searchParams,
}: AudioPageProps) {
	const { locale } = await params;
	const resolvedSearchParams = await searchParams;
	setRequestLocale(locale);

	const t = await getTranslations("Audio");

	const [pageData, memories] = await Promise.all([
		loadAudioPageData(locale, t, { searchParams: resolvedSearchParams }),
		getAlbumOfMemories(locale),
	]);

	const heroCovers: { id: number; coverUrl: string; title: string }[] = [];
	const seenCoverUrls = new Set<string>();
	for (const item of [...pageData.listing.items, ...memories]) {
		if (!item.coverUrl || seenCoverUrls.has(item.coverUrl)) {
			continue;
		}
		seenCoverUrls.add(item.coverUrl);
		heroCovers.push({
			id: item.id,
			coverUrl: item.coverUrl,
			title: item.title,
		});
		if (heroCovers.length >= 3) {
			break;
		}
	}

	return (
		<main className="bg-background">
			<div className={cn(homeInsetClass, "pb-0")}>
				<div className="overflow-hidden border border-border bg-surface">
					<AudioHero
						eyebrow={t("page.hero.eyebrow")}
						title={t("page.hero.title")}
						titleEmphasis={t("page.hero.titleEmphasis")}
						description={t("page.hero.description")}
						covers={heroCovers}
						showEmphasisItalic={locale === "ku"}
					/>
				</div>
			</div>

			<AudioMemoriesStrip
				title={t("memories.title")}
				description={t("memories.description")}
				items={memories}
			/>

			<div
				id="audio-content"
				className="scroll-mt-26 sm:scroll-mt-30"
			>
				<AudioShell
					cards={pageData.listing.items}
					currentPage={pageData.listing.currentPage}
					totalPages={pageData.listing.totalPages}
					totalElements={pageData.listing.totalElements}
					soundTypes={pageData.soundTypes}
					topics={pageData.topics}
					activeType={pageData.activeType}
					activeState={pageData.activeState}
					activeTopicId={pageData.activeTopicId}
					activeQuery={pageData.activeQuery}
					noResultsMessage={pageData.noResultsMessage}
				/>
			</div>
		</main>
	);
}
