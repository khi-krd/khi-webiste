import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { GalleryPostView } from "@/components/gallery/gallery-post-view";
import { getGalleryPostBySlug } from "@/lib/api/gallery";
import { plainTextFromRichContent } from "@/lib/rich-text";
import { localeAlternates } from "@/lib/seo/metadata";

type GalleryPostPageProps = {
	params: Promise<{ locale: string; slug: string }>;
};

export async function generateMetadata({
	params,
}: GalleryPostPageProps): Promise<Metadata> {
	const { locale, slug } = await params;
	const detail = await getGalleryPostBySlug(locale, slug);
	// Thrown HERE (not just in the page) so the 404 status is decided before
	// the shell starts streaming with a 200.
	if (!detail) notFound();

	return {
		alternates: localeAlternates(locale, `/gallery/${slug}`),
		title: detail.post.title,
		description: plainTextFromRichContent(detail.post.description),
	};
}

/** publishmentDate is an ISO LocalDate — format for the active locale. */
function formatPublishmentDate(locale: string, isoDate: string): string {
	try {
		return new Intl.DateTimeFormat(locale, { dateStyle: "long" }).format(
			new Date(isoDate),
		);
	} catch {
		return isoDate;
	}
}

export default async function GalleryPostPage({
	params,
}: GalleryPostPageProps) {
	const { locale, slug } = await params;
	setRequestLocale(locale);

	const detail = await getGalleryPostBySlug(locale, slug);
	if (!detail) notFound();

	const t = await getTranslations("Gallery");
	// Back links are named after the menu entry for the section they return to.
	const tNav = await getTranslations("Nav");

	return (
		<main>
			<GalleryPostView
				detail={detail}
				backHref="/gallery"
				backLabel={tNav("menuGallery")}
				backAriaLabel={t("post.back")}
				photosLabel={t("posts.photosCount", {
					count: detail.post.album.length,
				})}
				typeLabel={t(`posts.types.${detail.post.collectionType}`)}
				dateLabel={formatPublishmentDate(locale, detail.post.publishmentDate)}
				locationLabel={t("post.location")}
				collectedByLabel={t("post.collectedBy")}
				relatedLabel={t("post.related")}
				related={detail.related.map((entry) => ({
					id: entry.id,
					title: entry.title,
					coverUrl:
						entry.coverUrl ??
						entry.album.find((item) => item.imageUrl)?.imageUrl,
					photosLabel: t("posts.photosCount", { count: entry.album.length }),
				}))}
				closeLabel={t("lightbox.close")}
				lightboxPreviousLabel={t("lightbox.previous")}
				lightboxNextLabel={t("lightbox.next")}
				metadataLabels={{
					dimensions: t("lightbox.metadata.dimensions"),
					fileSize: t("lightbox.metadata.fileSize"),
					fileSizeBytes: t("lightbox.metadata.fileSizeBytes"),
					mimeType: t("lightbox.metadata.mimeType"),
					aspectRatio: t("lightbox.metadata.aspectRatio"),
					sortOrder: t("lightbox.metadata.sortOrder"),
					externalUrl: t("lightbox.metadata.externalUrl"),
					embedUrl: t("lightbox.metadata.embedUrl"),
				}}
			/>
		</main>
	);
}
