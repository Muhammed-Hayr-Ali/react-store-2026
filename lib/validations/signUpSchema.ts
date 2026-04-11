// @/lib/validations/signUpSchema.ts
import { z } from "zod";

export const signUpSchema = z
  .object({
    first_name: z.string().min(2, "validation.firstNameMin"),
    last_name: z.string().min(2, "validation.lastNameMin"),
    email: z.email("validation.emailInvalid"),
    password: z.string().min(8, "validation.passwordMin"),
    confirm_password: z.string(),
  })
  .refine((data) => data.password === data.confirm_password, {
    message: "validation.passwordsMismatch",
    path: ["confirm_password"],
  });

export type SignUpFormValues = z.infer<typeof signUpSchema>;
