import {
	filterProjects,
	getProjectListItems,
	getProjectTags,
	getProjectYears,
	paginateProjects,
	PROJECTS_PER_PAGE,
	type ProjectListItem,
} from "@/lib/api/projects";

export type ProjectsPageData = {
	allItems: ProjectListItem[];
	items: ProjectListItem[];
	years: string[];
	tags: string[];
	totalElements: number;
	totalPages: number;
	currentPage: number;
	activeYear: string | null;
	activeTag: string | null;
	activeQuery: string | null;
};

type LoadProjectsPageOptions = {
	year?: string | null;
	tag?: string | null;
	query?: string | null;
	page?: number;
};

export async function loadProjectsPageData(
	locale: string,
	{ year, tag, query, page = 1 }: LoadProjectsPageOptions,
): Promise<ProjectsPageData> {
	const allItems = await getProjectListItems(locale);
	const years = getProjectYears(allItems);
	const tags = getProjectTags(allItems);

	const activeYear = year && years.includes(year) ? year : null;
	const activeTag =
		tag && allItems.some((item) => item.tags.includes(tag)) ? tag : null;
	const activeQuery = query?.trim() || null;

	const filtered =
		activeTag || activeQuery
			? await getProjectListItems(locale, {
					year: activeYear,
					tag: activeTag,
					query: activeQuery,
				})
			: filterProjects(allItems, { year: activeYear });

	const {
		items,
		totalElements,
		totalPages,
		currentPage,
	} = paginateProjects(filtered, page, PROJECTS_PER_PAGE);

	return {
		allItems,
		items,
		years,
		tags,
		totalElements,
		totalPages,
		currentPage,
		activeYear,
		activeTag,
		activeQuery,
	};
}
