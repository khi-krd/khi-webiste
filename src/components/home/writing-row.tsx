import NextImage from "next/image";
import { Badge } from "@/components/ui/badge";
import { Link } from "@/components/ui/link";
import type { WritingItem } from "@/lib/mock/writings";
import { cn } from "@/lib/utils";

type WritingRowProps = {
	item: WritingItem;
	categoryLabel: string;
	readTimeLabel: string;
	index: number;
	className?: string;
};

export function WritingRow({
	item,
	categoryLabel,
	readTimeLabel,
	index,
	className,
}: WritingRowProps) {
	const href = `/articles/${item.slug}`;
	const displayIndex = String(index + 1).padStart(2, "0");

	return (
		<article
			className={cn(
				"border-t border-border py-16 first:border-t-0 first:pt-0 sm:py-[4.5rem] lg:py-20",
				className,
			)}
		>
			<Link
				href={href}
				variant="nav"
				className="group flex items-start gap-10 no-underline sm:gap-12 lg:gap-14"
				aria-label={item.title}
			>
				<span
					className="hidden shrink-0 pt-1 font-heading text-label tabular-nums text-muted sm:block"
					aria-hidden
				>
					{displayIndex}
				</span>

				<div className="min-w-0 flex-1 text-start">
					<Badge variant="subtle" size="sm" className="mb-4 w-fit">
						{categoryLabel}
					</Badge>
					<h3
						className={cn(
							"font-heading text-h3 font-semibold leading-[1.35] text-balance text-foreground sm:leading-[1.4]",
							"transition-[text-decoration-color] duration-300",
							"group-fine:underline group-fine:decoration-border group-fine:underline-offset-4",
							"motion-reduce:group-fine:no-underline",
						)}
					>
						{item.title}
					</h3>
					<p className="mt-4 line-clamp-2 text-lead leading-relaxed text-muted sm:mt-5">
						{item.excerpt}
					</p>
					<p className="mt-5 text-small leading-relaxed text-muted sm:mt-6">
						<span className="text-foreground/75">{item.author}</span>
						<span className="mx-2.5 text-border" aria-hidden>
							·
						</span>
						{readTimeLabel}
					</p>
				</div>

				{item.image ? (
					<div className="relative hidden size-28 shrink-0 overflow-hidden border border-border sm:block lg:size-32">
						<NextImage
							src={item.image.url}
							alt={item.image.alt ?? ""}
							fill
							sizes="(max-width: 1024px) 112px, 128px"
							className="object-cover brightness-[0.88] saturate-[0.75]"
						/>
					</div>
				) : null}
			</Link>
		</article>
	);
}
