import NextImage from "next/image";
import { Badge } from "@/components/ui/badge";
import { Link } from "@/components/ui/link";
import { cn } from "@/lib/utils";

export type WritingRowItem = {
	id: number;
	title: string;
	writer: string;
	excerpt: string;
	coverUrl: string | null;
	genreLabel: string;
	fileUrl: string | null;
};

type WritingRowProps = {
	item: WritingRowItem;
	className?: string;
};

export function WritingRow({ item, className }: WritingRowProps) {
	return (
		<article
			className={cn(
				"group h-full border border-border bg-surface transition-colors duration-300 fine-hover:border-foreground/30",
				className,
			)}
		>
			<Link
				href={`/writings/${item.id}`}
				variant="nav"
				className="flex h-full items-start gap-5 p-4 no-underline sm:gap-6 sm:p-5"
				aria-label={item.title}
			>
				{item.coverUrl ? (
					<div className="relative aspect-[4/3] w-36 shrink-0 overflow-hidden border border-border sm:w-44 lg:w-48">
						<NextImage
							src={item.coverUrl}
							alt=""
							fill
							sizes="(max-width: 640px) 144px, (max-width: 1024px) 176px, 192px"
							className="object-cover brightness-[0.9] saturate-[0.8] transition-[filter,transform] duration-500 group-fine:scale-[1.04] group-fine:brightness-100 group-fine:saturate-100"
						/>
					</div>
				) : (
					<div
						aria-hidden
						className="flex aspect-[4/3] w-36 shrink-0 items-center justify-center border border-border bg-sunken sm:w-44 lg:w-48"
					>
						<span className="font-heading text-h2 font-bold text-foreground/10">
							{item.title.charAt(0)}
						</span>
					</div>
				)}

				<div className="min-w-0 flex-1 text-start">
					<Badge variant="subtle" size="sm" className="mb-2.5 w-fit">
						{item.genreLabel}
					</Badge>
					<h3
						className={cn(
							"font-heading text-body font-semibold leading-snug text-balance text-foreground sm:text-h3 sm:leading-[1.35]",
							"transition-[text-decoration-color] duration-300",
							"group-fine:underline group-fine:decoration-border group-fine:underline-offset-4",
							"motion-reduce:group-fine:no-underline",
						)}
					>
						{item.title}
					</h3>
					{item.excerpt ? (
						<p className="mt-2 line-clamp-2 text-small leading-relaxed text-muted sm:mt-2.5">
							{item.excerpt}
						</p>
					) : null}
					{item.writer ? (
						<p className="mt-2.5 text-small leading-relaxed text-muted">
							<span className="text-foreground/75">{item.writer}</span>
						</p>
					) : null}
				</div>
			</Link>
		</article>
	);
}
