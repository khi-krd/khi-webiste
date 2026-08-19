import type { ResolvedAudioCard, TrackState } from "@/types/audio";

export type AudioFilterOptions = {
	soundType?: string | null;
	state?: TrackState | null;
	topicId?: number | null;
	tag?: string | null;
	query?: string | null;
};

export function filterAudioTracks(
	items: ResolvedAudioCard[],
	{ soundType, state, topicId, tag, query }: AudioFilterOptions,
): ResolvedAudioCard[] {
	let result = items;

	if (soundType) {
		result = result.filter((item) => item.soundType === soundType);
	}

	if (state) {
		result = result.filter((item) => item.trackState === state);
	}

	if (topicId != null) {
		result = result.filter((item) => item.topicId === topicId);
	}

	// Whole-entry match, mirroring the server's tag-collection lookup rather
	// than the substring behaviour of the free-text search below.
	const trimmedTag = tag?.trim().toLowerCase();
	if (trimmedTag) {
		result = result.filter((item) =>
			item.tags.some((entry) => entry.trim().toLowerCase() === trimmedTag),
		);
	}

	const trimmedQuery = query?.trim().toLowerCase();
	if (trimmedQuery) {
		result = result.filter((item) => {
			const haystack = [
				item.title,
				item.subtitle,
				item.excerpt,
				item.topicName,
				item.soundType,
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

export function sortAudioTracks(
	items: ResolvedAudioCard[],
): ResolvedAudioCard[] {
	return [...items].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export function paginateAudioTracks(
	items: ResolvedAudioCard[],
	page: number,
	size: number,
): {
	items: ResolvedAudioCard[];
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
