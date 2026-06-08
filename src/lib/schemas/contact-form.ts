import { z } from "zod";

export type ContactFormMessages = {
	fullNameRequired: string;
	emailInvalid: string;
	subjectRequired: string;
	messageRequired: string;
};

export function createContactFormSchema(messages: ContactFormMessages) {
	return z.object({
		fullName: z.string().trim().min(1, messages.fullNameRequired),
		email: z.string().trim().email(messages.emailInvalid),
		phone: z.string().trim().optional(),
		subject: z.string().trim().min(3, messages.subjectRequired),
		message: z.string().trim().min(10, messages.messageRequired),
	});
}

export type ContactFormValues = z.infer<
	ReturnType<typeof createContactFormSchema>
>;
