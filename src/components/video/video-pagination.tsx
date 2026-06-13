"use client";

import { useTransition } from "react";
import { Pagination } from "@/components/ui/pagination";
import { useRouter } from "@/i18n/navigation";
import { cn } from "@/lib/utils";
import { buildVideoHref } from "@/lib/video-url";
import type { VideoType } from "@/types/video";

type VideoPaginationProps = {
	currentPage: number;
	totalPages: number;
	activeType?: VideoType | null;
	activeTopicId?: number | null;
	activeMemories?: boolean | null;
	activeQuery?: string | null;
	/** Route the pager hangs off (e.g. "/videos" or "/videos/shortfilms"). */
	basePath?: string;
	/** When true the topic is implied by the route, so it's left off the query. */
	omitTopic?: boolean;
	label: string;
	previousLabel: string;
	nextLabel: string;
	scrollTargetId?: string;
	className?: string;
};

export function VideoPagination({
	currentPage,
	totalPages,
	activeType,
	activeTopicId,
	activeMemories,
	activeQuery,
	basePath = "/videos",
	omitTopic = false,
	label,
	previousLabel,
	nextLabel,
	scrollTargetId = "videos-grid",
	className,
}: VideoPaginationProps) {
	const router = useRouter();
	const [isPending, startTransition] = useTransition();

	const createHref = (page: number) =>
		buildVideoHref({
			type: activeType,
			topic: omitTopic ? null : activeTopicId,
			memories: activeMemories,
			q: activeQuery,
			page,
			basePath,
		});

	const handlePageChange = (page: number) => {
		startTransition(() => {
			router.replace(createHref(page), { scroll: false });

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
			createHref={createHref}
			onPageChange={handlePageChange}
			label={label}
			previousLabel={previousLabel}
			nextLabel={nextLabel}
			className={cn(className, isPending && "pointer-events-none opacity-70")}
		/>
	);
}
