import "server-only";
import { apiFetch, apiPost, DEFAULT_REVALIDATE } from "@/lib/api/client";
import { getApiBaseUrl } from "@/lib/api/config";
import {
	resolveContactOffices,
	type ResolvedContactOffice,
} from "@/lib/contact/resolve";
import {
	getContactOffices as getMockContactOffices,
	type ContactOffice,
} from "@/lib/mock/contact";
import {
	type ContactMessageResponse,
	ContactMessageResponseSchema,
	type ContactMessageSubmission,
	type ContactPage,
	ContactPageListSchema,
} from "@/types/contact-page";

const CONTACT_ACTIVE_ENDPOINT = "/api/v1/contact/active";
const CONTACT_MESSAGES_ENDPOINT = "/api/v1/contact/messages";
const CONTACT_TAG = "contact";

export async function getActiveContactPages(): Promise<ContactPage[]> {
	if (!getApiBaseUrl()) {
		return [];
	}

	const pages = await apiFetch(CONTACT_ACTIVE_ENDPOINT, {
		schema: ContactPageListSchema,
		tags: [CONTACT_TAG],
		revalidate: DEFAULT_REVALIDATE,
	});

	return pages ?? [];
}

export async function getContactOffices(
	locale: string,
): Promise<ResolvedContactOffice[]> {
	const pages = await getActiveContactPages();
	if (pages.length === 0) {
		return getMockContactOffices();
	}

	const offices = resolveContactOffices(locale, pages);
	return offices.length > 0 ? offices : getMockContactOffices();
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
