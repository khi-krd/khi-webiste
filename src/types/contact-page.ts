import { z } from "zod";

/**
 * `contact_pages.office_type` is a free-text varchar(40) on the backend, not an
 * enum: it answers "HQ" today, and an editor can type anything. Keep it a plain
 * string so an unknown value never voids the record — the badge mapping in
 * `resolveContactOffice` decides what counts as a headquarters.
 */
export const OfficeTypeSchema = z.string();

export const ContactContentSchema = z.object({
	title: z.string().nullish(),
	subtitle: z.string().nullish(),
	address: z.string().nullish(),
	workingHours: z.string().nullish(),
	description: z.string().nullish(),
});

export const ContactPageSchema = z.object({
	id: z.number(),
	slugCkb: z.string().nullish(),
	slugKmr: z.string().nullish(),
	ckbContent: ContactContentSchema.nullish(),
	kmrContent: ContactContentSchema.nullish(),
	phone: z.string().nullish(),
	secondaryPhone: z.string().nullish(),
	email: z.string().nullish(),
	mapEmbedUrl: z.string().nullish(),
	latitude: z.number().nullish(),
	longitude: z.number().nullish(),
	heroImageUrl: z.string().nullish(),
	officeType: OfficeTypeSchema.nullish(),
	badgeCkb: z.string().nullish(),
	badgeKmr: z.string().nullish(),
	displayOrder: z.number().nullish(),
	active: z.boolean().optional(),
	createdAt: z.string().nullish(),
	updatedAt: z.string().nullish(),
});

export const ContactPageListSchema = z.array(ContactPageSchema);

export const ContactActivePageSchema = z.object({
	content: z.array(ContactPageSchema),
	totalElements: z.number().optional(),
	totalPages: z.number().optional(),
	number: z.number().optional(),
	size: z.number().optional(),
	empty: z.boolean().optional(),
});

export type ContactActivePage = z.infer<typeof ContactActivePageSchema>;

/**
 * Public submissions are always created as NEW; staff move them through the rest
 * from the dashboard. Kept permissive for the same reason as `OfficeTypeSchema`:
 * the column is a varchar(30) and a status we do not know about must not turn a
 * stored message into a "submit failed" toast.
 */
export const ContactMessageStatusSchema = z.string();

export const ContactMessageSubmissionSchema = z.object({
	name: z.string(),
	email: z.string(),
	phone: z.string().nullish(),
	subject: z.string(),
	message: z.string(),
	locale: z.string().nullish(),
});

export const ContactMessageResponseSchema =
	ContactMessageSubmissionSchema.extend({
		id: z.number(),
		status: ContactMessageStatusSchema,
		createdAt: z.string(),
	});

export type OfficeType = z.infer<typeof OfficeTypeSchema>;
export type ContactPage = z.infer<typeof ContactPageSchema>;
export type ContactContent = z.infer<typeof ContactContentSchema>;
export type ContactMessageSubmission = z.infer<
	typeof ContactMessageSubmissionSchema
>;
export type ContactMessageResponse = z.infer<
	typeof ContactMessageResponseSchema
>;
