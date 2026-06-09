import { getTranslations } from "next-intl/server";
import type { ReactNode } from "react";
import {
	UI_PLAYGROUND_GROUPS,
	UI_PLAYGROUND_INTRODUCTION_ID,
} from "@/components/dev/ui-playground-groups";
import { UiPlaygroundToc } from "@/components/dev/ui-playground-toc";
import { type Locale, routing } from "@/i18n/routing";

type UiPlaygroundSidebarProps = {
	locale: Locale;
	activeSection: string;
	children: ReactNode;
};

export async function UiPlaygroundSidebar({
	locale,
	activeSection,
	children,
}: UiPlaygroundSidebarProps) {
	const t = await getTranslations("Ui");

	const groups = UI_PLAYGROUND_GROUPS.map((group) => ({
		key: group.key,
		label: t(`groups.${group.key}`),
		sections: group.sections.map((id) => ({
			id,
			title: t(`sections.${id}.title`),
		})),
	}));

	const localeLabels = Object.fromEntries(
		routing.locales.map((loc) => [loc, t(`locales.${loc}`)]),
	) as Record<Locale, string>;

	return (
		<main className="min-h-dvh pb-16">
			<div className="w-full px-6 pt-10 sm:px-12 lg:px-16 xl:px-24">
				<div className="grid gap-x-12 lg:grid-cols-[16rem_minmax(0,1fr)] lg:gap-x-20">
					<UiPlaygroundToc
						locale={locale}
						activeSection={activeSection}
						introductionTitle={t(
							`sections.${UI_PLAYGROUND_INTRODUCTION_ID}.title`,
						)}
						groups={groups}
						languagesLabel={t("languages")}
						localeLabels={localeLabels}
						jumpLabel={t("toc")}
					/>
					{children}
				</div>
			</div>
		</main>
	);
}
