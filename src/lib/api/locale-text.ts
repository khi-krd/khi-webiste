/**
 * Prefer the active language, then the other one — a record written in only
 * one language is still the editor's words, and showing them beats hiding the
 * item or falling back to generic translated copy.
 */
export function preferLocaleText(
	isCkb: boolean,
	ckb: string | null | undefined,
	kmr: string | null | undefined,
): string | null {
	return (
		(isCkb ? ckb?.trim() || kmr?.trim() : kmr?.trim() || ckb?.trim()) || null
	);
}
