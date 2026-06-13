import { ArrowRightIcon } from "@heroicons/react/24/outline";
import { DirectionalIcon } from "@/components/ui/directional-icon";
import { Link } from "@/components/ui/link";
import {
	VideoPosterCard,
	type VideoPosterCardProps,
} from "@/components/video/video-poster-card";
import { homeInsetClass } from "@/lib/layout";
import { cn } from "@/lib/utils";

type VideoPosterRailProps = {
	id?: string;
	title: string;
	cards: VideoPosterCardProps[];
	seeMoreHref?: string;
	seeMoreLabel?: string;
	emptyLabel?: string;
	/** Per-card track width — the row scrolls horizontally. */
	cardWidthClass?: string;
	dark?: boolean;
	className?: string;
};

export function VideoPosterRail({
	id,
	title,
	cards,
	seeMoreHref,
	seeMoreLabel,
	emptyLabel,
	cardWidthClass = "w-40 sm:w-44 lg:w-48",
	dark = false,
	className,
}: VideoPosterRailProps) {
	return (
		<section id={id} className={cn("w-full", className)}>
			<div
				className={cn(homeInsetClass, "flex items-end justify-between gap-4")}
			>
				<h2
					className={cn(
						"font-heading text-h2 font-bold leading-tight text-balance",
						dark && "text-primary-foreground",
					)}
				>
					{title}
				</h2>
				{seeMoreHref && seeMoreLabel ? (
					<Link
						href={seeMoreHref}
						variant="nav"
						className={cn(
							"group inline-flex shrink-0 items-center gap-1.5 font-heading text-small font-medium no-underline transition-colors",
							dark
								? "text-primary-foreground/60 fine-hover:text-primary-foreground"
								: "text-muted fine-hover:text-foreground",
						)}
					>
						<span>{seeMoreLabel}</span>
						<DirectionalIcon
							icon={ArrowRightIcon}
							className="size-4 transition-transform duration-300 group-fine:translate-x-0.5"
						/>
					</Link>
				) : null}
			</div>

			{cards.length === 0 ? (
				emptyLabel ? (
					<div className={cn(homeInsetClass, "mt-5")}>
						<div className="border border-border bg-surface px-6 py-10 text-center">
							<p className="text-body text-muted">{emptyLabel}</p>
						</div>
					</div>
				) : null
			) : (
				<div
					className={cn(
						homeInsetClass,
						"mt-5 flex gap-3 overflow-x-auto pb-3 sm:gap-4",
					)}
				>
					{cards.map((card) => (
						<div key={card.id} className={cn("shrink-0", cardWidthClass)}>
							<VideoPosterCard {...card} />
						</div>
					))}
				</div>
			)}
		</section>
	);
}
