import { ArrowRightIcon } from "@heroicons/react/24/outline";
import { Badge } from "@/components/ui/badge";
import { DirectionalIcon } from "@/components/ui/directional-icon";
import { Link } from "@/components/ui/link";
import { newsDetailHref } from "@/lib/content/href";
import type { NewsItem } from "@/lib/mock/news";
import { cn } from "@/lib/utils";

type NewsEditorialCardProps = {
	item: NewsItem;
	categoryLabel: string;
	className?: string;
};

export function NewsEditorialCard({
	item,
	categoryLabel,
	className,
}: NewsEditorialCardProps) {
	const href = newsDetailHref(item.slug);

	return (
		<Link
			href={href}
			variant="nav"
			className={cn(
				"group flex h-full min-h-52 flex-col justify-between border border-border bg-sunken p-6 no-underline sm:p-7 lg:min-h-0",
				className,
			)}
			aria-label={item.title}
		>
			<div className="text-start">
				<Badge variant="outline" size="sm" className="mb-4 w-fit">
					{categoryLabel}
				</Badge>
				<h3
					className={cn(
						"font-heading text-h2 font-bold leading-[1.12] text-balance text-foreground",
						"transition-[text-decoration-color] duration-300",
						"group-fine:underline group-fine:decoration-border group-fine:underline-offset-4",
						"motion-reduce:group-fine:no-underline",
					)}
				>
					{item.title}
				</h3>
				<p className="mt-3 line-clamp-3 text-body leading-relaxed text-muted">
					{item.excerpt}
				</p>
			</div>

			<DirectionalIcon
				icon={ArrowRightIcon}
				className="mt-6 size-4 text-foreground/80 transition-colors group-fine:text-foreground"
			/>
		</Link>
	);
}
