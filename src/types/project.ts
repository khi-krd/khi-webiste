import { z } from "zod";
import {
	BilingualSetSchema,
	ContentLanguageSchema,
	CoverMediaTypeSchema,
} from "@/types/news";

export const ProjectStatusSchema = z.enum([
	"ACTIVE",
	"ONGOING",
	"COMPLETED",
	"ARCHIVED",
]);

export type ProjectStatus = z.infer<typeof ProjectStatusSchema>;

export const ProjectContentSchema = z.object({
	title: z.string().nullable(),
	description: z.string().nullable(),
	location: z.string().nullable(),
});

export type ProjectContent = z.infer<typeof ProjectContentSchema>;

export const ProjectSchema = z.object({
	id: z.number(),
	coverUrl: z.string().nullable(),
	coverMediaType: CoverMediaTypeSchema.nullable().optional(),
	coverThumbnailUrl: z.string().nullable().optional(),
	mediaGallery: z.array(z.unknown()).optional(),
	projectTypeCkb: z.string().nullable().optional(),
	projectTypeKmr: z.string().nullable().optional(),
	status: ProjectStatusSchema.nullable().optional(),
	projectDate: z.string().nullable(),
	contentLanguages: z.array(ContentLanguageSchema),
	ckbContent: ProjectContentSchema.nullish(),
	kmrContent: ProjectContentSchema.nullish(),
	tagsCkb: z.array(z.string()).optional(),
	tagsKmr: z.array(z.string()).optional(),
	keywordsCkb: z.array(z.string()).optional(),
	keywordsKmr: z.array(z.string()).optional(),
	createdAt: z.string().optional(),
	updatedAt: z.string().optional(),
});

export type Project = z.infer<typeof ProjectSchema>;

export const ProjectsPageSchema = z.object({
	content: z.array(ProjectSchema),
	totalElements: z.number(),
	totalPages: z.number(),
	number: z.number().optional(),
	size: z.number().optional(),
	empty: z.boolean().optional(),
});

export type ProjectsPage = z.infer<typeof ProjectsPageSchema>;
