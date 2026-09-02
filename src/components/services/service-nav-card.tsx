import { ArrowRightIcon } from "@heroicons/react/24/outline";
import NextImage from "next/image";
import { DirectionalIcon } from "@/components/ui/directional-icon";
import type { ServiceItem } from "@/lib/mock/services";
import { cn } from "@/lib/utils";

const imageEase = "ease-[cubic-bezier(0.25,0.46,0.45,0.94)]";

type ServiceNavCardProps = {
	service: ServiceItem;
	title: string;
	className?: string;
};

export function ServiceNavCard({
	service,
	title,
	className,
}: ServiceNavCardProps) {
	const imageSrc = service.video.poster ?? service.featureImage.url;
	const imageAlt = service.featureImage.alt ?? title;

	return (
		<article
			className={cn(
				"group relative aspect-[3/4] min-h-64 w-[42vw] shrink-0 overflow-hidden border border-white/25 sm:min-h-72 sm:w-[28vw] lg:min-h-80 lg:w-[18vw]",
				className,
			)}
		>
			<div className="absolute inset-0 isolate overflow-hidden">
				<div
					className={cn(
						"absolute -inset-[5%] origin-center",
						"transition-transform duration-[1.35s]",
						imageEase,
						"group-fine:scale-[1.06] motion-reduce:transition-none motion-reduce:duration-0 motion-reduce:group-fine:scale-100",
					)}
				>
					<NextImage
						src={imageSrc}
						alt={imageAlt}
						fill
						sizes="(max-width: 640px) 42vw, (max-width: 1024px) 28vw, 18vw"
						className={cn(
							"object-cover brightness-[0.78] contrast-[1.1] saturate-[0.65]",
							"transition-[filter] duration-[1.35s]",
							imageEase,
							"group-fine:brightness-[0.88] group-fine:saturate-[0.8] motion-reduce:transition-none",
						)}
						draggable={false}
					/>
				</div>

				<div
					className="pointer-events-none absolute inset-0 z-1 bg-foreground/22"
					aria-hidden
				/>
				<div
					className="pointer-events-none absolute inset-0 z-1 bg-linear-to-t from-foreground/50 from-0% via-foreground/25 via-38% to-transparent to-78%"
					aria-hidden
				/>
			</div>

			<div className="pointer-events-none relative z-10 flex h-full flex-col justify-between p-3 sm:p-4">
				<span
					className="ms-auto inline-flex size-8 items-center justify-center border border-primary-foreground/25 bg-primary text-primary-foreground transition-opacity duration-300 group-fine:opacity-90 motion-reduce:transition-none sm:size-9"
					aria-hidden
				>
					<DirectionalIcon
						icon={ArrowRightIcon}
						className="size-3.5 sm:size-4"
					/>
				</span>

				<h3 className="font-heading text-small font-semibold leading-snug text-balance text-white sm:text-body">
					{title}
				</h3>
			</div>
		</article>
	);
}
