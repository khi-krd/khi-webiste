"use client";

import {
	ArrowLeftIcon,
	ArrowRightIcon,
	Bars3Icon,
	MagnifyingGlassIcon,
	XMarkIcon,
} from "@heroicons/react/24/outline";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import Image from "next/image";
import { useLocale, useTranslations } from "next-intl";
import {
	type KeyboardEvent as ReactKeyboardEvent,
	type RefObject,
	useCallback,
	useEffect,
	useRef,
	useState,
} from "react";
import { createPortal } from "react-dom";
import { LanguageSwitcher } from "@/components/layout/language-switcher";
import { MenuSearch } from "@/components/layout/menu-search";
import { NavPagePreview } from "@/components/layout/nav-page-preview";
import { Container } from "@/components/ui/container";
import { DirectionalIcon } from "@/components/ui/directional-icon";
import { DrawnBorder } from "@/components/ui/drawn-border";
import { Link } from "@/components/ui/link";
import { NAV_DEFAULT_IMAGE, NAV_ITEMS, type NavItem } from "@/config/site";
import {
	fetchTaxonomyCatalog,
	type SearchTaxonomyItem,
} from "@/lib/search/client";
import {
	getNavMenuTaxonomyItems,
	limitNavMenuLinks,
} from "@/lib/search/taxonomy-types";
import { useScrollLock } from "@/lib/use-scroll-lock";
import { cn } from "@/lib/utils";

const NAV_DRAWER_ID = "site-nav-drawer";

export { NAV_DRAWER_ID };

const overlayFooterIconButtonClass =
	"draw-border-host relative isolate inline-flex min-h-11 min-w-11 items-center justify-center overflow-hidden rounded-md border border-primary-foreground/20 bg-primary-foreground/8 text-primary-foreground backdrop-blur-sm transition-colors fine-hover:border-primary-foreground/35 fine-hover:bg-primary-foreground/14";

const FOCUSABLE =
	'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

const OVERLAY_DURATION = 0.4;
const BG_DURATION = 0.35;
const CONTENT_DURATION = 0.2;
const PANEL_ENTER_DURATION = 0.2;
const PANEL_EXIT_DURATION = 0.15;
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
	"group w-full py-1 text-start font-heading text-[clamp(2rem,3vw+0.4rem,3.125rem)] font-bold leading-[1.08] underline decoration-transparent decoration-2 underline-offset-[0.18em] transition-[opacity,text-decoration-color] duration-200 [text-shadow:0_1px_3px_color-mix(in_oklch,var(--color-foreground)_80%,transparent),0_0_2.5rem_color-mix(in_oklch,var(--color-foreground)_50%,transparent)]";

/** Sits inline-end of the label — not stretched across the column (DirectionalIcon flips in RTL). */
const primaryLabelRowClass = "inline-flex max-w-full items-center gap-2.5";

const primaryItemArrowClass =
	"size-5 shrink-0 opacity-0 transition-opacity group-focus-visible:opacity-100 lg:group-hover:opacity-100";

/** Keeps overlay copy readable when background photos run bright. */
const overlayTextShadow =
	"[text-shadow:0_1px_2px_color-mix(in_oklch,var(--color-foreground)_75%,transparent),0_0_1.75rem_color-mix(in_oklch,var(--color-foreground)_40%,transparent)]";

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

type SecondaryLink = {
	id: string;
	href: string;
	label: string;
};

function resolveSecondaryLinks(
	item: NavItem,
	taxonomyCatalog: SearchTaxonomyItem[] | null,
	t: ReturnType<typeof useTranslations<"Nav">>,
): SecondaryLink[] {
	const taxonomyItems = getNavMenuTaxonomyItems(
		item.key,
		taxonomyCatalog ?? [],
	);

	if (taxonomyItems.length > 0) {
		const links = taxonomyItems.map((entry) => ({
			id: entry.id,
			href: entry.href,
			label: entry.label,
		}));

		if (item.key === "video") {
			return limitNavMenuLinks([
				{
					id: "video-shortfilms",
					href: "/videos/shortfilms",
					label: t("videoSubShortFilms"),
				},
				...links,
			]);
		}

		return limitNavMenuLinks(links);
	}

	return limitNavMenuLinks(
		item.children.map((child) => ({
			id: child.key,
			href: child.href,
			label: t(child.key),
		})),
	);
}

type NavSecondaryPanelProps = {
	item: NavItem;
	onNavigate: () => void;
	taxonomyCatalog: SearchTaxonomyItem[] | null;
};

function NavSecondaryPanel({
	item,
	onNavigate,
	taxonomyCatalog,
}: NavSecondaryPanelProps) {
	const t = useTranslations("Nav");
	const links = resolveSecondaryLinks(item, taxonomyCatalog, t);

	return (
		<div className="text-start">
			<NavPagePreview
				href={item.href}
				label={t(item.key)}
				fallbackSrc={item.imageSrc}
			/>

			<Link
				href={item.href}
				variant="nav"
				onClick={onNavigate}
				className={cn(
					"mb-4 inline-flex items-center gap-2 font-heading text-h3 font-bold text-primary-foreground hover:text-primary-foreground",
					overlayTextShadow,
				)}
			>
				{t(item.key)}
			</Link>

			{/* Section description — wired from Nav.{item}Description */}
			<p
				className={cn(
					"mb-6 max-w-md text-small leading-relaxed text-primary-foreground/65",
					overlayTextShadow,
				)}
			>
				{t(item.descriptionKey)}
			</p>

			<div className="border-t border-primary-foreground/30 pt-5">
				<h3 className="mb-2.5 text-label font-medium uppercase tracking-[0.08em] text-primary-foreground/80">
					{t("secondaryLinkPrefix")}
				</h3>

				<ul className="flex flex-col">
					{links.map((link) => (
						<li
							key={link.id}
							className="border-b border-primary-foreground/15 last:border-b-0"
						>
							<Link
								href={link.href}
								variant="nav"
								onClick={onNavigate}
								className={cn(
									"block py-2.5 text-small text-primary-foreground/80 hover:text-primary-foreground",
									overlayTextShadow,
								)}
							>
								{link.label}
							</Link>
						</li>
					))}
				</ul>
			</div>
		</div>
	);
}

type NavView = "nav" | "search";

type NavDrawerProps = {
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
	open,
	onOpenChange,
	view,
	onViewChange,
	hideTrigger = false,
	triggerRef: externalTriggerRef,
}: NavDrawerProps) {
	const t = useTranslations("Nav");
	const locale = useLocale();
	const dir = locale === "ckb" ? "rtl" : "ltr";
	const reduceMotion = useReducedMotion();
	const isLg = useIsLg();
	const [hoveredKey, setHoveredKey] = useState<string | null>(null);
	const [activeKey, setActiveKey] = useState<string | null>(null);

	const [overlayMounted, setOverlayMounted] = useState(false);
	const [taxonomyCatalog, setTaxonomyCatalog] = useState<
		SearchTaxonomyItem[] | null
	>(null);
	const [taxonomyUnavailable, setTaxonomyUnavailable] = useState(false);
	const internalTriggerRef = useRef<HTMLButtonElement>(null);
	const triggerRef = externalTriggerRef ?? internalTriggerRef;
	const closeRef = useRef<HTMLButtonElement>(null);
	const panelRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		setOverlayMounted(true);
	}, []);

	useEffect(() => {
		if (!open) {
			return;
		}

		let cancelled = false;

		void fetchTaxonomyCatalog(locale).then(({ items, unavailable }) => {
			if (cancelled) {
				return;
			}
			setTaxonomyCatalog(items);
			setTaxonomyUnavailable(unavailable);
		});

		return () => {
			cancelled = true;
		};
	}, [open, locale]);

	const itemTriggerRefs = useRef<Record<string, HTMLButtonElement | null>>({});
	const wasOpen = useRef(false);

	const activeItem = NAV_ITEMS.find((item) => item.key === activeKey);
	const primaryNavItems = NAV_ITEMS;
	const bgKey = hoveredKey ?? activeKey ?? primaryNavItems[0]?.key ?? "default";
	const bgItem =
		NAV_ITEMS.find((item) => item.key === bgKey) ?? primaryNavItems[0];
	const bgSrc = bgItem?.imageSrc ?? NAV_DEFAULT_IMAGE;

	const close = useCallback(() => {
		onOpenChange(false);
		onViewChange("nav");
		setActiveKey(null);
		setHoveredKey(null);
	}, [onOpenChange, onViewChange]);

	useScrollLock(open);

	useEffect(() => {
		if (open) {
			wasOpen.current = true;
			requestAnimationFrame(() => closeRef.current?.focus());
		} else if (wasOpen.current) {
			onViewChange("nav");
			setActiveKey(null);
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

	function activateItem(key: string) {
		setActiveKey(key);
	}

	function goBackMobile() {
		if (!activeKey) return;
		const key = activeKey;
		setActiveKey(null);
		requestAnimationFrame(() => itemTriggerRefs.current[key]?.focus());
	}

	const showMobilePanel = !isLg && activeKey !== null;
	const showDesktopPanel = isLg && activeKey !== null;
	const panelEnterX = dir === "rtl" ? -24 : 24;
	const mobilePrimaryEnterX = dir === "rtl" ? 24 : -24;

	const panelSlideInitial = reduceMotion
		? { opacity: 0 }
		: { opacity: 0, x: panelEnterX };
	const panelSlideExit = reduceMotion
		? { opacity: 0 }
		: {
				opacity: 0,
				x: panelEnterX,
				transition: { duration: PANEL_EXIT_DURATION },
			};
	const panelSlideTransition = {
		duration: reduceMotion ? 0 : PANEL_ENTER_DURATION,
	};

	const mobilePrimaryExit = reduceMotion
		? { opacity: 0 }
		: {
				opacity: 0,
				x: mobilePrimaryEnterX,
				transition: { duration: PANEL_EXIT_DURATION },
			};
	const mobilePrimaryEnter = reduceMotion
		? { opacity: 0 }
		: { opacity: 0, x: mobilePrimaryEnterX };

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
					className="draw-border-host relative isolate inline-flex size-11 items-center justify-center overflow-hidden rounded-md bg-sunken text-foreground transition-colors fine-hover:bg-border"
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
										<NavBackground
											key={bgKey}
											src={bgSrc}
											reduceMotion={reduceMotion}
											priority
										/>
									</AnimatePresence>
									{/* Legibility scrim — stronger where text sits, photos still show through elsewhere. */}
									<div className="absolute inset-0 bg-foreground/50" />
									<div className="absolute inset-0 bg-linear-to-r from-foreground/80 from-0% via-foreground/45 via-50% to-transparent to-100% rtl:bg-linear-to-l" />
									{showMobilePanel && (
										<div className="absolute inset-0 bg-foreground/30 lg:hidden" />
									)}
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
												className="inline-flex min-h-11 min-w-11 shrink-0 items-center justify-center rounded-md border border-transparent bg-foreground/40 p-2 transition-colors hover:border-primary-foreground/30 hover:bg-foreground/60 focus-visible:border-primary-foreground/40 focus-visible:bg-foreground/60"
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
															taxonomyCatalog={taxonomyCatalog}
															taxonomyUnavailable={taxonomyUnavailable}
														/>
													</Container>
												</motion.div>
											) : (
												<motion.div
													key="nav"
													className="flex min-h-0 flex-1 flex-col overflow-x-hidden overflow-y-auto"
													{...contentMotion}
													transition={{
														duration: reduceMotion ? 0 : CONTENT_DURATION,
													}}
												>
													<Container className="max-w-none flex min-h-0 flex-1 pb-8 pt-4 sm:pt-6">
														<div
															className={cn(
																"w-full",
																isLg && "flex flex-1 gap-10 xl:gap-14",
																isLg && showDesktopPanel && "items-start",
																!isLg &&
																	"relative flex min-h-0 flex-1 flex-col",
															)}
														>
															{!isLg ? (
																<AnimatePresence initial={false}>
																	{!showMobilePanel ? (
																		<motion.div
																			key="mobile-primary"
																			className="absolute inset-0 flex flex-col"
																			initial={mobilePrimaryEnter}
																			animate={{ opacity: 1, x: 0 }}
																			exit={mobilePrimaryExit}
																			transition={panelSlideTransition}
																		>
																			<NavDismissSpacer
																				label={t("menuClose")}
																				onDismiss={close}
																			/>
																			<nav
																				aria-label={t("primary")}
																				className="w-full shrink-0"
																			>
																				<ul className="flex flex-col gap-0.5">
																					{primaryNavItems.map((item) => {
																						const isActive =
																							activeKey === item.key;

																						return (
																							<li
																								key={item.key}
																								className="group"
																							>
																								<button
																									ref={(el) => {
																										itemTriggerRefs.current[
																											item.key
																										] = el;
																									}}
																									type="button"
																									aria-expanded={isActive}
																									onClick={() =>
																										activateItem(item.key)
																									}
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
																									onFocus={() =>
																										setHoveredKey(item.key)
																									}
																									onBlur={() =>
																										setHoveredKey((current) =>
																											current === item.key
																												? null
																												: current,
																										)
																									}
																									className={cn(
																										primaryItemClass,
																										isActive
																											? "decoration-current opacity-100"
																											: "opacity-45 focus-visible:decoration-current focus-visible:opacity-100 lg:hover:decoration-current lg:hover:opacity-100",
																									)}
																								>
																									<span
																										className={
																											primaryLabelRowClass
																										}
																									>
																										<span>{t(item.key)}</span>
																										{!isActive && (
																											<DirectionalIcon
																												icon={ArrowRightIcon}
																												className={
																													primaryItemArrowClass
																												}
																											/>
																										)}
																									</span>
																								</button>
																							</li>
																						);
																					})}
																				</ul>
																			</nav>
																			<div
																				className="min-h-0 flex-1"
																				aria-hidden
																			/>
																		</motion.div>
																	) : (
																		activeItem && (
																			<motion.div
																				key={`mobile-panel-${activeItem.key}`}
																				className="absolute inset-0 flex flex-col overflow-y-auto"
																				initial={panelSlideInitial}
																				animate={{ opacity: 1, x: 0 }}
																				exit={panelSlideExit}
																				transition={panelSlideTransition}
																			>
																				<button
																					type="button"
																					onClick={goBackMobile}
																					className="mb-6 inline-flex items-center gap-2 text-small text-primary-foreground/60 transition-colors hover:text-primary-foreground"
																				>
																					<DirectionalIcon
																						icon={ArrowLeftIcon}
																						className="size-4 shrink-0"
																					/>
																					{t("searchBack")}
																				</button>
																				<NavSecondaryPanel
																					item={activeItem}
																					onNavigate={close}
																					taxonomyCatalog={taxonomyCatalog}
																				/>
																			</motion.div>
																		)
																	)}
																</AnimatePresence>
															) : (
																<div
																	className={cn(
																		"shrink-0 lg:max-w-[min(100%,22rem)]",
																		"flex flex-1 flex-col self-stretch",
																	)}
																>
																	<NavDismissSpacer
																		label={t("menuClose")}
																		onDismiss={close}
																	/>
																	<nav
																		aria-label={t("primary")}
																		className="w-full shrink-0"
																	>
																		<ul className="flex flex-col gap-0.5">
																			{primaryNavItems.map((item) => {
																				const isActive = activeKey === item.key;

																				return (
																					<li key={item.key} className="group">
																						<button
																							ref={(el) => {
																								itemTriggerRefs.current[
																									item.key
																								] = el;
																							}}
																							type="button"
																							aria-expanded={isActive}
																							onClick={() =>
																								activateItem(item.key)
																							}
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
																							onFocus={() =>
																								setHoveredKey(item.key)
																							}
																							onBlur={() =>
																								setHoveredKey((current) =>
																									current === item.key
																										? null
																										: current,
																								)
																							}
																							className={cn(
																								primaryItemClass,
																								isActive
																									? "decoration-current opacity-100"
																									: "opacity-45 focus-visible:decoration-current focus-visible:opacity-100 lg:hover:decoration-current lg:hover:opacity-100",
																							)}
																						>
																							<span
																								className={primaryLabelRowClass}
																							>
																								<span>{t(item.key)}</span>
																								{!isActive && (
																									<DirectionalIcon
																										icon={ArrowRightIcon}
																										className={
																											primaryItemArrowClass
																										}
																									/>
																								)}
																							</span>
																						</button>
																					</li>
																				);
																			})}
																		</ul>
																	</nav>
																	<div className="min-h-0 flex-1" aria-hidden />
																</div>
															)}

															{showDesktopPanel && activeItem && (
																<div className="hidden min-w-0 flex-1 self-start lg:block lg:max-w-md xl:max-w-lg">
																	<AnimatePresence mode="wait">
																		<motion.div
																			key={activeItem.key}
																			initial={panelSlideInitial}
																			animate={{ opacity: 1, x: 0 }}
																			exit={panelSlideExit}
																			transition={panelSlideTransition}
																		>
																			<NavSecondaryPanel
																				item={activeItem}
																				onNavigate={close}
																				taxonomyCatalog={taxonomyCatalog}
																			/>
																		</motion.div>
																	</AnimatePresence>
																</div>
															)}
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
