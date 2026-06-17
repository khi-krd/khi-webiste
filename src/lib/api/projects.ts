import "server-only";
import {
	apiFetch,
	BULK_FETCH_SIZE,
	DEFAULT_REVALIDATE,
} from "@/lib/api/client";
import { getApiBaseUrl } from "@/lib/api/config";
import type { ProjectItem } from "@/lib/mock/projects";
import { getProjects as getMockProjects } from "@/lib/mock/projects";
import { resolveProjectItems } from "@/lib/project/resolve";
import { ProjectsPageSchema } from "@/types/project";

const PROJECTS_ENDPOINT = "/api/v1/projects/getAll";
const PROJECTS_TAG = "projects";

export async function getProjects(locale: string): Promise<ProjectItem[]> {
	if (!getApiBaseUrl()) {
		return getMockProjects(locale);
	}

	const page = await apiFetch(PROJECTS_ENDPOINT, {
		schema: ProjectsPageSchema,
		tags: [PROJECTS_TAG],
		revalidate: DEFAULT_REVALIDATE,
		searchParams: { page: 0, size: BULK_FETCH_SIZE },
	});

	if (!page?.content.length) {
		return getMockProjects(locale);
	}

	const items = resolveProjectItems(locale, page.content);
	return items.length > 0 ? items : getMockProjects(locale);
}
