import {
	DocumentTextIcon,
	FilmIcon,
	MusicalNoteIcon,
	PaperClipIcon,
	PhotoIcon,
} from "@heroicons/react/24/outline";
import { Badge } from "@/components/ui/badge";
import { formatFileSize } from "@/lib/audio/format";
import type { AttachmentType, SoundAttachment } from "@/types/audio";

const typeIcons: Record<
	AttachmentType,
	React.ComponentType<React.ComponentProps<"svg">>
> = {
	PDF: DocumentTextIcon,
	VIDEO: FilmIcon,
	IMAGE: PhotoIcon,
	AUDIO: MusicalNoteIcon,
	OTHER: PaperClipIcon,
};

type AudioAttachmentsProps = {
	title: string;
	attachments: SoundAttachment[];
	untitledLabel: string;
	typeLabels: Record<AttachmentType, string>;
};

/** Companion files (PDFs, clips) listed for reference — no download offered. */
export function AudioAttachments({
	title,
	attachments,
	untitledLabel,
	typeLabels,
}: AudioAttachmentsProps) {
	if (attachments.length === 0) {
		return null;
	}

	return (
		<section aria-label={title}>
			<h2 className="font-heading text-h3 font-bold">{title}</h2>

			<ul className="mt-5 border border-border bg-surface">
				{attachments.map((attachment, index) => {
					const Icon = typeIcons[attachment.attachmentType];
					const sizeLabel = formatFileSize(attachment.sizeBytes ?? null);

					return (
						<li
							key={attachment.id}
							className={index > 0 ? "border-t border-border" : undefined}
						>
							<div className="flex items-center gap-3 px-4 py-3.5 sm:gap-4 sm:px-5">
								<span
									aria-hidden
									className="inline-flex size-9 shrink-0 items-center justify-center border border-border text-muted"
								>
									<Icon className="size-4" />
								</span>

								<div className="min-w-0 flex-1">
									<p className="truncate text-small font-medium text-foreground">
										{attachment.title?.trim() || untitledLabel}
									</p>
									<p className="mt-0.5 flex flex-wrap items-center gap-x-2 text-label text-muted">
										<span>{typeLabels[attachment.attachmentType]}</span>
										{sizeLabel ? <span>· {sizeLabel}</span> : null}
										{attachment.mimeType ? (
											<span className="hidden sm:inline">
												· {attachment.mimeType}
											</span>
										) : null}
									</p>
								</div>

								<Badge variant="outline" size="sm">
									{attachment.attachmentType}
								</Badge>
							</div>
						</li>
					);
				})}
			</ul>
		</section>
	);
}
