import { z } from "zod";

export const createConversationSchema = z.object({
  title: z.string().min(1).max(255).optional(),
});

export const addMessageSchema = z.object({
  role: z.enum(["user", "assistant"]),
  content: z.string().min(1, "Message content cannot be empty"),
});