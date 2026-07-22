import { ArrowRightIcon } from "@heroicons/react/24/outline";
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
import { DirectionalIcon } from "@/components/ui/directional-icon";
import { Link } from "@/components/ui/link";
import { cn } from "@/lib/utils";

const viewAllClass =
	"group/viewall relative inline-flex h-10 w-fit shrink-0 items-center gap-2.5 overflow-hidden border border-foreground px-5 font-heading text-small font-semibold text-foreground no-underline transition-[color,gap,box-shadow] duration-300 ease-out before:absolute before:inset-0 before:z-0 before:origin-bottom before:scale-y-0 before:bg-foreground before:transition-transform before:duration-300 before:ease-[cubic-bezier(0.22,1,0.36,1)] fine-hover:gap-3.5 fine-hover:text-primary-foreground fine-hover:shadow-[0_8px_24px_-12px_rgba(26,24,19,0.35)] fine-hover:before:scale-y-100 motion-reduce:before:transition-none motion-reduce:fine-hover:before:scale-y-100 motion-reduce:fine-hover:gap-2.5";

type DonateParticipationProps = {
	heading: string;
	archive: { label: string; body: string; cta: string };
	financial: { label: string; body: string; cta: string };
	body: string;
	closing: string;
	showArchive?: boolean;
	showFinancial?: boolean;
};

export function DonateParticipation({
	heading,
	archive,
	financial,
	body,
	closing,
	showArchive = true,
	showFinancial = true,
}: DonateParticipationProps) {
	return (
		<HomeSection
			className="bg-sunken/30"
			aria-labelledby="donate-participate-heading"
		>
			<ScrollRevealBlock className={homeSectionHeaderClass}>
				<header>
					<div className="max-w-2xl text-start">
						<h2
							id="donate-participate-heading"
							className="font-heading text-h1 font-bold leading-[1.1] text-balance"
						>
							{heading}
						</h2>
					</div>
				</header>
			</ScrollRevealBlock>

			<div className={homeSectionContentClass}>
				{showArchive || showFinancial ? (
					<ScrollReveal className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4">
						{showArchive ? (
							<ScrollRevealItem>
								<PathCard
									label={archive.label}
									body={archive.body}
									cta={archive.cta}
									href="#archive-form"
								/>
							</ScrollRevealItem>
						) : null}
						{showFinancial ? (
							<ScrollRevealItem>
								<PathCard
									label={financial.label}
									body={financial.body}
									cta={financial.cta}
									href="#financial-form"
								/>
							</ScrollRevealItem>
						) : null}
					</ScrollReveal>
				) : null}

				<ScrollRevealBlock className="mt-8 border border-border bg-background p-6 sm:mt-10 sm:p-8">
					<p className="max-w-3xl text-body leading-relaxed text-foreground">
						{body}
					</p>
					<p className="mt-4 max-w-3xl border-inline-start-2 border-border-strong ps-4 font-heading text-h3 font-semibold leading-snug text-foreground">
						{closing}
					</p>
				</ScrollRevealBlock>
			</div>
		</HomeSection>
	);
}

type PathCardProps = {
	label: string;
	body: string;
	cta: string;
	href: string;
};

function PathCard({ label, body, cta, href }: PathCardProps) {
	return (
		<article className="flex h-full flex-col border border-border bg-surface p-6 sm:p-8">
			<p className="label font-medium text-muted">{label}</p>
			<p className="mt-3 text-body leading-relaxed text-foreground">{body}</p>
			<Link href={href} variant="nav" className={cn(viewAllClass, "mt-6")}>
				<span className="relative z-1">{cta}</span>
				<DirectionalIcon
					icon={ArrowRightIcon}
					className="relative z-1 size-4"
				/>
			</Link>
		</article>
	);
}
