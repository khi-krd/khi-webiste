"use client";

import {
	ArrowTopRightOnSquareIcon,
	MapPinIcon,
} from "@heroicons/react/24/outline";
import { Prose } from "@/components/ui/prose";
import { VisuallyHidden } from "@/components/ui/visually-hidden";
import type { ContactOffice, OfficeId } from "@/lib/contact/office";
import { formatCoordinates } from "@/lib/contact/office";
import { cn } from "@/lib/utils";

export type MapOfficeOption = {
	id: OfficeId;
	label: string;
};

type ContactMapProps = {
	office: ContactOffice;
	heading: string;
	body: string;
	/**
	 * Sanitized CMS rich text (Tiptap HTML) — when set it replaces `body` and
	 * keeps the editor's bold/highlight/color/spacing intact on the green
	 * panel. Already run through renderRichText on the server.
	 */
	bodyHtml?: string;
	openInMapsLabel: string;
	iframeTitle: string;
	/** Rendered only when there is more than one office to switch between. */
	options: MapOfficeOption[];
	selectOfficeLabel: string;
	onSelect: (id: OfficeId) => void;
	className?: string;
};

export function ContactMap({
	office,
	heading,
	body,
	bodyHtml,
	openInMapsLabel,
	iframeTitle,
	options,
	selectOfficeLabel,
	onSelect,
	className,
}: ContactMapProps) {
	const coordinates = office.hasCoordinates
		? formatCoordinates(office.coordinates.lat, office.coordinates.lng)
		: null;

	return (
		<div
			className={cn(
				"grid overflow-hidden border border-border bg-surface lg:grid-cols-[1.2fr_0.8fr]",
				className,
			)}
		>
			<div className="relative min-h-72 overflow-hidden sm:min-h-96 lg:min-h-[28rem]">
				{/* Full color — the earlier grayscale wash hid map detail. */}
				<div className="absolute inset-0">
					{office.mapEmbedUrl ? (
						<iframe
							key={office.id}
							title={iframeTitle}
							src={office.mapEmbedUrl}
							loading="lazy"
							referrerPolicy="strict-origin-when-cross-origin"
							className="h-full w-full border-0"
							allowFullScreen
						/>
					) : (
						<div className="flex h-full w-full items-center justify-center bg-sunken">
							<MapPinIcon className="size-10 text-muted" aria-hidden />
						</div>
					)}
				</div>
			</div>

			{/* The institute green, not ink: this panel is the one large brand
			    surface on the page, so white text sits on --color-primary (7.6:1). */}
			<div className="flex flex-col justify-between bg-primary p-8 text-primary-foreground sm:p-10 lg:p-12">
				<div className="text-start">
					{options.length > 1 ? (
						<fieldset className="mb-8 flex flex-wrap gap-2 border-0 p-0">
							<VisuallyHidden as="legend">{selectOfficeLabel}</VisuallyHidden>
							{options.map((option) => {
								const isActive = option.id === office.id;
								return (
									<button
										key={option.id}
										type="button"
										onClick={() => onSelect(option.id)}
										aria-pressed={isActive}
										className={cn(
											"border px-4 py-2 text-small font-medium transition-colors",
											isActive
												? "border-primary-foreground bg-primary-foreground text-primary"
												: "border-primary-foreground/35 text-primary-foreground fine-hover:border-primary-foreground fine-hover:bg-primary-foreground/10",
										)}
									>
										{option.label}
									</button>
								);
							})}
						</fieldset>
					) : null}

					<h3 className="font-heading text-h2 font-semibold leading-[1.12] text-balance">
						{heading}
					</h3>
					{bodyHtml ? (
						// Editor-authored markup on the brand-green panel: prose
						// tokens retinted to primary-foreground so links,
						// strong, blockquotes and markers stay readable.
						<Prose
							className="mt-4 max-w-sm text-primary-foreground/75 leading-relaxed [&_:is(h1,h2,h3,h4,h5,h6)]:font-semibold [&_:is(h1,h2,h3,h4,h5,h6)]:text-primary-foreground [&_a]:text-primary-foreground [&_a]:decoration-primary-foreground/40 fine-hover:[&_a]:decoration-primary-foreground [&_blockquote]:border-primary-foreground/30 [&_blockquote]:text-primary-foreground/70 [&_code]:bg-primary-foreground/10 [&_code]:text-primary-foreground [&_figcaption]:text-primary-foreground/60 [&_hr]:border-primary-foreground/25 [&_li::marker]:text-primary-foreground/60 [&_strong]:text-primary-foreground"
							// biome-ignore lint/security/noDangerouslySetInnerHtml: bodyHtml is sanitized by renderRichText during resolve (sanitize-html allowlist) — never raw CMS markup.
							dangerouslySetInnerHTML={{ __html: bodyHtml }}
						/>
					) : (
						<p className="mt-4 max-w-sm text-body leading-relaxed text-primary-foreground/75">
							{body}
						</p>
					)}
					{coordinates ? (
						<p
							className="mt-8 font-mono text-lead tabular-nums text-primary-foreground"
							dir="ltr"
						>
							{coordinates}
						</p>
					) : null}
				</div>

				{office.mapLinkUrl ? (
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
				) : null}
			</div>
		</div>
	);
}
