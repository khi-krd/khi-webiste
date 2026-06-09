"use client";

import { useTransition } from "react";
import { useRouter } from "@/i18n/navigation";
import { Pagination } from "@/components/ui/pagination";
import { buildArticlesHref } from "@/lib/articles-url";
import { cn } from "@/lib/utils";

type ArticlesPaginationProps = {
	currentPage: number;
	totalPages: number;
	activeCategory?: string | null;
	activeQuery?: string | null;
	label: string;
	previousLabel: string;
	nextLabel: string;
	className?: string;
};

export function ArticlesPagination({
	currentPage,
	totalPages,
	activeCategory,
	activeQuery,
	label,
	previousLabel,
	nextLabel,
	className,
}: ArticlesPaginationProps) {
	const router = useRouter();
	const [isPending, startTransition] = useTransition();

	const handlePageChange = (page: number) => {
		startTransition(() => {
			router.replace(
				buildArticlesHref({
					category: activeCategory,
					q: activeQuery,
					page,
				}),
				{ scroll: false },
			);

			document.getElementById("articles-grid")?.scrollIntoView({
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
				buildArticlesHref({
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
