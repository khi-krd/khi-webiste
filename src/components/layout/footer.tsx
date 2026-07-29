import { ArrowRightIcon, ArrowUpRightIcon } from "@heroicons/react/24/outline";
import NextImage from "next/image";
import { getTranslations } from "next-intl/server";
import { Logo } from "@/components/layout/logo";
import {
	FooterReveal,
	FooterRevealItem,
} from "@/components/motion/scroll-reveal";
import { Container } from "@/components/ui/container";
import { DirectionalIcon } from "@/components/ui/directional-icon";
import { Link } from "@/components/ui/link";
import {
	FOOTER_COLUMNS,
	FOOTER_SOCIAL_LINKS,
	type FooterLink,
} from "@/config/site";
import { cn } from "@/lib/utils";

const footerCtaClass =
	"group/footer-cta relative inline-flex h-11 w-fit shrink-0 items-center gap-2.5 overflow-hidden border border-primary-foreground/70 bg-primary-foreground/10 px-5 font-heading text-small font-semibold text-primary-foreground no-underline backdrop-blur-[2px] transition-[color,gap,box-shadow,background-color,border-color] duration-300 ease-out before:absolute before:inset-0 before:z-0 before:origin-bottom before:scale-y-0 before:bg-primary-foreground before:transition-transform before:duration-300 before:ease-[cubic-bezier(0.22,1,0.36,1)] fine-hover:gap-3.5 fine-hover:border-primary-foreground fine-hover:text-foreground fine-hover:shadow-[0_8px_24px_-12px_color-mix(in_oklch,var(--color-foreground)_55%,transparent)] fine-hover:before:scale-y-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-foreground motion-reduce:before:transition-none motion-reduce:fine-hover:before:scale-y-100 motion-reduce:fine-hover:gap-2.5";

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
		<footer className="relative overflow-hidden pt-20">
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
				<Container className="max-w-none">
					<FooterReveal>
						<FooterRevealItem>
							<section className="grid gap-10 border-b border-primary-foreground/12 pb-12 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)] lg:items-end lg:gap-16 lg:pb-14">
								<div className="max-w-2xl">
									<p className="label font-medium text-primary-foreground/55">
										{t("newsletterEyebrow")}
									</p>
									<h2 className="mt-3 font-heading text-[clamp(2rem,4.1vw,3.25rem)] font-semibold leading-[1.05] text-balance text-primary-foreground">
										{t("newsletterTitle")}
									</h2>
									<p className="mt-4 max-w-xl text-body leading-relaxed text-primary-foreground/72">
										{t("newsletterDescription")}
									</p>
								</div>

								<form
									className="w-full max-w-xl lg:ms-auto lg:max-w-none"
									action="#"
									method="post"
								>
									<div
										className={cn(
											"flex flex-col gap-2 sm:flex-row sm:items-stretch sm:gap-0",
											"sm:overflow-hidden sm:rounded-md sm:border sm:border-primary-foreground/22 sm:bg-primary-foreground/8 sm:backdrop-blur-[2px]",
											"sm:transition-[border-color,background-color,box-shadow] sm:duration-300",
											"sm:focus-within:border-primary-foreground/45 sm:focus-within:bg-primary-foreground/12",
											"sm:focus-within:shadow-[0_0_0_1px_color-mix(in_oklch,var(--color-primary-foreground)_18%,transparent)]",
										)}
									>
										<input
											type="email"
											name="email"
											autoComplete="email"
											placeholder={t("emailPlaceholder")}
											aria-label={t("emailLabel")}
											className={cn(
												"h-12 w-full rounded-md bg-primary-foreground/10 px-4 text-body text-primary-foreground",
												"border border-primary-foreground/22 placeholder:text-primary-foreground/45 outline-none",
												"transition-[border-color,background-color] focus:border-primary-foreground/45 focus:bg-primary-foreground/14",
												"sm:flex-1 sm:rounded-none sm:border-0 sm:bg-transparent sm:focus:border-0 sm:focus:bg-transparent",
											)}
										/>
										<button
											type="submit"
											className={cn(
												"inline-flex h-12 shrink-0 items-center justify-center gap-2 rounded-md px-6",
												"border border-primary bg-primary font-heading text-small font-semibold text-primary-foreground",
												"transition-[opacity,gap] duration-200 fine-hover:gap-3 fine-hover:opacity-92",
												"focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-foreground/45 focus-visible:ring-offset-2 focus-visible:ring-offset-foreground",
												"sm:rounded-none sm:border-0 sm:border-s sm:border-primary-foreground/15",
											)}
										>
											{t("signUp")}
											<DirectionalIcon
												icon={ArrowRightIcon}
												className="size-4 shrink-0"
											/>
										</button>
									</div>
								</form>
							</section>
						</FooterRevealItem>

						<FooterRevealItem>
							<section className="mt-12 text-primary-foreground lg:mt-14">
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
