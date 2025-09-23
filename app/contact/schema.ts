import { z } from "zod";

export const contactSchema = z.object({
  name: z.string().min(2, "Name is required"),
  email: z.string().email("Enter a valid email"),
  company: z.string().optional(),
  message: z.string().min(20, "Please provide a bit more detail."),
});

export type ContactSchema = typeof contactSchema;
