import type { z } from "zod";
import {
	normalizeImageCollectionRecord,
	normalizeSoundTrackRecord,
	normalizeVideoRecord,
	normalizeWritingRecord,
} from "../src/lib/api/normalize";
import { SoundTrackSchema, SoundTracksPageSchema } from "../src/types/audio";
import { ContactActivePageSchema } from "../src/types/contact-page";
import { FeaturedApiItemsSchema } from "../src/types/content";
import {
	ImageCollectionSchema,
	ImageCollectionsPageSchema,
} from "../src/types/gallery";
import { ProjectSchema, ProjectsPageSchema } from "../src/types/project";
import { ServicesPageSchema } from "../src/types/service";
import { VideoSchema, VideosPageSchema } from "../src/types/video";
import { WritingSchema, WritingsPageSchema } from "../src/types/writing";

const API =
	process.env.API_BASE_URL ??
	"https://blissful-spontaneity-production.up.railway.app";

function unwrapApiPayload(payload: unknown): unknown | null {
	if (!payload || typeof payload !== "object") {
		return payload;
	}
	const record = payload as Record<string, unknown>;
	if ("success" in record && "data" in record) {
		return record.success === true ? record.data : null;
	}
	return payload;
}

function parsePageItems<T>(
	content: unknown[],
	itemSchema: z.ZodType<T>,
	normalizeItem?: (item: unknown) => unknown,
): T[] {
	return content
		.map((rawItem) => {
			const candidate = normalizeItem ? normalizeItem(rawItem) : rawItem;
			const parsed = itemSchema.safeParse(candidate);
			return parsed.success ? parsed.data : null;
		})
		.filter((item): item is T => item != null);
}

async function testPage<T>(
	name: string,
	path: string,
	itemSchema: z.ZodType<T>,
	normalizeItem?: (item: unknown) => unknown,
) {
	const response = await fetch(`${API}${path}`);
	const payload: unknown = await response.json();
	const data = unwrapApiPayload(payload) as { content?: unknown[] };
	const items = parsePageItems(data?.content ?? [], itemSchema, normalizeItem);
	console.log(
		`${name}: ${items.length > 0 ? "OK" : "FAIL"} parsed=${items.length} status=${response.status}`,
	);
}

async function testSchema(name: string, path: string, schema: z.ZodType) {
	const response = await fetch(`${API}${path}`);
	const payload: unknown = await response.json();
	const data = unwrapApiPayload(payload);
	const parsed = schema.safeParse(data);
	console.log(
		`${name}: ${parsed.success ? "OK" : "FAIL"} status=${response.status}`,
	);
	if (!parsed.success) {
		console.log(parsed.error.issues.slice(0, 3));
	}
}

async function main() {
	await testPage(
		"projects",
		"/api/v1/projects/getAll?page=0&size=5",
		ProjectSchema,
	);
	await testPage(
		"writings",
		"/api/v1/writings?page=0&size=5",
		WritingSchema,
		normalizeWritingRecord,
	);
	await testPage(
		"sound",
		"/api/v1/sound-tracks?page=0&size=5",
		SoundTrackSchema,
		normalizeSoundTrackRecord,
	);
	await testPage(
		"videos",
		"/api/v1/videos?page=0&size=5",
		VideoSchema,
		normalizeVideoRecord,
	);
	await testPage(
		"gallery",
		"/api/v1/image-collections?page=0&size=5",
		ImageCollectionSchema,
		normalizeImageCollectionRecord,
	);
	await testSchema(
		"services/all",
		"/api/v1/services/all?page=0&size=5",
		ServicesPageSchema,
	);
	await testSchema(
		"contact",
		"/api/v1/contact/active",
		ContactActivePageSchema,
	);
	await testSchema(
		"featured-ckb",
		"/api/v1/featured?locale=ckb",
		FeaturedApiItemsSchema,
	);
	await testSchema(
		"featured-ku",
		"/api/v1/featured?locale=ku",
		FeaturedApiItemsSchema,
	);
}

main().catch((error) => {
	console.error(error);
	process.exit(1);
});
