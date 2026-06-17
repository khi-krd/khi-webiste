import {
	getVideoListing,
	getVideoTopics,
	VIDEO_GRID_PAGE_SIZE,
} from "@/lib/api/videos";
import { SHORT_FILMS_TOPIC_ID } from "@/lib/mock/videos";
import {
	parseVideoMemories,
	parseVideoTopicId,
	parseVideoType,
} from "@/lib/video-url";

type TranslateFn = (
	key: string,
	values?: Record<string, string | number>,
) => string;

export type VideoPageSearchParams = {
	type?: string;
	topic?: string;
	memories?: string;
	q?: string;
	page?: string;
};

export async function loadVideoPageData(
	locale: string,
	t: TranslateFn,
	{
		searchParams = {},
	}: {
		searchParams?: VideoPageSearchParams;
	},
) {
	const activeType = parseVideoType(searchParams.type);
	const activeTopicId = parseVideoTopicId(searchParams.topic);
	const activeMemories = parseVideoMemories(searchParams.memories);
	const activeQuery = searchParams.q?.trim() || null;
	const page = Math.max(1, Number.parseInt(searchParams.page ?? "1", 10) || 1);

	// Short films live on their own hub — redirect topic filter to that page.
	const redirectToShortFilms =
		activeTopicId === SHORT_FILMS_TOPIC_ID && !activeType && !activeMemories;

	const [listing, topics] = await Promise.all([
		getVideoListing(locale, {
			videoType: activeType,
			topicId: activeTopicId === SHORT_FILMS_TOPIC_ID ? null : activeTopicId,
			excludeTopicId: SHORT_FILMS_TOPIC_ID,
			memories: activeMemories,
			query: activeQuery,
			page,
			size: VIDEO_GRID_PAGE_SIZE,
		}),
		getVideoTopics(locale),
	]);

	const catalogTopics = topics.filter(
		(topic) => topic.id !== SHORT_FILMS_TOPIC_ID,
	);

	const hasFilters = Boolean(
		activeType ||
			(activeTopicId != null && activeTopicId !== SHORT_FILMS_TOPIC_ID) ||
			activeMemories ||
			activeQuery,
	);

	return {
		activeType,
		activeTopicId:
			activeTopicId === SHORT_FILMS_TOPIC_ID ? null : activeTopicId,
		activeMemories,
		activeQuery,
		listing,
		topics: catalogTopics,
		redirectToShortFilms,
		// Featured bento only leads page 1 of the unfiltered catalogue.
		showFeatured: page === 1 && !hasFilters,
		noResultsMessage: hasFilters ? t("grid.noResults") : t("grid.empty"),
		direction: (locale === "ckb" ? "rtl" : "ltr") as "ltr" | "rtl",
	};
}
