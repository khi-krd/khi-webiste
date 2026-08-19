import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { GalleryHero } from "@/components/gallery/gallery-hero";
import { GalleryPosts } from "@/components/gallery/gallery-posts";
import {
	filterGalleryPosts,
	getGalleryHeroColumns,
	getGalleryPosts,
	getGalleryTopics,
	paginateGalleryPosts,
} from "@/lib/api/gallery";
import {
	isGalleryCollectionType,
	parseGalleryTopicId,
} from "@/lib/gallery-url";
import { localeAlternates } from "@/lib/seo/metadata";

export async function generateMetadata({
	params,
}: {
	params: Promise<{ locale: string }>;
}): Promise<Metadata> {
	const { locale } = await params;
	const t = await getTranslations({ locale, namespace: "Gallery" });

	return {
		alternates: localeAlternates(locale, "/gallery"),
		title: t("pageTitle"),
		description: t("metaDescription"),
	};
}

type GalleryPageProps = {
	params: Promise<{ locale: string }>;
	searchParams: Promise<{
		page?: string;
		q?: string;
		type?: string;
		topic?: string;
	}>;
};

export default async function GalleryPage({
	params,
	searchParams,
}: GalleryPageProps) {
	const { locale } = await params;
	const { page: pageParam, q, type, topic } = await searchParams;
	setRequestLocale(locale);

	const t = await getTranslations("Gallery");

	const activeType = isGalleryCollectionType(type) ? type : null;
	const activeTopicId = parseGalleryTopicId(topic);
	// URL page is 1-based and paginates in memory; the upstream page stays pinned
	// at 0 so the query/topic refinement runs over the whole set.
	const page = Math.max(1, Number.parseInt(pageParam ?? "1", 10) || 1);

	const [columns, records, topics] = await Promise.all([
		getGalleryHeroColumns(locale),
		// Only one dimension reaches the wire (see buildCollectionParams);
		// filterGalleryPosts below narrows the other, plus `q`, which has no
		// upstream endpoint of its own.
		getGalleryPosts(locale, { type: activeType, topicId: activeTopicId }),
		getGalleryTopics(locale),
	]);

	const allPosts = filterGalleryPosts(records, q, activeType, activeTopicId);
	const { items, totalPages, currentPage } = paginateGalleryPosts(
		allPosts,
		page,
	);
	const posts = items.map((post) => ({
		...post,
		// Photo count = album length (the API carries no separate count field).
		photosLabel: t("posts.photosCount", { count: post.album.length }),
		typeLabel: t(`posts.types.${post.collectionType}`),
	}));

	return (
		<main>
			<GalleryHero
				eyebrow={t("hero.eyebrow")}
				title={t("hero.title")}
				columns={columns}
			/>

			{/* Carries the #gallery-content anchor for in-page scroll targets. */}
			<GalleryPosts
				eyebrow={t("posts.eyebrow")}
				title={t("posts.title")}
				description={t("posts.description")}
				posts={posts}
				currentPage={currentPage}
				totalPages={totalPages}
				activeQuery={q}
				activeType={activeType}
				activeTopicId={activeTopicId}
				topics={topics}
				noResultsMessage={t("search.noResults")}
				paginationLabel={t("posts.pagination.label")}
				previousLabel={t("posts.pagination.previous")}
				nextLabel={t("posts.pagination.next")}
			/>
		</main>
	);
}
