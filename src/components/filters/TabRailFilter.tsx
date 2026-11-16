import type { FormEvent, ReactNode } from "react";
import { useCallback, useEffect, useId, useRef, useState } from "react";
import type { FilterOption, SelectOption } from "./filters-shared";
import {
	ChevronDownIcon,
	ChevronLeftIcon,
	ChevronRightIcon,
	cx,
	SearchIcon,
	toKurdishDigits,
} from "./filters-shared";
import "./filters-tokens.css";
import "./TabRailFilter.css";

/**
 * Style A — "Tab rail".
 * Title + underline search, one scrollable row of text tabs for the main
 * filter, and quiet dropdowns (subject, collection, sort…) beside the
 * result count. Used on the Images, Video and Sound pages.
 */

export interface TabRailSelect {
	/** Stable id, e.g. "subject". */
	id: string;
	/** Visible label before the dropdown, e.g. "بابەت". */
	label: string;
	value: string;
	/** Put the "all" choice first, e.g. { value: '', label: 'هەموو بابەتەکان' }. */
	options: SelectOption[];
	onChange: (value: string) => void;
}

export interface TabRailLabels {
	/** The first tab, which clears the tab filter. */
	all: string;
	/** Word after the result count. */
	results: string;
	/** Label of the sort dropdown. */
	sort: string;
	/** Hidden label of the search field. */
	searchLabel: string;
	/** Arrow button that scrolls back to the first tabs. */
	scrollBack: string;
	/** Arrow button that scrolls to more tabs. */
	scrollMore: string;
}

export const TAB_RAIL_DEFAULT_LABELS: TabRailLabels = {
	all: "هەموو",
	results: "ئەنجام",
	sort: "ڕیزکردن",
	searchLabel: "گەڕان",
	scrollBack: "جۆرەکانی پێشوو",
	scrollMore: "جۆری زیاتر",
};

export interface TabRailFilterProps {
	/** Page title, e.g. "وێنە". */
	title: string;
	/** Heading level of the title. Default "h1". */
	titleAs?: "h1" | "h2";
	/** Shown next to the title, e.g. a link to "کۆکراوەکان". */
	titleExtra?: ReactNode;

	query: string;
	onQueryChange: (value: string) => void;
	/** Called on Enter in the search field. */
	onSearchSubmit?: (value: string) => void;
	searchPlaceholder?: string;

	/** Accessible name of the tab group, e.g. "جۆر" or "شێواز". */
	tabsLabel: string;
	/** The main filter. Don't include "all" — it is added for you. */
	tabs: FilterOption[];
	/** Selected tab id, or null for "all". */
	activeTab: string | null;
	onTabChange: (id: string | null) => void;
	/** Count shown next to the "all" tab (the total, unfiltered). */
	totalCount?: number;
	/** Hide tabs whose count is 0. Default true. */
	hideEmpty?: boolean;

	/** Secondary filters shown as quiet dropdowns. */
	selects?: TabRailSelect[];

	sortOptions?: SelectOption[];
	sort?: string;
	onSortChange?: (value: string) => void;

	/** Number of results for the current filters. */
	resultCount: number;
	/** Show numbers as ٠١٢٣. Default true. */
	kurdishDigits?: boolean;
	labels?: Partial<TabRailLabels>;
	className?: string;
}

interface TabItem {
	id: string | null;
	label: string;
	count?: number;
}

/** Scrolls the rail sideways — smoothly, unless the user asked for reduced motion. */
function scrollRailBy(rail: HTMLElement, left: number) {
	const reduce =
		typeof window !== "undefined" &&
		window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
	if (typeof rail.scrollBy === "function")
		rail.scrollBy({ left, behavior: reduce ? "auto" : "smooth" });
	else rail.scrollLeft += left;
}

export function TabRailFilter({
	title,
	titleAs: TitleTag = "h1",
	titleExtra,
	query,
	onQueryChange,
	onSearchSubmit,
	searchPlaceholder = "گەڕان بەپێی ناونیشان یان بابەت…",
	tabsLabel,
	tabs,
	activeTab,
	onTabChange,
	totalCount,
	hideEmpty = true,
	selects = [],
	sortOptions,
	sort,
	onSortChange,
	resultCount,
	kurdishDigits = true,
	labels: labelOverrides,
	className,
}: TabRailFilterProps) {
	const L = { ...TAB_RAIL_DEFAULT_LABELS, ...labelOverrides };
	const num = (n: number) => (kurdishDigits ? toKurdishDigits(n) : String(n));
	const searchId = useId();
	const railRef = useRef<HTMLDivElement>(null);
	const [edges, setEdges] = useState({ start: false, end: false });
	const [rtl, setRtl] = useState(true);

	const visibleTabs = hideEmpty
		? tabs.filter((t) => t.count !== 0 || t.id === activeTab)
		: tabs;
	const items: TabItem[] = [
		{ id: null, label: L.all, count: totalCount },
		...visibleTabs,
	];

	/* Which ends of the rail have hidden tabs? Works for RTL and LTR. */
	const updateEdges = useCallback(() => {
		const rail = railRef.current;
		if (!rail) return;
		const isRtl = getComputedStyle(rail).direction === "rtl";
		const max = rail.scrollWidth - rail.clientWidth;
		const pos = Math.abs(rail.scrollLeft); // RTL scrollLeft is 0 → negative
		setRtl(isRtl);
		setEdges({ start: pos > 1, end: pos < max - 1 });
	}, []);

	useEffect(() => {
		const rail = railRef.current;
		if (!rail) return;
		updateEdges();
		rail.addEventListener("scroll", updateEdges, { passive: true });
		const observer =
			typeof ResizeObserver !== "undefined"
				? new ResizeObserver(updateEdges)
				: null;
		observer?.observe(rail);
		document.fonts?.ready.then(updateEdges).catch(() => undefined);
		return () => {
			rail.removeEventListener("scroll", updateEdges);
			observer?.disconnect();
		};
	}, [updateEdges, items.length]);

	/* Keep the selected tab in view (without scrolling the page). */
	useEffect(() => {
		const rail = railRef.current;
		const tab = rail?.querySelector<HTMLElement>('[aria-pressed="true"]');
		if (!rail || !tab || rail.clientWidth === 0) return; // hidden rail: nothing to do
		const r = rail.getBoundingClientRect();
		const t = tab.getBoundingClientRect();
		const pad = 56;
		if (t.left < r.left + pad) scrollRailBy(rail, t.left - r.left - pad);
		else if (t.right > r.right - pad)
			scrollRailBy(rail, t.right - r.right + pad);
	}, [activeTab]);

	const scrollRail = (towards: "start" | "end") => {
		const rail = railRef.current;
		if (!rail) return;
		const amount = rail.clientWidth * 0.7;
		const forward = towards === "end" ? 1 : -1;
		scrollRailBy(rail, (rtl ? -1 : 1) * forward * amount);
	};

	const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		onSearchSubmit?.(query);
	};

	const showSort = Boolean(
		sortOptions && sortOptions.length > 0 && onSortChange,
	);

	return (
		<section className={cx("tr", className)} aria-label={title}>
			<header className="tr__header">
				<div className="tr__titles">
					<TitleTag className="tr__title">{title}</TitleTag>
					{titleExtra}
				</div>
				<form role="search" className="tr__search" onSubmit={handleSubmit}>
					<label htmlFor={searchId} className="f-visually-hidden">
						{L.searchLabel}
					</label>
					<SearchIcon size={22} className="tr__search-icon" />
					<input
						id={searchId}
						type="search"
						className="tr__search-input"
						value={query}
						placeholder={searchPlaceholder}
						enterKeyHint="search"
						onChange={(e) => onQueryChange(e.target.value)}
					/>
				</form>
			</header>

			<div
				className="tr__rail-wrap"
				data-start={edges.start}
				data-end={edges.end}
			>
				<div
					ref={railRef}
					className="tr__rail"
					role="group"
					aria-label={tabsLabel}
				>
					{items.map((item) => {
						const active = item.id === activeTab;
						return (
							<button
								key={item.id ?? "__all"}
								type="button"
								className="tr__tab"
								aria-pressed={active}
								onClick={() => onTabChange(item.id)}
							>
								<span>{item.label}</span>
								{item.count !== undefined && (
									<span className="tr__count">{num(item.count)}</span>
								)}
							</button>
						);
					})}
				</div>
				{edges.start && (
					<button
						type="button"
						className="tr__arrow tr__arrow--start"
						aria-label={L.scrollBack}
						onClick={() => scrollRail("start")}
					>
						{rtl ? <ChevronRightIcon /> : <ChevronLeftIcon />}
					</button>
				)}
				{edges.end && (
					<button
						type="button"
						className="tr__arrow tr__arrow--end"
						aria-label={L.scrollMore}
						onClick={() => scrollRail("end")}
					>
						{rtl ? <ChevronLeftIcon /> : <ChevronRightIcon />}
					</button>
				)}
			</div>

			<div className="tr__toolbar">
				<p className="tr__result" aria-live="polite">
					<strong>{num(resultCount)}</strong> {L.results}
				</p>
				{(selects.length > 0 || showSort) && (
					<div className="tr__selects">
						{selects.map((s) => (
							<QuietSelect
								key={s.id}
								label={s.label}
								value={s.value}
								options={s.options}
								onChange={s.onChange}
							/>
						))}
						{showSort && sortOptions && onSortChange && (
							<QuietSelect
								label={L.sort}
								value={sort ?? sortOptions[0].value}
								options={sortOptions}
								onChange={onSortChange}
							/>
						)}
					</div>
				)}
			</div>
		</section>
	);
}

interface QuietSelectProps {
	label: string;
	value: string;
	options: SelectOption[];
	onChange: (value: string) => void;
}

function QuietSelect({ label, value, options, onChange }: QuietSelectProps) {
	const id = useId();
	return (
		<div className="tr__select">
			<label htmlFor={id} className="tr__select-label">
				{label}
			</label>
			<span className="tr__select-box">
				<select
					id={id}
					className="tr__select-input"
					value={value}
					onChange={(e) => onChange(e.target.value)}
				>
					{options.map((o) => (
						<option key={o.value} value={o.value}>
							{o.label}
						</option>
					))}
				</select>
				<ChevronDownIcon
					size={16}
					strokeWidth={2}
					className="tr__select-chevron"
				/>
			</span>
		</div>
	);
}

export default TabRailFilter;
