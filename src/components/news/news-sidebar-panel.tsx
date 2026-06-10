import { NewsSidebarCard } from "@/components/news/news-sidebar-card";
import type { NewsCategory, NewsItem } from "@/lib/mock/news";
import { cn } from "@/lib/utils";

type NewsSidebarPanelProps = {
	title: string;
	items: NewsItem[];
	locale: string;
	categoryLabels: Record<NewsCategory, string>;
	className?: string;
};

export function NewsSidebarPanel({
	title,
	items,
	locale,
	categoryLabels,
	className,
}: NewsSidebarPanelProps) {
	return (
		<div className={cn("text-start", className)}>
			<h3 className="font-heading text-h3 font-bold">{title}</h3>

			<ul className="mt-4 flex flex-col gap-3">
				{items.map((item) => (
					<li key={item.id}>
						<NewsSidebarCard
							item={item}
							categoryLabel={categoryLabels[item.category]}
							locale={locale}
						/>
					</li>
				))}
			</ul>
		</div>
	);
}
