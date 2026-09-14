import { z } from "zod";

export const registerSchema = z.object({
  fullName: z.string().min(2).max(30, "Name too long!"),
  email: z.string().email(),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});