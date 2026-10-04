"use client"

import * as React from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { Controller, useForm } from "react-hook-form"
import { z } from "zod"
import Link from "next/link"
import { EyeIcon, EyeOff, Lock } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { AppLogo } from "@/components/ui/app-logo"
import { Spinner } from "@/components/ui/spinner"
import { CustomInput } from "@/components/ui/custom-input"
import { AuthHeader } from "./header"

import {
  confirmPasswordReset,
  confirmPasswordResetSchema,
} from "@/lib/actions/authentication"
import { appRoutes } from "@/lib/config/app-routes"

const clientResetSchema = confirmPasswordResetSchema.omit({ token: true })
type ClientResetFormValues = z.infer<typeof clientResetSchema>

export function ResetPasswordForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams.get("token")

  const [showPassword, setShowPassword] = React.useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = React.useState(false)

  const form = useForm<ClientResetFormValues>({
    resolver: zodResolver(clientResetSchema),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  })

  const {
    formState: { isSubmitting },
  } = form

  if (!token) {
    return (
      <div className="flex flex-col items-center gap-4 p-6 text-center">
        <AppLogo size="xl" />
        <h1 className="text-xl font-bold text-destructive">Error</h1>
        <p className="text-sm text-muted-foreground">
          Reset password link is missing or invalid. Please request a new link.
        </p>

        <Button variant="outline" className="mt-4" asChild>
          <Link href={appRoutes.auth.forgotPassword}>Request New Link</Link>
        </Button>
      </div>
    )
  }

  async function onSubmit(data: ClientResetFormValues) {
    const result = await confirmPasswordReset({
      token: token as string,
      password: data.password,
      confirmPassword: data.confirmPassword,
    })

    if (result.success) {
      toast.success("Success! Your password has been updated.")
      router.refresh()
      router.replace(appRoutes.auth.login)
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
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                aria-invalid={fieldState.invalid}
                autoComplete="new-password"
                prefixIcon={<Lock size="16" />}
                suffixIcon={
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    onClick={() => setShowPassword(!showPassword)}
                    className="hover:bg-transparent focus:outline-none"
                  >
                    {showPassword ? (
                      <EyeIcon size="16" />
                    ) : (
                      <EyeOff size="16" />
                    )}
                  </Button>
                }
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
                type={showConfirmPassword ? "text" : "password"}
                placeholder="••••••••"
                aria-invalid={fieldState.invalid}
                autoComplete="new-password"
                prefixIcon={<Lock size="16" />}
                suffixIcon={
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="hover:bg-transparent focus:outline-none"
                  >
                    {showConfirmPassword ? (
                      <EyeIcon size="16" />
                    ) : (
                      <EyeOff size="16" />
                    )}
                  </Button>
                }
              />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />

        {/* زر الإرسال */}
        <Field className="mt-4">
          <Button type="submit" disabled={isSubmitting} className="uppercase">
            {isSubmitting ? <Spinner /> : "update password"}
          </Button>
        </Field>
      </FieldGroup>
    </form>
  )
}
