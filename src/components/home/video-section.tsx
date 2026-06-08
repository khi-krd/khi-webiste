import { ArrowRightIcon } from "@heroicons/react/24/outline";
import { getLocale, getTranslations } from "next-intl/server";
import { VideoCard } from "@/components/home/video-card";
import { DirectionalIcon } from "@/components/ui/directional-icon";
import { Link } from "@/components/ui/link";
import { getVideos, type VideoCategory } from "@/lib/mock/videos";

const viewAllClass =
	"group/viewall relative inline-flex h-10 w-fit shrink-0 items-center gap-2.5 overflow-hidden border border-foreground px-5 font-heading text-small font-semibold text-foreground no-underline transition-[color,gap,box-shadow] duration-300 ease-out before:absolute before:inset-0 before:z-0 before:origin-bottom before:scale-y-0 before:bg-foreground before:transition-transform before:duration-300 before:ease-[cubic-bezier(0.22,1,0.36,1)] fine-hover:gap-3.5 fine-hover:text-primary-foreground fine-hover:shadow-[0_8px_24px_-12px_rgba(26,24,19,0.35)] fine-hover:before:scale-y-100 motion-reduce:before:transition-none motion-reduce:fine-hover:before:scale-y-100 motion-reduce:fine-hover:gap-2.5";

export async function VideoSection() {
	const locale = await getLocale();
	const t = await getTranslations("Video");
	const videos = getVideos(locale);

	const [featured, second, third, fourth, fifth] = videos;

	const categoryLabel = (category: VideoCategory) =>
		t(`categories.${category}`);

	return (
		<section
			className="flex min-h-svh w-full flex-col overflow-hidden border-t border-border bg-background"
			aria-labelledby="video-heading"
		>
			<header className="shrink-0 px-6 pt-12 pb-8 sm:px-8 sm:pt-16 sm:pb-10 lg:pt-20">
				<div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between sm:gap-8">
					<div className="max-w-2xl text-start">
						<p className="label font-medium">{t("eyebrow")}</p>
						<h2
							id="video-heading"
							className="mt-2 font-heading text-h1 font-bold leading-[1.1] text-balance"
						>
							{t("title")}
						</h2>
						<p className="mt-3 text-body text-muted">{t("description")}</p>
					</div>

					<Link href="/video" variant="nav" className={viewAllClass}>
						<span className="relative z-1">{t("viewAll")}</span>
						<DirectionalIcon
							icon={ArrowRightIcon}
							className="relative z-1 size-4"
						/>
					</Link>
				</div>
			</header>

			<div className="flex min-h-0 flex-1 flex-col gap-px bg-border">
				<div className="grid min-h-0 flex-[3] grid-cols-1 gap-px bg-border lg:grid-cols-[7fr_5fr] lg:items-stretch">
					{featured ? (
						<div className="relative aspect-video min-h-0 lg:aspect-auto lg:h-full">
							<VideoCard
								item={featured}
								categoryLabel={categoryLabel(featured.category)}
								variant="featured"
								fill
							/>
						</div>
					) : null}

					<div className="flex min-h-0 flex-col gap-px bg-border lg:h-full">
						{second ? (
							<div className="relative aspect-video min-h-0 lg:aspect-auto lg:h-full lg:flex-1">
								<VideoCard
									item={second}
									categoryLabel={categoryLabel(second.category)}
									fill
								/>
							</div>
						) : null}
						{third ? (
							<div className="relative aspect-video min-h-0 lg:aspect-auto lg:h-full lg:flex-1">
								<VideoCard
									item={third}
									categoryLabel={categoryLabel(third.category)}
									fill
								/>
							</div>
						) : null}
					</div>
				</div>

				<div className="grid min-h-0 flex-1 grid-cols-1 gap-px bg-border sm:grid-cols-2">
					{fourth ? (
						<div className="relative aspect-video min-h-0 sm:aspect-auto sm:h-full">
							<VideoCard
								item={fourth}
								categoryLabel={categoryLabel(fourth.category)}
								fill
							/>
						</div>
					) : null}
					{fifth ? (
						<div className="relative aspect-video min-h-0 sm:aspect-auto sm:h-full">
							<VideoCard
								item={fifth}
								categoryLabel={categoryLabel(fifth.category)}
								fill
							/>
						</div>
					) : null}
				</div>
			</div>
		</section>
	);
}
