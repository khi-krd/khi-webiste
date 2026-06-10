import NextImage from "next/image";
import { Link } from "@/components/ui/link";
import {
	formatNewsDate,
	type NewsItem,
} from "@/lib/mock/news";
import { cn } from "@/lib/utils";

type NewsSidebarCardProps = {
	item: NewsItem;
	categoryLabel: string;
	locale: string;
	className?: string;
};

export function NewsSidebarCard({
	item,
	categoryLabel,
	locale,
	className,
}: NewsSidebarCardProps) {
	const href = `/news/${item.slug}`;
	const dateLabel = formatNewsDate(item.publishedAt, locale);

	return (
		<article className={cn("border border-border bg-surface", className)}>
			<Link
				href={href}
				variant="nav"
				className="group flex gap-3 p-3 no-underline sm:gap-4 sm:p-4"
				aria-label={item.title}
			>
				<div className="relative size-16 shrink-0 overflow-hidden sm:size-20">
					<NextImage
						src={item.image.url}
						alt={item.image.alt ?? item.title}
						fill
						sizes="5rem"
						className="object-cover brightness-[0.85] contrast-[1.05] saturate-[0.7] transition-[filter] duration-300 group-fine:brightness-95 group-fine:saturate-80 motion-reduce:transition-none"
					/>
				</div>

				<div className="min-w-0 flex-1 text-start">
					<p className="text-label text-muted">
						<span className="text-foreground">{categoryLabel}</span>
						<span aria-hidden> · </span>
						<time dateTime={item.publishedAt}>{dateLabel}</time>
					</p>
					<h3
						className={cn(
							"mt-1 font-heading text-small font-semibold leading-snug text-balance text-foreground line-clamp-2",
							"transition-[text-decoration-color] duration-300",
							"group-fine:underline group-fine:decoration-border group-fine:underline-offset-4",
							"motion-reduce:group-fine:no-underline",
						)}
					>
						{item.title}
					</h3>
				</div>
			</Link>
		</article>
	);
}
