// Fails if the locale message catalogues drift apart.
//
// next-intl resolves keys per locale at render time, so a key present in ckb
// but missing in ku surfaces as a runtime MISSING_MESSAGE error on that page
// only — invisible in a build and easy to miss in review. This compares the
// full set of leaf key paths in both directions.

import { readdirSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const messagesDir = join(
	dirname(fileURLToPath(import.meta.url)),
	"..",
	"messages",
);

function leafPaths(value, prefix = "") {
	if (value && typeof value === "object" && !Array.isArray(value)) {
		return Object.entries(value).flatMap(([key, child]) =>
			leafPaths(child, prefix ? `${prefix}.${key}` : key),
		);
	}
	return [prefix];
}

const catalogues = readdirSync(messagesDir)
	.filter((file) => file.endsWith(".json"))
	.map((file) => ({
		locale: file.replace(/\.json$/, ""),
		keys: new Set(
			leafPaths(JSON.parse(readFileSync(join(messagesDir, file), "utf8"))),
		),
	}));

if (catalogues.length < 2) {
	console.log("[i18n] Fewer than two catalogues; nothing to compare.");
	process.exit(0);
}

const [reference, ...others] = catalogues;
let failed = false;

for (const other of others) {
	const missing = [...reference.keys].filter((key) => !other.keys.has(key));
	const extra = [...other.keys].filter((key) => !reference.keys.has(key));

	if (missing.length || extra.length) {
		failed = true;
		console.error(`[i18n] ${reference.locale} vs ${other.locale}:`);
		for (const key of missing) {
			console.error(`  missing in ${other.locale}: ${key}`);
		}
		for (const key of extra) {
			console.error(`  missing in ${reference.locale}: ${key}`);
		}
	}
}

if (failed) {
	process.exit(1);
}

console.log(
	`[i18n] ${catalogues.map((c) => c.locale).join(", ")} in sync (${reference.keys.size} keys).`,
);
