import type { ComponentPropsWithoutRef } from "react";
import { cn } from "@/lib/utils";

type Level = 1 | 2 | 3 | 4;
type Size = "display" | "h1" | "h2" | "h3";

type HeadingProps = {
	/** Semantic level → rendered tag (h1–h4) AND, by default, the visual size. */
	level: Level;
	/**
	 * Optional visual-size override, decoupled from `level` for cases where the
	 * scale shouldn't track the document outline (e.g. a semantic h2 shown at
	 * display size). Defaults to match `level`.
	 */
	size?: Size;
} & ComponentPropsWithoutRef<"h1">;

// Size → scale token + weight. Weight tracks the VISUAL size (so a level-2
// heading shown at display size still reads as display). No letter-spacing —
// tracking is unsafe for Arabic; per-script heading leading is handled globally.
const sizeClass: Record<Size, string> = {
	display: "text-display font-bold",
	h1: "text-h1 font-bold",
	h2: "text-h2 font-semibold",
	h3: "text-h3 font-semibold",
};

// No h4 size token by design — level 4 reuses the smallest heading size (h3).
const levelDefaultSize: Record<Level, Size> = {
	1: "h1",
	2: "h2",
	3: "h3",
	4: "h3",
};

/**
 * Semantic heading. `level` controls the tag (and default size); `size`
 * optionally overrides the visual scale without changing the outline. Server
 * component. For a display-scale hero use `<Heading level={1} size="display">`.
 */
export function Heading({ level, size, className, ...props }: HeadingProps) {
	const Tag = `h${level}` as const;
	const visual = size ?? levelDefaultSize[level];
	return <Tag className={cn(sizeClass[visual], className)} {...props} />;
}
