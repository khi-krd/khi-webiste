import "server-only";

import { getTranslations } from "next-intl/server";
import { getAudioSoundTypes, getAudioTopics } from "@/lib/api/audio";
import { getGalleryPosts } from "@/lib/api/gallery";
import { getNews, getNewsCategories } from "@/lib/api/news";
import { getProjectListItems, getProjectTags } from "@/lib/api/projects";
import { getVideoTopics } from "@/lib/api/videos";
import { soundTypeLabel } from "@/lib/audio/sound-types";
import { buildAudioHref } from "@/lib/audio-url";
import { buildGalleryHref } from "@/lib/gallery-url";
import { buildNewsHref } from "@/lib/news-url";
import { projectsHref } from "@/lib/projects-url";
import type { SearchTaxonomyItem } from "@/lib/search/taxonomy-types";
import { buildVideoHref } from "@/lib/video-url";
import {
	WRITING_CATEGORY_NAV_KEYS,
	WRITING_CATEGORY_SLUGS,
} from "@/lib/writing/categories";
import { BOOK_GENRES } from "@/lib/writing/genres";
import { buildWritingsHref } from "@/lib/writings-url";
import type { VideoType } from "@/types/video";

function uniqueStrings(values: string[]): string[] {
	return [...new Set(values.map((value) => value.trim()).filter(Boolean))].sort(
		(a, b) => a.localeCompare(b),
	);
}

function galleryTagHrefFromPosts(
	posts: Awaited<ReturnType<typeof getGalleryPosts>>,
	tag: string,
): string {
	const match = posts.find((post) =>
		post.tags.some(
			(entry) => entry.toLocaleLowerCase() === tag.toLocaleLowerCase(),
		),
	);
	return match ? `/gallery/${match.id}` : buildGalleryHref({ q: tag });
}

function pushUniqueItem(
	items: SearchTaxonomyItem[],
	seen: Set<string>,
	item: SearchTaxonomyItem,
) {
	if (seen.has(item.id)) {
		return;
	}
	seen.add(item.id);
	items.push(item);
}

export async function getSearchTaxonomy(
	locale: string,
): Promise<SearchTaxonomyItem[]> {
	const [
		tNav,
		tWritings,
		tVideo,
		tAudio,
		newsItems,
		newsCategories,
		projectItems,
		videoTopics,
		audioTopics,
		audioSoundTypes,
		galleryPosts,
	] = await Promise.all([
		getTranslations({ locale, namespace: "Nav" }),
		getTranslations({ locale, namespace: "Writings" }),
		getTranslations({ locale, namespace: "Video" }),
		getTranslations({ locale, namespace: "Audio" }),
		getNews(locale),
		getNewsCategories(locale),
		getProjectListItems(locale),
		getVideoTopics(locale),
		getAudioTopics(locale),
		getAudioSoundTypes(locale),
		getGalleryPosts(locale),
	]);

	const items: SearchTaxonomyItem[] = [];
	const seen = new Set<string>();

	for (const category of newsCategories) {
		pushUniqueItem(items, seen, {
			id: `news-category-${category.key}`,
			label: category.label,
			kind: "category",
			sectionKey: "news",
			href: buildNewsHref({ category: category.key }),
			searchText: `${category.label} ${category.key}`,
		});
	}

	const newsTags = uniqueStrings(newsItems.flatMap((item) => item.tags ?? []));
	for (const tag of newsTags) {
		pushUniqueItem(items, seen, {
			id: `news-tag-${tag.toLocaleLowerCase()}`,
			label: tag,
			kind: "tag",
			sectionKey: "news",
			href: buildNewsHref({ q: tag }),
			searchText: tag,
		});
	}

	for (const tag of getProjectTags(projectItems)) {
		pushUniqueItem(items, seen, {
			id: `projects-tag-${tag.toLocaleLowerCase()}`,
			label: tag,
			kind: "tag",
			sectionKey: "projects",
			href: projectsHref({ tag }),
			searchText: tag,
		});
	}

	for (const topic of videoTopics) {
		pushUniqueItem(items, seen, {
			id: `videos-topic-${topic.id}`,
			label: topic.name,
			kind: "topic",
			sectionKey: "videos",
			href: buildVideoHref({ topic: topic.id }),
			searchText: topic.name,
		});
	}

	for (const type of ["FILM", "VIDEO_CLIP"] as VideoType[]) {
		const label = tVideo(`types.${type}`);
		pushUniqueItem(items, seen, {
			id: `videos-type-${type}`,
			label,
			kind: "type",
			sectionKey: "videos",
			href: buildVideoHref({ type }),
			searchText: `${label} ${type}`,
		});
	}

	for (const topic of audioTopics) {
		pushUniqueItem(items, seen, {
			id: `sound-topic-${topic.id}`,
			label: topic.name,
			kind: "topic",
			sectionKey: "soundTracks",
			href: buildAudioHref({ topic: topic.id }),
			searchText: topic.name,
		});
	}

	for (const soundType of audioSoundTypes) {
		const label = soundTypeLabel(tAudio, soundType);
		pushUniqueItem(items, seen, {
			id: `sound-type-${soundType.toLocaleLowerCase()}`,
			label,
			kind: "type",
			sectionKey: "soundTracks",
			href: buildAudioHref({ type: soundType }),
			searchText: `${label} ${soundType}`,
		});
	}

	const galleryTags = uniqueStrings(galleryPosts.flatMap((post) => post.tags));
	for (const tag of galleryTags) {
		pushUniqueItem(items, seen, {
			id: `gallery-tag-${tag.toLocaleLowerCase()}`,
			label: tag,
			kind: "tag",
			sectionKey: "imageCollections",
			href: galleryTagHrefFromPosts(galleryPosts, tag),
			searchText: tag,
		});
	}

	for (const slug of WRITING_CATEGORY_SLUGS) {
		const label = tNav(WRITING_CATEGORY_NAV_KEYS[slug]);
		pushUniqueItem(items, seen, {
			id: `writings-category-${slug}`,
			label,
			kind: "category",
			sectionKey: "writings",
			href: buildWritingsHref({ category: slug }),
			searchText: `${label} ${slug}`,
		});
	}

	for (const genre of BOOK_GENRES) {
		const label = tWritings(`genres.${genre}`);
		pushUniqueItem(items, seen, {
			id: `writings-genre-${genre}`,
			label,
			kind: "genre",
			sectionKey: "writings",
			href: buildWritingsHref({ genre }),
			searchText: `${label} ${genre}`,
		});
	}

	return items;
}
