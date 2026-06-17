import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { NewsPostView } from "@/components/news/news-post-view";
import { getNewsBySlug } from "@/lib/api/news";

type NewsPostPageProps = {
	params: Promise<{ locale: string; slug: string }>;
};

function formatPublishmentDate(locale: string, isoDate: string): string {
	try {
		return new Intl.DateTimeFormat(locale, { dateStyle: "long" }).format(
			new Date(isoDate),
		);
	} catch {
		return isoDate;
	}
}

export async function generateMetadata({
	params,
}: NewsPostPageProps): Promise<Metadata> {
	const { locale, slug } = await params;
	const detail = await getNewsBySlug(locale, slug);
	if (!detail) notFound();

	return {
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

	return (
		<main className="-mt-26 sm:-mt-30">
			<NewsPostView
				item={detail.item}
				categoryLabel={t(`categories.${detail.item.category}`)}
				dateLabel={formatPublishmentDate(locale, detail.item.publishedAt)}
				backLabel={t("post.back")}
				authorLabel={
					detail.item.author
						? t("post.byAuthor", { author: detail.item.author })
						: undefined
				}
				readTimeLabel={
					detail.item.readTime
						? t("readTime", { minutes: detail.item.readTime })
						: undefined
				}
				previous={detail.previous}
				next={detail.next}
				navLabel={t("post.navLabel")}
				previousLabel={t("post.previous")}
				nextLabel={t("post.next")}
			/>
		</main>
	);
}
