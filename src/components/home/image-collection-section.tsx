import { getLocale, getTranslations } from "next-intl/server";
import { ImageCollectionShowcase } from "@/components/home/image-collection-showcase";
import { getImageCollection } from "@/lib/api/image-collection";

export async function ImageCollectionSection() {
	const locale = await getLocale();
	const t = await getTranslations("ImageCollection");
	const items = await getImageCollection(locale);

	return (
		<section
			className="cv-auto flex h-svh max-h-svh min-h-0 w-full flex-col overflow-hidden border-t border-border bg-background [--cv-intrinsic:100svh]"
			aria-labelledby="image-collection-heading"
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
