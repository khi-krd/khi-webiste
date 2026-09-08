import { fnv1a } from "@/lib/platform/hash";

const BAR_COUNT = 32;
const BAR_PITCH = 4;
const BAR_WIDTH = 2;
const MIN_HEIGHT = 6;
const HEIGHT_RANGE = 28;
const VIEWBOX_HEIGHT = 40;

/**
 * The audio plate's stand-in for a cover: a still waveform whose bar heights
 * are seeded from the item's code, so every recording gets its own silhouette
 * and the server and client always draw the same one (no hydration drift).
 * Decorative only — the card is named by its title.
 */
export function WaveformMotif({ code }: { code: string }) {
	const bars = Array.from({ length: BAR_COUNT }, (_, index) => {
		const height = MIN_HEIGHT + (fnv1a(`${code}:${index}`) % HEIGHT_RANGE);
		return {
			x: index * BAR_PITCH,
			y: (VIEWBOX_HEIGHT - height) / 2,
			height,
		};
	});

	return (
		<svg
			aria-hidden="true"
			role="presentation"
			viewBox={`0 0 ${BAR_COUNT * BAR_PITCH} ${VIEWBOX_HEIGHT}`}
			fill="currentColor"
			className="pointer-events-none absolute inset-x-[16%] top-1/2 w-[68%] -translate-y-1/2 text-border-strong transition-colors duration-300 group-fine:text-muted"
		>
			{bars.map((bar) => (
				<rect
					key={bar.x}
					x={bar.x}
					y={bar.y}
					width={BAR_WIDTH}
					height={bar.height}
				/>
			))}
		</svg>
	);
}
