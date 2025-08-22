import { z } from "zod";

const envSchema = z.object({
  VITE_API_URL: z.string().url().min(1, "Obrigatório"),
  // GOOGLE_CLIENT_ID: z.string().min(1, "Obrigatório"),
  // GOOGLE_CLIENT_SECRET: z.string().min(1, "Obrigatório"),
});

export const env = envSchema.parse(import.meta.env);
