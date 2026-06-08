import type { ServiceLayoutProps } from "@/components/services/layouts/types";
import { buildServiceGallery } from "@/components/services/service-gallery-slides";
import { ServiceLayoutShell } from "@/components/services/service-layout-shell";
import { ServiceMediaGallery } from "@/components/services/service-media-gallery";

export function BentoLayout({ service, title, body }: ServiceLayoutProps) {
	const gallery = buildServiceGallery(service, "feature");

	return (
		<ServiceLayoutShell
			id={service.id}
			title={title}
			body={body}
			media={
				<ServiceMediaGallery
					slides={gallery.slides}
					defaultIndex={gallery.defaultIndex}
					title={title}
					mainAspectRatio="4/3"
					mainClassName="max-w-3xl"
				/>
			}
		/>
	);
}
