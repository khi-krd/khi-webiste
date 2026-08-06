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

/**
 * Returns `count` bar heights in [0.28, 1] for a waveform bent around a circle.
 * Built from integer harmonics so the contour closes on itself — a random walk
 * would leave a visible seam where the last bar meets the first.
 */
export function radialWaveformBars(seedId: number, count = 52): number[] {
	const random = mulberry32(seedId * 2654435761);
	const harmonics = [2, 3, 5, 8, 13, 21].map((frequency) => ({
		frequency,
		amplitude: 0.34 / frequency ** 0.5,
		phase: random() * Math.PI * 2,
	}));

	const raw = Array.from({ length: count }, (_, index) => {
		const theta = (2 * Math.PI * index) / count;
		let value = 0;
		for (const { frequency, amplitude, phase } of harmonics) {
			value += amplitude * Math.sin(frequency * theta + phase);
		}
		return value;
	});

	// Stretch to the full [0.12, 1] range per seed — otherwise quiet seeds render
	// as a near-uniform starburst instead of a waveform.
	const low = Math.min(...raw);
	const span = Math.max(...raw) - low || 1;
	return raw.map((value) =>
		Number((0.12 + ((value - low) / span) * 0.88).toFixed(3)),
	);
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
