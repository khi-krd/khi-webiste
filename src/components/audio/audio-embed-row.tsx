"use client";

import { MusicalNoteIcon } from "@heroicons/react/24/outline";
import { createContext, type ReactNode, useContext, useState } from "react";
import { cn } from "@/lib/utils";
import { toCleanEmbedSrc } from "@/lib/video/source";

/**
 * Expandable embed player for a tracklist row whose source is a provider
 * player URL (SoundCloud widget, Spotify embed, …) rather than a file the
 * site player can stream. `AudioEmbedRow` owns the open state;
 * `EmbedToggleButton` (in the jacket) flips it and `EmbedPanel` (below the
 * row) renders the iframe.
 */

const EmbedRowContext = createContext<{
	open: boolean;
	toggle: () => void;
} | null>(null);

export function AudioEmbedRow({ children }: { children: ReactNode }) {
	const [open, setOpen] = useState(false);
	return (
		<EmbedRowContext.Provider
			value={{ open, toggle: () => setOpen((v) => !v) }}
		>
			{children}
		</EmbedRowContext.Provider>
	);
}

export function EmbedToggleButton({
	ariaLabel,
	className,
}: {
	ariaLabel: string;
	className?: string;
}) {
	const ctx = useContext(EmbedRowContext);
	if (!ctx) return null;
	return (
		<button
			type="button"
			onClick={ctx.toggle}
			aria-label={ariaLabel}
			aria-expanded={ctx.open}
			className={cn(
				"absolute inset-0 inline-flex items-center justify-center bg-primary/30 text-white transition-colors fine-hover:bg-primary/50 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-ring",
				className,
			)}
		>
			<MusicalNoteIcon
				aria-hidden
				className="size-8 drop-shadow-[0_1px_4px_rgba(0,0,0,0.45)]"
			/>
		</button>
	);
}

export function EmbedPanel({ src, title }: { src: string; title: string }) {
	const ctx = useContext(EmbedRowContext);
	if (!ctx?.open) return null;
	return (
		<iframe
			src={toCleanEmbedSrc(src, { autoplay: true })}
			title={title}
			loading="lazy"
			allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
			className="mt-3 h-[166px] w-full border-0 bg-sunken"
		/>
	);
}
