import {
	ArrowTopRightOnSquareIcon,
	MusicalNoteIcon,
	PlayIcon,
} from "@heroicons/react/24/outline";
import { cn } from "@/lib/utils";
import { MediaMark } from "@/components/ui/media-mark";
import { toCleanEmbedSrc } from "@/lib/video/source";

/**
 * Shared renderers for gallery media whose source isn't a direct file —
 * provider embeds (SoundCloud/YouTube/Spotify iframes) and external page
 * links — used by the news and project media galleries.
 */

export function MediaEmbedFrame({
	src,
	title,
	kind,
	autoplay = false,
	className,
}: {
	src: string;
	title: string;
	kind: "VIDEO" | "AUDIO";
	/** Only on surfaces reached by a click — providers honor it via autoplay=1. */
	autoplay?: boolean;
	className?: string;
}) {
	return (
		<div
			className={cn(
				"relative w-full bg-foreground",
				kind === "AUDIO" ? "h-[166px]" : "aspect-video",
				className,
			)}
		>
			<iframe
				src={toCleanEmbedSrc(src, { autoplay })}
				title={title}
				loading="lazy"
				allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
				allowFullScreen
				className="absolute inset-0 size-full border-0"
			/>
			<MediaMark className="top-0 bottom-auto z-10" />
		</div>
	);
}

export function ExternalMediaLink({
	href,
	label,
	kind,
	className,
}: {
	href: string;
	label: string;
	kind: "VIDEO" | "AUDIO";
	className?: string;
}) {
	let host = href;
	try {
		host = new URL(/^https?:\/\//i.test(href) ? href : `https://${href}`)
			.hostname;
	} catch {
		// keep raw
	}
	return (
		<a
			href={/^https?:\/\//i.test(href) ? href : `https://${href}`}
			target="_blank"
			rel="noopener noreferrer"
			className={cn(
				"flex min-h-28 w-full flex-col items-center justify-center gap-2 border border-border bg-surface p-5 text-center transition-colors fine-hover:bg-sunken",
				className,
			)}
		>
			<span className="inline-flex items-center gap-2 text-small text-muted">
				{kind === "AUDIO" ? (
					<MusicalNoteIcon className="size-4" aria-hidden />
				) : (
					<PlayIcon className="size-4" aria-hidden />
				)}
				{host}
			</span>
			<span className="inline-flex items-center gap-1.5 text-small font-medium text-foreground underline underline-offset-4">
				{label}
				<ArrowTopRightOnSquareIcon className="size-4" aria-hidden />
			</span>
		</a>
	);
}
