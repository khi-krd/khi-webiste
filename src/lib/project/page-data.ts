import {
	filterProjects,
	getProjectListItems,
	getProjectTypeOptions,
	getProjectYears,
	PROJECTS_PER_PAGE,
	type ProjectListItem,
	paginateProjects,
} from "@/lib/api/projects";

export type ProjectsPageData = {
	allItems: ProjectListItem[];
	items: ProjectListItem[];
	years: string[];
	types: string[];
	totalElements: number;
	totalPages: number;
	currentPage: number;
	activeYear: string | null;
	activeType: string | null;
	activeQuery: string | null;
};

type LoadProjectsPageOptions = {
	year?: string | null;
	type?: string | null;
	query?: string | null;
	page?: number;
};

export async function loadProjectsPageData(
	locale: string,
	{ year, type, query, page = 1 }: LoadProjectsPageOptions,
): Promise<ProjectsPageData> {
	const allItems = await getProjectListItems(locale);
	const years = getProjectYears(allItems);
	const types = getProjectTypeOptions(allItems);

	const activeYear = year && years.includes(year) ? year : null;
	const activeType = type && types.includes(type) ? type : null;
	const activeQuery = query?.trim() || null;

	const filtered =
		activeQuery
			? await getProjectListItems(locale, {
					year: activeYear,
					type: activeType,
					query: activeQuery,
				})
			: filterProjects(allItems, { year: activeYear, type: activeType });

	const { items, totalElements, totalPages, currentPage } = paginateProjects(
		filtered,
		page,
		PROJECTS_PER_PAGE,
	);

	return {
		allItems,
		items,
		years,
		types,
		totalElements,
		totalPages,
		currentPage,
		activeYear,
		activeType,
		activeQuery,
	};
}
