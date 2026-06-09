import dynamic from "next/dynamic";
import { Skeleton } from "@/components/ui/skeleton";

function ShowcaseSkeleton({ minHeight = "12rem" }: { minHeight?: string }) {
	return <Skeleton className="w-full" style={{ minHeight }} aria-hidden />;
}

export const VideoPlayerShowcase = dynamic(
	() =>
		import("@/components/dev/video-player-showcase").then(
			(mod) => mod.VideoPlayerShowcase,
		),
	{ loading: () => <ShowcaseSkeleton minHeight="16rem" /> },
);

export const FormShowcase = dynamic(
	() =>
		import("@/components/dev/form-showcase").then((mod) => mod.FormShowcase),
	{ loading: () => <ShowcaseSkeleton /> },
);

export const FeaturedCarouselShowcase = dynamic(
	() =>
		import("@/components/dev/homepage-showcases").then(
			(mod) => mod.FeaturedCarouselShowcase,
		),
	{ loading: () => <ShowcaseSkeleton minHeight="20rem" /> },
);

export const AboutHeroShowcase = dynamic(
	() =>
		import("@/components/dev/about-showcases").then(
			(mod) => mod.AboutHeroShowcase,
		),
	{ loading: () => <ShowcaseSkeleton minHeight="24rem" /> },
);

export const AboutTeamShowcasePreview = dynamic(
	() =>
		import("@/components/dev/about-section-previews").then(
			(mod) => mod.AboutTeamShowcasePreview,
		),
	{ loading: () => <ShowcaseSkeleton minHeight="24rem" /> },
);

export const FeaturedHero = dynamic(
	() =>
		import("@/components/dev/homepage-section-previews").then(
			(mod) => mod.FeaturedHero,
		),
	{ loading: () => <ShowcaseSkeleton minHeight="24rem" /> },
);

export const LatestUpdates = dynamic(
	() =>
		import("@/components/dev/homepage-section-previews").then(
			(mod) => mod.LatestUpdates,
		),
	{ loading: () => <ShowcaseSkeleton minHeight="20rem" /> },
);

export const ProjectsSection = dynamic(
	() =>
		import("@/components/dev/homepage-section-previews").then(
			(mod) => mod.ProjectsSection,
		),
	{ loading: () => <ShowcaseSkeleton minHeight="20rem" /> },
);

export const SoundSection = dynamic(
	() =>
		import("@/components/dev/homepage-section-previews").then(
			(mod) => mod.SoundSection,
		),
	{ loading: () => <ShowcaseSkeleton minHeight="20rem" /> },
);

export const WritingsSection = dynamic(
	() =>
		import("@/components/dev/homepage-section-previews").then(
			(mod) => mod.WritingsSection,
		),
	{ loading: () => <ShowcaseSkeleton minHeight="20rem" /> },
);

export const VideoSection = dynamic(
	() =>
		import("@/components/dev/homepage-section-previews").then(
			(mod) => mod.VideoSection,
		),
	{ loading: () => <ShowcaseSkeleton minHeight="20rem" /> },
);

export const ImageCollectionSection = dynamic(
	() =>
		import("@/components/dev/homepage-section-previews").then(
			(mod) => mod.ImageCollectionSection,
		),
	{ loading: () => <ShowcaseSkeleton minHeight="20rem" /> },
);

export const AboutMissionPreview = dynamic(
	() =>
		import("@/components/dev/about-section-previews").then(
			(mod) => mod.AboutMissionPreview,
		),
	{ loading: () => <ShowcaseSkeleton minHeight="16rem" /> },
);

export const AboutFounderPreview = dynamic(
	() =>
		import("@/components/dev/about-section-previews").then(
			(mod) => mod.AboutFounderPreview,
		),
	{ loading: () => <ShowcaseSkeleton minHeight="16rem" /> },
);

export const AboutPartnersPreview = dynamic(
	() =>
		import("@/components/dev/about-section-previews").then(
			(mod) => mod.AboutPartnersPreview,
		),
	{ loading: () => <ShowcaseSkeleton minHeight="16rem" /> },
);
