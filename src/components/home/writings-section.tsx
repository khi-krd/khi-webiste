import { ArrowRightIcon } from "@heroicons/react/24/outline";
import { getLocale, getTranslations } from "next-intl/server";
import { WritingRow } from "@/components/home/writing-row";
import { Container } from "@/components/ui/container";
import { DirectionalIcon } from "@/components/ui/directional-icon";
import { Link } from "@/components/ui/link";
import { getWritings } from "@/lib/mock/writings";

const viewAllClass =
	"group/viewall relative inline-flex h-10 w-fit shrink-0 items-center gap-2.5 overflow-hidden border border-foreground px-5 font-heading text-small font-semibold text-foreground no-underline transition-[color,gap,box-shadow] duration-300 ease-out before:absolute before:inset-0 before:z-0 before:origin-bottom before:scale-y-0 before:bg-foreground before:transition-transform before:duration-300 before:ease-[cubic-bezier(0.22,1,0.36,1)] fine-hover:gap-3.5 fine-hover:text-primary-foreground fine-hover:shadow-[0_8px_24px_-12px_rgba(26,24,19,0.35)] fine-hover:before:scale-y-100 motion-reduce:before:transition-none motion-reduce:fine-hover:before:scale-y-100 motion-reduce:fine-hover:gap-2.5";

export async function WritingsSection() {
	const locale = await getLocale();
	const t = await getTranslations("Writings");
	const writings = getWritings(locale);

	return (
		<section
			className="w-full border-t border-border bg-background py-12 sm:py-16 lg:py-20"
			aria-labelledby="writings-heading"
		>
			<Container className="lg:grid lg:grid-cols-[minmax(0,1fr)_minmax(0,1.65fr)] lg:items-start lg:gap-20 xl:gap-24">
				<header className="text-start lg:sticky lg:top-32 lg:self-start">
					<p className="label font-medium">{t("eyebrow")}</p>
					<h2
						id="writings-heading"
						className="mt-3 font-heading text-h1 font-bold leading-[1.15] text-balance"
					>
						{t("title")}
					</h2>
					<p className="mt-4 max-w-md text-body leading-relaxed text-muted">
						{t("description")}
					</p>
					<Link
						href="/articles"
						variant="nav"
						className={`${viewAllClass} mt-8`}
					>
						<span className="relative z-1">{t("viewAll")}</span>
						<DirectionalIcon
							icon={ArrowRightIcon}
							className="relative z-1 size-4"
						/>
					</Link>
				</header>

				<div className="mt-12 divide-y divide-border lg:mt-0">
					{writings.map((item) => (
						<WritingRow
							key={item.id}
							item={item}
							categoryLabel={t(`categories.${item.category}`)}
							readTimeLabel={t("readTime", { minutes: item.readTime })}
						/>
					))}
				</div>
			</Container>
		</section>
	);
}
