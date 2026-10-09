import { hasLocale } from "next-intl";
import { getRequestConfig } from "next-intl/server";
import { apiFetchRaw } from "@/lib/api/client";
import { routing } from "./routing";

type Messages = Record<string, unknown>;

/**
 * Deep-set `Messages.Nav.menuNews` from a flat "Nav.menuNews" key.
 * Missing intermediate objects are created; existing non-object values are
 * replaced so a DB key always wins over the bundled JSON.
 */
function applyFlatKey(messages: Messages, flatKey: string, value: unknown) {
	const parts = flatKey.split(".");
	let node: Messages = messages;
	for (let i = 0; i < parts.length - 1; i++) {
		const part = parts[i];
		const next = node[part];
		if (next === null || typeof next !== "object" || Array.isArray(next)) {
			node[part] = {};
		}
		node = node[part] as Messages;
	}
	node[parts[parts.length - 1]] = value;
}

/**
 * Bundled messages/xx.json are the baseline; rows from the static_texts table
 * (edited in the dashboard) override matching keys. If the API is down the
 * bundled copy renders — text never blocks the page.
 */
async function loadMessages(locale: string): Promise<Messages> {
	const messages = (await import(`../../messages/${locale}.json`))
		.default as Messages;

	const overrides = await apiFetchRaw("/api/v1/text-blocks", {
		searchParams: { locale },
		noStore: true,
	});
	if (!overrides || typeof overrides !== "object") {
		return messages;
	}

	for (const [key, value] of Object.entries(overrides as Messages)) {
		if (!key || typeof value !== "string") continue;
		applyFlatKey(messages, key, value);
	}
	return messages;
}

export default getRequestConfig(async ({ requestLocale }) => {
	const requested = await requestLocale;
	const locale = hasLocale(routing.locales, requested)
		? requested
		: routing.defaultLocale;

	return {
		locale,
		messages: await loadMessages(locale),
	};
});
