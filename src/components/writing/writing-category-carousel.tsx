import {
	ScrollReveal,
	ScrollRevealItem,
} from "@/components/motion/scroll-reveal";
import { Link } from "@/components/ui/link";
import { cn } from "@/lib/utils";
import type { WritingCategorySlug } from "@/lib/writing/categories";

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
			<ScrollReveal className="flex flex-wrap items-center gap-x-6 gap-y-2 sm:gap-x-8">
				{items.map((item) => {
					const active = activeSlug === item.slug;

					return (
						<ScrollRevealItem key={item.slug}>
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
						</ScrollRevealItem>
					);
				})}
			</ScrollReveal>
		</nav>
	);
}
