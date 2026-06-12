import { Link } from "@/components/ui/link";
import type { WritingCategorySlug } from "@/lib/writing/categories";
import { cn } from "@/lib/utils";

export type WritingCategoryCarouselItem = {
	slug: WritingCategorySlug;
	label: string;
	href: string;
};

type WritingCategoryCarouselProps = {
	items: WritingCategoryCarouselItem[];
	activeSlug?: WritingCategorySlug | null;
	navLabel: string;
	className?: string;
};

export function WritingCategoryCarousel({
	items,
	activeSlug,
	navLabel,
	className,
}: WritingCategoryCarouselProps) {
	return (
		<nav aria-label={navLabel} className={cn("w-full", className)}>
			<ul className="flex flex-wrap items-center gap-x-6 gap-y-2 sm:gap-x-8">
				{items.map((item) => {
					const active = activeSlug === item.slug;

					return (
						<li key={item.slug}>
							<Link
								href={item.href}
								variant="nav"
								aria-current={active ? "page" : undefined}
								className={cn(
									"font-heading text-body font-medium no-underline transition-colors",
									active
										? "text-foreground underline decoration-foreground underline-offset-4"
										: "text-muted fine-hover:text-foreground fine-hover:underline fine-hover:decoration-border fine-hover:underline-offset-4",
								)}
							>
								{item.label}
							</Link>
						</li>
					);
				})}
			</ul>
		</nav>
	);
}
