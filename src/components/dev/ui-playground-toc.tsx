"use client";

import { type ChangeEvent, useMemo } from "react";
import { UI_PLAYGROUND_INTRODUCTION_ID } from "@/components/dev/ui-playground-groups";
import { Link, useRouter } from "@/i18n/navigation";
import { type Locale, routing } from "@/i18n/routing";
import { cn } from "@/lib/utils";

type TocGroup = {
	key: string;
	label: string;
	sections: { id: string; title: string }[];
};

type UiPlaygroundTocProps = {
	locale: Locale;
	activeSection: string;
	introductionTitle: string;
	groups: TocGroup[];
	languagesLabel: string;
	localeLabels: Record<Locale, string>;
	jumpLabel: string;
};

const linkClass =
	"block w-full ps-1 text-start text-small transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground/40 focus-visible:ring-offset-2";

function sectionHref(sectionId: string) {
	return sectionId === UI_PLAYGROUND_INTRODUCTION_ID
		? "/ui"
		: { pathname: "/ui" as const, query: { section: sectionId } };
}

export function UiPlaygroundToc({
	locale,
	activeSection,
	introductionTitle,
	groups,
	languagesLabel,
	localeLabels,
	jumpLabel,
}: UiPlaygroundTocProps) {
	const router = useRouter();

	const flatSections = useMemo(
		() => [
			{ id: UI_PLAYGROUND_INTRODUCTION_ID, title: introductionTitle },
			...groups.flatMap((group) => group.sections),
		],
		[groups, introductionTitle],
	);

	const selectSection = (id: string) => {
		if (id === UI_PLAYGROUND_INTRODUCTION_ID) {
			router.push("/ui");
			return;
		}
		router.push({
			pathname: "/ui",
			query: { section: id },
		});
	};

	const handleJumpChange = (event: ChangeEvent<HTMLSelectElement>) => {
		selectSection(event.target.value);
	};

	return (
		<>
			<div className="sticky top-0 z-20 -mx-6 mb-6 border-b border-border bg-background/95 px-6 py-3 backdrop-blur-sm lg:hidden">
				<label className="sr-only" htmlFor="ui-playground-jump">
					{jumpLabel}
				</label>
				<select
					id="ui-playground-jump"
					value={activeSection}
					onChange={handleJumpChange}
					className="w-full border border-border bg-surface px-3 py-2 text-small text-foreground"
				>
					{flatSections.map((section) => (
						<option key={section.id} value={section.id}>
							{section.title}
						</option>
					))}
				</select>
			</div>

			<nav aria-label={jumpLabel} className="hidden lg:block">
				<div
					className="sticky top-10 h-[calc(100svh-3rem)] overflow-y-auto overscroll-contain py-2 pe-6 text-start [touch-action:pan-y]"
				>
					<p className="label mb-5">{jumpLabel}</p>

					<Link
						href={sectionHref(UI_PLAYGROUND_INTRODUCTION_ID)}
						scroll
						aria-current={
							activeSection === UI_PLAYGROUND_INTRODUCTION_ID
								? "location"
								: undefined
						}
						className={cn(
							linkClass,
							"mb-6",
							activeSection === UI_PLAYGROUND_INTRODUCTION_ID
								? "font-medium text-foreground"
								: "text-muted hover:text-foreground",
						)}
					>
						{introductionTitle}
					</Link>

					{groups.map((group) => (
						<div key={group.key} className="mt-7 first:mt-0">
							<p className="mb-3 text-small font-semibold tracking-wide text-foreground">
								{group.label}
							</p>
							<ul className="flex flex-col gap-2.5">
								{group.sections.map((section) => {
									const isActive = activeSection === section.id;

									return (
										<li key={section.id}>
											<Link
												href={sectionHref(section.id)}
												scroll
												aria-current={isActive ? "location" : undefined}
												className={cn(
													linkClass,
													isActive
														? "font-medium text-foreground"
														: "text-muted hover:text-foreground",
												)}
											>
												{section.title}
											</Link>
										</li>
									);
								})}
							</ul>
						</div>
					))}

					<div className="mt-8">
						<p className="mb-3 text-small font-semibold tracking-wide text-foreground">
							{languagesLabel}
						</p>
						<ul className="flex flex-wrap gap-2">
							{routing.locales.map((loc) => (
								<li key={loc}>
									<Link
										href="/ui"
										locale={loc}
										aria-current={locale === loc ? "page" : undefined}
										className={cn(
											"inline-flex min-h-9 items-center border border-border px-2 py-1 text-small focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground/40 focus-visible:ring-offset-2",
											locale === loc
												? "font-medium text-foreground"
												: "text-muted hover:text-foreground",
										)}
									>
										{localeLabels[loc]}
									</Link>
								</li>
							))}
						</ul>
					</div>
				</div>
			</nav>
		</>
	);
}
