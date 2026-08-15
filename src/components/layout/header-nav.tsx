"use client";

import { Bars3Icon, MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import { useTranslations } from "next-intl";
import { useCallback, useRef, useState } from "react";
import { LanguageSwitcher } from "@/components/layout/language-switcher";
import { NAV_DRAWER_ID, NavDrawer } from "@/components/layout/nav-drawer";
import { DrawnBorder } from "@/components/ui/drawn-border";
import { cn } from "@/lib/utils";

const iconControlClass = cn(
	"draw-border-host draw-border-brand relative isolate inline-flex shrink-0 items-center justify-center overflow-hidden text-foreground transition-colors fine-hover:bg-sunken",
);

const utilityTrayClass =
	"flex items-center gap-0.5 border border-border bg-surface p-0.5 shadow-[0_1px_0_0_color-mix(in_oklch,var(--color-foreground)_5%,transparent)]";

type NavView = "nav" | "search";

/**
 * Interactive header cluster, pinned to the outer (physical right) edge of the
 * bar: the menu hamburger and the search + language tray. Primary nav links are
 * server-rendered in <Header/> — nothing here needs their markup.
 */
export function HeaderNav() {
	const t = useTranslations("Nav");
	const menuTriggerRef = useRef<HTMLButtonElement>(null);
	const [open, setOpen] = useState(false);
	const [view, setView] = useState<NavView>("nav");

	const openSearch = useCallback(() => {
		setView("search");
		setOpen(true);
	}, []);

	const handleOpenChange = useCallback((nextOpen: boolean) => {
		setOpen(nextOpen);
		if (!nextOpen) {
			setView("nav");
		}
	}, []);

	return (
		<>
			<div className="flex items-center gap-2 sm:gap-3">
				<button
					ref={menuTriggerRef}
					type="button"
					aria-expanded={open}
					aria-controls={NAV_DRAWER_ID}
					aria-label={open ? t("menuClose") : t("menuOpen")}
					onClick={() => handleOpenChange(!open)}
					className={cn(
						iconControlClass,
						"size-11 bg-sunken fine-hover:bg-border",
					)}
				>
					<DrawnBorder />
					<Bars3Icon
						className="relative z-1 size-5 stroke-[1.75]"
						aria-hidden="true"
					/>
				</button>

				<div className={cn(utilityTrayClass, "hidden sm:flex")}>
					<button
						type="button"
						onClick={openSearch}
						aria-label={t("searchOpen")}
						className={cn(iconControlClass, "size-10")}
					>
						<DrawnBorder />
						<MagnifyingGlassIcon
							className="relative z-1 size-[1.125rem] stroke-[1.75]"
							aria-hidden="true"
						/>
					</button>

					<LanguageSwitcher variant="dropdown" embedded />
				</div>
			</div>

			<NavDrawer
				open={open}
				onOpenChange={handleOpenChange}
				view={view}
				onViewChange={setView}
				hideTrigger
				triggerRef={menuTriggerRef}
			/>
		</>
	);
}
