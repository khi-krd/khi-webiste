import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import {
	AudioCoverStrip,
	type AudioStripCover,
} from "@/components/audio/audio-cover-strip";
import { AudioMemoriesStrip } from "@/components/audio/audio-memories-strip";
import { AudioShell } from "@/components/audio/audio-shell";
import { VisuallyHidden } from "@/components/ui/visually-hidden";
import { getAlbumOfMemories } from "@/lib/api/audio";
import { loadAudioPageData } from "@/lib/audio/page-data";
import { homeInsetClass } from "@/lib/layout";
import { localeAlternates } from "@/lib/seo/metadata";
import { cn } from "@/lib/utils";

export async function generateMetadata({
	params,
}: {
	params: Promise<{ locale: string }>;
}): Promise<Metadata> {
	const { locale } = await params;
	const t = await getTranslations({ locale, namespace: "Audio" });

	return {
		alternates: localeAlternates(locale, "/audio"),
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
		tag?: string;
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

	// The strip is the whole header — enough art to fill its widest budget,
	// deduped by cover URL so a repeated sleeve never sits twice.
	const heroCovers: AudioStripCover[] = [];
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
		if (heroCovers.length >= 6) {
			break;
		}
	}

	return (
		<main className="bg-background">
			<VisuallyHidden as="h1">{t("pageTitle")}</VisuallyHidden>

			<div className={cn(homeInsetClass, "pt-6 pb-0 sm:pt-8")}>
				<AudioCoverStrip covers={heroCovers} />
			</div>

			<AudioMemoriesStrip
				title={t("memories.title")}
				description={t("memories.description")}
				items={memories}
			/>

			<div id="audio-content" className="scroll-mt-26 sm:scroll-mt-30">
				<AudioShell
					cards={pageData.listing.items}
					currentPage={pageData.listing.currentPage}
					totalPages={pageData.listing.totalPages}
					soundTypes={pageData.soundTypes}
					topics={pageData.topics}
					activeType={pageData.activeType}
					activeState={pageData.activeState}
					activeTopicId={pageData.activeTopicId}
					activeTag={pageData.activeTag}
					activeQuery={pageData.activeQuery}
					noResultsMessage={pageData.noResultsMessage}
				/>
			</div>
		</main>
	);
}
