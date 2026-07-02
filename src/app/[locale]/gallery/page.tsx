import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { GalleryHero } from "@/components/gallery/gallery-hero";
import { GalleryPosts } from "@/components/gallery/gallery-posts";
import {
	GALLERY_POSTS_PER_PAGE,
	getGalleryHeroColumns,
	getGalleryPosts,
	paginateGalleryPosts,
	filterGalleryPosts,
} from "@/lib/api/gallery";

export async function generateMetadata({
	params,
}: {
	params: Promise<{ locale: string }>;
}): Promise<Metadata> {
	const { locale } = await params;
	const t = await getTranslations({ locale, namespace: "Gallery" });

	return {
		title: t("pageTitle"),
		description: t("metaDescription"),
	};
}

type GalleryPageProps = {
	params: Promise<{ locale: string }>;
	searchParams: Promise<{ page?: string; q?: string }>;
};

export default async function GalleryPage({
	params,
	searchParams,
}: GalleryPageProps) {
	const { locale } = await params;
	const { page: pageParam, q } = await searchParams;
	setRequestLocale(locale);

	const t = await getTranslations("Gallery");
	const columns = await getGalleryHeroColumns(locale);

	const page = Math.max(1, Number.parseInt(pageParam ?? "1", 10) || 1);
	const allPosts = filterGalleryPosts(await getGalleryPosts(locale), q);
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
		<main className="-mt-26 sm:-mt-30">
			<GalleryHero
				eyebrow={t("hero.eyebrow")}
				title={t("hero.title")}
				cta={t("hero.cta")}
				columns={columns}
			/>

			{/* Carries the #gallery-content anchor the hero CTA scrolls to. */}
			<GalleryPosts
				eyebrow={t("posts.eyebrow")}
				title={t("posts.title")}
				description={t("posts.description")}
				posts={posts}
				totalCount={allPosts.length}
				indexOffset={(currentPage - 1) * GALLERY_POSTS_PER_PAGE}
				currentPage={currentPage}
				totalPages={totalPages}
				paginationLabel={t("posts.pagination.label")}
				previousLabel={t("posts.pagination.previous")}
				nextLabel={t("posts.pagination.next")}
			/>
		</main>
	);
}
