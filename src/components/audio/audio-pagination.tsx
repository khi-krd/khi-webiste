"use client";

import { useTransition } from "react";
import { Pagination } from "@/components/ui/pagination";
import { useRouter } from "@/i18n/navigation";
import { buildAudioHref } from "@/lib/audio-url";
import { useScrollToSection } from "@/lib/use-scroll-to-section";
import { cn } from "@/lib/utils";
import type { TrackState } from "@/types/audio";

type AudioPaginationProps = {
	currentPage: number;
	totalPages: number;
	activeType?: string | null;
	activeState?: TrackState | null;
	activeTopicId?: number | null;
	activeTag?: string | null;
	activeQuery?: string | null;
	label: string;
	previousLabel: string;
	nextLabel: string;
	scrollTargetId?: string;
	className?: string;
};

export function AudioPagination({
	currentPage,
	totalPages,
	activeType,
	activeState,
	activeTopicId,
	activeTag,
	activeQuery,
	label,
	previousLabel,
	nextLabel,
	scrollTargetId = "audio-grid",
	className,
}: AudioPaginationProps) {
	const router = useRouter();
	const [isPending, startTransition] = useTransition();
	const scrollToSection = useScrollToSection();

	const createHref = (page: number) =>
		buildAudioHref({
			type: activeType,
			state: activeState,
			topic: activeTopicId,
			tag: activeTag,
			q: activeQuery,
			page,
		});

	const handlePageChange = (page: number) => {
		startTransition(() => {
			router.replace(createHref(page), { scroll: false });

			scrollToSection(scrollTargetId);
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
