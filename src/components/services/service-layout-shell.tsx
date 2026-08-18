import type { ReactNode } from "react";
import { ServiceSectionProse } from "@/components/services/service-section-prose";
import { cn } from "@/lib/utils";

type ServiceLayoutShellProps = {
	id: string;
	title: string;
	body: string;
	/** Omitted when the CMS holds no media — the section is then text only. */
	media?: ReactNode;
	mediaClassName?: string;
};

export function ServiceLayoutShell({
	id,
	title,
	body,
	media,
	mediaClassName,
}: ServiceLayoutShellProps) {
	return (
		<>
			<ServiceSectionProse id={id} title={title} body={body} />

			{media ? (
				<div className={cn("mt-6 sm:mt-8", mediaClassName)}>{media}</div>
			) : null}
		</>
	);
}
