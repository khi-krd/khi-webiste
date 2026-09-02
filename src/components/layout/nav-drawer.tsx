"use client";

import {
	ArrowRightIcon,
	Bars3Icon,
	MagnifyingGlassIcon,
	XMarkIcon,
} from "@heroicons/react/24/outline";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import {
	type KeyboardEvent as ReactKeyboardEvent,
	type RefObject,
	useCallback,
	useEffect,
	useMemo,
	useRef,
	useState,
} from "react";
import { createPortal } from "react-dom";
import { LanguageSwitcher } from "@/components/layout/language-switcher";
import { MenuSearch } from "@/components/layout/menu-search";
import { Container } from "@/components/ui/container";
import { DirectionalIcon } from "@/components/ui/directional-icon";
import { DrawnBorder } from "@/components/ui/drawn-border";
import { Link } from "@/components/ui/link";
import { NAV_ITEMS, type NavItem } from "@/config/site";
import type { NavMenuOverride } from "@/lib/api/nav-menu";
import { useScrollLock } from "@/lib/use-scroll-lock";
import { cn } from "@/lib/utils";

const NAV_DRAWER_ID = "site-nav-drawer";

export { NAV_DRAWER_ID };

const overlayFooterIconButtonClass =
	"draw-border-host relative isolate inline-flex min-h-11 min-w-11 items-center justify-center overflow-hidden border border-primary-foreground/25 bg-primary text-primary-foreground transition-opacity fine-hover:opacity-90";

const FOCUSABLE =
	'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

const OVERLAY_DURATION = 0.4;
const BG_DURATION = 0.35;
const CONTENT_DURATION = 0.2;
function getFocusable(container: HTMLElement | null): HTMLElement[] {
	if (!container) return [];
	return Array.from(container.querySelectorAll<HTMLElement>(FOCUSABLE));
}

function useIsLg() {
	const [isLg, setIsLg] = useState(false);

	useEffect(() => {
		const mq = window.matchMedia("(min-width: 1024px)");
		const update = () => setIsLg(mq.matches);
		update();
		mq.addEventListener("change", update);
		return () => mq.removeEventListener("change", update);
	}, []);

	return isLg;
}

/** Harvard-style underline — block-end rule on active/hover only, not a full-width box. */
const primaryItemClass =
	"group w-full py-1 text-start font-heading text-[clamp(1.625rem,2.2vw+0.4rem,2.25rem)] font-bold leading-[1.08] underline decoration-transparent decoration-2 underline-offset-[0.18em] transition-[opacity,text-decoration-color] duration-200 [text-shadow:0_1px_3px_color-mix(in_oklch,var(--color-foreground)_80%,transparent),0_0_2.5rem_color-mix(in_oklch,var(--color-foreground)_50%,transparent)]";

/** Sits inline-end of the label — not stretched across the column (DirectionalIcon flips in RTL). */
const primaryLabelRowClass = "inline-flex max-w-full items-center gap-2.5";

const primaryItemArrowClass =
	"size-5 shrink-0 opacity-0 transition-opacity group-focus-visible:opacity-100 lg:group-hover:opacity-100";

const navDismissSpacerClass =
	"block min-h-0 w-full flex-1 cursor-default border-0 bg-transparent p-0";

type NavDismissSpacerProps = {
	label: string;
	onDismiss: () => void;
};

/** Invisible flex region above nav links — tap/click closes the overlay. */
function NavDismissSpacer({ label, onDismiss }: NavDismissSpacerProps) {
	return (
		<button
			type="button"
			onClick={onDismiss}
			className={navDismissSpacerClass}
			aria-label={label}
			tabIndex={-1}
		/>
	);
}

type NavBackgroundProps = {
	src: string;
	reduceMotion: boolean | null;
	priority?: boolean;
	instant?: boolean;
};

/** Full-bleed decorative background with a gentle scale-in on crossfade. */
function NavBackground({
	src,
	reduceMotion,
	priority,
	instant = false,
}: NavBackgroundProps) {
	return (
		<motion.div
			className="absolute inset-0"
			initial={reduceMotion || instant ? false : { opacity: 0, scale: 1.06 }}
			animate={{ opacity: 1, scale: 1 }}
			exit={{ opacity: 0 }}
			transition={{
				duration: reduceMotion || instant ? 0 : BG_DURATION,
				ease: "easeOut",
			}}
		>
			<Image
				src={src}
				alt=""
				fill
				sizes="100vw"
				priority={priority}
				className="object-cover"
			/>
		</motion.div>
	);
}

/**
 * A menu section after the CMS overlay is applied: static config supplies the
 * section list and its i18n labels, the CMS wins per field where it has data.
 */
type ResolvedNavItem = {
	key: string;
	href: string;
	label: string;
	imageSrc?: string;
};

function mergeNavItems(
	items: NavItem[],
	overrides: NavMenuOverride[],
	t: ReturnType<typeof useTranslations<"Nav">>,
): ResolvedNavItem[] {
	const byKey = new Map(overrides.map((o) => [o.itemKey, o]));

	const merged: ResolvedNavItem[] = items.map((item) => {
		const cms = byKey.get(item.key.toLowerCase());
		const resolved: ResolvedNavItem = {
			key: item.key,
			href: cms?.href ?? item.href,
			label: cms?.label ?? t(item.labelKey),
		};
		const imageSrc = cms?.imageSrc ?? item.imageSrc;
		if (imageSrc) resolved.imageSrc = imageSrc;
		return resolved;
	});

	// Sections that exist only in the CMS still deserve a place in the menu.
	const known = new Set(items.map((item) => item.key.toLowerCase()));
	for (const cms of overrides) {
		if (known.has(cms.itemKey) || !cms.label || !cms.href) {
			continue;
		}
		const extra: ResolvedNavItem = {
			key: cms.itemKey,
			href: cms.href,
			label: cms.label,
		};
		if (cms.imageSrc) extra.imageSrc = cms.imageSrc;
		merged.push(extra);
	}

	return merged;
}

type NavView = "nav" | "search";

type NavDrawerProps = {
	/** CMS overlay from `GET /api/v1/nav-menu`; empty falls back to static config. */
	navMenu?: NavMenuOverride[];
	open: boolean;
	onOpenChange: (open: boolean) => void;
	view: NavView;
	onViewChange: (view: NavView) => void;
	/** When true, only the overlay portal is rendered (trigger lives in the header). */
	hideTrigger?: boolean;
	/** Focus target after close when `hideTrigger` is set. */
	triggerRef?: RefObject<HTMLButtonElement | null>;
};

/**
 * Primary-nav overlay: hamburger trigger plus the full-screen Harvard-style
 * menu it opens. Hover background, secondary panel drill, in-menu search,
 * focus trap, scroll lock, and keyboard listeners.
 */
export function NavDrawer({
	navMenu = [],
	open,
	onOpenChange,
	view,
	onViewChange,
	hideTrigger = false,
	triggerRef: externalTriggerRef,
}: NavDrawerProps) {
	const t = useTranslations("Nav");
	const reduceMotion = useReducedMotion();
	const isLg = useIsLg();
	const [hoveredKey, setHoveredKey] = useState<string | null>(null);

	const [overlayMounted, setOverlayMounted] = useState(false);
	const internalTriggerRef = useRef<HTMLButtonElement>(null);
	const triggerRef = externalTriggerRef ?? internalTriggerRef;
	const closeRef = useRef<HTMLButtonElement>(null);
	const panelRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		setOverlayMounted(true);
	}, []);

	const wasOpen = useRef(false);

	const primaryNavItems = useMemo(
		() => mergeNavItems(NAV_ITEMS, navMenu, t),
		[navMenu, t],
	);
	const bgKey = hoveredKey ?? primaryNavItems[0]?.key ?? "default";
	const bgItem =
		primaryNavItems.find((item) => item.key === bgKey) ?? primaryNavItems[0];
	// Truthy check, not `??` — an item may legitimately carry no image, and an
	// empty string would reach next/image and throw.
	const bgSrc = bgItem?.imageSrc || null;

	const close = useCallback(() => {
		onOpenChange(false);
		onViewChange("nav");
		setHoveredKey(null);
	}, [onOpenChange, onViewChange]);

	useScrollLock(open);

	useEffect(() => {
		if (open) {
			wasOpen.current = true;
			requestAnimationFrame(() => closeRef.current?.focus());
		} else if (wasOpen.current) {
			onViewChange("nav");
			setHoveredKey(null);
			triggerRef.current?.focus();
		}
	}, [open, onViewChange, triggerRef.current?.focus]);

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

	const overlayMotion = reduceMotion
		? {
				initial: { opacity: 0 },
				animate: { opacity: 1 },
				exit: { opacity: 0 },
			}
		: {
				initial: { opacity: 0, y: -16 },
				animate: { opacity: 1, y: 0 },
				exit: { opacity: 0, y: -16 },
			};

	const overlayTransition = reduceMotion
		? { duration: 0 }
		: { duration: OVERLAY_DURATION, ease: "easeOut" as const };

	const contentMotion = {
		initial: { opacity: 0 },
		animate: { opacity: 1 },
		exit: { opacity: 0 },
	};

	return (
		<>
			{!hideTrigger && (
				<button
					ref={internalTriggerRef}
					type="button"
					aria-expanded={open}
					aria-controls={NAV_DRAWER_ID}
					aria-label={open ? t("menuClose") : t("menuOpen")}
					onClick={() => (open ? close() : onOpenChange(true))}
					className="draw-border-host relative isolate inline-flex size-11 items-center justify-center overflow-hidden bg-sunken text-foreground transition-colors fine-hover:bg-border"
				>
					<DrawnBorder />
					<Bars3Icon
						className="relative z-1 size-5 stroke-[1.75]"
						aria-hidden="true"
					/>
				</button>
			)}

			{overlayMounted &&
				createPortal(
					<AnimatePresence>
						{open && (
							<motion.div
								key="overlay"
								ref={panelRef}
								id={NAV_DRAWER_ID}
								role="dialog"
								aria-modal="true"
								aria-label={t("menuTitle")}
								onKeyDown={onKeyDown}
								className="fixed inset-0 z-[100] flex flex-col text-primary-foreground"
								{...overlayMotion}
								transition={overlayTransition}
							>
								{/* Decorative backgrounds — crossfade on hover / active item. */}
								<div
									className="pointer-events-none absolute inset-0 overflow-hidden bg-foreground"
									aria-hidden
								>
									<AnimatePresence>
										{bgSrc && (
											<NavBackground
												key={bgKey}
												src={bgSrc}
												reduceMotion={reduceMotion}
												priority
											/>
										)}
									</AnimatePresence>
									{/* Legibility scrim — stronger where text sits, photos still show through elsewhere. */}
									<div className="absolute inset-0 bg-foreground/50" />
									<div className="absolute inset-0 bg-linear-to-r from-foreground/80 from-0% via-foreground/45 via-50% to-transparent to-100% rtl:bg-linear-to-l" />
									<div className="absolute inset-x-0 bottom-0 h-16 bg-linear-to-t from-foreground from-35% via-foreground/80 via-60% to-transparent sm:h-20" />
								</div>

								<div className="relative z-10 flex min-h-0 flex-1 flex-col">
									<Container className="max-w-none shrink-0 pt-8 sm:pt-10">
										<div className="flex">
											<NavDismissSpacer
												label={t("menuClose")}
												onDismiss={close}
											/>
											<button
												ref={closeRef}
												type="button"
												onClick={close}
												aria-label={t("menuClose")}
												className="inline-flex min-h-11 min-w-11 shrink-0 items-center justify-center border border-primary-foreground/25 bg-primary p-2 text-primary-foreground transition-opacity hover:opacity-90 focus-visible:opacity-90"
											>
												<XMarkIcon
													className="size-6 shrink-0"
													aria-hidden="true"
												/>
											</button>
										</div>
									</Container>

									<div className="flex min-h-0 flex-1 flex-col overflow-hidden">
										<AnimatePresence mode="wait">
											{view === "search" ? (
												<motion.div
													key="search"
													className="flex min-h-0 flex-1 flex-col overflow-hidden"
													{...contentMotion}
													transition={{
														duration: reduceMotion ? 0 : CONTENT_DURATION,
													}}
												>
													<Container className="max-w-none flex min-h-0 flex-1 flex-col pb-8 pt-4 sm:pt-6">
														<MenuSearch
															onBack={() => onViewChange("nav")}
															onNavigate={close}
														/>
													</Container>
												</motion.div>
											) : (
												<motion.div
													key="nav"
													data-wheel-scrollable=""
													className="flex min-h-0 flex-1 flex-col overflow-x-hidden overflow-y-auto"
													{...contentMotion}
													transition={{
														duration: reduceMotion ? 0 : CONTENT_DURATION,
													}}
												>
													<Container className="max-w-none flex min-h-0 flex-1 pb-8 pt-4 sm:pt-6">
														<div className="flex min-h-0 w-full flex-1 flex-col lg:max-w-[min(100%,22rem)]">
															<NavDismissSpacer
																label={t("menuClose")}
																onDismiss={close}
															/>
															<nav
																aria-label={t("primary")}
																className="w-full shrink-0"
															>
																<ul className="flex flex-col gap-3">
																	{primaryNavItems.map((item) => (
																		<li key={item.key} className="group">
																			<Link
																				href={item.href}
																				variant="nav"
																				onClick={close}
																				onMouseEnter={() => {
																					if (isLg) {
																						setHoveredKey(item.key);
																					}
																				}}
																				onMouseLeave={() => {
																					if (!isLg) return;
																					setHoveredKey((current) =>
																						current === item.key
																							? null
																							: current,
																					);
																				}}
																				onFocus={() => setHoveredKey(item.key)}
																				onBlur={() =>
																					setHoveredKey((current) =>
																						current === item.key
																							? null
																							: current,
																					)
																				}
																				className={cn(
																					primaryItemClass,
																					// Full strength on touch — the dim-until-hover treatment
																					// only reads as intentional where a pointer exists.
																					"text-primary-foreground hover:text-primary-foreground focus-visible:decoration-current focus-visible:opacity-100 lg:opacity-45 lg:hover:decoration-current lg:hover:opacity-100",
																				)}
																			>
																				<span className={primaryLabelRowClass}>
																					<span>{item.label}</span>
																					<DirectionalIcon
																						icon={ArrowRightIcon}
																						className={primaryItemArrowClass}
																					/>
																				</span>
																			</Link>
																		</li>
																	))}
																</ul>
															</nav>
															<div className="min-h-0 flex-1" aria-hidden />
														</div>
													</Container>
												</motion.div>
											)}
										</AnimatePresence>
									</div>

									{view === "nav" && (
										<footer className="relative z-10 mt-auto shrink-0 border-t border-primary-foreground/15 bg-foreground/90 backdrop-blur-md">
											<Container className="max-w-none py-4">
												<div className="flex items-center justify-between gap-4">
													<LanguageSwitcher
														variant="dropdown"
														overlay
														onLocaleChange={close}
													/>
													<button
														type="button"
														onClick={() => onViewChange("search")}
														aria-label={t("searchOpen")}
														className={overlayFooterIconButtonClass}
													>
														<DrawnBorder />
														<MagnifyingGlassIcon
															className="relative z-1 size-5 shrink-0"
															aria-hidden="true"
														/>
														<span className="visually-hidden">
															{t("searchLabel")}
														</span>
													</button>
												</div>
											</Container>
										</footer>
									)}
								</div>
							</motion.div>
						)}
					</AnimatePresence>,
					document.body,
				)}
		</>
	);
}
