import { getLocale, getTranslations } from "next-intl/server";
import { KindIcon } from "@/components/search/kind-icon";
import { Heading } from "@/components/ui/heading";
import { Image } from "@/components/ui/image";
import { Link } from "@/i18n/navigation";
import {
	humanizePlatformName,
	platformDisplaySubtitle,
	platformDisplayTitle,
} from "@/lib/platform/display";
import { KIND_LABEL_KEYS } from "@/lib/platform/kind-labels";
import { platformDetailHref } from "@/lib/platform/search-url";
import { cn } from "@/lib/utils";
import type { PlatformHit } from "@/types/platform";

/**
 * "More from this collection" — the API interleaves the kinds (one sound, one
 * video, one photo, one document, then round again), so the rail always shows
 * the collection's breadth rather than thirty photographs from one shoot.
 */
export async function PlatformRelatedRail({
	items,
	/** The page's own collection — an item from the same one prints no project line. */
	projectName,
}: {
	items: PlatformHit[];
	projectName?: string | null;
}) {
	if (items.length === 0) {
		return null;
	}
	const [locale, t, tSearch] = await Promise.all([
		getLocale(),
		getTranslations("Archive"),
		getTranslations("Search"),
	]);
	const pageProject = humanizePlatformName(projectName);

	return (
		<section aria-labelledby="platform-related-title">
			<div className="mb-5 flex items-center gap-4 sm:mb-6">
				<Heading level={2} size="h3" id="platform-related-title">
					{t("relatedTitle")}
				</Heading>
				<span aria-hidden className="h-px flex-1 bg-border" />
			</div>

			<ul className="grid grid-cols-2 gap-x-4 gap-y-6 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
				{items.map((hit) => {
					const kindLabel = tSearch(KIND_LABEL_KEYS[hit.type]);
					const display = platformDisplayTitle(hit, { locale, kindLabel });
					const title = display.title;
					const subtitle = platformDisplaySubtitle(hit, display);
					const itemProject = humanizePlatformName(hit.projectName);
					const projectLine =
						itemProject && itemProject !== pageProject ? itemProject : null;
					return (
						<li key={`${hit.type}:${hit.code}`}>
							<Link
								href={platformDetailHref(hit.type, hit.code)}
								className="group block"
							>
								<div className="relative aspect-square overflow-hidden border border-border bg-sunken">
									{hit.thumbnailUrl ? (
										<Image
											src={hit.thumbnailUrl}
											alt=""
											aspectRatio="square"
											sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 16vw"
											className="absolute inset-0 size-full"
											imageClassName="transition-transform duration-500 ease-out group-fine:scale-[1.04] motion-reduce:transition-none motion-reduce:group-fine:scale-100"
										/>
									) : (
										<span className="absolute inset-0 flex items-center justify-center">
											<KindIcon
												kind={hit.type}
												className="size-8 text-muted/60"
											/>
										</span>
									)}
									{hit.duration?.trim() ? (
										<span
											dir="ltr"
											className="absolute bottom-1 end-1 bg-foreground/80 px-1 py-0.5 text-label tabular-nums leading-none text-primary-foreground"
										>
											{hit.duration.trim()}
										</span>
									) : null}
								</div>

								<p className="label mt-2 flex min-w-0 items-center gap-x-2 font-medium">
									<span className="inline-flex shrink-0 items-center gap-1">
										<KindIcon kind={hit.type} className="size-3.5 shrink-0" />
										{kindLabel}
									</span>
									{projectLine ? (
										<>
											<span aria-hidden>·</span>
											<span
												dir="auto"
												className="min-w-0 line-clamp-1 normal-case tracking-normal [overflow-wrap:anywhere]"
											>
												{projectLine}
											</span>
										</>
									) : null}
								</p>
								<p
									className={cn(
										"mt-1 line-clamp-2 text-start text-small font-medium leading-snug text-foreground [overflow-wrap:anywhere]",
										"transition-colors group-fine:text-brand",
									)}
								>
									<bdi>{title}</bdi>
								</p>
								{subtitle ? (
									<p className="mt-0.5 line-clamp-1 text-start text-label text-muted [overflow-wrap:anywhere]">
										<bdi>{subtitle}</bdi>
									</p>
								) : null}
							</Link>
						</li>
					);
				})}
			</ul>
		</section>
	);
}
