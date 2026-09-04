import { getTranslations } from "next-intl/server";
import { KindIcon } from "@/components/search/kind-icon";
import { KIND_LABEL_KEYS } from "@/components/search/platform-hit-row";
import { Heading } from "@/components/ui/heading";
import { Image } from "@/components/ui/image";
import { Link } from "@/i18n/navigation";
import { platformDetailHref } from "@/lib/platform/search-url";
import { cn } from "@/lib/utils";
import type { PlatformHit } from "@/types/platform";

/**
 * "More from this collection" — the API interleaves the kinds (one sound, one
 * video, one photo, one document, then round again), so the rail always shows
 * the collection's breadth rather than thirty photographs from one shoot.
 */
export async function PlatformRelatedRail({ items }: { items: PlatformHit[] }) {
	if (items.length === 0) {
		return null;
	}
	const t = await getTranslations("Archive");
	const tSearch = await getTranslations("Search");

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
					const title = hit.title?.trim() || hit.code;
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
											imageClassName="transition-transform duration-500 ease-out group-fine-hover:scale-[1.04] motion-reduce:transition-none motion-reduce:group-fine-hover:scale-100"
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

								<p className="label mt-2 flex items-center gap-1 font-medium">
									<KindIcon kind={hit.type} className="size-3.5 shrink-0" />
									{tSearch(KIND_LABEL_KEYS[hit.type])}
								</p>
								<p
									className={cn(
										"mt-1 line-clamp-2 text-start text-small font-medium leading-snug text-foreground",
										"transition-colors group-fine-hover:text-brand",
									)}
								>
									<bdi>{title}</bdi>
								</p>
							</Link>
						</li>
					);
				})}
			</ul>
		</section>
	);
}
