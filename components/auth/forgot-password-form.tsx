"use client"

import * as React from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { Controller, useForm } from "react-hook-form"
import { Mail } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Spinner } from "@/components/ui/spinner"
import { CustomInput } from "@/components/ui/custom-input"
import { AuthHeader } from "./header"
import { IsSuccess } from "./request-is-success"

import {
  requestPasswordReset,
  requestPasswordResetSchema,
  type RequestPasswordResetInput,
} from "@/lib/actions/authentication"
import { appRoutes } from "@/lib/config/app-routes"

export function ForgotPasswordForm() {
  const [isSuccess, setIsSuccess] = React.useState(false)

  const form = useForm<RequestPasswordResetInput>({
    resolver: zodResolver(requestPasswordResetSchema),
    defaultValues: {
      email: "",
    },
  })

  const {
    formState: { isSubmitting, errors },
  } = form

  async function onSubmit(data: RequestPasswordResetInput) {
    const result = await requestPasswordReset(data)
    if (result.success) {
      setIsSuccess(true)
      toast.success("Password reset link sent! Please check your email.")
    } else {
      toast.error(
        result.error ||
          "Failed to send password reset link. Please try again later."
      )
    }
  }

  if (isSuccess) {
    return (
      <IsSuccess
        onClick={() => {
          setIsSuccess(false)
          form.reset()
        }}
        email={form.getValues("email")}
      />
    )
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)}>
      <FieldGroup>
        <AuthHeader
          title="Forgot Password"
          description="Enter your email to reset your password"
          linkText="Sign In"
          linkHref={appRoutes.auth.login}
        />

        {/* Email Field */}
        <Controller
          name="email"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="email">Email</FieldLabel>
              <CustomInput
                {...field}
                id="email"
                type="email"
                placeholder="you@domain.com"
                aria-invalid={fieldState.invalid}
                autoComplete="email"
                prefixIcon={<Mail size="16" />}
              />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />

        {errors.root && (
          <FieldError errors={[{ message: errors.root.message }]} />
        )}

        <Field>
          <Button type="submit" disabled={isSubmitting} className="uppercase">
            {isSubmitting ? <Spinner /> : "request reset link"}
          </Button>
        </Field>
      </FieldGroup>
    </form>
  )
}
