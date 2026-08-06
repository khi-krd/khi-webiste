"use client";

import { ChevronDownIcon } from "@heroicons/react/24/outline";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useTranslations } from "next-intl";
import { useEffect, useId, useRef, useState } from "react";
import { DrawnBorder } from "@/components/ui/drawn-border";
import { NAV_ITEMS } from "@/config/site";
import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/utils";
import {
	navTriggerLabelClass,
	navTriggerClass as triggerClass,
} from "./nav-styles";

/** Same catalogue entries as the hamburger menu — sound/video/writings/gallery. */
const PUBLICATION_KEYS = ["sound", "video", "writings", "gallery"] as const;

const PUBLICATION_ITEMS = PUBLICATION_KEYS.map((key) => {
	const item = NAV_ITEMS.find((navItem) => navItem.key === key);
	return { key, href: item?.href ?? "/" };
});

const panelClassName =
	"absolute start-0 top-[calc(100%+0.375rem)] z-50 min-w-[11.5rem] overflow-hidden rounded-md border border-border-strong bg-surface py-1 shadow-[0_8px_24px_color-mix(in_oklch,var(--color-foreground)_12%,transparent),0_2px_6px_color-mix(in_oklch,var(--color-foreground)_6%,transparent)]";

/** "بڵاوکراوە" dropdown trigger listing the sound/video/writings/gallery catalogue. */
export function PublicationsDropdown() {
	const t = useTranslations("Nav");
	const [open, setOpen] = useState(false);
	const containerRef = useRef<HTMLDivElement>(null);
	const menuId = useId();
	const reduceMotion = useReducedMotion();

	useEffect(() => {
		if (!open) return;

		function handlePointerDown(event: MouseEvent) {
			if (!containerRef.current?.contains(event.target as Node)) {
				setOpen(false);
			}
		}

		function handleKeyDown(event: KeyboardEvent) {
			if (event.key === "Escape") setOpen(false);
		}

		document.addEventListener("mousedown", handlePointerDown);
		document.addEventListener("keydown", handleKeyDown);
		return () => {
			document.removeEventListener("mousedown", handlePointerDown);
			document.removeEventListener("keydown", handleKeyDown);
		};
	}, [open]);

	return (
		<div ref={containerRef} className="relative">
			<button
				type="button"
				aria-expanded={open}
				aria-haspopup="menu"
				aria-controls={menuId}
				onClick={() => setOpen((current) => !current)}
				className={triggerClass}
			>
				<DrawnBorder />
				<span className={navTriggerLabelClass}>{t("publications")}</span>
				<ChevronDownIcon
					className={cn(
						"size-3.5 shrink-0 text-muted transition-transform duration-200",
						open && "rotate-180",
					)}
					strokeWidth={2}
					aria-hidden="true"
				/>
			</button>

			<AnimatePresence>
				{open && (
					<motion.ul
						id={menuId}
						role="menu"
						aria-label={t("publications")}
						initial={
							reduceMotion ? { opacity: 0 } : { opacity: 0, y: -6, scale: 0.98 }
						}
						animate={{ opacity: 1, y: 0, scale: 1 }}
						exit={
							reduceMotion ? { opacity: 0 } : { opacity: 0, y: -4, scale: 0.98 }
						}
						transition={{ duration: reduceMotion ? 0 : 0.16, ease: "easeOut" }}
						className={panelClassName}
					>
						{PUBLICATION_ITEMS.map(({ key, href }) => (
							<li key={key} role="presentation">
								<Link
									href={href}
									role="menuitem"
									onClick={() => setOpen(false)}
									className="flex w-full items-center px-3 py-2.5 text-start text-small font-normal text-muted transition-colors fine-hover:bg-sunken fine-hover:text-foreground"
								>
									{t(key)}
								</Link>
							</li>
						))}
					</motion.ul>
				)}
			</AnimatePresence>
		</div>
	);
}
