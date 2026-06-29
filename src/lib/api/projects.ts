import "server-only";
import {
	apiFetch,
	BULK_FETCH_SIZE,
	DEFAULT_REVALIDATE,
} from "@/lib/api/client";
import { getApiBaseUrl } from "@/lib/api/config";
import {
	filterProjects,
	getProjectById as getMockProjectById,
	getProjectListItems as getMockProjectListItems,
	getProjectTags,
	getProjectYears,
	type ProjectDetail,
	type ProjectFilter,
	type ProjectItem,
	type ProjectListItem,
	paginateProjects,
	PROJECTS_PER_PAGE,
} from "@/lib/mock/projects";
import {
	resolveProjectListItem,
	resolveProjectListItems,
	resolveProjectItem,
	resolveProjectItems,
} from "@/lib/project/resolve";
import { ProjectsPageSchema, ProjectSchema } from "@/types/project";

const PROJECTS_ENDPOINT = "/api/v1/projects/getAll";
const PROJECTS_TAG = "projects";

export {
	PROJECTS_PER_PAGE,
	type ProjectDetail,
	type ProjectFilter,
	type ProjectItem,
	type ProjectListItem,
	getProjectTags,
	getProjectYears,
	paginateProjects,
	filterProjects,
};

async function fetchProjectsPage(
	searchParams: Record<string, string | number | undefined>,
) {
	return apiFetch(PROJECTS_ENDPOINT, {
		schema: ProjectsPageSchema,
		tags: [PROJECTS_TAG],
		revalidate: DEFAULT_REVALIDATE,
		searchParams,
	});
}

async function fetchProjectsByTag(tag: string) {
	return apiFetch("/api/v1/projects/search/tag", {
		schema: ProjectsPageSchema,
		tags: [PROJECTS_TAG],
		revalidate: DEFAULT_REVALIDATE,
		searchParams: { tag, page: 0, size: BULK_FETCH_SIZE },
	});
}

async function fetchProjectsByKeyword(keyword: string) {
	return apiFetch("/api/v1/projects/search/keyword", {
		schema: ProjectsPageSchema,
		tags: [PROJECTS_TAG],
		revalidate: DEFAULT_REVALIDATE,
		searchParams: { keyword, page: 0, size: BULK_FETCH_SIZE },
	});
}

async function getAllProjectRecords(locale: string): Promise<ProjectListItem[]> {
	if (!getApiBaseUrl()) {
		return getMockProjectListItems(locale);
	}

	const page = await fetchProjectsPage({ page: 0, size: BULK_FETCH_SIZE });
	if (!page?.content.length) {
		return getMockProjectListItems(locale);
	}

	const items = resolveProjectListItems(locale, page.content);
	return items.length > 0 ? items : getMockProjectListItems(locale);
}

async function searchProjectRecords(
	locale: string,
	filter: ProjectFilter,
): Promise<ProjectListItem[]> {
	if (!getApiBaseUrl()) {
		return filterProjects(getMockProjectListItems(locale), filter);
	}

	if (filter.tag?.trim()) {
		const page = await fetchProjectsByTag(filter.tag.trim());
		if (page?.content.length) {
			const items = resolveProjectListItems(locale, page.content);
			if (items.length > 0) {
				return filterProjects(items, { ...filter, tag: null });
			}
		}
	}

	if (filter.query?.trim()) {
		const page = await fetchProjectsByKeyword(filter.query.trim());
		if (page?.content.length) {
			const items = resolveProjectListItems(locale, page.content);
			if (items.length > 0) {
				return filterProjects(items, { ...filter, query: null });
			}
		}
	}

	return filterProjects(await getAllProjectRecords(locale), filter);
}

export async function getProjects(locale: string): Promise<ProjectItem[]> {
	const records = await getAllProjectRecords(locale);
	return records.map((record) => ({
		id: record.id,
		slug: record.slug,
		title: record.title,
		subtitle: record.subtitle,
		image: record.image,
	}));
}

export async function getProjectListItems(
	locale: string,
	filter: ProjectFilter = {},
): Promise<ProjectListItem[]> {
	if (filter.tag?.trim() || filter.query?.trim()) {
		return searchProjectRecords(locale, filter);
	}
	return filterProjects(await getAllProjectRecords(locale), filter);
}

export async function getProjectById(
	locale: string,
	id: string,
): Promise<ProjectDetail | null> {
	if (!getApiBaseUrl()) {
		return getMockProjectById(locale, id);
	}

	const detail = await apiFetch(`/api/v1/projects/${encodeURIComponent(id)}`, {
		schema: ProjectSchema,
		tags: [PROJECTS_TAG, `project-${id}`],
		revalidate: DEFAULT_REVALIDATE,
	});

	if (detail) {
		const item = resolveProjectListItem(locale, detail);
		if (item) {
			const items = await getAllProjectRecords(locale);
			const index = items.findIndex(
				(entry) => entry.id === item.id || entry.slug === item.slug,
			);
			return {
				...item,
				previous: index > 0 ? items[index] : null,
				next: index >= 0 && index < items.length - 1 ? items[index + 1] : null,
			};
		}
	}

	const items = await getAllProjectRecords(locale);
	const index = items.findIndex((item) => item.id === id || item.slug === id);
	if (index === -1) return null;

	const item = items[index];
	return {
		...item,
		previous: index > 0 ? items[index - 1] : null,
		next: index < items.length - 1 ? items[index + 1] : null,
	};
}

export async function getProjectsHeroCovers(
	locale: string,
	limit = 6,
): Promise<string[]> {
	const items = await getAllProjectRecords(locale);
	return [...new Set(items.map((item) => item.image.url))].slice(0, limit);
}

/** Back-compat for featured/home resolve paths that still import resolveProjectItems. */
export { resolveProjectItems, resolveProjectItem, resolveProjectListItem };
