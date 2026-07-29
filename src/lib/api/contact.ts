import "server-only";
import { apiFetch, apiPost, DEFAULT_REVALIDATE } from "@/lib/api/client";
import { getApiBaseUrl } from "@/lib/api/config";
import { applyMockPolicy } from "@/lib/api/mock-policy";
import {
	type ResolvedContactOffice,
	resolveContactOffices,
} from "@/lib/contact/resolve";
import {
	type ContactOffice,
	getContactOffices as getMockContactOffices,
} from "@/lib/mock/contact";
import {
	ContactActivePageSchema,
	type ContactMessageResponse,
	ContactMessageResponseSchema,
	type ContactMessageSubmission,
	type ContactPage,
} from "@/types/contact-page";

const CONTACT_ACTIVE_ENDPOINT = "/api/v1/contact/active";
const CONTACT_MESSAGES_ENDPOINT = "/api/v1/contact/messages";
const CONTACT_TAG = "contact";

export async function getActiveContactPages(): Promise<ContactPage[]> {
	if (!getApiBaseUrl()) {
		return [];
	}

	const page = await apiFetch(CONTACT_ACTIVE_ENDPOINT, {
		schema: ContactActivePageSchema,
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

	return applyMockPolicy({
		context: "global",
		apiItems,
		getMockItems: () => getMockContactOffices(),
	});
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
