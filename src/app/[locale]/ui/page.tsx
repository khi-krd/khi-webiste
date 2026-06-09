import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Suspense } from "react";
import {
	resolveUiPlaygroundSectionId,
	UI_PLAYGROUND_INTRODUCTION_ID,
	type UiPlaygroundSectionId,
} from "@/components/dev/ui-playground-groups";
import { UiPlaygroundHeroStrip } from "@/components/dev/ui-playground-hero-strip";
import { UiPlaygroundIntroduction } from "@/components/dev/ui-playground-introduction";
import { UiPlaygroundMain } from "@/components/dev/ui-playground-main";
import { UiPlaygroundSectionRenderer } from "@/components/dev/ui-playground-section-renderer";
import { UiPlaygroundSidebar } from "@/components/dev/ui-playground-sidebar";
import { Skeleton } from "@/components/ui/skeleton";
import type { Locale } from "@/i18n/routing";

export async function generateMetadata({
	params,
}: {
	params: Promise<{ locale: string }>;
}): Promise<Metadata> {
	const { locale } = await params;
	const t = await getTranslations({ locale, namespace: "Ui" });

	return {
		title: t("title"),
		robots: { index: false, follow: false },
	};
}

type UiPlaygroundPageProps = {
	params: Promise<{ locale: string }>;
	searchParams: Promise<{ section?: string }>;
};

export default async function UiPlaygroundPage({
	params,
	searchParams,
}: UiPlaygroundPageProps) {
	const { locale } = await params;
	const { section } = await searchParams;
	setRequestLocale(locale);

	const activeSection = resolveUiPlaygroundSectionId(section);
	const isIntroduction = activeSection === UI_PLAYGROUND_INTRODUCTION_ID;

	return (
		<UiPlaygroundSidebar
			locale={locale as Locale}
			activeSection={activeSection}
		>
			<UiPlaygroundMain>
				{isIntroduction ? (
					<div className="space-y-10 sm:space-y-12">
						<UiPlaygroundIntroduction locale={locale as Locale} />
						<UiPlaygroundHeroStrip />
					</div>
				) : (
					<Suspense
						key={activeSection}
						fallback={<Skeleton className="min-h-48 w-full" aria-hidden />}
					>
						<UiPlaygroundSectionRenderer
							sectionId={activeSection as UiPlaygroundSectionId}
						/>
					</Suspense>
				)}
			</UiPlaygroundMain>
		</UiPlaygroundSidebar>
	);
}
