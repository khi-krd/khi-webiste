import { ArticleSidebarCard } from "@/components/articles/article-sidebar-card";
import type { ArticleCategory, ArticleItem } from "@/lib/mock/articles";
import { cn } from "@/lib/utils";

type ArticlesSidebarPanelProps = {
	title: string;
	items: ArticleItem[];
	locale: string;
	categoryLabels: Record<ArticleCategory, string>;
	className?: string;
};

export function ArticlesSidebarPanel({
	title,
	items,
	locale,
	categoryLabels,
	className,
}: ArticlesSidebarPanelProps) {
	return (
		<div className={cn("text-start", className)}>
			<h3 className="font-heading text-h3 font-bold">{title}</h3>

			<ul className="mt-4 flex flex-col gap-3">
				{items.map((item) => (
					<li key={item.id}>
						<ArticleSidebarCard
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
