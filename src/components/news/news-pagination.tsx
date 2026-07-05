"use client";

import { useTransition } from "react";
import { useScrollToSection } from "@/components/providers/lenis-context";
import { Pagination } from "@/components/ui/pagination";
import { useRouter } from "@/i18n/navigation";
import { buildNewsHref } from "@/lib/news-url";
import { cn } from "@/lib/utils";

type NewsPaginationProps = {
	currentPage: number;
	totalPages: number;
	activeCategory?: string | null;
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
	activeQuery,
	label,
	previousLabel,
	nextLabel,
	className,
}: NewsPaginationProps) {
	const router = useRouter();
	const [isPending, startTransition] = useTransition();
	const scrollToSection = useScrollToSection();

	const handlePageChange = (page: number) => {
		startTransition(() => {
			router.replace(
				buildNewsHref({
					category: activeCategory,
					q: activeQuery,
					page,
				}),
				{ scroll: false },
			);

			scrollToSection("news-grid");
		});
	};

	return (
		<Pagination
			currentPage={currentPage}
			totalPages={totalPages}
			createHref={(page) =>
				buildNewsHref({
					category: activeCategory,
					q: activeQuery,
					page,
				})
			}
			onPageChange={handlePageChange}
			label={label}
			previousLabel={previousLabel}
			nextLabel={nextLabel}
			className={cn(className, isPending && "pointer-events-none opacity-70")}
		/>
	);
}
