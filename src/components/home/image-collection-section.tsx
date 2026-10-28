import { getLocale, getTranslations } from "next-intl/server";
import { ImageCollectionShowcase } from "@/components/home/image-collection-showcase";
import { getImageCollection } from "@/lib/api/image-collection";

export async function ImageCollectionSection() {
	const locale = await getLocale();
	const t = await getTranslations("ImageCollection");
	const items = await getImageCollection(locale);

	// No collections → no section at all; an empty h-svh band is a blank
	// viewport between the video section and the donate band.
	if (items.length === 0) {
		return null;
	}

	return (
		<section
			// Full-width section: the bento tray bleeds edge to edge, so no canvas
			// inset here — the header centers itself via HOME_IMAGE_BENTO_HEADER_CLASS's
			// 2xl padding, matching the other home sections. At least one screen
			// tall, growing with the 4×5 grid so no row is clipped under the donate
			// band; the body carries no bottom padding, so the dark tray runs to
			// the section's last pixel and meets the donate band with NO light gap.
			className="cv-auto flex min-h-svh w-full flex-col border-t border-border bg-background [--cv-intrinsic:160svh]"
			aria-labelledby="image-collection-heading"
		>
			<ImageCollectionShowcase
				items={items}
				copy={{ title: t("title"), viewAll: t("viewAll") }}
			/>
		</section>
	);
}
