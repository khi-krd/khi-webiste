import type {
	FormEvent,
	KeyboardEvent,
	MouseEvent,
	ReactNode,
	Ref,
} from "react";
import { useEffect, useId, useMemo, useRef, useState } from "react";
import type { FilterGroup, FilterOption, SelectOption } from "./filters-shared";
import {
	ChevronDownIcon,
	CloseIcon,
	cx,
	SearchIcon,
	toKurdishDigits,
} from "./filters-shared";
import "./filters-tokens.css";
import "./UnifiedSearchBar.css";

/**
 * Style D — "Unified search bar".
 * One bar holds the search field and three dropdown segments:
 * جۆر (multi-select, grouped, searchable), نووسەر (single, searchable)
 * and ڕیزکردن. Active filters show below as removable tags.
 * On phones the panels open as bottom sheets. Used on the Writings page.
 */

type PanelKey = "type" | "author" | "sort";

export interface UnifiedSearchBarLabels {
	searchLabel: string;
	searchPlaceholder: string;
	search: string;
	type: string;
	allTypes: string;
	/** Segment text when 3+ types are chosen, e.g. "٣ جۆر". */
	typesCount: (n: string) => string;
	searchTypes: string;
	noTypeMatch: string;
	otherTypes: string;
	author: string;
	allAuthors: string;
	searchAuthors: string;
	noAuthorMatch: string;
	sort: string;
	showResults: (n: string) => string;
	results: string;
	remove: (label: string) => string;
	clear: string;
	clearAll: string;
	close: string;
}

export const UNIFIED_SEARCH_DEFAULT_LABELS: UnifiedSearchBarLabels = {
	searchLabel: "گەڕان لە نووسینەکان",
	searchPlaceholder: "گەڕان بەپێی ناونیشان، نووسەر یان وشە…",
	search: "گەڕان",
	type: "جۆر",
	allTypes: "هەموو جۆرەکان",
	typesCount: (n) => `${n} جۆر`,
	searchTypes: "گەڕان لە جۆرەکان…",
	noTypeMatch: "هیچ جۆرێک نەدۆزرایەوە",
	otherTypes: "جۆری تر",
	author: "نووسەر",
	allAuthors: "هەموو نووسەرەکان",
	searchAuthors: "گەڕان بۆ نووسەر…",
	noAuthorMatch: "هیچ نووسەرێک نەدۆزرایەوە",
	sort: "ڕیزکردن",
	showResults: (n) => `پیشاندانی ${n} ئەنجام`,
	results: "ئەنجام",
	remove: (label) => `لابردنی ${label}`,
	clear: "سڕینەوە",
	clearAll: "سڕینەوەی هەموو",
	close: "داخستن",
};

export interface UnifiedSearchBarProps {
	/** Page title, e.g. "نووسین". Omit to render the bar only. */
	title?: string;
	titleAs?: "h1" | "h2";

	query: string;
	onQueryChange: (value: string) => void;
	/** Called on Enter or the green search button. */
	onSearchSubmit?: (value: string) => void;

	/** All types. Give each a `group` id to show them grouped. */
	types: FilterOption[];
	typeGroups?: FilterGroup[];
	selectedTypes: string[];
	onTypesChange: (ids: string[]) => void;

	/** Leave undefined to hide the author segment. */
	authors?: FilterOption[];
	/** null = all authors. */
	selectedAuthor?: string | null;
	onAuthorChange?: (id: string | null) => void;

	sortOptions: SelectOption[];
	sort: string;
	onSortChange: (value: string) => void;

	/** Number of results for the current filters. */
	resultCount: number;
	/** Hide types whose count is 0 (unless selected). Default true. */
	hideEmpty?: boolean;
	/** Show numbers as ٠١٢٣. Default true. */
	kurdishDigits?: boolean;
	labels?: Partial<UnifiedSearchBarLabels>;
	className?: string;
}

interface TypeSection {
	id: string;
	label?: string;
	items: FilterOption[];
}

export function UnifiedSearchBar({
	title,
	titleAs: TitleTag = "h1",
	query,
	onQueryChange,
	onSearchSubmit,
	types,
	typeGroups,
	selectedTypes,
	onTypesChange,
	authors,
	selectedAuthor = null,
	onAuthorChange,
	sortOptions,
	sort,
	onSortChange,
	resultCount,
	hideEmpty = true,
	kurdishDigits = true,
	labels: labelOverrides,
	className,
}: UnifiedSearchBarProps) {
	const L = { ...UNIFIED_SEARCH_DEFAULT_LABELS, ...labelOverrides };
	const num = (n: number) => (kurdishDigits ? toKurdishDigits(n) : String(n));
	const uid = useId();

	const rootRef = useRef<HTMLDivElement>(null);
	const panelRef = useRef<HTMLDivElement>(null);
	const typeBtnRef = useRef<HTMLButtonElement>(null);
	const authorBtnRef = useRef<HTMLButtonElement>(null);
	const sortBtnRef = useRef<HTMLButtonElement>(null);
	const triggerFor = (key: PanelKey) =>
		key === "type" ? typeBtnRef : key === "author" ? authorBtnRef : sortBtnRef;

	const [open, setOpen] = useState<PanelKey | null>(null);
	const [typeQuery, setTypeQuery] = useState("");
	const [authorQuery, setAuthorQuery] = useState("");

	const selected = useMemo(() => new Set(selectedTypes), [selectedTypes]);
	const chosenTypes = types.filter((t) => selected.has(t.id));
	const chosenAuthor = authors?.find((a) => a.id === selectedAuthor) ?? null;
	const sortLabel =
		sortOptions.find((o) => o.value === sort)?.label ??
		sortOptions[0]?.label ??
		"";

	const typeValue =
		chosenTypes.length === 0
			? L.allTypes
			: chosenTypes.length <= 2
				? chosenTypes.map((t) => t.label).join("، ")
				: L.typesCount(num(chosenTypes.length));

	/* ----- open / close ----- */

	const toggle = (key: PanelKey) =>
		setOpen((cur) => (cur === key ? null : key));

	const close = (returnFocus: boolean) => {
		const key = open;
		setOpen(null);
		if (returnFocus && key) triggerFor(key).current?.focus();
	};

	// Close when clicking outside the component.
	useEffect(() => {
		if (!open) return;
		const onPointerDown = (e: PointerEvent) => {
			if (rootRef.current && !rootRef.current.contains(e.target as Node))
				setOpen(null);
		};
		document.addEventListener("pointerdown", onPointerDown);
		return () => document.removeEventListener("pointerdown", onPointerDown);
	}, [open]);

	// Move focus into the panel that just opened; reset panel searches.
	useEffect(() => {
		if (open !== "type") setTypeQuery("");
		if (open !== "author") setAuthorQuery("");
		if (!open) return;
		const panel = panelRef.current;
		const target =
			panel?.querySelector<HTMLElement>("[data-autofocus]") ??
			panel?.querySelector<HTMLElement>("input:checked") ??
			panel?.querySelector<HTMLElement>("input, button");
		target?.focus();
	}, [open]);

	const onKeyDown = (e: KeyboardEvent<HTMLElement>) => {
		if (e.key === "Escape" && open) {
			e.stopPropagation();
			close(true);
		}
	};

	const onSubmit = (e: FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		setOpen(null);
		onSearchSubmit?.(query);
	};

	/* ----- types ----- */

	const toggleType = (id: string) =>
		onTypesChange(
			selected.has(id)
				? selectedTypes.filter((x) => x !== id)
				: [...selectedTypes, id],
		);

	const typeSections: TypeSection[] = useMemo(() => {
		const q = typeQuery.trim();
		const matching = types.filter(
			(t) =>
				(!hideEmpty || t.count !== 0 || selected.has(t.id)) &&
				(!q || t.label.includes(q)),
		);
		if (!typeGroups || typeGroups.length === 0) {
			return matching.length ? [{ id: "__all", items: matching }] : [];
		}
		const known = new Set(typeGroups.map((g) => g.id));
		return [
			...typeGroups.map((g) => ({
				id: g.id,
				label: g.label,
				items: matching.filter((t) => t.group === g.id),
			})),
			{
				id: "__other",
				label: L.otherTypes,
				items: matching.filter((t) => !t.group || !known.has(t.group)),
			},
		].filter((s) => s.items.length > 0);
	}, [types, typeGroups, typeQuery, hideEmpty, selected, L.otherTypes]);

	const flatTypes = !typeGroups || typeGroups.length === 0;

	/* ----- authors & sort ----- */

	const filteredAuthors = (authors ?? []).filter(
		(a) => !authorQuery.trim() || a.label.includes(authorQuery.trim()),
	);

	// Close on a pointer pick; keyboard arrows only change the value.
	const pickAuthor = (id: string | null) => onAuthorChange?.(id);
	const pickSort = (value: string) => onSortChange(value);
	const closeOnPointer = (e: MouseEvent) => {
		if (e.detail > 0) close(true);
	};

	const clearAll = () => {
		onTypesChange([]);
		onAuthorChange?.(null);
	};

	const hasActive = chosenTypes.length > 0 || chosenAuthor !== null;

	return (
		<div ref={rootRef} className={cx("usb", className)}>
			{title && <TitleTag className="usb__title">{title}</TitleTag>}

			<form
				role="search"
				className="usb__bar"
				onSubmit={onSubmit}
				onKeyDown={onKeyDown}
			>
				<div className="usb__search">
					<label htmlFor={`${uid}-q`} className="f-visually-hidden">
						{L.searchLabel}
					</label>
					<SearchIcon size={22} className="usb__search-icon" />
					<input
						id={`${uid}-q`}
						type="search"
						className="usb__search-input"
						value={query}
						placeholder={L.searchPlaceholder}
						enterKeyHint="search"
						onChange={(e) => onQueryChange(e.target.value)}
					/>
				</div>

				<span className="usb__divider usb__divider--first" aria-hidden="true" />

				{/* ---------- جۆر ---------- */}
				<Segment
					panelId={`${uid}-type`}
					label={L.type}
					value={typeValue}
					isOpen={open === "type"}
					onToggle={() => toggle("type")}
					onClose={() => close(true)}
					closeLabel={L.close}
					buttonRef={typeBtnRef}
					panelRef={panelRef}
					anchor="bar"
					panelClassName="usb__panel--types"
				>
					<SearchField
						id={`${uid}-tq`}
						label={L.searchTypes}
						value={typeQuery}
						onChange={setTypeQuery}
					/>
					{typeSections.length === 0 ? (
						<p className="usb__empty">{L.noTypeMatch}</p>
					) : (
						<div className="usb__groups">
							{typeSections.map((section) => (
								<fieldset
									key={section.id}
									className={cx("usb__group", flatTypes && "usb__group--flat")}
								>
									{section.label && (
										<legend className="usb__group-title">
											{section.label}
										</legend>
									)}
									{section.items.map((t) => (
										<label key={t.id} className="usb__check">
											<input
												type="checkbox"
												checked={selected.has(t.id)}
												onChange={() => toggleType(t.id)}
											/>
											<span className="usb__check-label">{t.label}</span>
											{t.count !== undefined && (
												<span className="usb__count">{num(t.count)}</span>
											)}
										</label>
									))}
								</fieldset>
							))}
						</div>
					)}
					<div className="usb__panel-foot">
						<button
							type="button"
							className="usb__link"
							onClick={() => onTypesChange([])}
						>
							{L.clear}
						</button>
						<button
							type="button"
							className="usb__primary"
							onClick={() => close(true)}
						>
							{L.showResults(num(resultCount))}
						</button>
					</div>
				</Segment>

				{/* ---------- نووسەر ---------- */}
				{authors && (
					<>
						<span className="usb__divider" aria-hidden="true" />
						<Segment
							panelId={`${uid}-author`}
							label={L.author}
							value={chosenAuthor?.label ?? L.allAuthors}
							isOpen={open === "author"}
							onToggle={() => toggle("author")}
							onClose={() => close(true)}
							closeLabel={L.close}
							buttonRef={authorBtnRef}
							panelRef={panelRef}
						>
							<SearchField
								id={`${uid}-aq`}
								label={L.searchAuthors}
								value={authorQuery}
								onChange={setAuthorQuery}
							/>
							<div
								className="usb__list"
								role="radiogroup"
								aria-label={L.author}
							>
								<label className="usb__radio">
									<input
										type="radio"
										name={`${uid}-author`}
										checked={selectedAuthor === null}
										onChange={() => pickAuthor(null)}
										onClick={closeOnPointer}
									/>
									<span className="usb__check-label">{L.allAuthors}</span>
								</label>
								{filteredAuthors.map((a) => (
									<label key={a.id} className="usb__radio">
										<input
											type="radio"
											name={`${uid}-author`}
											checked={selectedAuthor === a.id}
											onChange={() => pickAuthor(a.id)}
											onClick={closeOnPointer}
										/>
										<span className="usb__check-label">{a.label}</span>
										{a.count !== undefined && (
											<span className="usb__count">{num(a.count)}</span>
										)}
									</label>
								))}
								{filteredAuthors.length === 0 && authorQuery.trim() !== "" && (
									<p className="usb__empty">{L.noAuthorMatch}</p>
								)}
							</div>
						</Segment>
					</>
				)}

				{/* ---------- ڕیزکردن ---------- */}
				<span className="usb__divider" aria-hidden="true" />
				<Segment
					panelId={`${uid}-sort`}
					label={L.sort}
					value={sortLabel}
					isOpen={open === "sort"}
					onToggle={() => toggle("sort")}
					onClose={() => close(true)}
					closeLabel={L.close}
					buttonRef={sortBtnRef}
					panelRef={panelRef}
					panelClassName="usb__panel--sort"
					narrow
				>
					<div className="usb__list" role="radiogroup" aria-label={L.sort}>
						{sortOptions.map((o) => (
							<label key={o.value} className="usb__radio">
								<input
									type="radio"
									name={`${uid}-sort`}
									checked={sort === o.value}
									onChange={() => pickSort(o.value)}
									onClick={closeOnPointer}
								/>
								<span className="usb__check-label">{o.label}</span>
							</label>
						))}
					</div>
				</Segment>

				<button type="submit" className="usb__submit" aria-label={L.search}>
					<SearchIcon size={24} strokeWidth={2} />
				</button>
			</form>

			{/* Dims the page behind bottom sheets on phones (hidden on desktop). */}
			{open && (
				<div
					className="usb__backdrop"
					aria-hidden="true"
					onClick={() => close(true)}
				/>
			)}

			<div className="usb__summary">
				<p className="usb__result" aria-live="polite">
					<strong>{num(resultCount)}</strong> {L.results}
				</p>
				{chosenTypes.map((t) => (
					<button
						key={t.id}
						type="button"
						className="usb__tag"
						aria-label={L.remove(t.label)}
						onClick={() => toggleType(t.id)}
					>
						<span>{t.label}</span>
						<CloseIcon size={16} strokeWidth={2} />
					</button>
				))}
				{chosenAuthor && (
					<button
						type="button"
						className="usb__tag"
						aria-label={L.remove(chosenAuthor.label)}
						onClick={() => onAuthorChange?.(null)}
					>
						<span>{chosenAuthor.label}</span>
						<CloseIcon size={16} strokeWidth={2} />
					</button>
				)}
				{hasActive && (
					<button
						type="button"
						className="usb__link usb__link--small"
						onClick={clearAll}
					>
						{L.clearAll}
					</button>
				)}
			</div>
		</div>
	);
}

/* ------------------------------------------------------------------ */

interface SegmentProps {
	panelId: string;
	label: string;
	value: string;
	isOpen: boolean;
	onToggle: () => void;
	onClose: () => void;
	closeLabel: string;
	buttonRef: Ref<HTMLButtonElement>;
	panelRef: Ref<HTMLDivElement>;
	/** "bar": the panel lines up with the whole bar (wide panels). */
	anchor?: "segment" | "bar";
	panelClassName?: string;
	narrow?: boolean;
	children: ReactNode;
}

function Segment({
	panelId,
	label,
	value,
	isOpen,
	onToggle,
	onClose,
	closeLabel,
	buttonRef,
	panelRef,
	anchor = "segment",
	panelClassName,
	narrow = false,
	children,
}: SegmentProps) {
	return (
		<div
			className={cx(
				"usb__segment",
				anchor === "bar" && "usb__segment--static",
				narrow && "usb__segment--narrow",
			)}
		>
			<button
				ref={buttonRef}
				type="button"
				className="usb__seg-btn"
				aria-haspopup="dialog"
				aria-expanded={isOpen}
				aria-controls={isOpen ? panelId : undefined}
				onClick={onToggle}
			>
				<span className="usb__seg-text">
					<span className="usb__seg-label">{label}</span>
					<span className="usb__seg-value">{value}</span>
				</span>
				<ChevronDownIcon
					size={16}
					strokeWidth={2}
					className="usb__seg-chevron"
				/>
			</button>
			{isOpen && (
				<div
					ref={panelRef}
					id={panelId}
					role="dialog"
					aria-label={label}
					className={cx("usb__panel", panelClassName)}
				>
					<div className="usb__sheet-head">
						<h2 className="usb__sheet-title">{label}</h2>
						<button
							type="button"
							className="usb__icon-btn"
							aria-label={closeLabel}
							onClick={onClose}
						>
							<CloseIcon size={22} />
						</button>
					</div>
					{children}
				</div>
			)}
		</div>
	);
}

interface SearchFieldProps {
	id: string;
	label: string;
	value: string;
	onChange: (value: string) => void;
}

function SearchField({ id, label, value, onChange }: SearchFieldProps) {
	return (
		<div className="usb__field">
			<label htmlFor={id} className="f-visually-hidden">
				{label}
			</label>
			<SearchIcon size={18} className="usb__field-icon" />
			<input
				id={id}
				type="search"
				data-autofocus="true"
				className="usb__field-input"
				value={value}
				placeholder={label}
				onChange={(e) => onChange(e.target.value)}
				onKeyDown={(e) => {
					// Enter here filters the list; it must not submit the main search.
					if (e.key === "Enter") e.preventDefault();
				}}
			/>
		</div>
	);
}

export default UnifiedSearchBar;
