import { z } from "zod";

export const createDocumentSchema = z.object({
  title: z.string().min(1, "Title is required").max(255),
  raw_text: z.string().min(1, "Document text cannot be empty"),
});