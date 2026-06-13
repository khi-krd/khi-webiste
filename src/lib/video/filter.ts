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

export function sortVideos(items: ResolvedVideoCard[]): ResolvedVideoCard[] {
	return [...items].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export function paginateVideos(
	items: ResolvedVideoCard[],
	page: number,
	size: number,
): {
	items: ResolvedVideoCard[];
	totalPages: number;
	totalElements: number;
	currentPage: number;
	empty: boolean;
} {
	const totalElements = items.length;
	const totalPages = Math.max(1, Math.ceil(totalElements / size));
	const currentPage = Math.min(Math.max(1, page), totalPages);
	const start = (currentPage - 1) * size;
	const pageItems = items.slice(start, start + size);

	return {
		items: pageItems,
		totalPages,
		totalElements,
		currentPage,
		empty: pageItems.length === 0,
	};
}
