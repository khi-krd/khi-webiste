/**
 * Deterministic decorative waveform bars. Seeded by id so server and client
 * render identical output — never use Math.random() here (hydration safety).
 */

function mulberry32(seed: number): () => number {
	let state = seed >>> 0;
	return () => {
		state = (state + 0x6d2b79f5) >>> 0;
		let t = state;
		t = Math.imul(t ^ (t >>> 15), t | 1);
		t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
		return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
	};
}

/** Returns `count` bar heights in [0.15, 1], shaped like a plausible waveform. */
export function waveformBars(seedId: number, count = 48): number[] {
	const random = mulberry32(seedId * 2654435761);
	const bars: number[] = [];
	let momentum = 0.55;
	for (let i = 0; i < count; i += 1) {
		// random walk with mean reversion → smooth, audio-like contour
		momentum += (random() - 0.5) * 0.45 + (0.55 - momentum) * 0.2;
		const envelope = Math.sin((Math.PI * (i + 0.5)) / count) ** 0.45;
		const height = Math.min(
			1,
			Math.max(0.15, momentum * envelope + random() * 0.12),
		);
		bars.push(Number(height.toFixed(3)));
	}
	return bars;
}
