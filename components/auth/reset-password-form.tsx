"use client"

import * as React from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { Controller, useForm } from "react-hook-form"
import * as z from "zod"
import { CustomButton } from "@/components/ui/custom-button"


import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { AppLogo } from "@/components/ui/app-logo"
import Link from "next/link"
import { Spinner } from "@/components/ui/spinner"
import { Lock } from "lucide-react"
import { appRoutes } from "@/lib/config/app-routes"
import { confirmPasswordReset } from "@/lib/actions/authentication/resetPassword"
import { AuthHeader } from "./header"
import { toast } from "sonner"
import { CustomInput } from "../ui/custom-input"

const resetPasswordSchema = z
  .object({
    password: z.string().min(8, "Password must be at least 8 characters long."),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match.",
    path: ["confirmPassword"],
  })

export function ResetPasswordForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams.get("token")

  // 2. تهيئة النموذج
  const form = useForm<z.infer<typeof resetPasswordSchema>>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  })

  const {
    formState: { isSubmitting },
  } = form

  // إذا لم يكن هناك رمز في الرابط، نعرض رسالة خطأ
  if (!token) {
    return (
      <div className="flex flex-col items-center gap-4 p-6 text-center">
        <AppLogo size="xl" />
        <h1 className="text-xl font-bold text-red-600">Error</h1>
        <p className="text-gray-600">
          Reset password link is missing or invalid. Please request a new link.
        </p>

        <CustomButton variant="outline" className="mt-4" asChild>
          <Link href={appRoutes.auth.forgotPassword}>
            Request New Link
          </Link>
        </CustomButton>
      </div>
    )
  }

  // 3. معالجة إرسال النموذج
  async function onSubmit(data: z.infer<typeof resetPasswordSchema>) {
    const result = await confirmPasswordReset(token, data.password)

    if (result.success) {
      toast.success("Success! Your password has been updated.")
      router.push(appRoutes.auth.login)
    } else {
      if (result.error === "INVALID_OR_EXPIRED_TOKEN") {
        toast.error(
          "Reset password link is invalid or has expired. Please request a new link."
        )
      } else {
        toast.error("Failed to update password. Please try again later.")
      }
    }
  }

  return (
    <form
      onSubmit={form.handleSubmit(onSubmit)}
      className="mx-auto w-full max-w-md"
    >
      <FieldGroup>
        <AuthHeader
          title="Reset Password"
          description="Enter your new password"
          linkText="Sign In"
          linkHref={appRoutes.auth.login}
        />

        {/* حقل كلمة المرور الجديدة */}
        <Controller
          name="password"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="password">New Password</FieldLabel>
              <CustomInput
                {...field}
                id="password"
                type="password"
                placeholder="••••••••"
                aria-invalid={fieldState.invalid}
                autoComplete="new-password"
                prefixIcon={<Lock size="16" />}
              />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />

        {/* حقل تأكيد كلمة المرور */}
        <Controller
          name="confirmPassword"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="confirmPassword">
                Confirm Password
              </FieldLabel>
              <CustomInput
                {...field}
                id="confirmPassword"
                type="password"
                placeholder="••••••••"
                aria-invalid={fieldState.invalid}
                autoComplete="new-password"
                prefixIcon={<Lock size="16" />}
              />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />

        {/* زر الإرسال */}
        <Field className="mt-4">
          <CustomButton type="submit" disabled={isSubmitting} className="uppercase">
            {isSubmitting ? <Spinner /> : "update password"}
          </CustomButton>
        </Field>
      </FieldGroup>
    </form>
  )
}
