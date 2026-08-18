"use client";

import {
	ArrowRightIcon,
	ClipboardDocumentIcon,
} from "@heroicons/react/24/outline";
import NextImage from "next/image";
import { useState } from "react";
import {
	HomeSection,
	homeSectionContentClass,
	homeSectionHeaderClass,
} from "@/components/donate/donate-shell";
import {
	ScrollReveal,
	ScrollRevealBlock,
	ScrollRevealItem,
} from "@/components/motion/scroll-reveal";
import { Button } from "@/components/ui/button";
import { DirectionalIcon } from "@/components/ui/directional-icon";
import { Link } from "@/components/ui/link";
import type { DonatePaymentDetails } from "@/lib/donate/content";

const supportersCtaClass =
	"group/supporters relative mt-6 inline-flex h-10 w-fit shrink-0 items-center gap-2.5 overflow-hidden border border-primary-foreground/35 bg-primary-foreground/10 px-5 font-heading text-small font-semibold text-primary-foreground no-underline transition-[color,gap,background-color,border-color] duration-300 fine-hover:gap-3.5 fine-hover:border-primary-foreground fine-hover:bg-primary-foreground fine-hover:text-foreground focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-foreground motion-reduce:fine-hover:gap-2.5";

type DonateClosingProps = {
	heading: string;
	supporters: {
		eyebrow: string;
		title: string;
		description: string;
		cta: string;
		image: { url: string; href: string | null };
	};
	payment: DonatePaymentDetails;
	fibCopy: { label: string; copy: string; copied: string };
	fastpayCopy: { label: string; copy: string; copied: string };
};

export function DonateClosing({
	heading,
	supporters,
	payment,
	fibCopy,
	fastpayCopy,
}: DonateClosingProps) {
	return (
		<HomeSection
			className="border-t border-border bg-foreground text-primary-foreground"
			aria-labelledby="donate-closing-heading"
		>
			<ScrollRevealBlock className={homeSectionHeaderClass}>
				<header>
					<div className="max-w-2xl text-start">
						<p className="label font-medium text-primary-foreground/65">
							{supporters.eyebrow}
						</p>
						<h2
							id="donate-closing-heading"
							className="mt-2 font-heading text-h1 font-bold leading-[1.1] text-balance"
						>
							{heading}
						</h2>
						<p className="mt-3 text-body leading-relaxed text-primary-foreground/82">
							{supporters.description}
						</p>
						{supporters.image.href ? (
							<Link
								href={supporters.image.href}
								variant="nav"
								className={supportersCtaClass}
							>
								<span className="relative z-1">{supporters.cta}</span>
								<DirectionalIcon
									icon={ArrowRightIcon}
									className="relative z-1 size-4"
								/>
							</Link>
						) : null}
					</div>
				</header>
			</ScrollRevealBlock>

			<div className={homeSectionContentClass}>
				<ScrollReveal className="grid gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3 lg:gap-4">
					<ScrollRevealItem className="relative min-h-52 overflow-hidden border border-primary-foreground/20 sm:min-h-56 lg:col-span-1">
						<NextImage
							src={supporters.image.url}
							alt=""
							fill
							sizes="(max-width: 1024px) 100vw, 33vw"
							className="object-cover brightness-[0.72] contrast-[1.08] saturate-[0.62]"
						/>
						<div
							className="pointer-events-none absolute inset-0 bg-linear-to-t from-foreground/80 via-foreground/25 to-transparent"
							aria-hidden
						/>
						<div className="relative z-1 flex h-full flex-col justify-end p-5 sm:p-6">
							<p className="font-heading text-h3 font-semibold leading-snug text-balance">
								{supporters.title}
							</p>
						</div>
					</ScrollRevealItem>

					<ScrollRevealItem>
						<PaymentRegisterBlock
							label={fibCopy.label}
							value={payment.fibAccount}
							copyLabel={fibCopy.copy}
							copiedLabel={fibCopy.copied}
						/>
					</ScrollRevealItem>
					<ScrollRevealItem>
						<PaymentRegisterBlock
							label={fastpayCopy.label}
							value={payment.fastpayNumber}
							copyLabel={fastpayCopy.copy}
							copiedLabel={fastpayCopy.copied}
						/>
					</ScrollRevealItem>
				</ScrollReveal>
			</div>
		</HomeSection>
	);
}

type PaymentRegisterBlockProps = {
	label: string;
	value: string;
	copyLabel: string;
	copiedLabel: string;
};

function PaymentRegisterBlock({
	label,
	value,
	copyLabel,
	copiedLabel,
}: PaymentRegisterBlockProps) {
	const [copied, setCopied] = useState(false);

	const handleCopy = async () => {
		try {
			await navigator.clipboard.writeText(value.replace(/\s/g, ""));
			setCopied(true);
			window.setTimeout(() => setCopied(false), 2000);
		} catch {
			setCopied(false);
		}
	};

	return (
		<div className="flex h-full min-h-52 flex-col justify-between border border-primary-foreground/20 bg-primary-foreground/6 p-6 sm:min-h-56 sm:p-8">
			<div>
				<p className="label font-medium text-primary-foreground/65">{label}</p>
				<p
					className="mt-3 font-heading text-[clamp(1.125rem,2vw,1.625rem)] font-bold leading-tight tabular-nums text-primary-foreground"
					dir="ltr"
				>
					{value}
				</p>
			</div>

			<Button
				type="button"
				variant="secondary"
				size="sm"
				className="mt-4 w-fit border-primary-foreground/25 bg-primary-foreground/10 text-primary-foreground fine-hover:bg-primary-foreground fine-hover:text-foreground"
				leadingIcon={<ClipboardDocumentIcon aria-hidden />}
				onClick={handleCopy}
			>
				{copied ? copiedLabel : copyLabel}
			</Button>
		</div>
	);
}
