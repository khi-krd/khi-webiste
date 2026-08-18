import { ArrowRightIcon, ArrowUpRightIcon } from "@heroicons/react/24/outline";
import NextImage from "next/image";
import { getTranslations } from "next-intl/server";
import { Logo } from "@/components/layout/logo";
import {
	FooterReveal,
	FooterRevealItem,
} from "@/components/motion/scroll-reveal";
import { Container } from "@/components/ui/container";
import { viewAllCtaOnBrandClass } from "@/components/ui/cta-styles";
import { DirectionalIcon } from "@/components/ui/directional-icon";
import { Link } from "@/components/ui/link";
import {
	DONATE_HREF,
	FOOTER_COLUMNS,
	FOOTER_SOCIAL_LINKS,
	type FooterLink,
} from "@/config/site";
import { getDonateBandImageUrl } from "@/lib/api/site-settings";
import { cn } from "@/lib/utils";

const footerCtaClass =
	"group/footer-cta relative inline-flex h-11 w-fit shrink-0 items-center gap-2.5 overflow-hidden border border-primary-foreground/70 bg-primary-foreground/10 px-5 font-heading text-small font-semibold text-primary-foreground no-underline backdrop-blur-[2px] transition-[color,gap,box-shadow,background-color,border-color] duration-300 ease-out before:absolute before:inset-0 before:z-0 before:origin-bottom before:scale-y-0 before:bg-primary-foreground before:transition-transform before:duration-300 before:ease-[cubic-bezier(0.22,1,0.36,1)] fine-hover:gap-3.5 fine-hover:border-primary-foreground fine-hover:text-foreground fine-hover:shadow-[0_8px_24px_-12px_color-mix(in_oklch,var(--color-foreground)_55%,transparent)] fine-hover:before:scale-y-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-foreground motion-reduce:before:transition-none motion-reduce:fine-hover:before:scale-y-100 motion-reduce:fine-hover:gap-2.5";

type FooterDonateBandProps = {
	title: string;
	description: string;
	cta: string;
	/** CMS photograph; null renders the band on its plain dark ground. */
	imageUrl: string | null;
};

/**
 * Full-bleed donate banner at the top of the footer: a slanted brand-green
 * panel over a skewed archive photo. The seam mirrors by `dir` (see
 * `.footer-donate-cut` / `.footer-donate-photo` in globals.css) — DOM order
 * alone already flips the panel/photo sides correctly since `flex-row`
 * follows the inline-start direction.
 */
function FooterDonateBand({
	title,
	description,
	cta,
	imageUrl,
}: FooterDonateBandProps) {
	return (
		<section className="relative z-10 flex flex-col overflow-hidden bg-foreground sm:h-[15rem] sm:flex-row lg:h-[17rem] 2xl:h-[20rem]">
			<div className="footer-donate-cut relative flex flex-col justify-center gap-3 bg-brand px-6 py-8 text-start sm:w-[54%] sm:px-10 sm:py-0 lg:px-16 xl:px-20 2xl:w-[46%] 2xl:px-32">
				<h2 className="max-w-lg text-balance font-heading text-[clamp(1.375rem,2.2vw,1.875rem)] font-bold leading-[1.2] text-white 2xl:max-w-2xl 2xl:text-[2.25rem]">
					{title}
				</h2>
				<p className="max-w-md text-small leading-relaxed text-white/80 2xl:max-w-lg">
					{description}
				</p>
				<Link
					href={DONATE_HREF}
					variant="nav"
					className={cn(viewAllCtaOnBrandClass, "mt-1")}
				>
					<span className="relative z-1">{cta}</span>
					<DirectionalIcon
						icon={ArrowRightIcon}
						className="relative z-1 size-4"
					/>
				</Link>
			</div>

			{/* No CMS photograph — the slanted panel is dropped entirely rather
			    than framing an empty rectangle. */}
			{imageUrl ? (
				<div className="relative h-40 sm:h-auto sm:flex-1">
					<div className="footer-donate-photo absolute -inset-y-8 inset-x-10 overflow-hidden border border-primary-foreground/15 sm:inset-x-16 2xl:-inset-y-10 2xl:inset-x-24">
						<NextImage
							src={imageUrl}
							alt=""
							fill
							sizes="(min-width: 640px) 46vw, 100vw"
							quality={75}
							className="object-cover"
						/>
					</div>
				</div>
			) : null}
		</section>
	);
}

type FooterNavPanelProps = {
	index: string;
	title: string;
	links: FooterLink[];
	resolveLabel: (link: FooterLink) => string;
	isLast?: boolean;
};

function FooterNavPanel({
	index,
	title,
	links,
	resolveLabel,
	isLast = false,
}: FooterNavPanelProps) {
	return (
		<nav
			aria-label={title}
			className={cn(
				"flex min-h-full flex-col px-6 py-7 sm:px-7 sm:py-8 lg:px-8",
				!isLast &&
					"border-b border-primary-foreground/12 sm:border-b-0 sm:border-e",
			)}
		>
			<div className="mb-6 flex items-baseline gap-3 border-b border-primary-foreground/12 pb-4">
				<span
					aria-hidden="true"
					className="font-heading text-[0.6875rem] font-bold tabular-nums tracking-[0.14em] text-primary-foreground/40"
				>
					{index}
				</span>
				<h4 className="font-heading text-small font-bold uppercase tracking-[0.14em] text-primary-foreground">
					{title}
				</h4>
			</div>
			<ul className="flex flex-1 flex-col gap-0.5">
				{links.map((item) => {
					const label = resolveLabel(item);
					const key = item.navKey ?? item.labelKey ?? item.href;

					if (item.external) {
						return (
							<li key={key}>
								<a
									href={item.href}
									target="_blank"
									rel="noreferrer"
									className={cn(
										"group flex w-full items-center justify-between gap-3 py-2.5",
										"font-heading text-[0.9375rem] font-medium leading-snug text-primary-foreground/70",
										"no-underline transition-colors duration-200 fine-hover:text-primary-foreground",
									)}
								>
									<span className="relative">
										{label}
										<span
											aria-hidden="true"
											className="absolute inset-x-0 -bottom-0.5 h-px origin-start scale-x-0 bg-primary-foreground/70 transition-transform duration-300 ease-out group-fine:scale-x-100"
										/>
									</span>
									<ArrowUpRightIcon
										className="size-3.5 shrink-0 opacity-30 transition-[opacity,transform] duration-200 group-fine:translate-x-px group-fine:-translate-y-px group-fine:opacity-100"
										aria-hidden="true"
									/>
								</a>
							</li>
						);
					}

					return (
						<li key={key}>
							<Link
								href={item.href}
								className={cn(
									"group flex w-full items-center justify-between gap-3 py-2.5",
									"font-heading text-[0.9375rem] font-medium leading-snug text-primary-foreground/70",
									"no-underline transition-colors duration-200 fine-hover:text-primary-foreground",
								)}
							>
								<span className="relative">
									{label}
									<span
										aria-hidden="true"
										className="absolute inset-x-0 -bottom-0.5 h-px origin-start scale-x-0 bg-primary-foreground/70 transition-transform duration-300 ease-out group-fine:scale-x-100"
									/>
								</span>
								<DirectionalIcon
									icon={ArrowRightIcon}
									className="size-3.5 shrink-0 opacity-0 transition-[opacity,transform] duration-200 group-fine:translate-x-0.5 group-fine:opacity-55"
								/>
							</Link>
						</li>
					);
				})}
			</ul>
		</nav>
	);
}

export async function Footer() {
	const t = await getTranslations("Footer");
	const donateImageUrl = await getDonateBandImageUrl();

	const resolveLabel = (link: FooterLink) => t(link.labelKey ?? "");

	const navPanels = [
		...FOOTER_COLUMNS.map((column, index) => ({
			key: column.titleKey,
			index: String(index + 1).padStart(2, "0"),
			title: t(column.titleKey),
			links: column.links,
		})),
		// Omitted while no real social profiles are configured — an empty
		// "connect" column reads as broken.
		...(FOOTER_SOCIAL_LINKS.length > 0
			? [
					{
						key: "connect",
						index: String(FOOTER_COLUMNS.length + 1).padStart(2, "0"),
						title: t("connect"),
						links: FOOTER_SOCIAL_LINKS,
					},
				]
			: []),
	];

	return (
		<footer className="relative overflow-hidden">
			<FooterDonateBand
				imageUrl={donateImageUrl}
				title={t("donateTitle")}
				description={t("donateDescription")}
				cta={t("donateCta")}
			/>

			<div
				aria-hidden="true"
				className="absolute inset-0 scale-125 saturate-150 contrast-125"
			>
				{/* Decorative, heavily blurred and behind dark overlays — a small
				    low-quality variant is indistinguishable, so request a tiny
				    width and let next/image serve AVIF/WebP. */}
				<NextImage
					src="/menu/1.jpg"
					alt=""
					fill
					quality={40}
					sizes="640px"
					className="object-cover blur-lg"
				/>
			</div>
			<div aria-hidden="true" className="absolute inset-0 bg-foreground/78" />
			<div
				aria-hidden="true"
				className="absolute inset-0 bg-linear-to-b from-foreground/40 via-foreground/70 to-foreground/88"
			/>
			<div
				aria-hidden="true"
				className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,transparent_20%,color-mix(in_oklch,var(--color-foreground)_55%,transparent)_100%)]"
			/>

			<div className="relative z-10 py-16 sm:py-20 lg:py-24">
				<Container className="max-w-none 2xl:max-w-[96rem]">
					<FooterReveal>
						<FooterRevealItem>
							<section className="text-primary-foreground">
								<div className="overflow-hidden border border-primary-foreground/14 bg-primary-foreground/4 backdrop-blur-[2px]">
									<div className="grid lg:grid-cols-[minmax(0,20rem)_1fr] xl:grid-cols-[minmax(0,23rem)_1fr]">
										<div className="flex flex-col justify-between gap-10 border-b border-primary-foreground/12 p-8 sm:p-9 lg:border-b-0 lg:border-e lg:p-10">
											<div className="space-y-6">
												<Logo className="text-primary-foreground" />
												<p className="label font-medium text-primary-foreground/55">
													{t("brandEyebrow")}
												</p>
												<h3 className="max-w-68 font-heading text-[clamp(1.625rem,2.5vw,2.25rem)] font-bold leading-[1.12] text-balance text-primary-foreground">
													{t("brandTagline")}
												</h3>
											</div>
											<Link href="/contact" className={footerCtaClass}>
												<span className="relative z-1">{t("getInTouch")}</span>
												<DirectionalIcon
													icon={ArrowRightIcon}
													className="relative z-1 size-4 shrink-0"
												/>
											</Link>
										</div>

										<div className="grid sm:grid-cols-2 lg:grid-cols-3">
											{navPanels.map((panel, index) => (
												<FooterNavPanel
													key={panel.key}
													index={panel.index}
													title={panel.title}
													links={panel.links}
													resolveLabel={resolveLabel}
													isLast={index === navPanels.length - 1}
												/>
											))}
										</div>
									</div>

									<div className="flex flex-col gap-3 border-t border-primary-foreground/12 px-8 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-10 lg:px-12">
										<p className="text-small leading-relaxed text-primary-foreground/50">
											{t("copyright")}
										</p>
										<p
											aria-hidden="true"
											className="font-heading text-[0.6875rem] font-bold uppercase tracking-[0.16em] text-primary-foreground/35"
										>
											KHI
										</p>
									</div>
								</div>
							</section>
						</FooterRevealItem>
					</FooterReveal>
				</Container>
			</div>
		</footer>
	);
}
