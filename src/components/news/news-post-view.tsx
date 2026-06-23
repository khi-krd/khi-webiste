import { ArrowLeftIcon, ArrowRightIcon } from "@heroicons/react/24/outline";
import NextImage from "next/image";
import {
	ScrollReveal,
	ScrollRevealBlock,
	ScrollRevealItem,
} from "@/components/motion/scroll-reveal";
import { Badge } from "@/components/ui/badge";
import { DirectionalIcon } from "@/components/ui/directional-icon";
import { Link } from "@/components/ui/link";
import { RichText } from "@/components/ui/rich-text";
import { newsDetailHref } from "@/lib/content/href";
import { homeInsetClass } from "@/lib/layout";
import type { NewsItem } from "@/lib/mock/news";
import { cn } from "@/lib/utils";

type NewsPostViewProps = {
	item: NewsItem;
	categoryLabel: string;
	dateLabel: string;
	backLabel: string;
	authorLabel?: string;
	readTimeLabel?: string;
	previous: NewsItem | null;
	next: NewsItem | null;
	navLabel: string;
	previousLabel: string;
	nextLabel: string;
};

function AdjacentLink({
	item,
	label,
	direction,
}: {
	item: NewsItem;
	label: string;
	direction: "previous" | "next";
}) {
	const isNext = direction === "next";

	return (
		<Link
			href={newsDetailHref(item.slug)}
			variant="nav"
			className={cn(
				"group flex flex-col gap-3 py-8 no-underline sm:py-10",
				isNext &&
					"items-end border-t border-border text-end sm:border-t-0 sm:border-s sm:ps-8",
				!isNext && "sm:pe-8",
			)}
		>
			<span className="label flex items-center gap-2 font-medium">
				<DirectionalIcon
					icon={isNext ? ArrowRightIcon : ArrowLeftIcon}
					className="size-3.5"
				/>
				{label}
			</span>
			<span className="font-heading text-h3 font-bold text-foreground underline decoration-transparent decoration-2 underline-offset-4 transition-[text-decoration-color] duration-300 group-fine:decoration-current">
				{item.title}
			</span>
		</Link>
	);
}

export function NewsPostView({
	item,
	categoryLabel,
	dateLabel,
	backLabel,
	authorLabel,
	readTimeLabel,
	previous,
	next,
	navLabel,
	previousLabel,
	nextLabel,
}: NewsPostViewProps) {
	return (
		<article className={cn(homeInsetClass, "pb-16 sm:pb-20")}>
			<ScrollReveal>
				<ScrollRevealItem>
					<header className="border-b border-border pb-8 sm:pb-10">
						<Link
							href="/news"
							variant="nav"
							className="label inline-flex items-center gap-2 font-medium text-muted no-underline"
						>
							<DirectionalIcon icon={ArrowLeftIcon} className="size-3.5" />
							{backLabel}
						</Link>

						<div className="mt-6 flex flex-wrap items-center gap-3">
							<Badge variant="outline" size="sm">
								{categoryLabel}
							</Badge>
							<p className="text-small text-muted">{dateLabel}</p>
							{readTimeLabel ? (
								<p className="text-small text-muted">{readTimeLabel}</p>
							) : null}
						</div>

						<h1 className="mt-5 max-w-4xl font-heading text-display font-bold leading-[1.05] text-balance">
							{item.title}
						</h1>

						{authorLabel ? (
							<p className="mt-4 text-body text-muted">{authorLabel}</p>
						) : null}
					</header>
				</ScrollRevealItem>

				<ScrollRevealItem>
					<div className="relative mt-8 aspect-[16/9] overflow-hidden border border-border bg-sunken sm:mt-10">
						<NextImage
							src={item.image.url}
							alt={item.image.alt ?? item.title}
							fill
							sizes="(max-width: 1024px) 100vw, 960px"
							className="object-cover"
							priority
						/>
					</div>
				</ScrollRevealItem>

				<ScrollRevealItem>
					<div className="mx-auto mt-8 max-w-3xl text-start sm:mt-10">
						{item.description ? (
							<RichText
								content={item.description}
								className="text-body leading-relaxed text-foreground"
							/>
						) : (
							<p className="text-body leading-relaxed text-foreground">
								{item.excerpt}
							</p>
						)}
					</div>
				</ScrollRevealItem>
			</ScrollReveal>

			{previous || next ? (
				<ScrollRevealBlock>
					<nav
						aria-label={navLabel}
						className="mt-12 grid border-t border-border sm:mt-16 sm:grid-cols-2"
					>
						{previous ? (
							<AdjacentLink
								item={previous}
								label={previousLabel}
								direction="previous"
							/>
						) : (
							<div className="hidden sm:block" />
						)}
						{next ? (
							<AdjacentLink item={next} label={nextLabel} direction="next" />
						) : null}
					</nav>
				</ScrollRevealBlock>
			) : null}
		</article>
	);
}
