import { z } from "zod";
import { MATERIAL_TYPE_IDS, type MaterialTypeId } from "@/lib/mock/donate";

const MAX_FILE_SIZE = 10 * 1024 * 1024;

const ACCEPTED_FILE_TYPES = new Set([
	"image/jpeg",
	"image/png",
	"image/webp",
	"image/gif",
	"audio/mpeg",
	"audio/wav",
	"audio/ogg",
	"video/mp4",
	"video/webm",
	"application/pdf",
]);

export type DonateArchiveFormMessages = {
	userNameRequired: string;
	contactRequired: string;
	materialTypeRequired: string;
	fileTooLarge: string;
	fileInvalidType: string;
};

export function createDonateArchiveFormSchema(
	messages: DonateArchiveFormMessages,
) {
	return z.object({
		userName: z.string().trim().min(1, messages.userNameRequired),
		registerName: z.string().trim().optional(),
		contactNumber: z.string().trim().min(1, messages.contactRequired),
		materialType: z
			.string()
			.min(1, messages.materialTypeRequired)
			.refine(
				(value): value is MaterialTypeId =>
					MATERIAL_TYPE_IDS.includes(value as MaterialTypeId),
				messages.materialTypeRequired,
			),
		file: z
			.custom<File | null>((val) => val === null || val instanceof File)
			.optional()
			.refine(
				(file) => !file || file.size <= MAX_FILE_SIZE,
				messages.fileTooLarge,
			)
			.refine(
				(file) => !file || ACCEPTED_FILE_TYPES.has(file.type),
				messages.fileInvalidType,
			),
		note: z.string().trim().optional(),
	});
}

export type DonateArchiveFormValues = z.input<
	ReturnType<typeof createDonateArchiveFormSchema>
>;
