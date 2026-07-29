import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { WritingPostView } from "@/components/writing/writing-post-view";
import { WritingsShell } from "@/components/writing/writings-shell";
import {
	getRelatedWritings,
	getWritingById,
	getWritingNeighbors,
	getWritingSeriesBooks,
} from "@/lib/api/writings";
import { localeAlternates } from "@/lib/seo/metadata";
import {
	WRITING_CATEGORY_NAV_KEYS,
	type WritingCategorySlug,
} from "@/lib/writing/categories";
import { BOOK_GENRES } from "@/lib/writing/genres";
import { loadWritingsPageData } from "@/lib/writing/page-data";
import { parseWritingSegment } from "@/lib/writing/segment";
import type { BookGenre } from "@/types/writing";

type WritingsSegmentPageProps = {
	params: Promise<{ locale: string; segment: string }>;
	searchParams: Promise<{
		genre?: string;
		q?: string;
		page?: string;
		sort?: string;
	}>;
};

export async function generateMetadata({
	params,
}: {
	params: Promise<{ locale: string; segment: string }>;
}): Promise<Metadata> {
	const { locale, segment } = await params;
	const parsed = parseWritingSegment(segment);

	if (!parsed) {
		return {};
	}

	if (parsed.kind === "category") {
		const t = await getTranslations({ locale, namespace: "Writings" });
		const navT = await getTranslations({ locale, namespace: "Nav" });

		return {
			title: navT(WRITING_CATEGORY_NAV_KEYS[parsed.slug]),
			description: t(`subcategories.${parsed.slug}.metaDescription`),
		};
	}

	const t = await getTranslations({ locale, namespace: "Writings" });
	const detail = await getWritingById(locale, parsed.id, {
		ckbLanguage: t("post.languages.ckb"),
		kmrLanguage: t("post.languages.kmr"),
	});

	if (!detail) {
		return {};
	}

	return {
		alternates: localeAlternates(locale, `/writings/${segment}`),
		title: detail.title,
		description: detail.description.slice(0, 160),
	};
}

export default async function WritingsSegmentPage({
	params,
	searchParams,
}: WritingsSegmentPageProps) {
	const { locale, segment } = await params;
	const resolvedSearchParams = await searchParams;
	const parsed = parseWritingSegment(segment);

	if (!parsed) {
		notFound();
	}

	setRequestLocale(locale);
	const t = await getTranslations("Writings");
	const navT = await getTranslations("Nav");

	if (parsed.kind === "category") {
		const pageData = await loadWritingsPageData(locale, t, navT, {
			categorySlug: parsed.slug as WritingCategorySlug,
			searchParams: resolvedSearchParams,
		});

		return (
			<main className="bg-background">
				<WritingsShell
					id="writings-content"
					title={pageData.gridTitle}
					categorySlug={parsed.slug}
					categoryCarouselItems={pageData.categoryCarouselItems}
					carouselNavLabel={t("grid.categoryNavLabel")}
					cards={pageData.gridCards}
					currentPage={pageData.listing.currentPage}
					totalPages={pageData.listing.totalPages}
					totalElements={pageData.listing.totalElements}
					activeGenre={pageData.activeGenre}
					activeQuery={pageData.activeQuery}
					activeSort={pageData.activeSort}
					genreLabels={pageData.genreLabels}
					noResultsMessage={pageData.noResultsMessage}
					paginationLabel={t("pagination.label")}
					previousLabel={t("pagination.previous")}
					nextLabel={t("pagination.next")}
					className="border-t-0 pt-10 sm:pt-12"
				/>
			</main>
		);
	}

	const labels = {
		ckbLanguage: t("post.languages.ckb"),
		kmrLanguage: t("post.languages.kmr"),
	};

	const detail = await getWritingById(locale, parsed.id, labels);
	if (!detail) {
		notFound();
	}

	const seriesBooks =
		detail.seriesId && detail.isPartOfSeries
			? await getWritingSeriesBooks(locale, detail.seriesId, detail.id)
			: [];

	const { previous, next } = await getWritingNeighbors(locale, detail.id);
	const related = await getRelatedWritings(locale, detail, {
		excludeIds: [previous?.id, next?.id].filter(
			(id): id is number => typeof id === "number",
		),
	});

	const genreLabels = Object.fromEntries(
		BOOK_GENRES.map((genre) => [genre, t(`genres.${genre}`)]),
	) as Record<BookGenre, string>;

	return (
		<main className="bg-background">
			<WritingPostView
				detail={detail}
				seriesBooks={seriesBooks}
				previous={previous}
				next={next}
				related={related}
				genreLabels={genreLabels}
				locale={locale}
				backLabel={t("post.back")}
				writerLabel={t("post.writer")}
				seriesLabel={t("post.series")}
				seriesVolumeLabel={(order, total) =>
					t("post.seriesVolume", { order, total: total ?? order })
				}
				topicLabel={t("post.topic")}
				keywordsLabel={t("post.keywords")}
				previewTitle={t("post.preview.title")}
				publishedLabel={t("post.published")}
				updatedLabel={t("post.updated")}
				navLabel={t("post.navLabel")}
				previousLabel={t("post.previous")}
				nextLabel={t("post.next")}
				relatedLabel={t("post.related")}
			/>
		</main>
	);
}
