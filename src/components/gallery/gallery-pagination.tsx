"use client";

import { useTransition } from "react";
import { useScrollToSection } from "@/components/providers/lenis-context";
import { Pagination } from "@/components/ui/pagination";
import { useRouter } from "@/i18n/navigation";
import { cn } from "@/lib/utils";

type GalleryPaginationProps = {
	currentPage: number;
	totalPages: number;
	label: string;
	previousLabel: string;
	nextLabel: string;
	className?: string;
};

/** Page 1 keeps the clean /gallery URL; deeper pages use ?page=N. */
function hrefFor(page: number) {
	return page > 1 ? `/gallery?page=${page}` : "/gallery";
}

/**
 * Gallery pager — the ui/Pagination primitive wired for client navigation
 * (news-pagination pattern): real hrefs for SEO, router.replace without a
 * scroll reset, then a smooth scroll back to the top of the collections list.
 */
export function GalleryPagination({
	currentPage,
	totalPages,
	label,
	previousLabel,
	nextLabel,
	className,
}: GalleryPaginationProps) {
	const router = useRouter();
	const [isPending, startTransition] = useTransition();
	const scrollToSection = useScrollToSection();

	const handlePageChange = (page: number) => {
		startTransition(() => {
			router.replace(hrefFor(page), { scroll: false });
			scrollToSection("gallery-content");
		});
	};

	return (
		<Pagination
			currentPage={currentPage}
			totalPages={totalPages}
			createHref={hrefFor}
			onPageChange={handlePageChange}
			label={label}
			previousLabel={previousLabel}
			nextLabel={nextLabel}
			className={cn(className, isPending && "pointer-events-none opacity-70")}
		/>
	);
}
