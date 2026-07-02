import type { ComponentPropsWithoutRef, ReactNode } from "react";
import { Badge } from "@/components/ui/badge";
import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/utils";

type BadgeVariant = ComponentPropsWithoutRef<typeof Badge>["variant"];
type BadgeSize = ComponentPropsWithoutRef<typeof Badge>["size"];

type TaxonomyBadgeLinkProps = {
	href: string;
	children: ReactNode;
	variant?: BadgeVariant;
	size?: BadgeSize;
	className?: string;
	badgeClassName?: string;
};

/** Clickable tag/category pill — links to the filtered listing for that term. */
export function TaxonomyBadgeLink({
	href,
	children,
	variant = "outline",
	size = "sm",
	className,
	badgeClassName,
}: TaxonomyBadgeLinkProps) {
	return (
		<Link
			href={href}
			className={cn(
				"inline-flex cursor-pointer rounded-md transition-opacity fine-hover:opacity-80",
				className,
			)}
		>
			<Badge variant={variant} size={size} className={badgeClassName}>
				{children}
			</Badge>
		</Link>
	);
}
