import { formatCount } from "@/lib/platform/format";
import type { PlatformHit, PlatformPersonSummary } from "@/types/platform";

/**
 * Display helpers for platform (پلاتفۆڕم) records.
 *
 * The archive's item codes — `GHULAMALIROMI_VID_RAW_V1_Copy(1)_000001` and
 * friends — are routing keys, not copy. A third of the catalogue has no title
 * at all and the API echoes the code in its place, so every surface that
 * shows a record goes through {@link platformDisplayTitle} and never falls
 * back to the raw code. Codes stay in URLs and filter values only.
 */

/** Matches the platform's generated codes, never a human title. */
function looksLikeCode(value: string): boolean {
	if (/\s/.test(value)) {
		return false;
	}
	return (
		/_(AUD|VID|IMG|TXT|PROJ)_/i.test(value) ||
		/_Copy\(\d+\)/i.test(value) ||
		/_\d{4,}$/.test(value)
	);
}

/** True when `value` is empty, the record's own code, or shaped like one. */
export function isPlatformCode(
	value: string | null | undefined,
	code?: string | null,
): boolean {
	const trimmed = value?.trim();
	if (!trimmed) {
		return false;
	}
	if (code && trimmed.toLowerCase() === code.trim().toLowerCase()) {
		return true;
	}
	return looksLikeCode(trimmed);
}

/** The trailing sequence of a code (`…_000003` → 3), or null. */
export function platformCodeOrdinal(code: string): number | null {
	const match = /_(\d{2,})$/.exec(code.trim());
	if (!match) {
		return null;
	}
	const ordinal = Number.parseInt(match[1], 10);
	return Number.isFinite(ordinal) && ordinal > 0 ? ordinal : null;
}

/**
 * Project and collection names arrive as folder slugs (`Album_Ghulam_Ali_Romi`,
 * `kalupaly_kurdawari`). Underscores become spaces for display; anything that
 * already contains whitespace is left exactly as typed.
 */
export function humanizePlatformName(
	value: string | null | undefined,
): string | null {
	const trimmed = value?.trim();
	if (!trimmed) {
		return null;
	}
	if (/\s/.test(trimmed)) {
		return trimmed;
	}
	return trimmed.replace(/_+/g, " ").trim() || null;
}

/** The person's name in the script the visitor is reading. */
export function platformPersonName(
	person: PlatformPersonSummary | null | undefined,
	locale: string,
): string | null {
	if (!person) {
		return null;
	}
	const fullName = person.fullName?.trim() || null;
	const romanized = person.romanizedName?.trim() || null;
	const nickname = person.nickname?.trim() || null;
	return locale === "ku"
		? (romanized ?? fullName ?? nickname)
		: (fullName ?? nickname ?? romanized);
}

type TitleSource = Pick<
	PlatformHit,
	| "code"
	| "title"
	| "titleInCentralKurdish"
	| "romanizedTitle"
	| "subtitle"
	| "projectName"
	| "person"
>;

export type PlatformDisplayTitle = {
	title: string;
	/** True when the record carries no real title and a label was composed. */
	untitled: boolean;
};

function firstRealTitle(hit: TitleSource, locale: string): string | null {
	const candidates =
		locale === "ku"
			? [hit.title, hit.romanizedTitle, hit.titleInCentralKurdish, hit.subtitle]
			: [
					hit.title,
					hit.titleInCentralKurdish,
					hit.subtitle,
					hit.romanizedTitle,
				];
	for (const candidate of candidates) {
		const trimmed = candidate?.trim();
		if (trimmed && !isPlatformCode(trimmed, hit.code)) {
			return trimmed;
		}
	}
	return null;
}

/**
 * The title to print for a record. A real title wins; otherwise the label is
 * composed from what the record does say about itself — the person or the
 * collection, then the kind and its sequence number (`غوڵام عەلی ڕۆمی · ڤیدیۆ ١`)
 * — so untitled items stay distinct without ever exposing the code.
 */
export function platformDisplayTitle(
	hit: TitleSource,
	options: { locale: string; kindLabel: string },
): PlatformDisplayTitle {
	const real = firstRealTitle(hit, options.locale);
	if (real) {
		return { title: real, untitled: false };
	}

	const base =
		platformPersonName(hit.person, options.locale) ??
		humanizePlatformName(hit.projectName);
	const ordinal = platformCodeOrdinal(hit.code);
	const label = ordinal
		? `${options.kindLabel} ${formatCount(options.locale, ordinal)}`
		: options.kindLabel;

	return { title: base ? `${base} · ${label}` : label, untitled: true };
}

/**
 * The secondary line under a title: the subtitle, else the romanized form —
 * never the code, never a repeat of the title, and nothing at all for a
 * composed label (its context is already in the label).
 */
export function platformDisplaySubtitle(
	hit: TitleSource,
	display: PlatformDisplayTitle,
): string | null {
	if (display.untitled) {
		return null;
	}
	const candidates = [
		hit.subtitle,
		hit.romanizedTitle,
		hit.titleInCentralKurdish,
	];
	for (const candidate of candidates) {
		const trimmed = candidate?.trim();
		if (
			trimmed &&
			trimmed !== display.title &&
			!isPlatformCode(trimmed, hit.code)
		) {
			return trimmed;
		}
	}
	return null;
}

/**
 * Fields the query matched in, minus the ones that mean nothing to a reader:
 * `code` is internal, and `title` is self-evident from the card itself.
 */
export function visibleMatchedIn(
	matchedIn: readonly string[] | null | undefined,
): string[] {
	return (matchedIn ?? []).filter(
		(field) => field !== "code" && field !== "title",
	);
}
