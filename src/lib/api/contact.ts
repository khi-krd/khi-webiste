import "server-only";
import { apiFetchPage, apiPost, DEFAULT_REVALIDATE } from "@/lib/api/client";
import { getApiBaseUrl } from "@/lib/api/config";
import {
	type ResolvedContactOffice,
	resolveContactOffices,
} from "@/lib/contact/resolve";
import type { ContactOffice } from "@/lib/mock/contact";
import {
	type ContactMessageResponse,
	ContactMessageResponseSchema,
	type ContactMessageSubmission,
	type ContactPage,
	ContactPageSchema,
} from "@/types/contact-page";

const CONTACT_ACTIVE_ENDPOINT = "/api/v1/contact/active";
const CONTACT_MESSAGES_ENDPOINT = "/api/v1/contact/messages";
const CONTACT_TAG = "contact";

export async function getActiveContactPages(): Promise<ContactPage[]> {
	if (!getApiBaseUrl()) {
		return [];
	}

	// Per-item parsing, not a whole-page schema: a single office the schema
	// cannot read must cost us that office, not the entire section.
	const page = await apiFetchPage(CONTACT_ACTIVE_ENDPOINT, {
		itemSchema: ContactPageSchema,
		tags: [CONTACT_TAG],
		revalidate: DEFAULT_REVALIDATE,
	});

	return page?.content ?? [];
}

export async function getContactOffices(
	locale: string,
): Promise<ResolvedContactOffice[]> {
	const pages = await getActiveContactPages();
	const apiItems = pages.length > 0 ? resolveContactOffices(locale, pages) : [];

	return apiItems;
}

export type { ContactOffice, ResolvedContactOffice };

export async function submitContactMessage(
	body: ContactMessageSubmission,
): Promise<ContactMessageResponse | null> {
	if (!getApiBaseUrl()) {
		return null;
	}

	return apiPost(CONTACT_MESSAGES_ENDPOINT, body, {
		schema: ContactMessageResponseSchema,
		tags: [CONTACT_TAG],
	});
}
