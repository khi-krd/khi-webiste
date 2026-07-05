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

type FooterNavPanelProps = {
	index: string;
	title: string;
	links: FooterLink[];
	resolveLabel: (link: FooterLink) => string;
};

function FooterNavPanel({
	index,
	title,
	links,
	resolveLabel,
}: FooterNavPanelProps) {
	return (
		<div className="flex min-h-full flex-col bg-surface p-6 sm:p-7">
			<div className="mb-5 flex items-baseline gap-3 border-b border-border pb-4">
				<span
					aria-hidden="true"
					className="font-heading text-[0.6875rem] font-bold tabular-nums tracking-[0.08em] text-muted/70"
				>
					{index}
				</span>
				<h4 className="font-heading text-small font-bold uppercase tracking-[0.12em] text-foreground">
					{title}
				</h4>
			</div>
			<ul className="flex flex-1 flex-col">
				{links.map((item) => {
					const label = resolveLabel(item);
					const key = item.navKey ?? item.labelKey ?? item.href;

					if (item.external) {
						return (
							<li
								key={key}
								className="border-t border-border/70 first:border-t-0"
							>
								<a
									href={item.href}
									target="_blank"
									rel="noreferrer"
									className={cn(
										"group flex items-center justify-between gap-3 py-3.5",
										"font-heading text-[0.9375rem] font-medium leading-snug text-foreground/75",
										"no-underline transition-colors fine-hover:text-foreground",
									)}
								>
									<span>{label}</span>
									<ArrowUpRightIcon
										className="size-3.5 shrink-0 opacity-35 transition-[opacity,transform] fine-hover:translate-x-px fine-hover:-translate-y-px fine-hover:opacity-100"
										aria-hidden="true"
									/>
								</a>
							</li>
						);
					}

					return (
						<li
							key={key}
							className="border-t border-border/70 first:border-t-0"
						>
							<Link
								href={item.href}
								className={cn(
									"group flex items-center justify-between gap-3 py-3.5",
									"font-heading text-[0.9375rem] font-medium leading-snug text-foreground/75",
									"no-underline transition-colors fine-hover:text-foreground",
								)}
							>
								<span>{label}</span>
								<DirectionalIcon
									icon={ArrowRightIcon}
									className="size-3.5 shrink-0 opacity-0 transition-[opacity,transform] group-fine:translate-x-0.5 group-fine:opacity-55"
								/>
							</Link>
						</li>
					);
				})}
			</ul>
		</div>
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
		{
			key: "connect",
			index: String(FOOTER_COLUMNS.length + 1).padStart(2, "0"),
			title: t("connect"),
			links: FOOTER_SOCIAL_LINKS,
		},
	];

	return (
		<footer className="relative mt-20 overflow-hidden border-t border-foreground/20">
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
			<div aria-hidden="true" className="absolute inset-0 bg-foreground/60" />
			<div
				aria-hidden="true"
				className="absolute inset-0 bg-linear-to-b from-foreground/35 via-foreground/56 to-foreground/68"
			/>

			<div className="relative z-10 py-16 sm:py-20">
				<Container className="max-w-none">
					<FooterReveal>
						<FooterRevealItem>
							<section className="max-w-3xl">
								<h2 className="max-w-2xl font-heading text-[clamp(2.1rem,4.25vw,3.4rem)] font-semibold leading-[1.04] text-primary-foreground">
									{t("newsletterTitle")}
								</h2>
								<p className="mt-4 max-w-2xl text-body text-primary-foreground/80">
									{t("newsletterDescription")}
								</p>
								<form
									className="mt-8 grid max-w-2xl gap-2 sm:grid-cols-[1fr_auto]"
									action="#"
									method="post"
								>
									<input
										type="email"
										name="email"
										autoComplete="email"
										placeholder={t("emailPlaceholder")}
										aria-label={t("emailLabel")}
										className="h-12 w-full border border-primary-foreground/28 bg-primary-foreground/10 px-4 text-body text-primary-foreground placeholder:text-primary-foreground/55 outline-none transition focus:border-primary-foreground/55 focus:bg-primary-foreground/14"
									/>
									<button
										type="submit"
										className="inline-flex h-12 items-center justify-center gap-2 border border-primary bg-primary px-6 font-heading text-small font-semibold text-primary-foreground transition hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-foreground/45"
									>
										{t("signUp")}
										<ArrowRightIcon
											className="size-4 shrink-0"
											aria-hidden="true"
										/>
									</button>
								</form>
							</section>
						</FooterRevealItem>

						<FooterRevealItem>
							<section className="mt-12 overflow-hidden border border-border bg-border text-foreground shadow-[0_28px_90px_-48px_rgba(26,24,19,0.45)]">
								<div aria-hidden="true" className="h-0.5 bg-foreground" />

								<div className="grid gap-px lg:grid-cols-[minmax(0,19rem)_1fr] xl:grid-cols-[minmax(0,22rem)_1fr]">
									<div className="flex flex-col justify-between gap-8 bg-surface p-8 sm:p-9 lg:p-10">
										<div className="space-y-6">
											<Logo />
											<p className="label font-medium text-muted">
												{t("brandEyebrow")}
											</p>
											<h3 className="max-w-[16rem] font-heading text-[clamp(1.625rem,2.4vw,2.125rem)] font-bold leading-[1.1] text-balance">
												{t("brandTagline")}
											</h3>
										</div>
										<Link
											href="/contact"
											className={cn(
												"inline-flex h-11 w-fit items-center gap-2 border border-border-strong",
												"bg-background px-5 font-heading text-small font-semibold text-foreground",
												"transition fine-hover:bg-sunken",
											)}
											withArrow
										>
											{t("getInTouch")}
										</Link>
									</div>

									<div className="grid gap-px bg-border sm:grid-cols-2 lg:grid-cols-3">
										{navPanels.map((panel) => (
											<FooterNavPanel
												key={panel.key}
												index={panel.index}
												title={panel.title}
												links={panel.links}
												resolveLabel={resolveLabel}
											/>
										))}
									</div>
								</div>

								<div className="border-t border-border bg-sunken/80 px-8 py-5 sm:px-10 lg:px-12">
									<p className="text-small leading-relaxed text-muted">
										{t("copyright")}
									</p>
								</div>
							</section>
						</FooterRevealItem>
					</FooterReveal>
				</Container>
			</div>
		</footer>
	);
}
