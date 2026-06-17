"use client";

import { useTransition } from "react";
import { Pagination } from "@/components/ui/pagination";
import { useRouter } from "@/i18n/navigation";
import { cn } from "@/lib/utils";
import type { WritingCategorySlug } from "@/lib/writing/categories";
import type { WritingsSort } from "@/lib/writing/filter";
import { buildWritingsHref } from "@/lib/writings-url";
import type { BookGenre } from "@/types/writing";

type WritingsPaginationProps = {
	currentPage: number;
	totalPages: number;
	categorySlug?: WritingCategorySlug | null;
	activeGenre?: BookGenre | null;
	activeQuery?: string | null;
	activeSort?: WritingsSort;
	label: string;
	previousLabel: string;
	nextLabel: string;
	scrollTargetId?: string;
	className?: string;
};

export function WritingsPagination({
	currentPage,
	totalPages,
	categorySlug,
	activeGenre,
	activeQuery,
	activeSort,
	label,
	previousLabel,
	nextLabel,
	scrollTargetId = "writings-grid",
	className,
}: WritingsPaginationProps) {
	const router = useRouter();
	const [isPending, startTransition] = useTransition();

	const handlePageChange = (page: number) => {
		startTransition(() => {
			router.replace(
				buildWritingsHref({
					category: categorySlug,
					genre: activeGenre,
					q: activeQuery,
					sort: activeSort,
					page,
				}),
				{ scroll: false },
			);

			document.getElementById(scrollTargetId)?.scrollIntoView({
				behavior: "smooth",
				block: "start",
			});
		});
	};

	return (
		<Pagination
			currentPage={currentPage}
			totalPages={totalPages}
			createHref={(page) =>
				buildWritingsHref({
					category: categorySlug,
					genre: activeGenre,
					q: activeQuery,
					sort: activeSort,
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
