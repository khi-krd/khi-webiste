/**
 * FNV-1a, 32-bit. Pure and deterministic, so the server markup and any client
 * re-render agree byte for byte — the audio waveform motif seeds its bar
 * heights from it and must never cause a hydration mismatch.
 */
export function fnv1a(input: string): number {
	let hash = 0x811c9dc5;
	for (const char of input) {
		hash ^= char.codePointAt(0) ?? 0;
		hash = Math.imul(hash, 0x01000193) >>> 0;
	}
	return hash >>> 0;
}
