import type { ImageCollectionItem } from "@/lib/mock/image-collection";
import type { ProjectItem, ProjectListItem } from "@/lib/mock/projects";
import { parseMediaGallery } from "@/lib/project/media";
import { plainTextFromRichContent } from "@/lib/rich-text";
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

function resolveProjectContent(
	locale: string,
	project: Project,
): ProjectContent | null {
	if (locale === "ckb") {
		return project.ckbContent ?? project.kmrContent ?? null;
	}
	return project.kmrContent ?? project.ckbContent ?? null;
}

function resolveTags(locale: string, project: Project): string[] {
	if (locale === "ckb") {
		return project.tagsCkb ?? project.tagsKmr ?? [];
	}
	return project.tagsKmr ?? project.tagsCkb ?? [];
}

function resolveKeywords(locale: string, project: Project): string[] {
	if (locale === "ckb") {
		return project.keywordsCkb ?? project.keywordsKmr ?? [];
	}
	return project.keywordsKmr ?? project.keywordsCkb ?? [];
}

function resolveProjectType(locale: string, project: Project): string | null {
	if (locale === "ckb") {
		return firstNonBlank(project.projectTypeCkb, project.projectTypeKmr);
	}
	return firstNonBlank(project.projectTypeKmr, project.projectTypeCkb);
}

function isUsableCoverUrl(url: string | null | undefined): url is string {
	if (!url?.trim()) return false;
	try {
		const parsed = new URL(url);
		return parsed.protocol === "https:" || parsed.protocol === "http:";
	} catch {
		return url.startsWith("/");
	}
}

function resolveCoverImage(project: Project): string {
	const type = project.coverMediaType ?? "IMAGE";
	if (type === "IMAGE") {
		const cover = firstNonBlank(project.coverUrl, project.coverThumbnailUrl);
		if (isUsableCoverUrl(cover)) return cover;
	} else {
		const poster = firstNonBlank(project.coverThumbnailUrl);
		if (isUsableCoverUrl(poster)) return poster;
	}

	const id = Number(project.id);
	const fallbacks = [
		"/menu/1.jpg",
		"/menu/2.jpg",
		"/menu/3.jpg",
		"/menu/4.jpg",
		"/menu/5.jpg",
		"/menu/6.jpg",
		"/menu/7.jpg",
	];
	return fallbacks[(id - 1) % fallbacks.length] ?? "/menu/1.jpg";
}

function resolveCoverMediaUrl(project: Project): string {
	const cover = firstNonBlank(project.coverUrl, project.coverThumbnailUrl);
	if (isUsableCoverUrl(cover)) return cover;
	return resolveCoverImage(project);
}

export function resolveProjectListItem(
	locale: string,
	project: Project,
): ProjectListItem | null {
	const content = resolveProjectContent(locale, project);
	const title = content?.title?.trim();
	if (!title) {
		return null;
	}

	const description = content?.description?.trim() ?? "";
	const excerpt = plainTextFromRichContent(description).slice(0, 320);
	const location = content?.location?.trim() ?? null;
	const coverImage = resolveCoverImage(project);
	const coverMedia = resolveCoverMediaUrl(project);
	const projectDate = project.projectDate?.trim() ?? null;
	const year = projectDate?.slice(0, 4) ?? null;

	return {
		id: String(project.id),
		slug: String(project.id),
		title,
		subtitle: firstNonBlank(location, resolveProjectType(locale, project)) ?? "",
		description,
		excerpt,
		location,
		projectType: resolveProjectType(locale, project),
		status: project.status ?? null,
		projectDate,
		year,
		tags: resolveTags(locale, project),
		keywords: resolveKeywords(locale, project),
		coverMediaType: project.coverMediaType ?? null,
		coverThumbnailUrl: project.coverThumbnailUrl ?? null,
		mediaGallery: parseMediaGallery(project.mediaGallery, locale),
		image: {
			url: coverImage,
			alt: title,
		},
		coverUrl: coverMedia,
	};
}

export function resolveProjectItem(
	locale: string,
	project: Project,
): ProjectItem | null {
	const listItem = resolveProjectListItem(locale, project);
	if (!listItem) return null;

	return {
		id: listItem.id,
		slug: listItem.slug,
		title: listItem.title,
		subtitle: listItem.subtitle,
		image: listItem.image,
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

export function resolveProjectListItems(
	locale: string,
	projects: Project[],
): ProjectListItem[] {
	return projects
		.map((project) => resolveProjectListItem(locale, project))
		.filter((item): item is ProjectListItem => item != null);
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
