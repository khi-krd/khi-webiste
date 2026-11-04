import NextImage from "next/image";
import { Badge } from "@/components/ui/badge";
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
	/** Small chip over the cover's inline-start corner — e.g. "٢ لە ٥" volume. */
	badgeLabel?: string | null;
	/** Chip over the cover's inline-end corner marking the open record. */
	currentLabel?: string | null;
	/** The record the page already shows — card renders non-linked, highlighted. */
	isCurrent?: boolean;
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

function CardBody({
	title,
	writer,
	coverUrl,
	hoverCoverUrl,
	badgeLabel,
	currentLabel,
}: Pick<
	WritingGridCardProps,
	| "title"
	| "writer"
	| "coverUrl"
	| "hoverCoverUrl"
	| "badgeLabel"
	| "currentLabel"
>) {
	return (
		<>
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
				{badgeLabel ? (
					<Badge
						variant="subtle"
						size="sm"
						className="absolute start-2 top-2 bg-surface/95 shadow-sm ring-1 ring-border"
					>
						{badgeLabel}
					</Badge>
				) : null}
				{currentLabel ? (
					<Badge
						variant="solid"
						size="sm"
						className="absolute end-2 top-2 shadow-sm"
					>
						{currentLabel}
					</Badge>
				) : null}
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
		</>
	);
}

export function WritingGridCard({
	id,
	title,
	writer,
	coverUrl,
	hoverCoverUrl,
	badgeLabel,
	currentLabel,
	isCurrent,
	className,
}: WritingGridCardProps) {
	return (
		<article
			className={cn(
				"group flex h-full w-full flex-col overflow-hidden border bg-surface transition-colors duration-300 fine-hover:border-foreground/30",
				isCurrent ? "border-foreground/40" : "border-border",
				className,
			)}
		>
			{isCurrent ? (
				<div className="flex h-full flex-col items-stretch">
					<CardBody
						title={title}
						writer={writer}
						coverUrl={coverUrl}
						hoverCoverUrl={hoverCoverUrl}
						badgeLabel={badgeLabel}
						currentLabel={currentLabel}
					/>
				</div>
			) : (
				<Link
					href={`/writings/${id}`}
					variant="nav"
					className="flex h-full flex-col items-stretch no-underline text-inherit"
				>
					<CardBody
						title={title}
						writer={writer}
						coverUrl={coverUrl}
						hoverCoverUrl={hoverCoverUrl}
						badgeLabel={badgeLabel}
						currentLabel={currentLabel}
					/>
				</Link>
			)}
		</article>
	);
}
