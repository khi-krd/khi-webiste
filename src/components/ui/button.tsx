import {
	type ComponentPropsWithoutRef,
	forwardRef,
	type ReactNode,
} from "react";
import { cn } from "@/lib/utils";
import { DrawnBorder } from "./drawn-border";

type Variant = "primary" | "secondary" | "ghost";
type Size = "sm" | "md" | "lg";

type ButtonProps = {
	variant?: Variant;
	size?: Size;
	/** Icon shown at the inline-START (flips to the right in RTL automatically). */
	leadingIcon?: ReactNode;
	/** Icon shown at the inline-END. */
	trailingIcon?: ReactNode;
} & ComponentPropsWithoutRef<"button">;

// `relative` + `draw-border-host` host the DrawnBorder overlay; `isolate` keeps
// its stacking context local. rounded-md now resolves to 0 (square) via tokens.
const base =
	"draw-border-host relative isolate inline-flex items-center justify-center " +
	"gap-2 overflow-hidden rounded-md font-medium transition-colors " +
	"disabled:pointer-events-none disabled:opacity-50 " +
	"[&_svg]:shrink-0 [&>:not(svg)]:relative [&>:not(svg)]:z-1";

const variants: Record<Variant, string> = {
	primary: "bg-primary text-primary-foreground hover:opacity-90",
	secondary:
		"border border-border-strong bg-surface text-foreground hover:bg-sunken",
	ghost: "text-foreground hover:bg-sunken",
};

const sizes: Record<Size, string> = {
	sm: "h-8 px-3 text-small leading-none [&_svg]:size-4",
	md: "h-10 px-4 text-small leading-none [&_svg]:size-4",
	lg: "h-12 px-5 text-body leading-none [&_svg]:size-5",
};

/**
 * Button — server component (no interactivity of its own; consumers add
 * onClick from their own client components). Icons sit in normal DOM order, so
 * `inline-flex` + the document `dir` mirror them automatically: the leading
 * icon renders at the start in both LTR and RTL — no physical left/right.
 *
 * NOTE: icons here are treated as decorative (gap-spaced, aria-hidden). A
 * *directional* glyph (chevron/arrow) should flip with dir — wrap it in
 * <DirectionalIcon>, or use <Link withArrow> which handles it.
 *
 * Hover: ALL variants (primary, secondary, ghost) get the <DrawnBorder> overlay
 * — a single stroke that traces the perimeter on hover/focus and reverses on
 * leave. Pure CSS, so the Button stays a Server Component (no client surface).
 * The overlay never affects layout (absolute, pointer-events:none). Label/icons
 * sit above the stroke via z-1; the host clips any subpixel bleed (overflow-hidden).
 */
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
	(
		{
			variant = "primary",
			size = "md",
			leadingIcon,
			trailingIcon,
			type = "button",
			className,
			children,
			...props
		},
		ref,
	) => (
		<button
			ref={ref}
			type={type}
			className={cn(base, variants[variant], sizes[size], className)}
			{...props}
		>
			<DrawnBorder />
			{leadingIcon && (
				<span className="inline-flex shrink-0 items-center" aria-hidden>
					{leadingIcon}
				</span>
			)}
			{children}
			{trailingIcon && (
				<span className="inline-flex shrink-0 items-center" aria-hidden>
					{trailingIcon}
				</span>
			)}
		</button>
	),
);
Button.displayName = "Button";
