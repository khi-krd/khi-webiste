import { getLocale, getTranslations } from "next-intl/server";
import { ImageCollectionShowcase } from "@/components/home/image-collection-showcase";
import { getImageCollection } from "@/lib/api/image-collection";

export async function ImageCollectionSection() {
	const locale = await getLocale();
	const t = await getTranslations("ImageCollection");
	const items = await getImageCollection(locale);

	return (
		<section
			className="cv-auto w-full overflow-hidden border-t border-border bg-background [--cv-intrinsic:800px]"
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
