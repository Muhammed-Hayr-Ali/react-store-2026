// @/lib/validations/forgotPasswordSchema.ts
import { z } from "zod";

export const forgotPasswordSchema = z.object({
  email: z.email("validation.emailInvalid"),
});

export type ForgotPasswordFormValues = z.infer<typeof forgotPasswordSchema>;
