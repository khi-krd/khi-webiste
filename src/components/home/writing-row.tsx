import NextImage from "next/image";
import { Link } from "@/components/ui/link";
import { cn } from "@/lib/utils";

export type WritingRowItem = {
	id: number;
	title: string;
	writer: string;
	excerpt: string;
	coverUrl: string | null;
	genreLabel: string;
	fileUrl: string | null;
};

type WritingRowProps = {
	item: WritingRowItem;
	className?: string;
};

const imageEase = "ease-[cubic-bezier(0.25,0.46,0.45,0.94)]";

/**
 * Container-less book row for the home writings grid: cover on the start side,
 * text beside it, both flush to the top so every row hangs from the same line.
 * No border/surface box — the hover reads through the cover (lift + color) and
 * the title underline instead of a card frame.
 */
export function WritingRow({ item, className }: WritingRowProps) {
	return (
		<article className={cn("group h-full", className)}>
			{/* `w-full`: the Link base class contributes `inline-flex`, which wins
			    over `flex` in the compiled CSS order and would shrink-wrap short
			    rows — full width keeps the whole cell clickable. */}
			<Link
				href={`/writings/${item.id}`}
				variant="nav"
				className="flex h-full w-full items-start gap-4 no-underline sm:gap-5"
				aria-label={item.title}
			>
				<div
					className={cn(
						// The cover is the hover's anchor: ring sharpens and a soft ink
						// shadow lifts it off the page while the art zooms + warms.
						// Sized between the old thumbnail (w-24) and the sound-album tiles:
						// generous where the cell is wide, pulled in at lg where 4 columns
						// squeeze hardest.
						"relative aspect-3/4 w-36 shrink-0 overflow-hidden bg-sunken ring-1 ring-border/80 lg:w-28 xl:w-40 2xl:w-44",
						"transition-[box-shadow] duration-500 ease-out",
						"group-fine:ring-foreground/40 group-fine:shadow-[0_16px_32px_-16px_color-mix(in_oklch,var(--color-foreground)_50%,transparent)]",
					)}
				>
					{item.coverUrl ? (
						<div
							className={cn(
								"absolute inset-[-5%] origin-center",
								"transition-transform duration-[1.2s]",
								imageEase,
								"group-fine:scale-[1.05] motion-reduce:transition-none motion-reduce:group-fine:scale-100",
							)}
						>
							<NextImage
								src={item.coverUrl}
								alt=""
								fill
								sizes="(max-width: 1024px) 144px, (max-width: 1280px) 112px, (max-width: 1536px) 160px, 176px"
								className="object-cover brightness-[0.92] saturate-[0.85] transition-[filter] duration-500 group-fine:brightness-100 group-fine:saturate-100"
							/>
						</div>
					) : (
						<div
							aria-hidden
							className="flex h-full w-full items-center justify-center"
						>
							<span className="font-heading text-h2 font-bold text-foreground/12">
								{item.title.charAt(0)}
							</span>
						</div>
					)}
				</div>

				<div className="flex min-w-0 flex-1 flex-col text-start">
					<span className="label w-fit border border-border bg-background px-2 py-0.5 font-medium text-muted transition-colors duration-300 group-fine:border-foreground/30 group-fine:text-foreground">
						{item.genreLabel}
					</span>

					<h3
						className={cn(
							"mt-2.5 font-heading text-body font-semibold leading-snug text-balance text-foreground",
							"transition-[text-decoration-color] duration-300",
							"group-fine:underline group-fine:decoration-border group-fine:underline-offset-4",
							"motion-reduce:group-fine:no-underline",
						)}
					>
						{item.title}
					</h3>

					{item.excerpt ? (
						<p className="mt-1.5 line-clamp-2 text-small leading-relaxed text-muted">
							{item.excerpt}
						</p>
					) : null}

					{item.writer ? (
						<p className="mt-2.5 text-small text-foreground/70 transition-colors duration-300 group-fine:text-foreground">
							{item.writer}
						</p>
					) : null}
				</div>
			</Link>
		</article>
	);
}
