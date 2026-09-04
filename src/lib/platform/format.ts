/**
 * Locale-aware formatting for platform (پلاتفۆڕم) content. Mirrors the
 * conventions already used on the audio detail page: ckb renders Arabic-Indic
 * digits via ar-IQ, Kurmanji stays Latin.
 */

function numberLocale(locale: string): string {
	return locale === "ckb" ? "ar-IQ" : locale;
}

export function formatCount(locale: string, value: number): string {
	try {
		return new Intl.NumberFormat(numberLocale(locale), {
			maximumFractionDigits: 0,
		}).format(value);
	} catch {
		return String(value);
	}
}

/** Locale digits WITHOUT grouping — years must never read "٢,٠٢٤". */
function formatPlainInteger(locale: string, value: number): string {
	try {
		return new Intl.NumberFormat(numberLocale(locale), {
			maximumFractionDigits: 0,
			useGrouping: false,
		}).format(value);
	} catch {
		return String(value);
	}
}

/** Year of an ISO instant/date, in locale digits. Null when unparseable. */
export function formatYear(
	locale: string,
	iso: string | null | undefined,
): string | null {
	if (!iso) {
		return null;
	}
	const date = new Date(iso);
	if (Number.isNaN(date.getTime())) {
		return null;
	}
	return formatPlainInteger(locale, date.getUTCFullYear());
}

/** Long-form date for the detail page's metadata table. */
export function formatFullDate(
	locale: string,
	iso: string | null | undefined,
): string | null {
	if (!iso) {
		return null;
	}
	const date = new Date(iso);
	if (Number.isNaN(date.getTime())) {
		return null;
	}
	try {
		return new Intl.DateTimeFormat(numberLocale(locale), {
			year: "numeric",
			month: "long",
			day: "numeric",
			timeZone: "UTC",
		}).format(date);
	} catch {
		return date.toISOString().slice(0, 10);
	}
}

/**
 * Facet decade labels arrive as "1950s" — localize the number, keep a plural
 * marker the locale understands (ckb: "…کان", ku: "…an").
 */
export function formatDecadeLabel(locale: string, label: string): string {
	const match = /^(\d{3})0s?$/.exec(label.trim());
	if (!match) {
		return label;
	}
	const decade = Number.parseInt(`${match[1]}0`, 10);
	const digits = formatPlainInteger(locale, decade);
	return locale === "ckb" ? `${digits}کان` : `${digits}an`;
}
