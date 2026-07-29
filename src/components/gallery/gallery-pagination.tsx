"use client";

import { useTransition } from "react";
import { Pagination } from "@/components/ui/pagination";
import { useRouter } from "@/i18n/navigation";
import { buildGalleryHref } from "@/lib/gallery-url";
import { useScrollToSection } from "@/lib/use-scroll-to-section";
import { cn } from "@/lib/utils";

type GalleryPaginationProps = {
	currentPage: number;
	totalPages: number;
	activeQuery?: string | null;
	activeType?: string | null;
	label: string;
	previousLabel: string;
	nextLabel: string;
	className?: string;
};

/**
 * Gallery pager — the ui/Pagination primitive wired for client navigation
 * (news-pagination pattern): real hrefs for SEO, router.replace without a
 * scroll reset, then a smooth scroll back to the top of the collections list.
 */
export function GalleryPagination({
	currentPage,
	totalPages,
	activeQuery,
	activeType,
	label,
	previousLabel,
	nextLabel,
	className,
}: GalleryPaginationProps) {
	const router = useRouter();
	const [isPending, startTransition] = useTransition();
	const scrollToSection = useScrollToSection();

	const hrefFor = (page: number) =>
		buildGalleryHref({
			q: activeQuery,
			type: activeType,
			page,
		});

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
