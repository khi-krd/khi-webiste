"use client";

import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/outline";
import type { ComponentProps, MouseEvent } from "react";
import { cn } from "@/lib/utils";
import { DirectionalIcon } from "./directional-icon";
import { Link } from "./link";
import { VisuallyHidden } from "./visually-hidden";

type Href = ComponentProps<typeof Link>["href"];

type PaginationProps = {
	currentPage: number;
	totalPages: number;
	/** Build the href for a page number. Pages render as REAL links (crawlable). */
	createHref: (page: number) => Href;
	/** Accessible name for the pager (translated). Default "Pagination". */
	label?: string;
	previousLabel?: string;
	nextLabel?: string;
	/** Page numbers shown on each side of the current page. Default 1. */
	siblingCount?: number;
	/** Client-side navigation — keeps href for SEO while avoiding full scroll reset. */
	onPageChange?: (page: number) => void;
	className?: string;
};

function range(start: number, end: number): number[] {
	return Array.from({ length: end - start + 1 }, (_, i) => start + i);
}

/** Page numbers with "ellipsis" gaps, e.g. [1, "ellipsis", 4, 5, 6, "ellipsis", 20]. */
function buildPages(
	current: number,
	total: number,
	siblings: number,
): (number | "ellipsis")[] {
	const totalNumbers = siblings * 2 + 5; // first, last, current, 2·siblings, 2 dots
	if (totalNumbers >= total) return range(1, total);

	const leftSibling = Math.max(current - siblings, 1);
	const rightSibling = Math.min(current + siblings, total);
	const showLeftDots = leftSibling > 2;
	const showRightDots = rightSibling < total - 1;

	if (!showLeftDots && showRightDots) {
		return [...range(1, 3 + siblings * 2), "ellipsis", total];
	}
	if (showLeftDots && !showRightDots) {
		return [1, "ellipsis", ...range(total - (2 + siblings * 2), total)];
	}
	return [
		1,
		"ellipsis",
		...range(leftSibling, rightSibling),
		"ellipsis",
		total,
	];
}

const itemBase =
	"inline-flex h-9 min-w-9 items-center justify-center rounded-md px-2 text-small";

/**
 * Accessible pager: <nav aria-label> + previous/next controls and numbered
 * pages, current marked aria-current. Server component.
 *
 * Prev/Next use <DirectionalIcon> chevrons: previous points toward reading-
 * start, next toward reading-end — both flip in RTL. Pages are real <Link>s
 * (SEO); pass onPageChange for client navigation without scrolling to the
 * page top. Current renders as plain text; disabled prev/next render as
 * aria-disabled spans. Decoupled from URL state — caller provides createHref.
 */
export function Pagination({
	currentPage,
	totalPages,
	createHref,
	label = "Pagination",
	previousLabel = "Previous",
	nextLabel = "Next",
	siblingCount = 1,
	onPageChange,
	className,
}: PaginationProps) {
	const handlePageClick =
		(page: number) => (event: MouseEvent<HTMLAnchorElement>) => {
			if (!onPageChange) return;
			event.preventDefault();
			onPageChange(page);
		};
	if (totalPages <= 1) return null;

	const pages = buildPages(currentPage, totalPages, siblingCount);
	const isFirst = currentPage <= 1;
	const isLast = currentPage >= totalPages;

	return (
		<nav aria-label={label} className={className}>
			<ul className="flex items-center gap-1">
				<li>
					{isFirst ? (
						<span
							aria-disabled="true"
							className={cn(
								itemBase,
								"pointer-events-none text-muted opacity-50",
							)}
						>
							<DirectionalIcon icon={ChevronLeftIcon} className="size-4" />
							<VisuallyHidden>{previousLabel}</VisuallyHidden>
						</span>
					) : (
						<Link
							href={createHref(currentPage - 1)}
							scroll={false}
							rel="prev"
							aria-label={previousLabel}
							onClick={handlePageClick(currentPage - 1)}
							className={cn(itemBase, "text-foreground hover:bg-sunken")}
						>
							<DirectionalIcon icon={ChevronLeftIcon} className="size-4" />
						</Link>
					)}
				</li>

				{pages.map((page, index) =>
					page === "ellipsis" ? (
						<li
							// biome-ignore lint/suspicious/noArrayIndexKey: positional gap marker
							key={`ellipsis-${index}`}
							aria-hidden
							className={cn(itemBase, "text-muted")}
						>
							…
						</li>
					) : (
						<li key={page}>
							{page === currentPage ? (
								<span
									aria-current="page"
									className={cn(
										itemBase,
										"bg-primary font-medium text-primary-foreground",
									)}
								>
									{page}
								</span>
							) : (
								<Link
									href={createHref(page)}
									scroll={false}
									onClick={handlePageClick(page)}
									className={cn(itemBase, "text-foreground hover:bg-sunken")}
								>
									{page}
								</Link>
							)}
						</li>
					),
				)}

				<li>
					{isLast ? (
						<span
							aria-disabled="true"
							className={cn(
								itemBase,
								"pointer-events-none text-muted opacity-50",
							)}
						>
							<DirectionalIcon icon={ChevronRightIcon} className="size-4" />
							<VisuallyHidden>{nextLabel}</VisuallyHidden>
						</span>
					) : (
						<Link
							href={createHref(currentPage + 1)}
							scroll={false}
							rel="next"
							aria-label={nextLabel}
							onClick={handlePageClick(currentPage + 1)}
							className={cn(itemBase, "text-foreground hover:bg-sunken")}
						>
							<DirectionalIcon icon={ChevronRightIcon} className="size-4" />
						</Link>
					)}
				</li>
			</ul>
		</nav>
	);
}
