function range(start: number, end: number): number[] {
	return Array.from({ length: end - start + 1 }, (_, index) => start + index);
}

/** Page numbers with ellipsis gaps for compact PDF page pickers. */
export function buildPdfPageRange(
	current: number,
	total: number,
	siblingCount = 1,
): (number | "ellipsis")[] {
	if (total <= 0) {
		return [];
	}

	const totalNumbers = siblingCount * 2 + 5;
	if (totalNumbers >= total) {
		return range(1, total);
	}

	const leftSibling = Math.max(current - siblingCount, 1);
	const rightSibling = Math.min(current + siblingCount, total);
	const showLeftDots = leftSibling > 2;
	const showRightDots = rightSibling < total - 1;

	if (!showLeftDots && showRightDots) {
		return [...range(1, 3 + siblingCount * 2), "ellipsis", total];
	}
	if (showLeftDots && !showRightDots) {
		return [1, "ellipsis", ...range(total - (2 + siblingCount * 2), total)];
	}
	return [
		1,
		"ellipsis",
		...range(leftSibling, rightSibling),
		"ellipsis",
		total,
	];
}

export function spreadStartPage(page: number, twoPageSpread: boolean): number {
	if (!twoPageSpread || page <= 1) {
		return 1;
	}
	return page % 2 === 0 ? page - 1 : page;
}

export function visibleSpreadPages(
	pageNumber: number,
	numPages: number,
	twoPageSpread: boolean,
): number[] {
	if (!twoPageSpread || numPages <= 0) {
		return [pageNumber];
	}

	const second = pageNumber + 1;
	return second <= numPages ? [pageNumber, second] : [pageNumber];
}
