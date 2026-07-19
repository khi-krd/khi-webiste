import NextImage from "next/image";
import { Link } from "@/components/ui/link";
import { cn } from "@/lib/utils";

export type WritingGridCardProps = {
	id: number;
	title: string;
	writer: string;
	coverUrl: string | null;
	seriesName: string | null;
	topicName: string | null;
	fileUrl: string | null;
	className?: string;
};

function CoverImage({ src, alt }: { src: string; alt: string }) {
	return (
		<NextImage
			src={src}
			alt={alt}
			fill
			sizes="(max-width: 640px) 50vw, (max-width: 1280px) 25vw, 20vw"
			className="object-cover brightness-[0.94] saturate-[0.88] transition-[filter,transform] duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-fine:scale-[1.04] group-fine:brightness-100 group-fine:saturate-100"
		/>
	);
}

export function WritingGridCard({
	id,
	title,
	writer,
	coverUrl,
	seriesName,
	topicName,
	className,
}: WritingGridCardProps) {
	const subtitle = seriesName ?? topicName;

	return (
		<article
			className={cn(
				"group flex h-full w-full flex-col overflow-hidden border border-border bg-surface transition-colors duration-300 fine-hover:border-foreground/30",
				className,
			)}
		>
			<Link
				href={`/writings/${id}`}
				variant="nav"
				className="flex h-full flex-col no-underline text-inherit"
			>
				<div className="relative aspect-[4/3] w-full overflow-hidden bg-sunken">
					{coverUrl ? (
						<CoverImage src={coverUrl} alt="" />
					) : (
						<div
							aria-hidden
							className="flex h-full w-full items-center justify-center bg-sunken"
						>
							<span className="font-heading text-h1 font-bold text-foreground/10">
								{title.charAt(0)}
							</span>
						</div>
					)}
				</div>

				<div className="flex flex-1 flex-col gap-1.5 px-4 py-4 sm:px-5 sm:py-5">
					<h3 className="font-heading text-h3 font-bold leading-snug text-balance">
						{title}
					</h3>
					{subtitle ? (
						<p className="text-small italic text-muted">{subtitle}</p>
					) : null}
					{writer ? (
						<p className="text-small text-foreground/80">{writer}</p>
					) : null}
				</div>
			</Link>
		</article>
	);
}
