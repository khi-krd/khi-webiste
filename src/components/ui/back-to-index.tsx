import { ArrowLeftIcon } from "@heroicons/react/24/outline";
import type { ComponentProps } from "react";
import {
	viewAllCtaClass,
	viewAllCtaOnDarkClass,
} from "@/components/ui/cta-styles";
import { DirectionalIcon } from "@/components/ui/directional-icon";
import { Link } from "@/components/ui/link";
import { VisuallyHidden } from "@/components/ui/visually-hidden";
import { cn } from "@/lib/utils";

type BackToIndexLinkProps = {
	/** Locale-relative index path, e.g. "/audio" — the prefix is added for us. */
	href: ComponentProps<typeof Link>["href"];
	/** Visible label: the section's own index-page title. */
	label: string;
	/**
	 * Translated "back to X" phrasing, appended for assistive tech only. It is
	 * APPENDED rather than set as `aria-label` on purpose: an aria-label would
	 * replace the visible title in the accessible name, and a name that does not
	 * contain its own visible label fails WCAG 2.5.3 (Label in Name) for
	 * voice-control users.
	 */
	ariaLabel?: string;
	/** "dark" for the CTA sitting on a near-black hero. */
	tone?: "light" | "dark";
	className?: string;
};

/**
 * "Back to the section index" button for item/detail pages — the way out of an
 * album, a gallery post, a project, an article, a film or a publication. The
 * face carries the INDEX PAGE'S OWN TITLE (so the destination is named, not
 * just gestured at) and the arrow LEADS, wrapped in <DirectionalIcon> so it
 * points back in both scripts. Server component.
 *
 * Styling is the site-wide hairline CTA (`viewAllCtaClass`) so it reads as one
 * family with every other زیاتر button; children carry `relative z-1` to sit
 * above that class's ::before hover wipe.
 */
export function BackToIndexLink({
	href,
	label,
	ariaLabel,
	tone = "light",
	className,
}: BackToIndexLinkProps) {
	return (
		<Link
			href={href}
			variant="nav"
			className={cn(
				tone === "dark" ? viewAllCtaOnDarkClass : viewAllCtaClass,
				className,
			)}
		>
			<DirectionalIcon
				icon={ArrowLeftIcon}
				className="relative z-1 size-4 shrink-0"
			/>
			<span className="relative z-1">{label}</span>
			{ariaLabel ? <VisuallyHidden>{ariaLabel}</VisuallyHidden> : null}
		</Link>
	);
}
