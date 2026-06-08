import type { SimpleIcon } from "simple-icons";
import { siFacebook, siInstagram, siWhatsapp, siYoutube } from "simple-icons";
import type { SocialPlatformId } from "@/lib/mock/contact";
import { cn } from "@/lib/utils";

const ICONS: Record<SocialPlatformId, SimpleIcon> = {
	whatsapp: siWhatsapp,
	youtube: siYoutube,
	instagram: siInstagram,
	facebook: siFacebook,
};

function BrandIcon({ icon }: { icon: SimpleIcon }) {
	return (
		<svg
			role="img"
			viewBox="0 0 24 24"
			className="size-5 shrink-0"
			fill="currentColor"
			aria-hidden
		>
			<title>{icon.title}</title>
			<path d={icon.path} />
		</svg>
	);
}

type SocialPlatformCardProps = {
	href: string;
	platformId: SocialPlatformId;
	name: string;
	handle: string;
	className?: string;
};

export function SocialPlatformCard({
	href,
	platformId,
	name,
	handle,
	className,
}: SocialPlatformCardProps) {
	const icon = ICONS[platformId];

	return (
		<a
			href={href}
			target="_blank"
			rel="noreferrer"
			className={cn(
				"group flex flex-col gap-6 border border-border bg-background p-5 no-underline transition-[border-color,box-shadow] duration-300 fine-hover:border-border-strong fine-hover:shadow-[0_8px_32px_-24px_rgba(26,24,19,0.35)] motion-reduce:transition-none sm:p-6",
				className,
			)}
		>
			<div className="flex items-center justify-between gap-3">
				<span className="text-foreground transition-colors fine-hover:text-foreground">
					<BrandIcon icon={icon} />
				</span>
				<span className="label font-medium text-muted">{name}</span>
			</div>
			<span className="font-heading text-body font-semibold text-foreground">
				{handle}
			</span>
		</a>
	);
}
