import type { ResolvedVideoCard, VideoType } from "@/types/video";

export type VideoFilterOptions = {
	videoType?: VideoType | null;
	topicId?: number | null;
	excludeTopicId?: number | null;
	memories?: boolean | null;
	query?: string | null;
};

export function filterVideos(
	items: ResolvedVideoCard[],
	{ videoType, topicId, excludeTopicId, memories, query }: VideoFilterOptions,
): ResolvedVideoCard[] {
	let result = items;

	if (videoType) {
		result = result.filter((item) => item.videoType === videoType);
	}

	if (topicId != null) {
		result = result.filter((item) => item.topicId === topicId);
	}

	if (excludeTopicId != null) {
		result = result.filter((item) => item.topicId !== excludeTopicId);
	}

	if (memories) {
		result = result.filter((item) => item.albumOfMemories);
	}

	const trimmedQuery = query?.trim().toLowerCase();
	if (trimmedQuery) {
		result = result.filter((item) => {
			const haystack = [
				item.title,
				item.subtitle,
				item.excerpt,
				item.topicName,
				...item.tags,
				...item.keywords,
			]
				.filter(Boolean)
				.join(" ")
				.toLowerCase();
			return haystack.includes(trimmedQuery);
		});
	}

	return result;
}

function featuredSortKey(order: number | null): number {
	return order ?? Number.MAX_SAFE_INTEGER;
}

/** Featured items first (lower `featuredOrder` wins), then newest. */
export function sortVideos(items: ResolvedVideoCard[]): ResolvedVideoCard[] {
	return [...items].sort((a, b) => {
		if (a.featured !== b.featured) {
			return a.featured ? -1 : 1;
		}
		if (a.featured && b.featured) {
			const orderDiff =
				featuredSortKey(a.featuredOrder) - featuredSortKey(b.featuredOrder);
			if (orderDiff !== 0) {
				return orderDiff;
			}
		}
		return b.createdAt.localeCompare(a.createdAt);
	});
}

export function pickFeaturedCard(
	items: ResolvedVideoCard[],
): ResolvedVideoCard | null {
	const featured = items.filter((item) => item.featured);
	if (featured.length === 0) {
		return null;
	}
	return sortVideos(featured)[0] ?? null;
}

export function cardIdentity(card: ResolvedVideoCard): string {
	return card.clipNumber != null
		? `${card.id}-${card.clipNumber}`
		: String(card.id);
}

/**
 * Card-level pagination.
 *
 * `firstPageExtra` exists for the hero: page one hands its first card to the
 * featured slot above the grid, which left the grid one short and its last row
 * ragged while a whole page still followed. Page one takes that many cards
 * MORE, and every later page shifts by the same amount, so the grid always
 * gets a full `size` and no card is skipped between pages.
 */
export function paginateVideos(
	items: ResolvedVideoCard[],
	page: number,
	size: number,
	firstPageExtra = 0,
): {
	items: ResolvedVideoCard[];
	totalPages: number;
	totalElements: number;
	currentPage: number;
	empty: boolean;
} {
	const totalElements = items.length;
	const firstPageSize = size + firstPageExtra;
	const totalPages =
		totalElements <= firstPageSize
			? 1
			: 1 + Math.ceil((totalElements - firstPageSize) / size);
	const currentPage = Math.min(Math.max(1, page), totalPages);
	const start =
		currentPage === 1 ? 0 : firstPageSize + (currentPage - 2) * size;
	const take = currentPage === 1 ? firstPageSize : size;
	const pageItems = items.slice(start, start + take);

	return {
		items: pageItems,
		totalPages,
		totalElements,
		currentPage,
		empty: pageItems.length === 0,
	};
}
