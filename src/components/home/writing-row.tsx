import NextImage from "next/image";
import { Badge } from "@/components/ui/badge";
import { Link } from "@/components/ui/link";
import type { WritingItem } from "@/lib/mock/writings";
import { cn } from "@/lib/utils";

type WritingRowProps = {
	item: WritingItem;
	categoryLabel: string;
	readTimeLabel: string;
	className?: string;
};

export function WritingRow({
	item,
	categoryLabel,
	readTimeLabel,
	className,
}: WritingRowProps) {
	const href = `/articles/${item.slug}`;

	return (
		<article
			className={cn("py-8 first:pt-0 last:pb-0 sm:py-9 lg:py-10", className)}
		>
			<Link
				href={href}
				variant="nav"
				className="group flex items-start gap-5 no-underline sm:gap-6 lg:gap-8"
				aria-label={item.title}
			>
				<div className="min-w-0 flex-1 text-start">
					<Badge variant="subtle" size="sm" className="mb-3 w-fit">
						{categoryLabel}
					</Badge>
					<h3
						className={cn(
							"font-heading text-h3 font-semibold leading-[1.35] text-balance text-foreground sm:leading-[1.4]",
							"transition-[text-decoration-color] duration-300",
							"fine-group-hover:underline fine-group-hover:decoration-border fine-group-hover:underline-offset-4",
							"motion-reduce:fine-group-hover:no-underline",
						)}
					>
						{item.title}
					</h3>
					<p className="mt-3 line-clamp-2 text-small leading-relaxed text-muted sm:mt-4 sm:text-body">
						{item.excerpt}
					</p>
					<p className="mt-4 text-small leading-relaxed text-muted sm:mt-5">
						<span className="text-foreground/75">{item.author}</span>
						<span className="mx-2.5 text-border" aria-hidden>
							·
						</span>
						{readTimeLabel}
					</p>
				</div>

				{item.image ? (
					<div className="relative hidden size-20 shrink-0 overflow-hidden border border-border sm:block lg:size-24">
						<NextImage
							src={item.image.url}
							alt={item.image.alt ?? ""}
							fill
							sizes="(max-width: 1024px) 80px, 96px"
							className="object-cover brightness-[0.88] saturate-[0.75]"
						/>
					</div>
				) : null}
			</Link>
		</article>
	);
}
