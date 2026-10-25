/**
 * Strict audit of every GET the website makes against the live backend.
 *
 * The site parses API records one by one and silently skips any record its
 * zod schema rejects, so a schema that is stricter than the backend makes
 * content vanish with no error. This script fails if a SINGLE record is
 * rejected — on every list endpoint, every detail page, and every lookup —
 * and prints the exact field that broke.
 *
 *   API_BASE_URL=http://178.105.80.251 npm run validate:api
 *
 * Optional: PLATFORM_API_BASE_URL (archive platform, defaults to the site's).
 */
import type { z } from "zod";
import {
	normalizeImageCollectionRecord,
	normalizeSeriesBookRecord,
	normalizeServiceRecord,
	normalizeSoundTrackRecord,
	normalizeVideoRecord,
	normalizeWritingRecord,
} from "../src/lib/api/normalize";
import { AboutSchema } from "../src/types/about";
import {
	SoundReklamVideoSchema,
	SoundTopicSchema,
	SoundTrackSchema,
	SoundTrackTypeSchema,
} from "../src/types/audio";
import { ContactPageSchema } from "../src/types/contact-page";
import { FeaturedApiItemSchema } from "../src/types/content";
import {
	DonationSettingsSchema,
	DonationTypeCardSchema,
	DonationTypeSchema,
} from "../src/types/donation";
import { ImageCollectionSchema } from "../src/types/gallery";
import { NavMenuItemSchema } from "../src/types/nav-menu";
import { NewsSchema } from "../src/types/news";
import { PartnerSchema } from "../src/types/partner";
import {
	PlatformSearchResponseSchema,
	PlatformSuggestionSchema,
} from "../src/types/platform";
import { ProjectSchema } from "../src/types/project";
import { ServiceSchema, ServiceTypeOptionSchema } from "../src/types/service";
import { SiteFontSchema } from "../src/types/site-font";
import { SiteSettingsSchema } from "../src/types/site-settings";
import { SitemapResponseSchema } from "../src/types/sitemap";
import { SocialLinkSchema } from "../src/types/social";
import { TeamMemberSchema } from "../src/types/team";
import {
	FilmReklamVideoSchema,
	VideoSchema,
	VideoTopicSchema,
} from "../src/types/video";
import {
	BookGenreRecordSchema,
	SeriesResponseSchema,
	WritingSchema,
} from "../src/types/writing";

const API = (process.env.API_BASE_URL ?? "http://178.105.80.251").replace(
	/\/+$/,
	"",
);
const PLATFORM = (
	process.env.PLATFORM_API_BASE_URL ?? "http://178.105.87.169"
).replace(/\/+$/, "");
const BULK = 200;

type Normalize = (raw: unknown) => unknown;
const identity: Normalize = (raw) => raw;

let checked = 0;
const failures: string[] = [];

function unwrap(payload: unknown): unknown {
	if (payload && typeof payload === "object") {
		const record = payload as Record<string, unknown>;
		if ("success" in record && "data" in record) return record.data;
	}
	return payload;
}

/** Items of a Spring page, a bare array, or an { items } wrapper. */
function itemsOf(data: unknown): unknown[] {
	if (Array.isArray(data)) return data;
	if (data && typeof data === "object") {
		const record = data as Record<string, unknown>;
		for (const key of ["content", "items", "data"]) {
			if (Array.isArray(record[key])) return record[key] as unknown[];
		}
	}
	return [];
}

function idOf(item: unknown): string {
	const record = (item ?? {}) as Record<string, unknown>;
	return String(record.id ?? record.itemKey ?? record.slug ?? "?");
}

function describe(error: z.ZodError): string {
	return error.issues
		.slice(0, 3)
		.map((issue) => `${issue.path.join(".") || "(root)"}: ${issue.message}`)
		.join(" | ");
}

async function getJson(
	url: string,
): Promise<{ status: number; body: unknown }> {
	try {
		const response = await fetch(url, { signal: AbortSignal.timeout(20_000) });
		const text = await response.text();
		return { status: response.status, body: text ? JSON.parse(text) : null };
	} catch (error) {
		return { status: 0, body: String(error) };
	}
}

function check(
	label: string,
	item: unknown,
	schema: z.ZodType,
	normalize: Normalize,
): boolean {
	checked++;
	const parsed = schema.safeParse(normalize(item));
	if (!parsed.success) {
		failures.push(`${label} id=${idOf(item)} → ${describe(parsed.error)}`);
	}
	return parsed.success;
}

/** Every item of a list/page endpoint must parse. Returns the raw items. */
async function list(
	label: string,
	path: string,
	schema: z.ZodType,
	normalize: Normalize = identity,
	base = API,
): Promise<unknown[]> {
	const { status, body } = await getJson(`${base}${path}`);
	if (status !== 200) {
		failures.push(`${label} ${path} → HTTP ${status}`);
		return [];
	}
	const items = itemsOf(unwrap(body));
	let ok = 0;
	for (const item of items) if (check(label, item, schema, normalize)) ok++;
	console.log(
		`${ok === items.length ? "✓" : "✗"} ${label}: ${ok}/${items.length}`,
	);
	return items;
}

/** A single-object endpoint must parse as a whole. */
async function single(
	label: string,
	path: string,
	schema: z.ZodType,
	normalize: Normalize = identity,
	{ optional = false, base = API } = {},
): Promise<void> {
	const { status, body } = await getJson(`${base}${path}`);
	if (status === 404 && optional) {
		console.log(`- ${label}: not configured (404)`);
		return;
	}
	if (status !== 200) {
		failures.push(`${label} ${path} → HTTP ${status}`);
		console.log(`✗ ${label}: HTTP ${status}`);
		return;
	}
	const ok = check(label, unwrap(body), schema, normalize);
	console.log(`${ok ? "✓" : "✗"} ${label}`);
}

/** Every record of the list must also open on its own detail endpoint. */
async function details(
	label: string,
	items: unknown[],
	pathFor: (item: Record<string, unknown>) => string | null,
	schema: z.ZodType,
	normalize: Normalize = identity,
): Promise<void> {
	let ok = 0;
	let total = 0;
	for (const item of items) {
		const path = pathFor(item as Record<string, unknown>);
		if (!path) continue;
		total++;
		const { status, body } = await getJson(`${API}${path}`);
		if (status !== 200) {
			failures.push(`${label} ${path} → HTTP ${status}`);
			continue;
		}
		if (check(label, unwrap(body), schema, normalize)) ok++;
	}
	console.log(`${ok === total ? "✓" : "✗"} ${label}: ${ok}/${total}`);
}

const byId = (base: string) => (item: Record<string, unknown>) =>
	item.id != null ? `${base}/${item.id}` : null;

async function main() {
	console.log(`Auditing ${API} (platform ${PLATFORM})\n`);
	const page = `?page=0&size=${BULK}`;

	// ── Writings ──────────────────────────────────────────────────────────
	const writings = await list(
		"writings",
		`/api/v1/writings${page}`,
		WritingSchema,
		normalizeWritingRecord,
	);
	await details(
		"writings/{id}",
		writings,
		byId("/api/v1/writings"),
		WritingSchema,
		normalizeWritingRecord,
	);
	const seriesIds = new Set(
		writings
			.map((w) => {
				const record = w as Record<string, unknown>;
				const info = (record.seriesInfo ?? {}) as Record<string, unknown>;
				return (record.seriesId ?? info.seriesId) as string | undefined;
			})
			.filter((id): id is string => Boolean(id)),
	);
	for (const seriesId of seriesIds) {
		const { status, body } = await getJson(
			`${API}/api/v1/writings/series/${encodeURIComponent(seriesId)}`,
		);
		if (status !== 200) {
			failures.push(`writings/series/${seriesId} → HTTP ${status}`);
			continue;
		}
		const record = unwrap(body) as Record<string, unknown>;
		const books = itemsOf(record?.books ?? []).map(normalizeSeriesBookRecord);
		check(
			"writings/series",
			{ ...record, books },
			SeriesResponseSchema,
			identity,
		);
	}
	if (seriesIds.size) console.log(`  series checked: ${seriesIds.size}`);
	await list(
		"writings/featured",
		`/api/v1/writings/featured${page}`,
		WritingSchema,
		normalizeWritingRecord,
	);
	await list("book-genres", "/api/v1/book-genres", BookGenreRecordSchema);

	// ── Projects ──────────────────────────────────────────────────────────
	const projects = await list(
		"projects",
		`/api/v1/projects/getAll${page}`,
		ProjectSchema,
	);
	await details(
		"projects/{id}",
		projects,
		byId("/api/v1/projects"),
		ProjectSchema,
	);

	// ── News ──────────────────────────────────────────────────────────────
	const news = await list("news", `/api/v1/news${page}`, NewsSchema);
	await details("news/{id}", news, byId("/api/v1/news"), NewsSchema);

	// ── Videos ────────────────────────────────────────────────────────────
	const videos = await list(
		"videos",
		`/api/v1/videos${page}`,
		VideoSchema,
		normalizeVideoRecord,
	);
	await details(
		"videos/{id}",
		videos,
		byId("/api/v1/videos"),
		VideoSchema,
		normalizeVideoRecord,
	);
	await list(
		"videos/featured",
		`/api/v1/videos/featured${page}`,
		VideoSchema,
		normalizeVideoRecord,
	);
	await list("videos/topics", "/api/v1/videos/topics", VideoTopicSchema);
	await single(
		"videos/film-reklam-video",
		"/api/v1/videos/film-reklam-video",
		FilmReklamVideoSchema,
		identity,
		{ optional: true },
	);

	// ── Sounds ────────────────────────────────────────────────────────────
	const sounds = await list(
		"sound-tracks",
		`/api/v1/sound-tracks${page}`,
		SoundTrackSchema,
		normalizeSoundTrackRecord,
	);
	await details(
		"sound-tracks/{id}",
		sounds,
		byId("/api/v1/sound-tracks"),
		SoundTrackSchema,
		normalizeSoundTrackRecord,
	);
	await list(
		"sound-tracks/album-of-memories",
		`/api/v1/sound-tracks/album-of-memories${page}`,
		SoundTrackSchema,
		normalizeSoundTrackRecord,
	);
	await list(
		"sound-tracks/topics",
		"/api/v1/sound-tracks/topics",
		SoundTopicSchema,
	);
	await list(
		"sound-tracks/types",
		"/api/v1/sound-tracks/types",
		SoundTrackTypeSchema,
	);
	await single(
		"sound-tracks/sound-reklam-video",
		"/api/v1/sound-tracks/sound-reklam-video",
		SoundReklamVideoSchema,
		identity,
		{ optional: true },
	);

	// ── Image collections ─────────────────────────────────────────────────
	const collections = await list(
		"image-collections",
		`/api/v1/image-collections${page}`,
		ImageCollectionSchema,
		normalizeImageCollectionRecord,
	);
	await details(
		"image-collections/{id}",
		collections,
		byId("/api/v1/image-collections"),
		ImageCollectionSchema,
		normalizeImageCollectionRecord,
	);
	await details(
		"image-collections/slug/{slug}",
		collections,
		(item) => {
			const slug = item.slugCkb ?? item.slugKmr;
			return typeof slug === "string" && slug
				? `/api/v1/image-collections/slug/${encodeURIComponent(slug)}`
				: null;
		},
		ImageCollectionSchema,
		normalizeImageCollectionRecord,
	);

	// ── Services ──────────────────────────────────────────────────────────
	await list(
		"services/all",
		`/api/v1/services/all${page}`,
		ServiceSchema,
		normalizeServiceRecord,
	);
	await list(
		"services/types",
		"/api/v1/services/types",
		ServiceTypeOptionSchema,
	);

	// ── Featured carousel ─────────────────────────────────────────────────
	for (const locale of ["ckb", "ku"]) {
		await list(
			`featured (${locale})`,
			`/api/v1/featured?locale=${locale}`,
			FeaturedApiItemSchema,
		);
	}

	// ── About, contact, donations ─────────────────────────────────────────
	const abouts = await list("about", `/api/v1/about${page}`, AboutSchema);
	await details(
		"about/{slug}",
		abouts,
		(item) => {
			const slug = item.slugCkb ?? item.slug;
			return typeof slug === "string" && slug
				? `/api/v1/about/${encodeURIComponent(slug)}`
				: null;
		},
		AboutSchema,
	);
	await list("about/team", "/api/v1/about/team", TeamMemberSchema);
	await list("about/partners", "/api/v1/about/partners", PartnerSchema);
	await list(
		"contact/active",
		`/api/v1/contact/active${page}`,
		ContactPageSchema,
	);
	await single(
		"donations/settings",
		"/api/v1/donations/settings",
		DonationSettingsSchema,
	);
	await list("donations/types", "/api/v1/donations/types", DonationTypeSchema);
	await list(
		"donations/type-cards",
		"/api/v1/donations/type-cards",
		DonationTypeCardSchema,
	);

	// ── Site chrome ───────────────────────────────────────────────────────
	await single("site-settings", "/api/v1/site-settings", SiteSettingsSchema);
	await list("site-fonts", "/api/v1/site-fonts", SiteFontSchema);
	await list("settings/social", "/api/v1/settings/social", SocialLinkSchema);
	await list("nav-menu", "/api/v1/nav-menu", NavMenuItemSchema);
	await single("sitemap", "/api/v1/sitemap", SitemapResponseSchema);

	// ── Archive platform ──────────────────────────────────────────────────
	await single(
		"platform search",
		"/api/guest/media/search?size=24&facets=true",
		PlatformSearchResponseSchema,
		identity,
		{ base: PLATFORM },
	);
	await list(
		"platform suggest",
		"/api/guest/suggest?q=a&limit=8",
		PlatformSuggestionSchema,
		identity,
		PLATFORM,
	);

	console.log(`\n${checked} records checked.`);
	if (failures.length) {
		console.log(
			`\n${failures.length} FAILURE(S) — these records are hidden on the website:`,
		);
		for (const failure of failures) console.log(`  ✗ ${failure}`);
		process.exit(1);
	}
	console.log("All records parse. Nothing is being dropped.");
}

main().catch((error) => {
	console.error(error);
	process.exit(1);
});
