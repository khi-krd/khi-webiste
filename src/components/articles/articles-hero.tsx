import { homeInsetClass } from "@/lib/layout";
import { cn } from "@/lib/utils";

type ArticlesHeroProps = {
	eyebrow: string;
	title: string;
	description: string;
	className?: string;
};

export function ArticlesHero({
	eyebrow,
	title,
	description,
	className,
}: ArticlesHeroProps) {
	return (
		<section
			aria-labelledby="articles-hero-heading"
			className={cn(
				"relative w-full overflow-hidden border-b border-border bg-background",
				className,
			)}
		>
			<header
				className={cn(
					homeInsetClass,
					"pt-12 pb-12 sm:pt-16 sm:pb-14 lg:pt-20 lg:pb-16",
				)}
			>
				<div className="max-w-3xl text-start">
					<p className="label font-medium">{eyebrow}</p>
					<h1
						id="articles-hero-heading"
						className="mt-2 font-heading text-h1 font-bold leading-[1.1] text-balance sm:text-display sm:leading-[1.08]"
					>
						{title}
					</h1>
					<p className="mt-3 max-w-2xl text-body text-muted sm:mt-4 sm:text-lead sm:leading-relaxed">
						{description}
					</p>
				</div>
			</header>
		</section>
	);
}
