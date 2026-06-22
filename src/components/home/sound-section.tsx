import { ArrowRightIcon } from "@heroicons/react/24/outline";
import { getTranslations } from "next-intl/server";
import { SoundSectionVideo } from "@/components/home/sound-section-video";
import { DirectionalIcon } from "@/components/ui/directional-icon";
import { Link } from "@/components/ui/link";
import { cn } from "@/lib/utils";

const soundCtaClass =
	"group/sound-cta relative inline-flex h-10 w-fit shrink-0 items-center gap-2.5 overflow-hidden border border-white/70 bg-white/10 px-5 font-heading text-small font-semibold text-white no-underline backdrop-blur-[2px] transition-[color,gap,box-shadow,background-color,border-color] duration-300 ease-out before:absolute before:inset-0 before:z-0 before:origin-bottom before:scale-y-0 before:bg-white before:transition-transform before:duration-300 before:ease-[cubic-bezier(0.22,1,0.36,1)] fine-hover:gap-3.5 fine-hover:border-white fine-hover:text-foreground fine-hover:shadow-[0_8px_24px_-12px_rgba(0,0,0,0.45)] fine-hover:before:scale-y-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white motion-reduce:before:transition-none motion-reduce:fine-hover:before:scale-y-100 motion-reduce:fine-hover:gap-2.5";

type SoundSectionProps = {
	/** Constrained height for UI playground previews. */
	compact?: boolean;
	className?: string;
};

export async function SoundSection({
	compact = false,
	className,
}: SoundSectionProps = {}) {
	const t = await getTranslations("Sound");

	return (
		<section
			aria-labelledby="sound-heading"
			className={cn(
				"cv-auto relative w-full overflow-hidden border-t border-border [--cv-intrinsic:900px]",
				compact ? "min-h-112 sm:min-h-144" : "min-h-svh",
				className,
			)}
		>
			<SoundSectionVideo />

			{/* Warm ink wash + legibility scrims (stacked; strongest at bottom + text side). */}
			<div
				className="pointer-events-none absolute inset-0 z-1 bg-foreground/45"
				aria-hidden
			/>
			<div
				className="pointer-events-none absolute inset-0 z-1 bg-linear-to-t from-foreground from-0% via-foreground/80 via-32% to-transparent to-72%"
				aria-hidden
			/>
			<div
				className="pointer-events-none absolute inset-x-0 top-0 z-1 h-44 bg-linear-to-b from-foreground/85 via-foreground/35 to-transparent sm:h-52"
				aria-hidden
			/>
			<div
				className="pointer-events-none absolute inset-0 z-1 bg-linear-to-r from-foreground/75 from-0% via-foreground/40 via-42% to-transparent to-80% rtl:bg-linear-to-l"
				aria-hidden
			/>
			<div
				className="pointer-events-none absolute inset-0 z-1 bg-[radial-gradient(ellipse_130%_90%_at_50%_115%,var(--color-foreground)_0%,transparent_62%)] opacity-70"
				aria-hidden
			/>

			<div className="relative z-10 flex min-h-[inherit] flex-col justify-end px-6 pb-14 sm:px-10 sm:pb-16 lg:px-14 lg:pb-20">
				<div className="max-w-4xl text-start text-white">
					<p className="hero-slide-eyebrow">{t("eyebrow")}</p>

					<h2 id="sound-heading" className="hero-slide-title mt-3">
						{t("title")}
					</h2>

					<p className="hero-slide-description mt-5 max-w-xl">
						{t("description")}
					</p>

					<Link
						href="/audio"
						variant="nav"
						className={cn(soundCtaClass, "mt-8")}
					>
						<span className="relative z-1">{t("cta")}</span>
						<DirectionalIcon
							icon={ArrowRightIcon}
							className="relative z-1 size-4"
						/>
					</Link>
				</div>
			</div>
		</section>
	);
}
