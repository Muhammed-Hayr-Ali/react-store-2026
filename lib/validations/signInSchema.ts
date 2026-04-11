// @/lib/validations/signInSchema.ts
import { z } from "zod";

export const signInSchema = z.object({
  email: z.email("validation.emailInvalid"),
  password: z.string().min(1, "validation.passwordRequired"),
});

export type SignInFormValues = z.infer<typeof signInSchema>;
