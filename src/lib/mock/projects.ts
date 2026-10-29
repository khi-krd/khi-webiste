import type { MediaItem, MediaKind } from "@/types/media";
import type { ProjectStatus } from "@/types/project";

// Formerly the demo projects catalogue — now only the shared types and pure
// list helpers production code still imports. All records come from the CMS
// via `@/lib/api/projects`.

export type ProjectItem = {
	id: string;
	slug: string;
	title: string;
	subtitle: string;
	image: {
		url: string;
		alt?: string;
	};
};

export type ProjectListItem = ProjectItem & {
	description: string;
	excerpt: string;
	location: string | null;
	projectType: string | null;
	projectTypes?: string[];
	status: ProjectStatus | null;
	projectDate: string | null;
	/** Link to the finished project's result — shared across languages. */
	resultUrl?: string | null;
	year: string | null;
	tags: string[];
	keywords: string[];
	coverMediaType: MediaKind | null;
	coverUrl: string;
	coverThumbnailUrl: string | null;
	mediaGallery: MediaItem[];
};

export type ProjectDetail = ProjectListItem & {
	previous: ProjectListItem | null;
	next: ProjectListItem | null;
};

export const PROJECTS_PER_PAGE = 300;

export function getProjectYears(items: ProjectListItem[]): string[] {
	const years = new Set<string>();
	for (const item of items) {
		if (item.year) years.add(item.year);
	}
	return [...years].sort((a, b) => Number(b) - Number(a));
}

export function getProjectTags(items: ProjectListItem[]): string[] {
	const tags = new Set<string>();
	for (const item of items) {
		for (const tag of item.tags) tags.add(tag);
	}
	return [...tags].sort((a, b) => a.localeCompare(b));
}

/** Distinct project types across items — the filter bar's pill axis. */
export function getProjectTypeOptions(items: ProjectListItem[]): string[] {
	const types = new Set<string>();
	for (const item of items) {
		const list = item.projectTypes?.length
			? item.projectTypes
			: item.projectType
				? [item.projectType]
				: [];
		for (const type of list) types.add(type);
	}
	return [...types].sort((a, b) => a.localeCompare(b));
}

export type ProjectFilter = {
	year?: string | null;
	type?: string | null;
	tag?: string | null;
	query?: string | null;
};

export function filterProjects(
	items: ProjectListItem[],
	filter: ProjectFilter,
): ProjectListItem[] {
	let result = items;

	if (filter.year) {
		result = result.filter((item) => item.year === filter.year);
	}

	if (filter.type) {
		result = result.filter((item) => {
			const list = item.projectTypes?.length
				? item.projectTypes
				: item.projectType
					? [item.projectType]
					: [];
			return list.some(
				(type) => type.toLowerCase() === filter.type?.toLowerCase(),
			);
		});
	}

	if (filter.tag) {
		result = result.filter((item) =>
			item.tags.some((tag) => tag.toLowerCase() === filter.tag?.toLowerCase()),
		);
	}

	if (filter.query?.trim()) {
		const q = filter.query.trim().toLowerCase();
		result = result.filter(
			(item) =>
				item.title.toLowerCase().includes(q) ||
				item.excerpt.toLowerCase().includes(q) ||
				(item.projectType ?? "").toLowerCase().includes(q) ||
				(item.projectTypes ?? []).some((type) =>
					type.toLowerCase().includes(q),
				) ||
				item.tags.some((tag) => tag.toLowerCase().includes(q)) ||
				item.keywords.some((kw) => kw.toLowerCase().includes(q)),
		);
	}

	return result;
}

export function paginateProjects(
	items: ProjectListItem[],
	page: number,
	perPage = PROJECTS_PER_PAGE,
) {
	const totalElements = items.length;
	const totalPages = Math.max(1, Math.ceil(totalElements / perPage));
	const currentPage = Math.min(Math.max(1, page), totalPages);
	const start = (currentPage - 1) * perPage;

	return {
		items: items.slice(start, start + perPage),
		totalElements,
		totalPages,
		currentPage,
	};
}
