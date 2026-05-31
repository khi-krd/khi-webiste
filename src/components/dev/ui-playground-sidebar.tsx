import { getTranslations } from "next-intl/server";
import type { ReactNode } from "react";
import {
	UI_PLAYGROUND_GROUPS,
	UI_PLAYGROUND_INTRODUCTION_ID,
} from "@/components/dev/ui-playground-groups";

type UiPlaygroundSidebarProps = {
	children: ReactNode;
};

export async function UiPlaygroundSidebar({
	children,
}: UiPlaygroundSidebarProps) {
	const t = await getTranslations("Ui");

	return (
		<main className="min-h-dvh pb-16">
			<div className="w-full px-100 pt-10 sm:px-20 lg:px-30">
				<div className="grid gap-x-12 lg:grid-cols-[12rem_minmax(0,1fr)] lg:gap-x-16">
					<nav aria-label={t("toc")} className="hidden lg:block">
						<div className="sticky top-8 flex max-h-[calc(100dvh-2rem)] flex-col gap-5 overflow-y-auto overscroll-y-contain text-start">
							<p className="label">{t("toc")}</p>
							<ul className="flex flex-col gap-1">
								<li>
									<a
										href={`#${UI_PLAYGROUND_INTRODUCTION_ID}`}
										className="text-small text-muted transition-colors hover:text-foreground"
									>
										{t(`sections.${UI_PLAYGROUND_INTRODUCTION_ID}.title`)}
									</a>
								</li>
							</ul>
							{UI_PLAYGROUND_GROUPS.map((group) => (
								<div key={group.key} className="flex flex-col gap-1.5">
									<p className="text-small font-medium text-foreground">
										{t(`groups.${group.key}`)}
									</p>
									<ul className="flex flex-col gap-1">
										{group.sections.map((id) => (
											<li key={id}>
												<a
													href={`#${id}`}
													className="text-small text-muted transition-colors hover:text-foreground"
												>
													{t(`sections.${id}.title`)}
												</a>
											</li>
										))}
									</ul>
								</div>
							))}
						</div>
					</nav>
					{children}
				</div>
			</div>
		</main>
	);
}
