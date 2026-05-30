import type { ComponentPropsWithoutRef } from "react";
import { cn } from "@/lib/utils";

type ProseProps = ComponentPropsWithoutRef<"div">;

/**
 * Long-form rich-text wrapper for article/about bodies. Styles nested HTML
 * (p, h2–h4, ul/ol/li, a, blockquote, hr, figure/figcaption, code, strong/em)
 * to the design system. Server component.
 *
 * Pair with <Container width="prose"> for the page measure; Prose keeps its own
 * sensible reading measure too. All styling lives in globals.css (`.prose`,
 * @layer components) using LOGICAL properties + semantic tokens so lists,
 * blockquotes and indentation mirror correctly in RTL.
 */
export function Prose({ className, ...props }: ProseProps) {
	return <div className={cn("prose", className)} {...props} />;
}
