export { formatDuration } from "@/lib/audio/format";

/** Formats a megabyte figure as `### MB`, or `#.## GB` once it crosses 1 GB. */
export function formatFileSizeMb(mb: number | null): string | null {
	if (mb == null || mb <= 0) {
		return null;
	}
	if (mb >= 1024) {
		return `${(mb / 1024).toFixed(2)} GB`;
	}
	const rounded = Number.isInteger(mb) ? mb : Number(mb.toFixed(1));
	return `${rounded} MB`;
}

/** Formats an ISO `yyyy-MM-dd` date for the active locale, falling back to raw. */
export function formatPublishmentDate(
	locale: string,
	value: string | null,
): string | null {
	if (!value) {
		return null;
	}
	try {
		return new Intl.DateTimeFormat(locale, {
			year: "numeric",
			month: "long",
			day: "numeric",
		}).format(new Date(value));
	} catch {
		return value;
	}
}
