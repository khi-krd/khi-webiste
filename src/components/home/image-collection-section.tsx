import { getLocale, getTranslations } from "next-intl/server";
import { ImageCollectionShowcase } from "@/components/home/image-collection-showcase";
import { getImageCollection } from "@/lib/mock/image-collection";

export async function ImageCollectionSection() {
	const locale = await getLocale();
	const t = await getTranslations("ImageCollection");
	const items = getImageCollection(locale);

	return (
		<section
			className="w-full overflow-hidden border-t border-border bg-background"
			aria-labelledby="image-collection-heading"
			aria-roledescription="carousel"
		>
			<ImageCollectionShowcase
				items={items}
				copy={{
					eyebrow: t("eyebrow"),
					title: t("title"),
					description: t("description"),
					viewAll: t("viewAll"),
				}}
			/>
		</section>
	);
}
