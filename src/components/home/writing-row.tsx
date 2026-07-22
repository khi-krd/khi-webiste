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

export function WritingRow({ item, className }: WritingRowProps) {
	return (
		<article
			className={cn(
				"group h-full overflow-hidden rounded-md border border-border bg-surface",
				"transition-[border-color,background-color] duration-300",
				"fine-hover:border-foreground/25 fine-hover:bg-sunken/40",
				className,
			)}
		>
			<Link
				href={`/writings/${item.id}`}
				variant="nav"
				className="flex h-full items-stretch gap-4 p-3.5 no-underline sm:gap-5 sm:p-4"
				aria-label={item.title}
			>
				<div className="relative aspect-3/4 w-24 shrink-0 overflow-hidden rounded-sm bg-sunken ring-1 ring-border/80 sm:w-28 lg:w-32">
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
								sizes="(max-width: 640px) 96px, (max-width: 1024px) 112px, 128px"
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

				<div className="flex min-w-0 flex-1 flex-col justify-center text-start">
					<span className="label w-fit border border-border bg-background px-2 py-0.5 font-medium text-muted">
						{item.genreLabel}
					</span>

					<h3
						className={cn(
							"mt-2.5 font-heading text-body font-semibold leading-snug text-balance text-foreground sm:text-h3 sm:leading-[1.3]",
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
						<p className="mt-2.5 text-small text-foreground/70">{item.writer}</p>
					) : null}
				</div>
			</Link>
		</article>
	);
}
