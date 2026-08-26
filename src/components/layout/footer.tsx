import { ArrowRightIcon, ArrowUpRightIcon } from "@heroicons/react/24/outline";
import NextImage from "next/image";
import { getTranslations } from "next-intl/server";
import type { ComponentProps, ComponentType } from "react";
import { Logo } from "@/components/layout/logo";
import {
	FooterReveal,
	FooterRevealItem,
} from "@/components/motion/scroll-reveal";
import { Container } from "@/components/ui/container";
import { viewAllCtaOnBrandClass } from "@/components/ui/cta-styles";
import { DirectionalIcon } from "@/components/ui/directional-icon";
import { Link } from "@/components/ui/link";
import { DONATE_HREF, FOOTER_COLUMNS, type FooterLink } from "@/config/site";
import { getDonateBandImageUrl, getSiteLogoUrl } from "@/lib/api/site-settings";
import { getSocialPlatformsFromApi } from "@/lib/api/social";
import { getContactOffices, type SocialPlatformId } from "@/lib/mock/contact";
import { cn } from "@/lib/utils";

function YoutubeIcon(props: ComponentProps<"svg">) {
	return (
		<svg
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			strokeWidth={1.7}
			aria-hidden="true"
			{...props}
		>
			<rect x="2.5" y="6" width="19" height="13" rx="3.5" />
			<path d="M10 9.7v5.6l5-2.8z" fill="currentColor" stroke="none" />
		</svg>
	);
}

function FacebookIcon(props: ComponentProps<"svg">) {
	return (
		<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...props}>
			<path d="M13.5 21v-7h2.4l.4-3h-2.8V9.1c0-.9.3-1.5 1.6-1.5h1.3V4.9c-.3 0-1.1-.1-2-.1-2 0-3.4 1.2-3.4 3.5V11H8.5v3H11v7z" />
		</svg>
	);
}

function InstagramIcon(props: ComponentProps<"svg">) {
	return (
		<svg
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			strokeWidth={1.7}
			aria-hidden="true"
			{...props}
		>
			<rect x="3" y="3" width="18" height="18" rx="5" />
			<circle cx="12" cy="12" r="4" />
			<circle cx="17.3" cy="6.7" r="1.1" fill="currentColor" stroke="none" />
		</svg>
	);
}

function WhatsappIcon(props: ComponentProps<"svg">) {
	return (
		<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...props}>
			<path d="M12 3a9 9 0 0 0-7.7 13.6L3 21l4.5-1.2A9 9 0 1 0 12 3zm0 1.8a7.2 7.2 0 1 1-3.7 13.4l-.3-.2-2.6.7.7-2.6-.2-.3A7.2 7.2 0 0 1 12 4.8zm-3.3 3.6c-.2 0-.4 0-.6.3-.2.2-.8.7-.8 1.8s.8 2.1.9 2.2c.1.2 1.5 2.5 3.8 3.4 1.8.7 2.2.6 2.6.5.4 0 1.3-.5 1.5-1.1.2-.6.2-1 .1-1.1 0-.1-.2-.2-.4-.3l-1.5-.7c-.2 0-.4-.1-.5.1l-.7.9c-.1.2-.3.2-.5.1-.2-.1-1-.4-1.9-1.2-.7-.6-1.2-1.4-1.3-1.6-.1-.2 0-.3.1-.4l.4-.5.2-.4c0-.2 0-.3 0-.4l-.7-1.6c-.2-.4-.3-.4-.5-.4h-.2z" />
		</svg>
	);
}

function EmailIcon(props: ComponentProps<"svg">) {
	return (
		<svg
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			strokeWidth={1.7}
			aria-hidden="true"
			{...props}
		>
			<rect x="3" y="5" width="18" height="14" rx="2.5" />
			<path d="M4 7l8 6 8-6" />
		</svg>
	);
}

type FooterDonateBandProps = {
	title: string;
	description: string;
	cta: string;
	/** CMS photograph; null renders the band on its plain dark ground. */
	imageUrl: string | null;
};

/**
 * Full-bleed donate banner at the top of the footer: a slanted brand-green
 * panel beside a plain, untransformed archive photograph. The panel's seam
 * mirrors by `dir` (see `.footer-donate-cut` in globals.css) — DOM order
 * alone already flips the panel/photo sides correctly since `flex-row`
 * follows the inline-start direction. The photo carries NO transform: any
 * treatment is baked into the artwork by the designer.
 */
function FooterDonateBand({
	title,
	description,
	cta,
	imageUrl,
}: FooterDonateBandProps) {
	return (
		<section className="relative z-10 flex flex-col overflow-hidden bg-foreground sm:h-[15rem] sm:flex-row lg:h-[17rem] 2xl:h-[20rem]">
			<div className="footer-donate-cut relative z-10 flex flex-col justify-center gap-3 bg-brand px-6 py-8 text-start sm:w-[54%] sm:px-10 sm:py-0 lg:px-16 xl:px-20 2xl:w-[46%] 2xl:px-32">
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

			{/* No CMS photograph — the panel is dropped entirely rather than
			    framing an empty rectangle. The photograph is shown as the plain
			    rectangle it is: any treatment belongs to the artwork itself, so
			    the frame adds no skew, no overhang and no border. */}
			{imageUrl ? (
				<div
					// Slid under the panel by exactly the width of the wedge its
					// clip-path removes (8% of a 54% / 46% panel), so the diagonal
					// seam reveals the photograph rather than the section's black
					// ground. The panel's z-10 keeps the green painted on top.
					className="relative h-44 sm:-ms-[4.32%] sm:h-auto sm:flex-1 2xl:-ms-[3.68%]"
				>
					<NextImage
						src={imageUrl}
						alt=""
						fill
						sizes="(min-width: 1536px) 54vw, (min-width: 640px) 46vw, 100vw"
						quality={75}
						className="object-cover"
					/>
				</div>
			) : null}
		</section>
	);
}

/** Glyph per platform the CMS can hand back; order comes from the CMS. */
const SOCIAL_ICONS: Record<
	SocialPlatformId,
	ComponentType<ComponentProps<"svg">>
> = {
	youtube: YoutubeIcon,
	facebook: FacebookIcon,
	instagram: InstagramIcon,
	whatsapp: WhatsappIcon,
};

type FooterSocialLink = {
	key: string;
	href: string;
	label: string;
	icon: ComponentType<ComponentProps<"svg">>;
	external?: boolean;
};

/** Circular icon-only social row over the dark footer ground — hover fills
 *  brand green, same interactive color as every other filled control on the
 *  site. Renders nothing while no real profile URLs resolve. */
function FooterSocialIcons({ links }: { links: FooterSocialLink[] }) {
	if (links.length === 0) return null;

	return (
		<div className="flex items-center gap-3">
			{links.map(({ key, href, label, icon: Icon, external }) => (
				<a
					key={key}
					href={href}
					aria-label={label}
					title={label}
					{...(external ? { target: "_blank", rel: "noreferrer" } : {})}
					// rounded-[50%], not rounded-full: --radius-full is 0 while the
					// site-wide square-corner toggle is off, and these pills are
					// round by design in the footer regardless of that setting.
					className="flex size-11 items-center justify-center rounded-[50%] border border-primary-foreground/15 bg-primary-foreground/5 text-primary-foreground/75 transition-colors duration-200 fine-hover:border-brand fine-hover:bg-brand fine-hover:text-white focus-visible:border-brand focus-visible:bg-brand focus-visible:text-white"
				>
					<Icon className="size-[1.1875rem]" />
				</a>
			))}
		</div>
	);
}

type FooterNavPanelProps = {
	title: string;
	links: FooterLink[];
	resolveLabel: (link: FooterLink) => string;
};

function FooterNavPanel({ title, links, resolveLabel }: FooterNavPanelProps) {
	return (
		<nav aria-label={title} className="flex min-w-52 flex-col sm:min-w-60">
			<ul className="flex flex-col gap-1">
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
										"group flex w-full items-center justify-between gap-4 py-3.5",
										"font-heading text-[1.25rem] font-medium leading-snug text-primary-foreground/75 lg:text-[1.375rem]",
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
										className="size-[1.125rem] shrink-0 opacity-30 transition-[opacity,transform] duration-200 group-fine:translate-x-px group-fine:-translate-y-px group-fine:opacity-100"
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
								variant="nav"
								className={cn(
									"group flex w-full items-center justify-between gap-4 py-3.5",
									"font-heading text-[1.25rem] font-medium leading-snug text-primary-foreground/75 lg:text-[1.375rem]",
									"transition-colors duration-200 fine-hover:text-primary-foreground",
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
									className="size-[1.125rem] shrink-0 opacity-0 transition-[opacity,transform] duration-200 group-fine:translate-x-0.5 group-fine:opacity-55"
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
	const logoUrl = await getSiteLogoUrl();
	const donateImageUrl = await getDonateBandImageUrl();

	const resolveLabel = (link: FooterLink) => t(link.labelKey ?? "");

	const navPanels = FOOTER_COLUMNS.map((column) => ({
		key: column.titleKey,
		title: t(column.titleKey),
		links: column.links,
	}));

	// Edited in the dashboard, stored in the CMS — the same source the contact
	// page reads, so a URL changed there moves both at once. The row is drawn
	// in the CMS's own order, and a platform with no glyph is skipped rather
	// than rendered as a placeholder "#" (a bare icon reads as broken).
	const socialPlatforms = await getSocialPlatformsFromApi();
	const hqEmail = getContactOffices().find(
		(office) => office.badge === "hq",
	)?.email;

	const socialLinks: FooterSocialLink[] = [
		...socialPlatforms.flatMap((platform) => {
			const icon = SOCIAL_ICONS[platform.id];
			if (!icon || !platform.href) {
				return [];
			}
			return [
				{
					key: platform.id,
					href: platform.href,
					label: t(platform.id),
					icon,
					external: true,
				},
			];
		}),
		...(hqEmail
			? [
					{
						key: "email",
						href: `mailto:${hqEmail}`,
						label: t("email"),
						icon: EmailIcon,
					},
				]
			: []),
	];

	return (
		<footer className="relative">
			<FooterDonateBand
				imageUrl={donateImageUrl}
				title={t("donateTitle")}
				description={t("donateDescription")}
				cta={t("donateCta")}
			/>

			{/* The gradient ground and watermark belong to the link area only — the
			    donate band above carries its own solid brand-green panel. */}
			<div className="footer-panel relative overflow-hidden">
				{/* Giant, near-invisible brand mark behind everything — pure texture,
				    not a real logo presentation, so it's excluded from a11y. */}
				<div
					aria-hidden="true"
					// opacity kept low: the centered link columns sit directly over the
					// mark's densest strokes, and anything heavier eats their contrast.
					className="pointer-events-none absolute left-1/2 top-1/2 size-[26rem] -translate-x-1/2 -translate-y-1/2 select-none opacity-[0.055] saturate-[0.6] brightness-150 sm:size-[34rem] lg:size-[42rem]"
				>
					<NextImage
						src={logoUrl ?? "/logo.png"}
						alt=""
						fill
						quality={35}
						sizes="(min-width: 1024px) 672px, (min-width: 640px) 544px, 416px"
						className="object-contain"
					/>
				</div>

				<div className="relative z-10 pb-8 pt-14 sm:pt-16 lg:pt-20">
					<Container className="max-w-none 2xl:max-w-[var(--canvas)]">
						<FooterReveal>
							<FooterRevealItem>
								<div className="flex flex-wrap items-center justify-between gap-8">
									<Logo className="text-primary-foreground" reverse />
									<FooterSocialIcons links={socialLinks} />
								</div>

								{/* Centered pair of content-sized columns. NOT a 2-track grid:
							    equal tracks pushed the two lists to opposite page edges.
							    justify-center centers the block under the watermark while
							    each column keeps its own intrinsic width. */}
								<div className="mt-12 flex flex-wrap justify-center gap-x-20 gap-y-8 sm:gap-x-32 lg:mt-14 lg:gap-x-40">
									{navPanels.map((panel) => (
										<FooterNavPanel
											key={panel.key}
											title={panel.title}
											links={panel.links}
											resolveLabel={resolveLabel}
										/>
									))}
								</div>

								<div className="mt-10 flex flex-col-reverse gap-3 border-t border-primary-foreground/10 pt-6 sm:mt-12 sm:flex-row sm:items-center sm:justify-between">
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
							</FooterRevealItem>
						</FooterReveal>
					</Container>
				</div>
			</div>
		</footer>
	);
}
