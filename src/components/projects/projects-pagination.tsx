"use client";

import { useTransition } from "react";
import { Pagination } from "@/components/ui/pagination";
import { useRouter } from "@/i18n/navigation";
import { projectsHref } from "@/lib/projects-url";
import { useScrollToSection } from "@/lib/use-scroll-to-section";
import { cn } from "@/lib/utils";

type ProjectsPaginationProps = {
	currentPage: number;
	totalPages: number;
	activeYear: string | null;
	activeTag: string | null;
	activeQuery: string | null;
	label: string;
	previousLabel: string;
	nextLabel: string;
	className?: string;
};

function hrefFor(
	page: number,
	activeYear: string | null,
	activeTag: string | null,
	activeQuery: string | null,
) {
	return projectsHref({
		year: activeYear,
		tag: activeTag,
		q: activeQuery,
		page: page > 1 ? page : undefined,
	});
}

export function ProjectsPagination({
	currentPage,
	totalPages,
	activeYear,
	activeTag,
	activeQuery,
	label,
	previousLabel,
	nextLabel,
	className,
}: ProjectsPaginationProps) {
	const router = useRouter();
	const [isPending, startTransition] = useTransition();
	const scrollToSection = useScrollToSection();

	const handlePageChange = (page: number) => {
		startTransition(() => {
			router.replace(hrefFor(page, activeYear, activeTag, activeQuery), {
				scroll: false,
			});

			scrollToSection("projects-content");
		});
	};

	return (
		<Pagination
			currentPage={currentPage}
			totalPages={totalPages}
			createHref={(page) => hrefFor(page, activeYear, activeTag, activeQuery)}
			onPageChange={handlePageChange}
			label={label}
			previousLabel={previousLabel}
			nextLabel={nextLabel}
			className={cn(className, isPending && "pointer-events-none opacity-70")}
		/>
	);
}
