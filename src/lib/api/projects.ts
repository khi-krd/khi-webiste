import "server-only";
import {
	apiFetchPage,
	apiFetchRaw,
	BULK_FETCH_SIZE,
	DEFAULT_REVALIDATE,
	unwrapApiPayload,
} from "@/lib/api/client";
import { getApiBaseUrl } from "@/lib/api/config";
import {
	filterProjects,
	getProjectTags,
	getProjectYears,
	PROJECTS_PER_PAGE,
	type ProjectDetail,
	type ProjectFilter,
	type ProjectItem,
	type ProjectListItem,
	paginateProjects,
} from "@/lib/mock/projects";
import {
	resolveProjectItem,
	resolveProjectItems,
	resolveProjectListItem,
	resolveProjectListItems,
} from "@/lib/project/resolve";
import { ProjectSchema } from "@/types/project";

const PROJECTS_ENDPOINT = "/api/v1/projects/getAll";
const PROJECTS_TAG = "projects";

export {
	filterProjects,
	getProjectTags,
	getProjectYears,
	PROJECTS_PER_PAGE,
	type ProjectDetail,
	type ProjectFilter,
	type ProjectItem,
	type ProjectListItem,
	paginateProjects,
};

async function fetchProjectsPage(
	searchParams: Record<string, string | number | undefined>,
) {
	return apiFetchPage(PROJECTS_ENDPOINT, {
		itemSchema: ProjectSchema,
		tags: [PROJECTS_TAG],
		revalidate: DEFAULT_REVALIDATE,
		searchParams,
	});
}

async function fetchProjectsByTag(tag: string) {
	return apiFetchPage("/api/v1/projects/search/tag", {
		itemSchema: ProjectSchema,
		tags: [PROJECTS_TAG],
		revalidate: DEFAULT_REVALIDATE,
		searchParams: { tag, page: 0, size: BULK_FETCH_SIZE },
	});
}

async function fetchProjectsByKeyword(keyword: string) {
	return apiFetchPage("/api/v1/projects/search/keyword", {
		itemSchema: ProjectSchema,
		tags: [PROJECTS_TAG],
		revalidate: DEFAULT_REVALIDATE,
		searchParams: { keyword, page: 0, size: BULK_FETCH_SIZE },
	});
}

async function fetchProjectListItemsFromApi(
	locale: string,
): Promise<ProjectListItem[]> {
	if (!getApiBaseUrl()) {
		return [];
	}

	const page = await fetchProjectsPage({ page: 0, size: BULK_FETCH_SIZE });
	if (!page?.content.length) {
		return [];
	}

	return resolveProjectListItems(locale, page.content);
}

async function getAllProjectRecords(
	locale: string,
): Promise<ProjectListItem[]> {
	const apiItems = await fetchProjectListItemsFromApi(locale);
	return apiItems;
}

async function searchProjectRecords(
	locale: string,
	filter: ProjectFilter,
): Promise<ProjectListItem[]> {
	if (!getApiBaseUrl()) {
		return [];
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
	const apiItems = await fetchProjectListItemsFromApi(locale);
	const records = apiItems;

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
	let apiDetail: ProjectDetail | null = null;

	if (getApiBaseUrl()) {
		const raw = await apiFetchRaw(
			`/api/v1/projects/${encodeURIComponent(id)}`,
			{
				tags: [PROJECTS_TAG, `project-${id}`],
				revalidate: DEFAULT_REVALIDATE,
			},
		);
		const unwrapped = unwrapApiPayload(raw);
		const parsed = unwrapped ? ProjectSchema.safeParse(unwrapped) : null;

		if (parsed?.success) {
			const item = resolveProjectListItem(locale, parsed.data);
			if (item) {
				const items = await getAllProjectRecords(locale);
				const index = items.findIndex(
					(entry) => entry.id === item.id || entry.slug === item.slug,
				);
				apiDetail = {
					...item,
					previous: index > 0 ? items[index] : null,
					next:
						index >= 0 && index < items.length - 1 ? items[index + 1] : null,
				};
			}
		}

		if (!apiDetail) {
			const items = await getAllProjectRecords(locale);
			const index = items.findIndex(
				(item) => item.id === id || item.slug === id,
			);
			if (index !== -1) {
				const item = items[index];
				apiDetail = {
					...item,
					previous: index > 0 ? items[index - 1] : null,
					next: index < items.length - 1 ? items[index + 1] : null,
				};
			}
		}
	}

	return apiDetail;
}

export async function getProjectsHeroCovers(
	locale: string,
	limit = 6,
): Promise<string[]> {
	const items = await getAllProjectRecords(locale);
	return [...new Set(items.map((item) => item.image.url))].slice(0, limit);
}

/** Back-compat for featured/home resolve paths that still import resolveProjectItems. */
export { resolveProjectItem, resolveProjectItems, resolveProjectListItem };
