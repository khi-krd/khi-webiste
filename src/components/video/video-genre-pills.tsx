"use client";

import { useSearchParams } from "next/navigation";
import { useTransition } from "react";
import { useRouter } from "@/i18n/navigation";
import { useScrollToSection } from "@/lib/use-scroll-to-section";
import { cn } from "@/lib/utils";

type VideoGenrePillsProps = {
	genres: string[];
	activeGenre: string | null;
	allLabel: string;
	/** Visible eyebrow for the row, and the filter group's accessible name. */
	label: string;
	/** Where the row lives — the active genre rides on `?genre=`. */
	basePath?: string;
	scrollTargetId?: string;
	dark?: boolean;
	className?: string;
};

function Pill({
	active,
	onClick,
	children,
	dark = false,
}: {
	active: boolean;
	onClick: () => void;
	children: React.ReactNode;
	dark?: boolean;
}) {
	return (
		<button
			type="button"
			onClick={onClick}
			aria-pressed={active}
			className={cn(
				"shrink-0 border px-3.5 py-1.5 font-heading text-small font-medium transition-[background-color,border-color,color] duration-300",
				dark
					? active
						? "border-primary-foreground bg-primary-foreground text-foreground"
						: "border-primary-foreground/20 bg-transparent text-primary-foreground/75 fine-hover:border-primary-foreground/50 fine-hover:bg-primary-foreground/10 fine-hover:text-primary-foreground"
					: active
						? "border-primary bg-primary text-primary-foreground"
						: "border-border-strong bg-background text-foreground fine-hover:border-foreground/40 fine-hover:bg-sunken",
			)}
		>
			{children}
		</button>
	);
}

/**
 * Tag row for the short-film programme. Every pill in the list stays reachable
 * whatever is selected — the genres are collected from the whole catalogue, not
 * from the filtered slice, so a chosen genre never hides the rest.
 */
export function VideoGenrePills({
	genres,
	activeGenre,
	allLabel,
	label,
	basePath = "/videos/shortfilms",
	scrollTargetId,
	dark = false,
	className,
}: VideoGenrePillsProps) {
	const router = useRouter();
	const searchParams = useSearchParams();
	const [isPending, startTransition] = useTransition();
	const scrollToSection = useScrollToSection();

	const go = (genre: string | null) => {
		// Carry the rest of the query (a topic arriving from the detail sidebar,
		// say) instead of dropping it: only the tag axis is ours to rewrite, and
		// `q` names that same axis, so it goes when a pill takes over.
		const params = new URLSearchParams(searchParams.toString());
		params.delete("q");
		if (genre) {
			params.set("genre", genre);
		} else {
			params.delete("genre");
		}
		const query = params.toString();

		startTransition(() => {
			router.replace(query ? `${basePath}?${query}` : basePath, {
				scroll: false,
			});
			if (scrollTargetId) {
				scrollToSection(scrollTargetId);
			}
		});
	};

	return (
		<fieldset
			className={cn(
				"min-w-0 border-0 p-0 transition-opacity duration-300",
				isPending && "opacity-70",
				className,
			)}
		>
			<legend className="sr-only">{label}</legend>

			<div className="flex flex-wrap items-center gap-x-3 gap-y-2">
				<span
					aria-hidden="true"
					className={cn(
						"label shrink-0",
						dark ? "text-primary-foreground/45" : "text-muted",
					)}
				>
					{label}
				</span>

				<div className="flex flex-wrap gap-2">
					<Pill active={!activeGenre} onClick={() => go(null)} dark={dark}>
						{allLabel}
					</Pill>
					{genres.map((genre) => (
						<Pill
							key={genre}
							active={activeGenre === genre}
							onClick={() => go(genre)}
							dark={dark}
						>
							{genre}
						</Pill>
					))}
				</div>
			</div>
		</fieldset>
	);
}
