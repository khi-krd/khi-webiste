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
	useCallback,
	useEffect,
	useId,
	useRef,
	useState,
} from "react";
import { LanguageSwitcher } from "@/components/layout/language-switcher";
import { MenuSearch } from "@/components/layout/menu-search";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { DirectionalIcon } from "@/components/ui/directional-icon";
import { Link } from "@/components/ui/link";
import { NAV_DEFAULT_IMAGE, NAV_ITEMS, type NavItem } from "@/config/site";
import { useRouter } from "@/i18n/navigation";
import { cn } from "@/lib/utils";

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
	"inline-flex w-full items-center justify-between gap-4 py-1.5 text-start font-heading text-[clamp(2.75rem,4.5vw+0.75rem,4.5rem)] font-bold leading-[1.05] underline decoration-transparent decoration-2 underline-offset-[0.18em] transition-[opacity,text-decoration-color] duration-200 [text-shadow:0_1px_3px_color-mix(in_oklch,var(--color-foreground)_80%,transparent),0_0_2.5rem_color-mix(in_oklch,var(--color-foreground)_50%,transparent)]";

/** Keeps overlay copy readable when background photos run bright. */
const overlayTextShadow =
	"[text-shadow:0_1px_2px_color-mix(in_oklch,var(--color-foreground)_75%,transparent),0_0_1.75rem_color-mix(in_oklch,var(--color-foreground)_40%,transparent)]";

type NavBackgroundProps = {
	src: string;
	reduceMotion: boolean | null;
	priority?: boolean;
};

/** Full-bleed decorative background with a gentle scale-in on crossfade. */
function NavBackground({ src, reduceMotion, priority }: NavBackgroundProps) {
	return (
		<motion.div
			className="absolute inset-0"
			initial={reduceMotion ? false : { opacity: 0, scale: 1.06 }}
			animate={{ opacity: 1, scale: 1 }}
			exit={{ opacity: 0 }}
			transition={{ duration: reduceMotion ? 0 : BG_DURATION, ease: "easeOut" }}
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

type NavSecondaryPanelProps = {
	item: NavItem;
	onNavigate: () => void;
};

function NavSecondaryPanel({ item, onNavigate }: NavSecondaryPanelProps) {
	const t = useTranslations("Nav");

	return (
		<div className="text-start">
			<Link
				href={item.href}
				variant="nav"
				withArrow
				onClick={onNavigate}
				className={cn(
					"mb-5 inline-flex items-center gap-2 font-heading text-h2 font-bold text-primary-foreground hover:text-primary-foreground",
					overlayTextShadow,
				)}
			>
				{t(item.key)}
			</Link>

			{/* Section description — wired from Nav.{item}Description */}
			<p
				className={cn(
					"mb-8 max-w-md text-body leading-relaxed text-primary-foreground/65",
					overlayTextShadow,
				)}
			>
				{t(item.descriptionKey)}
			</p>

			<h3 className="mb-3 text-small text-primary-foreground/55">
				{t("secondaryLinkPrefix")}
			</h3>

			<ul className="flex flex-col">
				{item.children.map((child) => (
					<li
						key={child.key}
						className="border-b border-primary-foreground/15 last:border-b-0"
					>
						<Link
							href={child.href}
							variant="nav"
							onClick={onNavigate}
							className={cn(
								"block py-3 text-body text-primary-foreground/80 hover:text-primary-foreground",
								overlayTextShadow,
							)}
						>
							{t(child.key)}
						</Link>
					</li>
				))}
			</ul>
		</div>
	);
}

/**
 * Primary-nav overlay: hamburger trigger plus the full-screen Harvard-style
 * menu it opens. Owns open state, hover background, secondary panel drill,
 * in-menu search, focus trap, scroll lock, and keyboard listeners.
 */
export function NavDrawer() {
	const t = useTranslations("Nav");
	const locale = useLocale();
	const dir = locale === "ckb" ? "rtl" : "ltr";
	const reduceMotion = useReducedMotion();
	const isLg = useIsLg();
	const router = useRouter();

	const [open, setOpen] = useState(false);
	const [view, setView] = useState<"nav" | "search">("nav");
	const [hoveredKey, setHoveredKey] = useState<string | null>(null);
	const [activeKey, setActiveKey] = useState<string | null>(null);

	const overlayId = useId();
	const triggerRef = useRef<HTMLButtonElement>(null);
	const closeRef = useRef<HTMLButtonElement>(null);
	const panelRef = useRef<HTMLDivElement>(null);
	const itemTriggerRefs = useRef<Record<string, HTMLButtonElement | null>>({});
	const wasOpen = useRef(false);

	const activeItem = NAV_ITEMS.find((item) => item.key === activeKey);
	const primaryNavItems = NAV_ITEMS.filter((item) => item.key !== "archive");
	const bgKey =
		hoveredKey ?? activeKey ?? primaryNavItems[0]?.key ?? "default";
	const bgItem =
		NAV_ITEMS.find((item) => item.key === bgKey) ?? primaryNavItems[0];
	const bgSrc = bgItem?.imageSrc ?? NAV_DEFAULT_IMAGE;

	const close = useCallback(() => {
		setOpen(false);
		setView("nav");
		setActiveKey(null);
		setHoveredKey(null);
	}, []);

	useEffect(() => {
		if (!open) return;
		const previous = document.body.style.overflow;
		document.body.style.overflow = "hidden";
		return () => {
			document.body.style.overflow = previous;
		};
	}, [open]);

	useEffect(() => {
		if (open) {
			wasOpen.current = true;
			requestAnimationFrame(() => closeRef.current?.focus());
		} else if (wasOpen.current) {
			setView("nav");
			setActiveKey(null);
			setHoveredKey(null);
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
			<button
				ref={triggerRef}
				type="button"
				aria-expanded={open}
				aria-controls={overlayId}
				aria-label={open ? t("menuClose") : t("menuOpen")}
				onClick={() => (open ? close() : setOpen(true))}
				className="inline-flex h-11 w-11 items-center justify-center bg-sunken text-foreground transition-colors hover:bg-border"
			>
				<Bars3Icon className="size-5 stroke-2" aria-hidden="true" />
			</button>

			<AnimatePresence>
				{open && (
					<motion.div
						key="overlay"
						ref={panelRef}
						id={overlayId}
						role="dialog"
						aria-modal="true"
						aria-label={t("menuTitle")}
						onKeyDown={onKeyDown}
						className="fixed inset-0 z-50 flex flex-col text-primary-foreground"
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
								<div className="flex justify-end">
									<button
										ref={closeRef}
										type="button"
										onClick={close}
										aria-label={t("menuClose")}
										className="inline-flex size-11 items-center justify-center border border-primary-foreground/25 bg-foreground/40 transition-colors hover:bg-foreground/60"
									>
										<XMarkIcon className="size-6 shrink-0" aria-hidden="true" />
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
													onBack={() => setView("nav")}
													onNavigate={close}
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
														isLg &&
															"flex flex-1 gap-10 xl:gap-14",
														isLg &&
															!showDesktopPanel &&
															"flex flex-1 items-center",
														isLg && showDesktopPanel && "items-start",
														!isLg && "relative flex min-h-0 flex-1 flex-col",
													)}
												>
													{!isLg ? (
														<AnimatePresence initial={false}>
															{!showMobilePanel ? (
																<motion.div
																	key="mobile-primary"
																	className="absolute inset-0 flex items-center"
																	initial={mobilePrimaryEnter}
																	animate={{ opacity: 1, x: 0 }}
																	exit={mobilePrimaryExit}
																	transition={panelSlideTransition}
																>
																	<nav
																		aria-label={t("primary")}
																		className="w-full"
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
																							onClick={() =>
																								activateItem(item.key)
																							}
																							onMouseEnter={() =>
																								setHoveredKey(item.key)
																							}
																							onMouseLeave={() =>
																								setHoveredKey((current) =>
																									current === item.key
																										? null
																										: current,
																								)
																							}
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
																									: "opacity-45 hover:decoration-current hover:opacity-100 focus-visible:decoration-current focus-visible:opacity-100",
																							)}
																						>
																							<span>{t(item.key)}</span>
																							<DirectionalIcon
																								icon={ArrowRightIcon}
																								className="size-6 shrink-0 opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100"
																							/>
																						</button>
																					</li>
																				);
																			})}
																		</ul>
																	</nav>
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
																		/>
																	</motion.div>
																)
															)}
														</AnimatePresence>
													) : (
														<div
															className={cn(
																"shrink-0 lg:max-w-[min(100%,22rem)]",
																"flex flex-1 items-center self-stretch",
															)}
														>
															<nav aria-label={t("primary")} className="w-full">
																<ul className="flex flex-col gap-0.5">
																	{primaryNavItems.map((item) => {
																		const isActive = activeKey === item.key;

																		return (
																			<li key={item.key} className="group">
																				<button
																					ref={(el) => {
																						itemTriggerRefs.current[item.key] =
																							el;
																					}}
																					type="button"
																					aria-expanded={isActive}
																					onClick={() => activateItem(item.key)}
																					onMouseEnter={() => setHoveredKey(item.key)}
																					onMouseLeave={() =>
																						setHoveredKey((current) =>
																							current === item.key
																								? null
																								: current,
																						)
																					}
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
																						isActive
																							? "decoration-current opacity-100"
																							: "opacity-45 hover:decoration-current hover:opacity-100 focus-visible:decoration-current focus-visible:opacity-100",
																					)}
																				>
																					<span>{t(item.key)}</span>
																					<DirectionalIcon
																						icon={ArrowRightIcon}
																						className="size-6 shrink-0 opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100"
																					/>
																				</button>
																			</li>
																		);
																	})}
																</ul>
															</nav>
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
								<footer className="relative z-10 mt-auto shrink-0 border-t border-primary-foreground/20 bg-foreground">
									<Container className="max-w-none py-4">
										<div className="flex items-center justify-between gap-4">
											<LanguageSwitcher variant="group" overlay />
											<div className="flex items-center gap-3">
												<Button
													variant="ghost"
													type="button"
													className="font-sans h-11 px-5 text-body font-bold text-primary-foreground hover:bg-primary-foreground/10"
													onClick={() => {
														router.push("/archive");
														close();
													}}
												>
													{t("archive")}
												</Button>
												<button
													type="button"
													onClick={() => setView("search")}
													aria-label={t("searchOpen")}
													className="inline-flex size-11 items-center justify-center border border-primary-foreground/25 bg-primary-foreground/5 transition-colors hover:bg-primary-foreground/10"
												>
													<MagnifyingGlassIcon
														className="size-5 shrink-0"
														aria-hidden="true"
													/>
													<span className="visually-hidden">
														{t("searchLabel")}
													</span>
												</button>
											</div>
										</div>
									</Container>
								</footer>
							)}
						</div>
					</motion.div>
				)}
			</AnimatePresence>
		</>
	);
}
