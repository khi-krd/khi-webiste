import {
	getFeaturedVideoLead,
	getVideoListing,
	getVideoTopics,
	VIDEO_GRID_PAGE_SIZE,
} from "@/lib/api/videos";
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
	const hasFilters = Boolean(
		activeType || activeTopicId != null || activeMemories || activeQuery,
	);
	const showFeatured = page === 1 && !hasFilters;

	const [listing, topics, featuredLead] = await Promise.all([
		getVideoListing(locale, {
			videoType: activeType,
			topicId: activeTopicId,
			memories: activeMemories,
			query: activeQuery,
			page,
			size: VIDEO_GRID_PAGE_SIZE,
		}),
		getVideoTopics(locale),
		showFeatured ? getFeaturedVideoLead(locale) : Promise.resolve(null),
	]);

	return {
		activeType,
		activeTopicId,
		activeMemories,
		activeQuery,
		listing,
		topics,
		featuredLead,
		showFeatured,
		noResultsMessage: hasFilters ? t("grid.noResults") : t("grid.empty"),
		direction: (locale === "ckb" ? "rtl" : "ltr") as "ltr" | "rtl",
	};
}
