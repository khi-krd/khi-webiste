import {
	HomeSection,
	homeSectionContentClass,
	homeSectionHeaderClass,
} from "@/components/contact/contact-shell";
import { SocialPlatformCard } from "@/components/contact/social-platform-card";
import type { SocialPlatform, SocialPlatformId } from "@/lib/mock/contact";
import { cn } from "@/lib/utils";

type SocialPlatformCopy = {
	name: string;
	handle: string;
};

type ContactSocialProps = {
	eyebrow: string;
	heading: string;
	platforms: SocialPlatform[];
	getPlatformCopy: (id: SocialPlatformId) => SocialPlatformCopy;
	className?: string;
};

export function ContactSocial({
	eyebrow,
	heading,
	platforms,
	getPlatformCopy,
	className,
}: ContactSocialProps) {
	return (
		<HomeSection
			className={cn("bg-sunken/30", className)}
			aria-labelledby="contact-social-heading"
		>
			<header className={homeSectionHeaderClass}>
				<div className="max-w-2xl text-start">
					{eyebrow ? <p className="label font-medium">{eyebrow}</p> : null}
					<h2
						id="contact-social-heading"
						className={cn(
							"font-heading text-h1 font-bold leading-[1.1] text-balance",
							eyebrow ? "mt-2" : undefined,
						)}
					>
						{heading}
					</h2>
				</div>
			</header>

			<div className={homeSectionContentClass}>
				<div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-4 lg:gap-4">
					{platforms.map((platform) => {
						const copy = getPlatformCopy(platform.id);
						return (
							<SocialPlatformCard
								key={platform.id}
								href={platform.href}
								platformId={platform.id}
								name={copy.name}
								handle={copy.handle}
							/>
						);
					})}
				</div>
			</div>
		</HomeSection>
	);
}
