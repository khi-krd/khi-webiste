"use client";

import { useTransition } from "react";
import { useRouter } from "@/i18n/navigation";
import { homeInsetClass } from "@/lib/layout";
import { cn } from "@/lib/utils";

type VideoGenrePillsProps = {
	genres: string[];
	activeGenre: string | null;
	allLabel: string;
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
				"shrink-0 border px-4 py-2 font-heading text-small font-medium transition-colors",
				dark
					? active
						? "border-primary-foreground bg-primary-foreground text-foreground"
						: "border-primary-foreground/20 bg-primary-foreground/10 text-primary-foreground fine-hover:border-primary-foreground/40 fine-hover:bg-primary-foreground/15"
					: active
						? "border-foreground bg-primary text-primary-foreground"
						: "border-border-strong bg-background text-foreground fine-hover:border-foreground/40 fine-hover:bg-sunken",
			)}
		>
			{children}
		</button>
	);
}

export function VideoGenrePills({
	genres,
	activeGenre,
	allLabel,
	basePath = "/videos/shortfilms",
	scrollTargetId,
	dark = false,
	className,
}: VideoGenrePillsProps) {
	const router = useRouter();
	const [isPending, startTransition] = useTransition();

	const go = (genre: string | null) => {
		startTransition(() => {
			const href = genre
				? `${basePath}?genre=${encodeURIComponent(genre)}`
				: basePath;
			router.replace(href, { scroll: false });
			if (scrollTargetId) {
				document.getElementById(scrollTargetId)?.scrollIntoView({
					behavior: "smooth",
					block: "start",
				});
			}
		});
	};

	return (
		<div
			className={cn(
				homeInsetClass,
				"flex flex-wrap gap-2.5 transition-opacity",
				isPending && "opacity-80",
				className,
			)}
		>
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
	);
}
