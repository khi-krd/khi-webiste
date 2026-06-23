import type { ImageCollectionItem } from "@/lib/mock/image-collection";
import type { ProjectItem } from "@/lib/mock/projects";
import type { Project, ProjectContent } from "@/types/project";

function firstNonBlank(
	...values: (string | null | undefined)[]
): string | null {
	for (const value of values) {
		if (value && value.trim().length > 0) {
			return value;
		}
	}
	return null;
}

function stripHtml(html: string): string {
	return html
		.replace(/<[^>]+>/g, " ")
		.replace(/\s+/g, " ")
		.trim();
}

function resolveProjectContent(
	locale: string,
	project: Project,
): ProjectContent | null {
	if (locale === "ckb") {
		return project.ckbContent ?? project.kmrContent ?? null;
	}
	return project.kmrContent ?? project.ckbContent ?? null;
}

export function resolveProjectItem(
	locale: string,
	project: Project,
): ProjectItem | null {
	const content = resolveProjectContent(locale, project);
	const title = content?.title?.trim();
	if (!title) {
		return null;
	}

	const description = content?.description?.trim() ?? "";
	const subtitle =
		firstNonBlank(
			content?.location,
			project.projectTypeKmr,
			project.projectTypeCkb,
		) ?? stripHtml(description).slice(0, 80);

	const cover = firstNonBlank(project.coverUrl, project.coverThumbnailUrl);

	return {
		id: String(project.id),
		slug: String(project.id),
		title,
		subtitle,
		image: {
			url: cover ?? "/menu/1.jpg",
			alt: title,
		},
	};
}

export function resolveProjectItems(
	locale: string,
	projects: Project[],
): ProjectItem[] {
	return projects
		.map((project) => resolveProjectItem(locale, project))
		.filter((item): item is ProjectItem => item != null);
}

export function resolveProjectAsImageCollectionItem(
	locale: string,
	project: Project,
	index: number,
): ImageCollectionItem | null {
	const item = resolveProjectItem(locale, project);
	if (!item) {
		return null;
	}

	return {
		...item,
		catalogRef: `Plate ${String(index + 1).padStart(2, "0")}`,
	};
}
