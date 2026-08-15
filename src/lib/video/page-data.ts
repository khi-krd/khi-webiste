import {
	getFeaturedVideoLead,
	getVideoListing,
	getVideoTopics,
	VIDEO_GRID_PAGE_SIZE,
} from "@/lib/api/videos";
import { cardIdentity } from "@/lib/video/filter";
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

	const topicsPromise = getVideoTopics(locale);
	const featuredLead = showFeatured ? await getFeaturedVideoLead(locale) : null;

	// The hero lead is dropped from the paginated flow (not just deduped on
	// page 1) so every non-final page keeps full grid rows.
	const [listing, topics] = await Promise.all([
		getVideoListing(locale, {
			videoType: activeType,
			topicId: activeTopicId,
			memories: activeMemories,
			query: activeQuery,
			page,
			size: VIDEO_GRID_PAGE_SIZE,
			excludeCardIdentity: featuredLead ? cardIdentity(featuredLead) : null,
		}),
		topicsPromise,
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
