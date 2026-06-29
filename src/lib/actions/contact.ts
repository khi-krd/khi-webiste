"use server";

import { submitContactMessage } from "@/lib/api/contact";
import type { ContactFormValues } from "@/lib/schemas/contact-form";

export type ContactFormActionResult =
	| { success: true }
	| { success: false; error: "submit_failed" };

export async function submitContactFormAction(
	locale: string,
	values: ContactFormValues,
): Promise<ContactFormActionResult> {
	const result = await submitContactMessage({
		name: values.fullName,
		email: values.email,
		phone: values.phone?.trim() || undefined,
		subject: values.subject,
		message: values.message,
		locale,
	});

	if (!result) {
		return { success: false, error: "submit_failed" };
	}

	return { success: true };
}
