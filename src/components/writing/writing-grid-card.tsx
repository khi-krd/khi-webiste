import NextImage from "next/image";
import { HoverCover } from "@/components/ui/hover-cover";
import { Link } from "@/components/ui/link";
import { cn } from "@/lib/utils";

export type WritingGridCardProps = {
	id: number;
	title: string;
	writer: string;
	coverUrl: string | null;
	hoverCoverUrl: string | null;
	fileUrl: string | null;
	className?: string;
};

function CoverImage({
	src,
	alt,
	fadeOnHover,
}: {
	src: string;
	alt: string;
	fadeOnHover: boolean;
}) {
	return (
		<NextImage
			src={src}
			alt={alt}
			fill
			sizes="(max-width: 640px) 50vw, (max-width: 1280px) 25vw, 20vw"
			className={cn(
				"object-cover brightness-[0.94] saturate-[0.88] transition-[filter,transform,opacity] duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-fine:scale-[1.04] group-fine:brightness-100 group-fine:saturate-100",
				fadeOnHover && "group-fine:opacity-0",
			)}
		/>
	);
}

export function WritingGridCard({
	id,
	title,
	writer,
	coverUrl,
	hoverCoverUrl,
	className,
}: WritingGridCardProps) {
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
				className="flex h-full flex-col items-stretch no-underline text-inherit"
			>
				<div className="relative aspect-[4/3] w-full overflow-hidden bg-sunken">
					{coverUrl ? (
						<CoverImage
							src={coverUrl}
							alt=""
							fadeOnHover={Boolean(hoverCoverUrl && hoverCoverUrl !== coverUrl)}
						/>
					) : null}
					<HoverCover
						src={hoverCoverUrl}
						coverSrc={coverUrl}
						sizes="(max-width: 640px) 50vw, (max-width: 1280px) 25vw, 20vw"
					/>
					{coverUrl ? null : (
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

				<div className="flex-1 space-y-1 px-4 py-3 sm:px-5 sm:py-3.5">
					<h3
						title={title}
						className="line-clamp-2 w-full min-w-0 text-start font-heading text-h3 font-bold leading-snug"
					>
						{title}
					</h3>
					{writer ? (
						<p className="w-full text-start text-small text-foreground/80">
							{writer}
						</p>
					) : null}
				</div>
			</Link>
		</article>
	);
}
