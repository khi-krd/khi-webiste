import { ArrowRightIcon } from "@heroicons/react/24/outline";
import { getTranslations } from "next-intl/server";
import { Logo } from "@/components/layout/logo";
import { Container } from "@/components/ui/container";
import { Link } from "@/components/ui/link";

type FooterLink = {
	labelKey: string;
	href: string;
};

type FooterColumn = {
	titleKey: string;
	links: FooterLink[];
};

const footerColumns: FooterColumn[] = [
	{
		titleKey: "industries",
		links: [
			{ labelKey: "books", href: "/books" },
			{ labelKey: "songs", href: "/songs" },
			{ labelKey: "audio", href: "/audio" },
			{ labelKey: "video", href: "/video" },
		],
	},
	{
		titleKey: "insights",
		links: [
			{ labelKey: "articles", href: "/articles" },
			{ labelKey: "gallery", href: "/gallery" },
			{ labelKey: "archive", href: "/archive" },
			{ labelKey: "events", href: "/events" },
		],
	},
	{
		titleKey: "company",
		links: [
			{ labelKey: "about", href: "/about" },
			{ labelKey: "careers", href: "/careers" },
			{ labelKey: "joinUs", href: "/join-us" },
			{ labelKey: "contact", href: "/contact" },
		],
	},
];

const socialLinks = [
	{ labelKey: "x", href: "https://x.com" },
	{ labelKey: "instagram", href: "https://instagram.com" },
	{ labelKey: "facebook", href: "https://facebook.com" },
	{ labelKey: "linkedin", href: "https://linkedin.com" },
] as const;

export async function Footer() {
	const t = await getTranslations("Footer");

	return (
		<footer className="relative mt-20 overflow-hidden border-t border-foreground/20">
			<div
				aria-hidden="true"
				className="absolute inset-0 scale-125 bg-[url('/menu/1.jpg')] bg-cover bg-center blur-lg saturate-150 contrast-125"
			/>
			<div aria-hidden="true" className="absolute inset-0 bg-foreground/60" />
			<div
				aria-hidden="true"
				className="absolute inset-0 bg-linear-to-b from-foreground/35 via-foreground/56 to-foreground/68"
			/>

			<div className="relative z-10 py-16 sm:py-20">
				<Container className="max-w-none">
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
								<ArrowRightIcon className="size-4 shrink-0" aria-hidden="true" />
							</button>
						</form>
					</section>

					<section className="mt-12 border border-border/70 bg-background/95 text-foreground shadow-[0_14px_60px_-30px_rgba(0,0,0,0.65)] backdrop-blur-[2px]">
						<div className="grid gap-10 p-8 sm:p-10 lg:grid-cols-[1.15fr_3fr] lg:gap-12">
							<div className="space-y-5 border-border lg:border-e lg:pe-9">
								<Logo />
								<h3 className="max-w-sm font-heading text-h2 font-semibold leading-[1.15]">
									{t("brandTagline")}
								</h3>
								<Link
									href="/contact"
									variant="text"
									className="font-heading text-small font-semibold text-foreground"
									withArrow
								>
									{t("getInTouch")}
								</Link>
							</div>

							<div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
								{footerColumns.map((column) => (
									<div key={column.titleKey}>
										<h4 className="mb-3 border-b border-border pb-2 font-heading text-small font-semibold uppercase tracking-[0.06em] text-muted">
											{t(column.titleKey)}
										</h4>
										<ul className="space-y-3">
											{column.links.map((item) => (
												<li key={item.labelKey}>
													<Link
														href={item.href}
														variant="nav"
														className="text-body text-foreground/85 hover:text-foreground"
													>
														{t(item.labelKey)}
													</Link>
												</li>
											))}
										</ul>
									</div>
								))}

								<div>
									<h4 className="mb-3 border-b border-border pb-2 font-heading text-small font-semibold uppercase tracking-[0.06em] text-muted">
										{t("connect")}
									</h4>
									<ul className="space-y-3">
										{socialLinks.map((item) => (
											<li key={item.labelKey}>
												<a
													href={item.href}
													target="_blank"
													rel="noreferrer"
													className="inline-flex items-center text-body text-foreground/80 no-underline transition-colors hover:text-foreground"
												>
													{t(item.labelKey)}
												</a>
											</li>
										))}
									</ul>
								</div>
							</div>
						</div>

						<div className="border-t border-border px-8 py-4 sm:px-10">
							<div className="flex flex-col gap-2 text-small text-muted sm:flex-row sm:items-center sm:justify-between">
								<ul className="flex flex-wrap items-center gap-x-6 gap-y-2">
									<li>
										<Link href="/privacy-policy" variant="nav" className="text-muted">
											{t("privacyPolicy")}
										</Link>
									</li>
									<li>
										<Link href="/terms" variant="nav" className="text-muted">
											{t("termsOfUse")}
										</Link>
									</li>
									<li>
										<Link href="/cookie-consent" variant="nav" className="text-muted">
											{t("cookieConsent")}
										</Link>
									</li>
								</ul>
								<p>{t("copyright")}</p>
							</div>
						</div>
					</section>
				</Container>
			</div>
		</footer>
	);
}
