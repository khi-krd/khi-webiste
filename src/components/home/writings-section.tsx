import { ArrowRightIcon } from "@heroicons/react/24/outline";
import { getLocale, getTranslations } from "next-intl/server";
import { WritingRow } from "@/components/home/writing-row";
import {
	ScrollReveal,
	ScrollRevealBlock,
	ScrollRevealItem,
} from "@/components/motion/scroll-reveal";
import { Container } from "@/components/ui/container";
import { DirectionalIcon } from "@/components/ui/directional-icon";
import { Link } from "@/components/ui/link";
import { buildGenreLabels } from "@/components/writing/writing-card";
import { getWritingsCarousel } from "@/lib/api/writings";
import type { BookGenre } from "@/types/writing";

const HOME_WRITINGS_COUNT = 6;

const viewAllClass =
	"group/viewall relative inline-flex h-10 w-fit shrink-0 items-center gap-2.5 overflow-hidden border border-foreground px-5 font-heading text-small font-semibold text-foreground no-underline transition-[color,gap,box-shadow] duration-300 ease-out before:absolute before:inset-0 before:z-0 before:origin-bottom before:scale-y-0 before:bg-foreground before:transition-transform before:duration-300 before:ease-[cubic-bezier(0.22,1,0.36,1)] fine-hover:gap-3.5 fine-hover:text-primary-foreground fine-hover:shadow-[0_8px_24px_-12px_rgba(26,24,19,0.35)] fine-hover:before:scale-y-100 motion-reduce:before:transition-none motion-reduce:fine-hover:before:scale-y-100 motion-reduce:fine-hover:gap-2.5";

export async function WritingsSection() {
	const locale = await getLocale();
	const t = await getTranslations("Writings");
	const writings = (
		await getWritingsCarousel(locale, HOME_WRITINGS_COUNT)
	).slice(0, HOME_WRITINGS_COUNT);

	const translateGenre = (genre: BookGenre) => t(`genres.${genre}`);

	const rows = writings.map((item) => {
		const genreLabels = buildGenreLabels(
			item.genres,
			item.freeTextGenre,
			translateGenre,
		);

		return {
			id: item.id,
			title: item.title,
			writer: item.writer,
			excerpt: item.excerpt,
			coverUrl: item.coverUrl,
			genreLabel: genreLabels[0] ?? item.topicName ?? t("eyebrow"),
			fileUrl: item.fileUrl,
		};
	});

	return (
		<section
			className="cv-auto w-full border-t border-border bg-background py-12 [--cv-intrinsic:1800px] sm:py-16 lg:py-20"
			aria-labelledby="writings-heading"
		>
			<Container>
				<ScrollRevealBlock className="mb-8 sm:mb-10">
					<header>
						<div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between sm:gap-8">
							<div className="max-w-xl text-start">
								<p className="label font-medium">{t("eyebrow")}</p>
								<h2
									id="writings-heading"
									className="mt-3 font-heading text-h2 font-bold leading-[1.15] text-balance"
								>
									{t("title")}
								</h2>
								<p className="mt-4 max-w-md text-body leading-relaxed text-muted">
									{t("description")}
								</p>
							</div>

							<Link href="/writings" variant="nav" className={viewAllClass}>
								<span className="relative z-1">{t("viewAll")}</span>
								<DirectionalIcon
									icon={ArrowRightIcon}
									className="relative z-1 size-4"
								/>
							</Link>
						</div>
					</header>
				</ScrollRevealBlock>

				<ScrollReveal className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4">
					{rows.map((item) => (
						<ScrollRevealItem key={item.id}>
							<WritingRow item={item} />
						</ScrollRevealItem>
					))}
				</ScrollReveal>
			</Container>
		</section>
	);
}
