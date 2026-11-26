export type AudioUrlParams = {
	type?: string | null;
	/** Managed type slug — SINGLE/MULTI keep their short `single`/`multi` form. */
	state?: string | null;
	topic?: number | string | null;
	tag?: string | null;
	q?: string | null;
	page?: number;
};

export function parseAudioState(value?: string | null): string | null {
	const slug = value?.trim().toUpperCase();
	return slug && /^[A-Z0-9_]+$/.test(slug) ? slug : null;
}

export function parseAudioTag(value?: string | null): string | null {
	return value?.trim() || null;
}

export function parseAudioTopicId(value?: string | null): number | null {
	if (!value) {
		return null;
	}
	const parsed = Number.parseInt(value, 10);
	return Number.isInteger(parsed) && parsed > 0 ? parsed : null;
}

export function buildAudioHref({
	type,
	state,
	topic,
	tag,
	q,
	page,
}: AudioUrlParams): string {
	const params = new URLSearchParams();

	if (type?.trim()) {
		params.set("type", type.trim());
	}
	const stateParam =
		state === "SINGLE" || state === "MULTI"
			? state.toLowerCase()
			: state?.trim() || null;
	if (stateParam) {
		params.set("state", stateParam);
	}
	if (topic != null && topic !== "") {
		params.set("topic", String(topic));
	}
	if (tag?.trim()) {
		params.set("tag", tag.trim());
	}
	if (q?.trim()) {
		params.set("q", q.trim());
	}
	if (page && page > 1) {
		params.set("page", String(page));
	}

	const qs = params.toString();
	return qs ? `/audio?${qs}` : "/audio";
}
