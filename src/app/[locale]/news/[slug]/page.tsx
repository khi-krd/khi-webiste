import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { NewsPostView } from "@/components/news/news-post-view";
import { getNewsBySlug, getRelatedNews } from "@/lib/api/news";
import { localeAlternates } from "@/lib/seo/metadata";

type NewsPostPageProps = {
	params: Promise<{ locale: string; slug: string }>;
};

export async function generateMetadata({
	params,
}: NewsPostPageProps): Promise<Metadata> {
	const { locale, slug } = await params;
	const detail = await getNewsBySlug(locale, slug);
	if (!detail) notFound();

	return {
		alternates: localeAlternates(locale, `/news/${slug}`),
		title: detail.item.title,
		description: detail.item.excerpt,
	};
}

export default async function NewsPostPage({ params }: NewsPostPageProps) {
	const { locale, slug } = await params;
	setRequestLocale(locale);

	const detail = await getNewsBySlug(locale, slug);
	if (!detail) notFound();

	const t = await getTranslations("News");
	const related = await getRelatedNews(locale, detail.item, {
		excludeIds: [detail.previous?.id, detail.next?.id].filter(
			(id): id is string => Boolean(id),
		),
	});

	return (
		<main className="bg-background">
			<NewsPostView
				item={detail.item}
				authorLabel={
					detail.item.author
						? t("post.byAuthor", { author: detail.item.author })
						: undefined
				}
				galleryLabel={t("post.gallery")}
				closeLabel={t("post.lightbox.close")}
				lightboxPreviousLabel={t("post.lightbox.previous")}
				lightboxNextLabel={t("post.lightbox.next")}
				related={related}
				relatedLabel={t("post.related")}
			/>
		</main>
	);
}
