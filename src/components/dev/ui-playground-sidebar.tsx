import { getTranslations } from "next-intl/server";
import type { ReactNode } from "react";
import {
	UI_PLAYGROUND_GROUPS,
	UI_PLAYGROUND_INTRODUCTION_ID,
} from "@/components/dev/ui-playground-groups";
import { Link } from "@/components/ui/link";
import { type Locale, routing } from "@/i18n/routing";

type UiPlaygroundSidebarProps = {
	locale: Locale;
	children: ReactNode;
};

export async function UiPlaygroundSidebar({
	locale,
	children,
}: UiPlaygroundSidebarProps) {
	const t = await getTranslations("Ui");

	return (
		<main className="min-h-dvh pb-16">
			<div className="w-full px-6 pt-10 sm:px-12 lg:px-16 xl:px-24">
				<div className="grid gap-x-12 lg:grid-cols-[16rem_minmax(0,1fr)] lg:gap-x-20">
					<nav aria-label={t("toc")} className="hidden lg:block">
						<div
							data-lenis-prevent
							className="sticky top-10 h-[calc(100svh-3rem)] overflow-y-auto overscroll-contain py-2 pe-6 text-start [touch-action:pan-y]"
						>
							<p className="label mb-5">{t("toc")}</p>

							<a
								href={`#${UI_PLAYGROUND_INTRODUCTION_ID}`}
								aria-current="location"
								className="mb-6 block ps-1 text-small text-muted transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground/40 focus-visible:ring-offset-2"
							>
								{t(`sections.${UI_PLAYGROUND_INTRODUCTION_ID}.title`)}
							</a>

							{UI_PLAYGROUND_GROUPS.map((group) => (
								<div
									key={group.key}
									className="mt-7 first:mt-0"
								>
									<p className="mb-3 text-small font-semibold tracking-wide text-foreground">
										{t(`groups.${group.key}`)}
									</p>
									<ul className="flex flex-col gap-2.5">
										{group.sections.map((id) => (
											<li key={id}>
												<a
													href={`#${id}`}
													className="block ps-1 text-small text-muted transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground/40 focus-visible:ring-offset-2"
												>
													{t(`sections.${id}.title`)}
												</a>
											</li>
										))}
									</ul>
								</div>
							))}
							<div className="mt-8">
								<p className="mb-3 text-small font-semibold tracking-wide text-foreground">
									{t("languages")}
								</p>
								<ul className="flex flex-wrap gap-2">
									{routing.locales.map((loc) => (
										<li key={loc}>
											<Link
												href="/ui"
												locale={loc}
												variant="nav"
												active={locale === loc}
												className="inline-flex min-h-9 items-center border border-border px-2 py-1 text-small focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground/40 focus-visible:ring-offset-2"
											>
												{t(`locales.${loc}`)}
											</Link>
										</li>
									))}
								</ul>
							</div>
						</div>
					</nav>
					{children}
				</div>
			</div>
		</main>
	);
}
