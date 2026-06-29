import { z } from "zod";

export const DonationSettingsSchema = z.object({
	id: z.number().optional(),
	titleCkb: z.string().nullish(),
	titleKmr: z.string().nullish(),
	descriptionCkb: z.string().nullish(),
	descriptionKmr: z.string().nullish(),
	heroImageUrl: z.string().nullish(),
	bankName: z.string().nullish(),
	accountName: z.string().nullish(),
	accountNumber: z.string().nullish(),
	iban: z.string().nullish(),
	swiftCode: z.string().nullish(),
	paymentInstructionsCkb: z.string().nullish(),
	paymentInstructionsKmr: z.string().nullish(),
	financialDonationsEnabled: z.boolean().optional(),
	archiveDonationsEnabled: z.boolean().optional(),
});

export const DonationTypeCodeSchema = z.enum(["FINANCIAL", "ARCHIVE"]);

export const DonationTypeSchema = z.object({
	code: DonationTypeCodeSchema,
	titleCkb: z.string().nullish(),
	titleKmr: z.string().nullish(),
	enabled: z.boolean(),
});

export const DonationTypeListSchema = z.array(DonationTypeSchema);

export const FinancialDonationStatusSchema = z.enum([
	"PENDING",
	"APPROVED",
	"REJECTED",
]);

export const FinancialDonationSubmissionSchema = z.object({
	donorName: z.string(),
	email: z.string(),
	phone: z.string().nullish(),
	amount: z.number(),
	currency: z.string(),
	paymentMethod: z.string(),
	transactionReference: z.string().nullish(),
	message: z.string().nullish(),
});

export const FinancialDonationResponseSchema =
	FinancialDonationSubmissionSchema.extend({
		id: z.number(),
		status: FinancialDonationStatusSchema,
		createdAt: z.string(),
	});

export const ArchiveMaterialTypeSchema = z.enum([
	"PHOTOGRAPH",
	"MANUSCRIPT",
	"DOCUMENT",
	"AUDIO",
	"VIDEO",
	"OTHER",
]);

export const ArchiveDonationSubmissionSchema = z.object({
	donorName: z.string(),
	email: z.string(),
	phone: z.string().nullish(),
	materialType: ArchiveMaterialTypeSchema,
	title: z.string().nullish(),
	description: z.string().nullish(),
	estimatedDate: z.string().nullish(),
	attachmentUrl: z.string().nullish(),
});

export const ArchiveDonationResponseSchema =
	ArchiveDonationSubmissionSchema.extend({
		id: z.number(),
		status: FinancialDonationStatusSchema,
		createdAt: z.string(),
	});

export type DonationSettings = z.infer<typeof DonationSettingsSchema>;
export type DonationType = z.infer<typeof DonationTypeSchema>;
export type ArchiveMaterialType = z.infer<typeof ArchiveMaterialTypeSchema>;
export type FinancialDonationSubmission = z.infer<
	typeof FinancialDonationSubmissionSchema
>;
export type FinancialDonationResponse = z.infer<
	typeof FinancialDonationResponseSchema
>;
export type ArchiveDonationSubmission = z.infer<
	typeof ArchiveDonationSubmissionSchema
>;
export type ArchiveDonationResponse = z.infer<
	typeof ArchiveDonationResponseSchema
>;
