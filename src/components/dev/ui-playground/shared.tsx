import type { ReactNode } from "react";

export const showcaseGridClass = "grid gap-6 lg:gap-7 xl:grid-cols-2";

export const LANDSCAPE = "/sample/archive-landscape.png";
export const PORTRAIT = "/sample/archive-portrait.png";

export function Swatch({
	name,
	className,
}: {
	name: string;
	className: string;
}) {
	return (
		<div className="flex flex-col gap-2 text-start">
			<span
				className={`size-14 shrink-0 border border-border ${className}`}
				aria-hidden
			/>
			<span className="text-small">{name}</span>
		</div>
	);
}

export function VariantGrid({
	title,
	children,
}: {
	title: string;
	children: ReactNode;
}) {
	return (
		<div className="bg-surface p-5 sm:p-6">
			<h4 className="mb-4 text-small font-semibold tracking-wide text-muted">
				{title}
			</h4>
			<div className="flex flex-wrap items-center gap-3.5">{children}</div>
		</div>
	);
}
