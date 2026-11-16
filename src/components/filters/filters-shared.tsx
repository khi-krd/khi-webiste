import type { SVGProps } from "react";

/** One filter choice (tab, checkbox option, author row…). */
export interface FilterOption {
	/** Stable id sent back through the change handlers. */
	id: string;
	label: string;
	/** Real count from the API — omit when unknown (it stays hidden). */
	count?: number;
	/** Optional group id used by the grouped type panel. */
	group?: string;
}

/** A named cluster of options inside the type panel. */
export interface FilterGroup {
	id: string;
	label: string;
}

/** Native <select> option. */
export interface SelectOption {
	value: string;
	label: string;
}

/** Arabic-Indic digits (٠١٢٣…) for Kurdish UI numbers. */
export function toKurdishDigits(n: number | string): string {
	return String(n).replace(/\d/g, (d) => "٠١٢٣٤٥٦٧٨٩"[Number(d)]);
}

/** Tiny classname joiner (keeps the components dependency-free). */
export function cx(...parts: Array<string | false | null | undefined>): string {
	return parts.filter(Boolean).join(" ");
}

type IconProps = SVGProps<SVGSVGElement> & { size?: number };

function IconBase({
	size = 20,
	strokeWidth = 1.8,
	children,
	...rest
}: IconProps) {
	return (
		<svg
			width={size}
			height={size}
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			strokeWidth={strokeWidth}
			strokeLinecap="round"
			strokeLinejoin="round"
			aria-hidden="true"
			{...rest}
		>
			{children}
		</svg>
	);
}

export function SearchIcon(props: IconProps) {
	return (
		<IconBase {...props}>
			<circle cx="11" cy="11" r="7" />
			<path d="m20 20-3.5-3.5" />
		</IconBase>
	);
}

export function ChevronDownIcon(props: IconProps) {
	return (
		<IconBase {...props}>
			<path d="m6 9 6 6 6-6" />
		</IconBase>
	);
}

export function ChevronLeftIcon(props: IconProps) {
	return (
		<IconBase {...props}>
			<path d="m15 18-6-6 6-6" />
		</IconBase>
	);
}

export function ChevronRightIcon(props: IconProps) {
	return (
		<IconBase {...props}>
			<path d="m9 18 6-6-6-6" />
		</IconBase>
	);
}

export function CloseIcon(props: IconProps) {
	return (
		<IconBase {...props}>
			<path d="M18 6 6 18" />
			<path d="m6 6 12 12" />
		</IconBase>
	);
}
