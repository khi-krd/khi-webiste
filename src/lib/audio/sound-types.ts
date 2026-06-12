export const KNOWN_SOUND_TYPES = [
	"poem",
	"music",
	"folk",
	"religious",
	"speech",
	"interview",
	"radio",
] as const;

export type KnownSoundType = (typeof KNOWN_SOUND_TYPES)[number];

export function isKnownSoundType(value: string): value is KnownSoundType {
	return (KNOWN_SOUND_TYPES as readonly string[]).includes(value);
}

type TranslateFn = (key: string) => string;

/**
 * `soundType` is free text on the API; known values get a translated label,
 * anything else renders as-is.
 */
export function soundTypeLabel(t: TranslateFn, raw: string): string {
	if (isKnownSoundType(raw)) {
		return t(`soundTypes.${raw}`);
	}
	return raw;
}
