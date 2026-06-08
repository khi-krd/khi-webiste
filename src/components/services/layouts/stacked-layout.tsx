import type { ServiceLayoutProps } from "@/components/services/layouts/types";
import { buildServiceGallery } from "@/components/services/service-gallery-slides";
import { ServiceLayoutShell } from "@/components/services/service-layout-shell";
import { ServiceMediaGallery } from "@/components/services/service-media-gallery";

export function StackedLayout({ service, title, body }: ServiceLayoutProps) {
	const gallery = buildServiceGallery(service, "video");

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
					mainClassName="max-w-4xl"
				/>
			}
		/>
	);
}
