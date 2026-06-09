import type { ReactElement } from "react";
import {
	AboutFounderSection,
	AboutHeroSection,
	AboutMissionSection,
	AboutPartnersSection,
	AboutTeamPhotoSection,
	AboutTeamShowcaseSection,
	PartnerCardSection,
	SectionRuleHeadingSection,
} from "@/components/dev/ui-playground/sections/about";
import {
	ContainerSection,
	ImageSection,
	ProseSection,
	VideoPlayerSection,
} from "@/components/dev/ui-playground/sections/content";
import {
	FieldSection,
	InputSection,
} from "@/components/dev/ui-playground/sections/forms";
import {
	ColorsSection,
	HeadingsSection,
	TypographySection,
} from "@/components/dev/ui-playground/sections/foundations";
import {
	FeaturedCarouselSection,
	FeaturedHeroSection,
	FeaturedSlideSection,
	ImageCollectionSectionPreview,
	LatestUpdatesSection,
	NewsCardSection,
	ProjectCardSection,
	ProjectsSectionPreview,
	SoundSectionPreview,
	VideoCardSection,
	VideoSectionPreview,
	WritingRowSection,
	WritingsSectionPreview,
} from "@/components/dev/ui-playground/sections/homepage";
import {
	ButtonSection,
	DirectionalIconSection,
	DrawnBorderSection,
	LinkSection,
} from "@/components/dev/ui-playground/sections/primitives";
import {
	EmptyStateSection,
	ErrorStateSection,
	SkeletonSection,
	SpinnerSection,
} from "@/components/dev/ui-playground/sections/states";
import {
	BadgeSection,
	BreadcrumbSection,
	DividerSection,
	PaginationSection,
	VisuallyHiddenSection,
} from "@/components/dev/ui-playground/sections/utilities";
import type { UiPlaygroundSectionId } from "@/components/dev/ui-playground-groups";

const SECTION_RENDERERS: Record<
	UiPlaygroundSectionId,
	() => Promise<ReactElement>
> = {
	typography: TypographySection,
	headings: HeadingsSection,
	colors: ColorsSection,
	button: ButtonSection,
	drawnBorder: DrawnBorderSection,
	link: LinkSection,
	directionalIcon: DirectionalIconSection,
	input: InputSection,
	field: FieldSection,
	prose: ProseSection,
	image: ImageSection,
	videoPlayer: VideoPlayerSection,
	container: ContainerSection,
	spinner: SpinnerSection,
	emptyState: EmptyStateSection,
	errorState: ErrorStateSection,
	skeleton: SkeletonSection,
	visuallyHidden: VisuallyHiddenSection,
	divider: DividerSection,
	badge: BadgeSection,
	breadcrumb: BreadcrumbSection,
	pagination: PaginationSection,
	featuredSlide: FeaturedSlideSection,
	featuredCarousel: FeaturedCarouselSection,
	newsCard: NewsCardSection,
	projectCard: ProjectCardSection,
	writingRow: WritingRowSection,
	videoCard: VideoCardSection,
	featuredHero: FeaturedHeroSection,
	latestUpdates: LatestUpdatesSection,
	projectsSection: ProjectsSectionPreview,
	soundSection: SoundSectionPreview,
	writingsSection: WritingsSectionPreview,
	videoSection: VideoSectionPreview,
	imageCollectionSection: ImageCollectionSectionPreview,
	sectionRuleHeading: SectionRuleHeadingSection,
	aboutTeamPhoto: AboutTeamPhotoSection,
	partnerCard: PartnerCardSection,
	aboutHero: AboutHeroSection,
	aboutMission: AboutMissionSection,
	aboutFounder: AboutFounderSection,
	aboutTeamShowcase: AboutTeamShowcaseSection,
	aboutPartners: AboutPartnersSection,
};

type UiPlaygroundSectionRendererProps = {
	sectionId: UiPlaygroundSectionId;
};

export async function UiPlaygroundSectionRenderer({
	sectionId,
}: UiPlaygroundSectionRendererProps) {
	const render = SECTION_RENDERERS[sectionId];
	return render();
}
