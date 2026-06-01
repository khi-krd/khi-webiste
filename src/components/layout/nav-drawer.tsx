"use client";

import { Bars3Icon, XMarkIcon } from "@heroicons/react/24/outline";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useLocale, useTranslations } from "next-intl";
import {
	type KeyboardEvent as ReactKeyboardEvent,
	useEffect,
	useId,
	useRef,
	useState,
} from "react";
import { LanguageSwitcher } from "@/components/layout/language-switcher";
import { Link } from "@/components/ui/link";
import { DONATE_HREF, NAV_ITEMS } from "@/config/site";
import { cn } from "@/lib/utils";

const FOCUSABLE =
	'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

function getFocusable(container: HTMLElement | null): HTMLElement[] {
	if (!container) return [];
	return Array.from(container.querySelectorAll<HTMLElement>(FOCUSABLE));
}

/**
 * Primary-nav drawer: the hamburger trigger plus the off-canvas menu it opens.
 * The ONLY client component in the header — it owns open state, the focus trap,
 * scroll lock, and the keyboard/scrim listeners.
 *
 * A11y dialog contract: role="dialog" + aria-modal, focus moves into the panel
 * on open and returns to the trigger on close, Tab is trapped, Esc and a scrim
 * click both close, and body scroll is locked while open.
 *
 * Direction: the panel is anchored to the inline-END edge (`end-0`), so it sits
 * on the trailing side in BOTH scripts. Motion's transforms are physical, so the
 * off-screen translate sign is derived from `dir` — it enters from the right in
 * ku/en (LTR) and from the left in ckb (RTL). Under prefers-reduced-motion we
 * drop the slide and fade only (the project's reduced-motion fallback).
 */
export function NavDrawer() {
	const t = useTranslations("Nav");
	const locale = useLocale();
	const dir = locale === "ckb" ? "rtl" : "ltr";
	const reduceMotion = useReducedMotion();

	const [open, setOpen] = useState(false);
	const drawerId = useId();
	const triggerRef = useRef<HTMLButtonElement>(null);
	const closeRef = useRef<HTMLButtonElement>(null);
	const panelRef = useRef<HTMLDivElement>(null);
	const wasOpen = useRef(false);

	const close = () => setOpen(false);

	// Lock body scroll while the drawer is open; restore on close/unmount.
	useEffect(() => {
		if (!open) return;
		const previous = document.body.style.overflow;
		document.body.style.overflow = "hidden";
		return () => {
			document.body.style.overflow = previous;
		};
	}, [open]);

	// Move focus into the panel on open; return it to the trigger on close.
	useEffect(() => {
		if (open) {
			wasOpen.current = true;
			closeRef.current?.focus();
		} else if (wasOpen.current) {
			triggerRef.current?.focus();
		}
	}, [open]);

	function onKeyDown(event: ReactKeyboardEvent<HTMLDivElement>) {
		if (event.key === "Escape") {
			event.stopPropagation();
			close();
			return;
		}
		if (event.key !== "Tab") return;

		const focusable = getFocusable(panelRef.current);
		if (focusable.length === 0) return;
		const first = focusable[0];
		const last = focusable[focusable.length - 1];
		const active = document.activeElement;

		if (event.shiftKey) {
			if (active === first || !panelRef.current?.contains(active)) {
				event.preventDefault();
				last.focus();
			}
		} else if (active === last) {
			event.preventDefault();
			first.focus();
		}
	}

	// Off-screen translate is PHYSICAL (transforms don't mirror), so derive the
	// sign from dir: RTL panel sits at the left edge → enters from -100%.
	const offscreenX = dir === "rtl" ? "-100%" : "100%";
	const panelMotion = reduceMotion
		? { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 } }
		: {
				initial: { x: offscreenX },
				animate: { x: 0 },
				exit: { x: offscreenX },
			};

	return (
		<>
			<button
				ref={triggerRef}
				type="button"
				aria-expanded={open}
				aria-controls={drawerId}
				aria-label={open ? t("menuClose") : t("menuOpen")}
				onClick={() => setOpen((value) => !value)}
				className="inline-flex h-11 w-11 items-center justify-center bg-sunken text-foreground transition-colors hover:bg-border"
			>
				{open ? (
					<XMarkIcon className="size-5 stroke-2" aria-hidden="true" />
				) : (
					<Bars3Icon className="size-5 stroke-2" aria-hidden="true" />
				)}
			</button>

			<AnimatePresence>
				{open && (
					<motion.div
						key="scrim"
						className="fixed inset-0 z-50 bg-foreground/40"
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						exit={{ opacity: 0 }}
						transition={{ duration: 0.2 }}
						onClick={close}
						aria-hidden="true"
					/>
				)}
				{open && (
					<motion.div
						key="panel"
						ref={panelRef}
						id={drawerId}
						role="dialog"
						aria-modal="true"
						aria-label={t("menuTitle")}
						onKeyDown={onKeyDown}
						className="fixed inset-y-0 end-0 z-50 flex w-[min(20rem,85vw)] flex-col border-s border-border bg-background"
						{...panelMotion}
						transition={{ duration: 0.28, ease: [0.4, 0, 0.2, 1] }}
					>
						<div className="flex items-center justify-between gap-4 border-b border-border px-8 py-4">
							<span className="label">{t("menuTitle")}</span>
							<button
								ref={closeRef}
								type="button"
								onClick={close}
								aria-label={t("menuClose")}
								className="inline-flex size-10 items-center justify-center text-foreground transition-colors hover:bg-sunken"
							>
								<XMarkIcon className="size-6" aria-hidden="true" />
							</button>
						</div>

						<nav
							aria-label={t("primary")}
							className="flex-1 overflow-y-auto px-8 py-5"
						>
							<ul className="flex flex-col gap-1">
								{NAV_ITEMS.map((item) => (
									<li key={item.key}>
										<Link
											href={item.href}
											variant="nav"
											onClick={close}
											className={cn("w-full py-2 text-body")}
										>
											{t(item.key)}
										</Link>
									</li>
								))}
								{/* Donate also lives in the list (the header CTA is separate). */}
								<li>
									<Link
										href={DONATE_HREF}
										variant="nav"
										onClick={close}
										className={cn("w-full py-2 text-body")}
									>
										{t("donate")}
									</Link>
								</li>
							</ul>
						</nav>

						<div className="border-t border-border px-8 py-4">
							<LanguageSwitcher />
						</div>
					</motion.div>
				)}
			</AnimatePresence>
		</>
	);
}
