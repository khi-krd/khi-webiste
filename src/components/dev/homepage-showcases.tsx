"use client";

import { useLocale, useTranslations } from "next-intl";
import { ShowcaseCard } from "@/components/dev/playground-block";
import { FeaturedCarousel } from "@/components/hero/featured-carousel";
import { FeaturedSlide } from "@/components/hero/featured-slide";
import { NewsCard } from "@/components/home/news-card";
import { ProjectCard } from "@/components/home/project-card";
import { VideoCard } from "@/components/home/video-card";
import { WritingRow } from "@/components/home/writing-row";
import {
	getLatestUpdates,
	type LatestUpdateCategory,
} from "@/lib/mock/latest-updates";
import { getProjects } from "@/lib/mock/projects";
import { getWritings } from "@/lib/mock/writings";
import { getVideos } from "@/lib/mock/videos";
import type { HeroSlide } from "@/types/content";

const showcaseGridClass = "grid gap-6 lg:gap-7 xl:grid-cols-2";

const PLAYGROUND_IMAGE_NAMES = ["5.jpg", "6.jpg", "7.jpg"] as const;

function getPlaygroundSlideCopy(locale: string) {
	if (locale === "ckb") {
		return [
			{
				title: "کتێب و بەڵگەنامەی میرات",
				description:
					"کۆکراوەیەک لە کتێب، دەستنووس و بەڵگەنامەی مێژوویی کە بە شێوەی دیجیتاڵ پارێزراون.",
				typeLabel: "کتێب",
				actionLabel: "خوێندنەوە",
			},
			{
				title: "ئەرشیفی گۆرانی و دەنگ",
				description:
					"گوێبگرە لە گۆرانییە کەلتوورییەکان و تۆمارە دەنگییە گرنگەکانی مێژووی شفاهی.",
				typeLabel: "دەنگ",
				actionLabel: "گوێگرتن",
			},
			{
				title: "وێنە و ڤیدیۆی کەلتووری",
				description:
					"بینینی گەلەری و ڤیدیۆکانی پەیوەندیدار بە ژیان، هونەر و مێژووی کوردی.",
				typeLabel: "گەلەری",
				actionLabel: "بینین",
			},
		];
	}

	if (locale === "ku") {
		return [
			{
				title: "Pirtûk û Belgeyên Mîratê",
				description:
					"Berhevoka pirtûk, destnivîs û belgeyên dîrokî yên ku bi awayekî dîjîtal hatiye parastin.",
				typeLabel: "Pirtûk",
				actionLabel: "Bixwîne",
			},
			{
				title: "Arşîva Stran û Deng",
				description:
					"Bihîse stranên çandî û tomarên dengî yên girîng ji dîroka devkî ya kurdî.",
				typeLabel: "Deng",
				actionLabel: "Bihîse",
			},
			{
				title: "Wêne û Vîdyoyên Çandî",
				description:
					"Temaşe bike galerî û vîdyoyên girêdayî bi jiyan, huner û dîroka kurdî.",
				typeLabel: "Galerî",
				actionLabel: "Bibîne",
			},
		];
	}

	return [
		{
			title: "Featured Heritage Library",
			description:
				"Browse curated books, manuscripts, and historical records from Kurdish cultural collections.",
			typeLabel: "Book",
			actionLabel: "Read",
		},
		{
			title: "Music and Oral History Archive",
			description:
				"Listen to songs, interviews, and oral history recordings preserved for the digital archive.",
			typeLabel: "Audio",
			actionLabel: "Listen",
		},
		{
			title: "Photo and Video Highlights",
			description:
				"Explore galleries and visual stories documenting Kurdish heritage across regions and generations.",
			typeLabel: "Gallery",
			actionLabel: "View",
		},
	];
}

function buildPlaygroundSlides(
	locale: string,
	slideLabel: (current: number, total: number) => string,
): HeroSlide[] {
	const copy = getPlaygroundSlideCopy(locale);

	return PLAYGROUND_IMAGE_NAMES.map((imageName, index) => {
		const slide = copy[index];
		return {
			id: `playground-${imageName}`,
			href: `/${locale}`,
			title: slide.title,
			description: slide.description,
			typeLabel: slide.typeLabel,
			actionLabel: slide.actionLabel,
			slideLabel: slideLabel(index + 1, PLAYGROUND_IMAGE_NAMES.length),
			image: {
				url: `/menu/${imageName}`,
				alt: slide.title,
			},
		};
	});
}

function usePlaygroundSlides(): HeroSlide[] {
	const locale = useLocale();
	const tHero = useTranslations("Hero");

	return buildPlaygroundSlides(locale, (current, total) =>
		tHero("slideLabel", { current, total }),
	);
}

function useCarouselDirection(): "ltr" | "rtl" {
	const locale = useLocale();
	return locale === "ckb" ? "rtl" : "ltr";
}

export function FeaturedSlideShowcase() {
	const slides = usePlaygroundSlides();

	return (
		<ShowcaseCard title={slides[0]?.title ?? "Featured slide"}>
			<FeaturedSlide slide={slides[0]} isPriority height="playground" />
		</ShowcaseCard>
	);
}

export function FeaturedCarouselShowcase() {
	const slides = usePlaygroundSlides();
	const direction = useCarouselDirection();
	const tHero = useTranslations("Hero");

	return (
		<ShowcaseCard title={tHero("regionLabel")}>
			<FeaturedCarousel
				slides={slides}
				direction={direction}
				height="playground"
				labels={{
					previous: tHero("previous"),
					next: tHero("next"),
				}}
			/>
		</ShowcaseCard>
	);
}

export function NewsCardShowcase() {
	const locale = useLocale();
	const t = useTranslations("LatestUpdates");
	const items = getLatestUpdates(locale);
	const [featured, small, medium, wide] = items;

	const categoryLabel = (category: LatestUpdateCategory) =>
		t(`categories.${category}`);

	if (!featured || !small || !medium || !wide) {
		return null;
	}

	return (
		<div className={showcaseGridClass}>
			<ShowcaseCard title="featured">
				<NewsCard
					item={featured}
					variant="featured"
					categoryLabel={categoryLabel(featured.category)}
					className="min-h-80"
				/>
			</ShowcaseCard>
			<ShowcaseCard title="small">
				<NewsCard
					item={small}
					variant="small"
					categoryLabel={categoryLabel(small.category)}
					className="min-h-52"
				/>
			</ShowcaseCard>
			<ShowcaseCard title="medium">
				<NewsCard
					item={medium}
					variant="medium"
					categoryLabel={categoryLabel(medium.category)}
					className="min-h-56"
				/>
			</ShowcaseCard>
			<ShowcaseCard title="wide">
				<NewsCard
					item={wide}
					variant="wide"
					categoryLabel={categoryLabel(wide.category)}
					className="min-h-56"
				/>
			</ShowcaseCard>
		</div>
	);
}

export function ProjectCardShowcase() {
	const locale = useLocale();
	const projects = getProjects(locale);
	const project = projects[0];

	if (!project) {
		return null;
	}

	return (
		<ShowcaseCard title={project.title}>
			<div className="max-w-sm">
				<ProjectCard item={project} />
			</div>
		</ShowcaseCard>
	);
}

export function WritingRowShowcase() {
	const locale = useLocale();
	const t = useTranslations("Writings");
	const writings = getWritings(locale).slice(0, 3);

	return (
		<ShowcaseCard title={t("title")}>
			<div>
				{writings.map((item, index) => (
					<WritingRow
						key={item.id}
						item={{
							id: Number.parseInt(item.id.replace(/\D/g, ""), 10) || index,
							title: item.title,
							writer: item.author ?? "",
							excerpt: item.excerpt,
							coverUrl: item.image?.url ?? null,
							genreLabel: t(`categories.${item.category}`),
							fileUrl: null,
						}}
						index={index}
					/>
				))}
			</div>
		</ShowcaseCard>
	);
}

export function VideoCardShowcase() {
	const locale = useLocale();
	const t = useTranslations("Video");
	const videos = getVideos(locale);
	const [featured, compact] = videos;

	if (!featured || !compact) {
		return null;
	}

	const categoryLabel = (category: (typeof featured)["category"]) =>
		t(`categories.${category}`);

	return (
		<div className={showcaseGridClass}>
			<ShowcaseCard title="featured">
				<VideoCard
					item={featured}
					categoryLabel={categoryLabel(featured.category)}
					variant="featured"
				/>
			</ShowcaseCard>
			<ShowcaseCard title="compact">
				<VideoCard
					item={compact}
					categoryLabel={categoryLabel(compact.category)}
					variant="compact"
				/>
			</ShowcaseCard>
		</div>
	);
}
