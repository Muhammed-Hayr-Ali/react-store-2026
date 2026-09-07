"use client"

import * as React from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { Controller, useForm } from "react-hook-form"
import * as z from "zod"
import { CustomButton } from "@/components/ui/custom-button"
import {
  Field,
  FieldError, // Added FieldError to display validation messages
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Spinner } from "../ui/spinner"
import { appRoutes } from "@/lib/config/app-routes"
import { requestPasswordReset } from "@/lib/actions/authentication/resetPassword"
import { IsSuccess } from "./request-is-success"
import { Mail } from "lucide-react"
import { AuthHeader } from "./header"
import { toast } from "sonner"
import { CustomInput } from "../ui/custom-input"

// 1. Define the validation schema using Zod
const loginSchema = z.object({
  email: z
    .string()
    .min(1, "Email is required.")
    .email("Please enter a valid email address."),
})

export function ForgotPasswordForm() {
  // success state to handle successful password reset request
  const [isSuccess, setIsSuccess] = React.useState(false)
  // 2. Initialize the form with React Hook Form and Zod
  const form = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
    },
  })

  const {
    formState: { isSubmitting, errors },
  } = form

  // 3. Handle form submission
  async function onSubmit(data: z.infer<typeof loginSchema>) {
    const result = await requestPasswordReset(data.email)
    if (result.success) {
      setIsSuccess(true)
      // On successful password reset request, refresh the page to let the server-side logic handle redirection.
      toast.success("Password reset link sent! Please check your email.")

    } else {
      // On failure, set a form error to display to the user.
      toast.error(result.error || "Failed to send password reset link. Please try again later.")
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
                prefixIcon={<Mail size="16" />} // Optional: Add an email icon if desired
              />
              {/* Render error message if invalid */}
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />

        {/* Display server-side errors */}
        {errors.root && (
          <FieldError errors={[{ message: errors.root.message }]} />
        )}

        <Field>
          <CustomButton type="submit" disabled={isSubmitting} className="uppercase">
            {isSubmitting ? <Spinner /> : "request reset link"}
          </CustomButton>
        </Field>
      </FieldGroup>
    </form>
  )
}
