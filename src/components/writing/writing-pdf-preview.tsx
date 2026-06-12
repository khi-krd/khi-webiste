"use client";

import dynamic from "next/dynamic";
import { Spinner } from "@/components/ui/spinner";
import type { WritingFileOffer } from "@/types/writing";

const WritingPdfViewer = dynamic(
	() =>
		import("@/components/writing/writing-pdf-viewer").then(
			(mod) => mod.WritingPdfViewer,
		),
	{
		ssr: false,
		loading: () => (
			<div className="flex min-h-64 items-center justify-center border border-border bg-background sm:min-h-80">
				<Spinner size="lg" />
			</div>
		),
	},
);

type WritingPdfPreviewProps = {
	fileOffers: WritingFileOffer[];
	locale: string;
	title: string;
	coverUrl?: string | null;
};

export function WritingPdfPreview(props: WritingPdfPreviewProps) {
	return <WritingPdfViewer {...props} />;
}
