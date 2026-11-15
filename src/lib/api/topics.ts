import { apiFetchRaw } from "@/lib/api/client";
import { getApiBaseUrl } from "@/lib/api/config";

export type TopicEntityType = "VIDEO" | "SOUND" | "IMAGE" | "WRITING";

/**
 * Record count per topic id (`GET /api/v1/topics/{entityType}/counts`) —
 * powers the "(N)" badges inside filter dropdowns.
 */
export async function getTopicCounts(
	entityType: TopicEntityType,
): Promise<Record<number, number>> {
	if (!getApiBaseUrl()) {
		return {};
	}
	const raw = await apiFetchRaw(`/api/v1/topics/${entityType}/counts`, {
		tags: ["topic-counts", entityType],
		revalidate: 300,
	});
	if (!raw || typeof raw !== "object" || Array.isArray(raw)) {
		return {};
	}
	const out: Record<number, number> = {};
	for (const [k, v] of Object.entries(raw as Record<string, unknown>)) {
		const id = Number(k);
		const count = Number(v);
		if (Number.isFinite(id) && Number.isFinite(count)) {
			out[id] = count;
		}
	}
	return out;
}
