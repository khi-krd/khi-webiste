import type { TrackState } from "@/types/audio";

export type AudioUrlParams = {
	type?: string | null;
	state?: TrackState | string | null;
	topic?: number | string | null;
	q?: string | null;
	page?: number;
};

export function parseAudioState(value?: string | null): TrackState | null {
	if (value === "single") {
		return "SINGLE";
	}
	if (value === "multi") {
		return "MULTI";
	}
	return null;
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
	q,
	page,
}: AudioUrlParams): string {
	const params = new URLSearchParams();

	if (type?.trim()) {
		params.set("type", type.trim());
	}
	const stateParam =
		state === "SINGLE" ? "single" : state === "MULTI" ? "multi" : null;
	if (stateParam) {
		params.set("state", stateParam);
	}
	if (topic != null && topic !== "") {
		params.set("topic", String(topic));
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
