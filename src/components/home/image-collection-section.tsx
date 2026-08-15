import { getLocale, getTranslations } from "next-intl/server";
import { ImageCollectionShowcase } from "@/components/home/image-collection-showcase";
import { getImageCollection } from "@/lib/api/image-collection";

export async function ImageCollectionSection() {
	const locale = await getLocale();
	const t = await getTranslations("ImageCollection");
	const items = await getImageCollection(locale);

	return (
		<section
			// 2xl inline padding centers the bento in the shared 96rem canvas; no
			// +2rem here because the showcase's own `px-6 sm:px-8` supplies it. It
			// also stops the square tiles outgrowing the h-svh clip on wide screens.
			className="cv-auto flex h-svh max-h-svh min-h-0 w-full flex-col overflow-hidden border-t border-border bg-background [--cv-intrinsic:100svh] 2xl:px-[calc((100vw-96rem)/2)]"
			aria-labelledby="image-collection-heading"
		>
			<ImageCollectionShowcase
				items={items}
				copy={{ title: t("title"), viewAll: t("viewAll") }}
			/>
		</section>
	);
}
