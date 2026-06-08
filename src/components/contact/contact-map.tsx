"use client";

import { ArrowTopRightOnSquareIcon } from "@heroicons/react/24/outline";
import type { ContactOffice } from "@/lib/mock/contact";
import { formatCoordinates } from "@/lib/mock/contact";
import { cn } from "@/lib/utils";

type ContactMapProps = {
	office: ContactOffice;
	heading: string;
	body: string;
	openInMapsLabel: string;
	iframeTitle: string;
	className?: string;
};

export function ContactMap({
	office,
	heading,
	body,
	openInMapsLabel,
	iframeTitle,
	className,
}: ContactMapProps) {
	const coordinates = formatCoordinates(
		office.coordinates.lat,
		office.coordinates.lng,
	);

	return (
		<div
			className={cn(
				"grid overflow-hidden border border-border bg-surface lg:grid-cols-[1.2fr_0.8fr]",
				className,
			)}
		>
			<div className="relative min-h-72 overflow-hidden sm:min-h-96 lg:min-h-[26rem]">
				<div className="absolute inset-0 grayscale contrast-[1.04]">
					<iframe
						key={office.id}
						title={iframeTitle}
						src={office.mapEmbedUrl}
						loading="lazy"
						referrerPolicy="no-referrer-when-downgrade"
						className="h-full w-full border-0"
						allowFullScreen
					/>
				</div>
			</div>

			<div className="flex flex-col justify-between bg-foreground p-8 text-primary-foreground sm:p-10 lg:p-12">
				<div className="text-start">
					<h3 className="font-heading text-h2 font-semibold leading-[1.12] text-balance">
						{heading}
					</h3>
					<p className="mt-4 max-w-sm text-body leading-relaxed text-primary-foreground/72">
						{body}
					</p>
					<p
						className="mt-8 font-mono text-lead tabular-nums text-primary-foreground"
						dir="ltr"
					>
						{coordinates}
					</p>
				</div>

				<a
					href={office.mapLinkUrl}
					target="_blank"
					rel="noreferrer"
					className="group/maps mt-10 inline-flex w-fit items-center gap-2.5 border border-primary-foreground/35 px-5 py-3 text-small font-medium text-primary-foreground no-underline transition-colors fine-hover:border-primary-foreground fine-hover:bg-primary-foreground/10"
				>
					{openInMapsLabel}
					<ArrowTopRightOnSquareIcon
						className="size-4 shrink-0 transition-transform fine-hover:-translate-y-0.5 fine-hover:translate-x-0.5"
						aria-hidden
					/>
				</a>
			</div>
		</div>
	);
}
