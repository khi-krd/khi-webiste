import type { ComponentType } from "react";
import { BentoLayout } from "@/components/services/layouts/bento-layout";
import { CinemaLayout } from "@/components/services/layouts/cinema-layout";
import { EditorialLayout } from "@/components/services/layouts/editorial-layout";
import { GalleryLayout } from "@/components/services/layouts/gallery-layout";
import { SplitLayout } from "@/components/services/layouts/split-layout";
import { SplitReverseLayout } from "@/components/services/layouts/split-reverse-layout";
import { StackedLayout } from "@/components/services/layouts/stacked-layout";
import { StudioPanelLayout } from "@/components/services/layouts/studio-panel-layout";
import type { ServiceLayoutProps } from "@/components/services/layouts/types";
import type { ServiceLayout } from "@/lib/mock/services";

const LAYOUTS: Record<ServiceLayout, ComponentType<ServiceLayoutProps>> = {
	cinema: CinemaLayout,
	split: SplitLayout,
	"split-reverse": SplitReverseLayout,
	editorial: EditorialLayout,
	stacked: StackedLayout,
	gallery: GalleryLayout,
	"studio-panel": StudioPanelLayout,
	bento: BentoLayout,
};

export function getServiceLayoutComponent(layout: ServiceLayout) {
	return LAYOUTS[layout];
}
