// @/lib/validations/resetPasswordSchema.ts
import { z } from "zod";

export const resetPasswordSchema = z
  .object({
    token: z.string().min(1, "validation.tokenRequired"),
    password: z.string().min(8, "validation.passwordMin"),
    confirm_password: z.string(),
  })
  .refine((data) => data.password === data.confirm_password, {
    message: "validation.passwordsMismatch",
    path: ["confirm_password"],
  });

export type ResetPasswordFormValues = z.infer<typeof resetPasswordSchema>;
