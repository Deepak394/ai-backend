import { z } from "zod";

export const createDocumentSchema = z.object({
  title: z.string().min(1, "Title is required").max(255),
  raw_text: z.string().min(1, "Document text cannot be empty"),
  type: z.enum(["document", "note"]).default("document"),
});

export const updateDocumentSchema = z
  .object({
    title: z.string().min(1).max(255).optional(),
    raw_text: z.string().min(1).optional(),
  })
  .refine((data) => data.title || data.raw_text, {
    message: "At least one field (title or raw_text) must be provided",
  });
