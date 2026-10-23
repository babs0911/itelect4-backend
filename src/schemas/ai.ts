import { z } from "zod";

export const aiRequestSchema = z.object({
  prompt: z
    .string()
    .trim()
    .min(20, "Enter at least 20 characters.")
    .max(2000, "Keep your request to 2000 characters or fewer."),
});

export const aiReplySchema = z.object({
  category: z.enum([
    "book-recommendation",
    "reservation-help",
    "account-help",
    "general-library-help",
  ]),
  answer: z.string().min(1),
  suggestions: z.array(z.string().min(1)).min(1).max(3),
  nextSteps: z.array(z.string().min(1)).min(1).max(3),
});

export type AiReply = z.infer<typeof aiReplySchema>;
