import { ChevronRightIcon } from "@heroicons/react/24/outline";
import type { ComponentProps, ReactNode } from "react";
import { DirectionalIcon } from "./directional-icon";
import { Link } from "./link";

type Href = ComponentProps<typeof Link>["href"];

export type BreadcrumbItem = {
	label: ReactNode;
	/** Locale-aware href. Omit (or on the last item) to render plain text. */
	href?: Href;
};

type BreadcrumbProps = {
	items: BreadcrumbItem[];
	/** Accessible name for the trail (translated). Default "Breadcrumb". */
	label?: string;
	className?: string;
};

/**
 * Accessible breadcrumb trail: <nav aria-label> + <ol>, last item marked
 * aria-current="page" and rendered as plain text. Server component.
 *
 * Separators use <DirectionalIcon> so the chevron points in the reading
 * direction and flips in RTL; the flex row reverses so the trail reads
 * start→end in both directions. Structure only — caller supplies items.
 */
export function Breadcrumb({
	items,
	label = "Breadcrumb",
	className,
}: BreadcrumbProps) {
	return (
		<nav aria-label={label} className={className}>
			<ol className="flex flex-wrap items-center gap-2 text-small">
				{items.map((item, index) => {
					const isLast = index === items.length - 1;
					return (
						<li
							// biome-ignore lint/suspicious/noArrayIndexKey: static trail, never reorders
							key={index}
							className="flex items-center gap-2"
						>
							{isLast || !item.href ? (
								<span
									aria-current={isLast ? "page" : undefined}
									className={
										isLast ? "font-medium text-foreground" : "text-muted"
									}
								>
									{item.label}
								</span>
							) : (
								<Link href={item.href} variant="nav">
									{item.label}
								</Link>
							)}
							{!isLast && (
								<DirectionalIcon
									icon={ChevronRightIcon}
									className="size-4 shrink-0 text-muted"
								/>
							)}
						</li>
					);
				})}
			</ol>
		</nav>
	);
}
