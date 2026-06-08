import type { ServiceLayoutProps } from "@/components/services/layouts/types";
import { ServiceFeatureImage } from "@/components/services/service-feature-image";
import { buildServiceGallery } from "@/components/services/service-gallery-slides";
import { ServiceLayoutShell } from "@/components/services/service-layout-shell";
import { ServiceMediaGallery } from "@/components/services/service-media-gallery";

export function SplitLayout({ service, title, body }: ServiceLayoutProps) {
	const gallery = buildServiceGallery(service, "feature");

	return (
		<ServiceLayoutShell
			id={service.id}
			title={title}
			body={body}
			media={
				<div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.3fr)] lg:items-start lg:gap-4">
					<ServiceMediaGallery
						slides={gallery.slides}
						defaultIndex={gallery.defaultIndex}
						title={title}
					/>
					<ServiceFeatureImage
						src={service.video.poster ?? service.featureImage.url}
						alt={service.featureImage.alt ?? title}
						aspectRatio="3/4"
						sizes="(max-width: 1024px) 100vw, 30vw"
						className="hidden lg:block"
					/>
				</div>
			}
		/>
	);
}
