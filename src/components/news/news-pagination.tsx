"use client";

import { useTransition } from "react";
import { Pagination } from "@/components/ui/pagination";
import { useRouter } from "@/i18n/navigation";
import { buildNewsHref } from "@/lib/news-url";
import { useScrollToSection } from "@/lib/use-scroll-to-section";
import { cn } from "@/lib/utils";

type NewsPaginationProps = {
	currentPage: number;
	totalPages: number;
	activeCategory?: string | null;
	activeSubCategory?: string | null;
	activeTag?: string | null;
	activeQuery?: string | null;
	label: string;
	previousLabel: string;
	nextLabel: string;
	className?: string;
};

export function NewsPagination({
	currentPage,
	totalPages,
	activeCategory,
	activeSubCategory,
	activeTag,
	activeQuery,
	label,
	previousLabel,
	nextLabel,
	className,
}: NewsPaginationProps) {
	const router = useRouter();
	const [isPending, startTransition] = useTransition();
	const scrollToSection = useScrollToSection();

	// Rebuilt from scratch, so every active dimension has to be forwarded here.
	const hrefForPage = (page: number) =>
		buildNewsHref({
			category: activeCategory,
			subcategory: activeSubCategory,
			tag: activeTag,
			q: activeQuery,
			page,
		});

	const handlePageChange = (page: number) => {
		startTransition(() => {
			router.replace(hrefForPage(page), { scroll: false });

			scrollToSection("news-grid");
		});
	};

	return (
		<Pagination
			currentPage={currentPage}
			totalPages={totalPages}
			createHref={hrefForPage}
			onPageChange={handlePageChange}
			label={label}
			previousLabel={previousLabel}
			nextLabel={nextLabel}
			className={cn(className, isPending && "pointer-events-none opacity-70")}
		/>
	);
}
