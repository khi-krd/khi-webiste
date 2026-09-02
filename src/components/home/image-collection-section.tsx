import { getLocale, getTranslations } from "next-intl/server";
import { ImageCollectionShowcase } from "@/components/home/image-collection-showcase";
import { getImageCollection } from "@/lib/api/image-collection";

export async function ImageCollectionSection() {
	const locale = await getLocale();
	const t = await getTranslations("ImageCollection");
	const items = await getImageCollection(locale);

	return (
		<section
			// Full-width section: the bento tray bleeds edge to edge, so no canvas
			// inset here — the header centers itself via HOME_IMAGE_BENTO_HEADER_CLASS's
			// 2xl padding, matching the other home sections. Height HUGS the
			// content (user request: the band must connect straight to the donate
			// section below), while max-h-svh keeps the deliberate poster-crop
			// when a full 3×5 collage outgrows the viewport.
			className="cv-auto flex max-h-svh min-h-0 w-full flex-col overflow-hidden border-t border-border bg-background [--cv-intrinsic:100svh]"
			aria-labelledby="image-collection-heading"
		>
			<ImageCollectionShowcase
				items={items}
				copy={{ title: t("title"), viewAll: t("viewAll") }}
			/>
		</section>
	);
}
