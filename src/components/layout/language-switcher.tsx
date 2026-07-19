"use client";

import {
	CheckIcon,
	ChevronDownIcon,
} from "@heroicons/react/24/outline";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import Image from "next/image";
import { useLocale, useTranslations } from "next-intl";
import {
	useEffect,
	useId,
	useLayoutEffect,
	useRef,
	useState,
	useTransition,
	type CSSProperties,
} from "react";
import { createPortal } from "react-dom";
import { Link as UiLink } from "@/components/ui/link";
import { DrawnBorder } from "@/components/ui/drawn-border";
import { LOCALE_LABELS } from "@/config/site";
import { usePathname, useRouter } from "@/i18n/navigation";
import { routing, type Locale } from "@/i18n/routing";
import { cn } from "@/lib/utils";

type LanguageSwitcherProps = {
	/** "links" = autonym text links; "dropdown" = compact select-style menu. */
	variant?: "links" | "dropdown";
	/** Sits inside the header utility tray — no own fill/border on the trigger. */
	embedded?: boolean;
	/** Dark overlay footer — light-on-ink token overrides. */
	overlay?: boolean;
	/** Called before navigating to the new locale (e.g. close the nav overlay). */
	onLocaleChange?: () => void;
};

/**
 * Locale switcher. Preserves the current pathname when switching language.
 */
export function LanguageSwitcher({
	variant = "links",
	embedded = false,
	overlay = false,
	onLocaleChange,
}: LanguageSwitcherProps) {
	const t = useTranslations("LanguageSwitcher");
	const activeLocale = useLocale() as Locale;
	const pathname = usePathname();
	const router = useRouter();
	const [isPending, startTransition] = useTransition();
	const listboxId = useId();

	function switchLocale(locale: (typeof routing.locales)[number]) {
		if (locale === activeLocale) return;
		onLocaleChange?.();
		startTransition(() => {
			router.replace(pathname, { locale });
		});
	}

	if (variant === "dropdown") {
		return (
			<LanguageDropdown
				activeLocale={activeLocale}
				embedded={embedded}
				isPending={isPending}
				listboxId={listboxId}
				overlay={overlay}
				label={t("label")}
				onSelect={switchLocale}
			/>
		);
	}

	return (
		<nav aria-label={t("label")}>
			<ul className="flex flex-wrap items-center gap-x-5 gap-y-2">
				{routing.locales.map((locale) => (
					<li key={locale}>
						<UiLink
							href={pathname}
							locale={locale}
							lang={locale}
							variant="nav"
							active={locale === activeLocale}
							className="text-small"
						>
							{LOCALE_LABELS[locale]}
						</UiLink>
					</li>
				))}
			</ul>
		</nav>
	);
}

type LanguageDropdownProps = {
	activeLocale: Locale;
	embedded: boolean;
	isPending: boolean;
	listboxId: string;
	overlay: boolean;
	label: string;
	onSelect: (locale: Locale) => void;
};

const PANEL_GAP_PX = 6;
const PANEL_MIN_WIDTH_PX = 184; // 11.5rem

const triggerShell =
	"draw-border-host relative isolate inline-flex items-center gap-2 overflow-hidden rounded-md text-small font-medium transition-colors [&>:not(svg)]:relative [&>:not(svg)]:z-1";

const panelClassName =
	"min-w-[11.5rem] overflow-hidden rounded-md border py-1 shadow-[0_8px_24px_color-mix(in_oklch,var(--color-foreground)_12%,transparent),0_2px_6px_color-mix(in_oklch,var(--color-foreground)_6%,transparent)]";

function LanguageDropdown({
	activeLocale,
	embedded,
	isPending,
	listboxId,
	overlay,
	label,
	onSelect,
}: LanguageDropdownProps) {
	const [open, setOpen] = useState(false);
	const [panelStyle, setPanelStyle] = useState<CSSProperties>();
	const [mounted, setMounted] = useState(false);
	const containerRef = useRef<HTMLDivElement>(null);
	const triggerRef = useRef<HTMLButtonElement>(null);
	const panelRef = useRef<HTMLUListElement>(null);
	const reduceMotion = useReducedMotion();

	// Overlay footer uses backdrop-filter which clips absolute children — portal instead.
	const portalPanel = overlay;

	useEffect(() => {
		setMounted(true);
	}, []);

	useLayoutEffect(() => {
		if (!open || !portalPanel) return;

		function updatePosition() {
			const trigger = triggerRef.current;
			if (!trigger) return;

			const rect = trigger.getBoundingClientRect();
			const isRtl = document.documentElement.dir === "rtl";
			const next: CSSProperties = {
				position: "fixed",
				bottom: window.innerHeight - rect.top + PANEL_GAP_PX,
				zIndex: 110,
				minWidth: Math.max(rect.width, PANEL_MIN_WIDTH_PX),
			};

			if (isRtl) {
				next.right = window.innerWidth - rect.right;
			} else {
				next.left = rect.left;
			}

			setPanelStyle(next);
		}

		updatePosition();
		window.addEventListener("resize", updatePosition);
		return () => window.removeEventListener("resize", updatePosition);
	}, [open, portalPanel]);

	useEffect(() => {
		if (!open) return;

		function handlePointerDown(event: MouseEvent) {
			const target = event.target as Node;
			if (
				containerRef.current?.contains(target) ||
				panelRef.current?.contains(target)
			) {
				return;
			}
			setOpen(false);
		}

		function handleKeyDown(event: KeyboardEvent) {
			if (event.key === "Escape") {
				setOpen(false);
			}
		}

		document.addEventListener("mousedown", handlePointerDown);
		document.addEventListener("keydown", handleKeyDown);
		return () => {
			document.removeEventListener("mousedown", handlePointerDown);
			document.removeEventListener("keydown", handleKeyDown);
		};
	}, [open]);

	function selectLocale(locale: Locale) {
		onSelect(locale);
		setOpen(false);
	}

	const triggerClass = cn(
		triggerShell,
		embedded ? "h-10 px-2.5 fine-hover:bg-sunken" : "h-11 px-3.5",
		overlay
			? "border border-primary-foreground/20 bg-primary-foreground/8 text-primary-foreground backdrop-blur-sm fine-hover:border-primary-foreground/35 fine-hover:bg-primary-foreground/12"
			: embedded
				? "text-foreground"
				: "border border-border bg-surface text-foreground fine-hover:bg-sunken",
		open &&
			(overlay
				? "border-primary-foreground/35 bg-primary-foreground/12"
				: embedded
					? "bg-sunken"
					: "border-border-strong bg-sunken"),
	);

	const panelMotion = reduceMotion
		? { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 } }
		: portalPanel
			? {
					initial: { opacity: 0, y: 6, scale: 0.98 },
					animate: { opacity: 1, y: 0, scale: 1 },
					exit: { opacity: 0, y: 4, scale: 0.98 },
				}
			: {
					initial: { opacity: 0, y: -6, scale: 0.98 },
					animate: { opacity: 1, y: 0, scale: 1 },
					exit: { opacity: 0, y: -4, scale: 0.98 },
				};

	const panelSurfaceClass = overlay
		? "border-primary-foreground/20 bg-foreground/95 text-primary-foreground backdrop-blur-md"
		: "border-border-strong bg-surface";

	const listbox = open && (
		<motion.ul
			ref={panelRef}
			id={listboxId}
			role="listbox"
			aria-label={label}
			{...panelMotion}
			transition={{ duration: reduceMotion ? 0 : 0.16, ease: "easeOut" }}
			style={portalPanel ? panelStyle : undefined}
			className={cn(
				panelClassName,
				panelSurfaceClass,
				portalPanel
					? "fixed"
					: "absolute end-0 top-[calc(100%+0.375rem)] z-50",
			)}
		>
			{routing.locales.map((locale) => {
				const isActive = locale === activeLocale;

				return (
					<li key={locale} role="presentation">
						<button
							type="button"
							role="option"
							lang={locale}
							aria-selected={isActive}
							disabled={isPending || isActive}
							onClick={() => selectLocale(locale)}
							className={cn(
								"flex w-full items-center gap-2 px-3 py-2.5 text-start text-small transition-colors",
								(isPending || isActive) && "cursor-default",
								overlay
									? isActive
										? "bg-primary-foreground/10 font-medium text-primary-foreground"
										: "font-normal text-primary-foreground/80 fine-hover:bg-primary-foreground/8 fine-hover:text-primary-foreground"
									: isActive
										? "bg-sunken font-medium text-foreground"
										: "font-normal text-muted fine-hover:bg-sunken fine-hover:text-foreground",
							)}
						>
							<span className="min-w-0 flex-1 truncate">
								{LOCALE_LABELS[locale]}
							</span>
							{isActive && (
								<CheckIcon
									className={cn(
										"size-4 shrink-0",
										overlay
											? "text-primary-foreground/80"
											: "text-foreground/70",
									)}
									strokeWidth={2}
									aria-hidden="true"
								/>
							)}
						</button>
					</li>
				);
			})}
		</motion.ul>
	);

	return (
		<div ref={containerRef} className="relative">
			<button
				ref={triggerRef}
				type="button"
				aria-expanded={open}
				aria-haspopup="listbox"
				aria-controls={listboxId}
				disabled={isPending}
				onClick={() => setOpen((current) => !current)}
				className={triggerClass}
			>
				<DrawnBorder />
				<Image
					src="/flag.png"
					alt=""
					width={16}
					height={16}
					className="size-4 shrink-0 rounded-sm"
					aria-hidden="true"
				/>
				<span lang={activeLocale} className="max-w-[7rem] truncate sm:max-w-none">
					{LOCALE_LABELS[activeLocale]}
				</span>
				<ChevronDownIcon
					className={cn(
						"size-3.5 shrink-0 transition-transform duration-200",
						open && "rotate-180",
						overlay ? "text-primary-foreground/60" : "text-muted",
					)}
					strokeWidth={2}
					aria-hidden="true"
				/>
				<span className="visually-hidden">{label}</span>
			</button>

			{portalPanel ? (
				mounted &&
				createPortal(
					<AnimatePresence>{listbox}</AnimatePresence>,
					document.body,
				)
			) : (
				<AnimatePresence>{listbox}</AnimatePresence>
			)}
		</div>
	);
}
