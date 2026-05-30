/**
 * DrawnBorder — animated hover-stroke overlay for buttons.
 *
 * A single continuous <rect> stroke traces the button's perimeter on hover/
 * focus (and un-draws on leave). Implemented with stroke-dasharray /
 * stroke-dashoffset, normalized with `pathLength={100}` so the dash math is
 * size-independent — one unbroken pen-stroke, not two pseudo-elements meeting.
 *
 * Stays a SERVER COMPONENT: the draw + reverse-on-leave is pure CSS
 * (:hover + transition), so there's no JS, no client bundle, and no hydration —
 * strictly lighter than a Motion-driven client component. All styling, the
 * RTL mirror (scaleX(-1)), and the reduced-motion fallback live in globals.css
 * (`.draw-border` / `.draw-border__rect`). The host button just needs the
 * `draw-border-host` class and `position: relative`.
 *
 * Direction (visual, not logical, so it must be mirrored explicitly):
 *   • ku  (LTR): starts top-left,  draws clockwise.
 *   • ckb (RTL): starts top-right, draws counter-clockwise.
 */
export function DrawnBorder() {
	return (
		<svg
			className="draw-border"
			width="100%"
			height="100%"
			preserveAspectRatio="none"
			aria-hidden="true"
			focusable="false"
		>
			<rect className="draw-border__rect" pathLength={100} />
		</svg>
	);
}
