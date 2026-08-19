import {
	AUDIO_GRID_PAGE_SIZE,
	getAudioListing,
	getAudioSoundTypes,
	getAudioTopics,
} from "@/lib/api/audio";
import {
	parseAudioState,
	parseAudioTag,
	parseAudioTopicId,
} from "@/lib/audio-url";

type TranslateFn = (
	key: string,
	values?: Record<string, string | number>,
) => string;

export type AudioPageSearchParams = {
	type?: string;
	state?: string;
	topic?: string;
	tag?: string;
	q?: string;
	page?: string;
};

export async function loadAudioPageData(
	locale: string,
	t: TranslateFn,
	{
		searchParams = {},
	}: {
		searchParams?: AudioPageSearchParams;
	},
) {
	const activeType = searchParams.type?.trim() || null;
	const activeState = parseAudioState(searchParams.state);
	const activeTopicId = parseAudioTopicId(searchParams.topic);
	const activeTag = parseAudioTag(searchParams.tag);
	const activeQuery = searchParams.q?.trim() || null;
	const page = Math.max(1, Number.parseInt(searchParams.page ?? "1", 10) || 1);

	const [listing, soundTypes, topics] = await Promise.all([
		getAudioListing(locale, {
			soundType: activeType,
			state: activeState,
			topicId: activeTopicId,
			tag: activeTag,
			query: activeQuery,
			page,
			size: AUDIO_GRID_PAGE_SIZE,
		}),
		getAudioSoundTypes(locale),
		getAudioTopics(locale),
	]);

	const hasFilters = Boolean(
		activeType ||
			activeState ||
			activeTopicId != null ||
			activeTag ||
			activeQuery,
	);

	return {
		activeType,
		activeState,
		activeTopicId,
		activeTag,
		activeQuery,
		listing,
		soundTypes,
		topics,
		noResultsMessage: hasFilters ? t("grid.noResults") : t("grid.empty"),
		direction: (locale === "ckb" ? "rtl" : "ltr") as "ltr" | "rtl",
	};
}
