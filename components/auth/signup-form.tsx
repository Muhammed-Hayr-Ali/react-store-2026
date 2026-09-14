"use client"

import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { Controller, useForm } from "react-hook-form"
import * as z from "zod"
import { CustomButton } from "@/components/ui/custom-button"
import {
  Field,
  FieldError, // Added FieldError to display validation messages
  FieldGroup,
  FieldLabel,
  FieldSeparator,
} from "@/components/ui/field"
import { signUpWithPassword } from "@/lib/actions/authentication/signUpWithPassword"
import { Spinner } from "../ui/spinner"
import { EyeIcon, EyeOff, Lock, Mail, User } from "lucide-react"
import React from "react"
import { appRoutes } from "@/lib/config/app-routes"
import { GoogleSignInButton } from "./google-sign-in-button"
import { AuthHeader } from "./header"
import { toast } from "sonner"
import { CustomInput } from "../ui/custom-input"

// 1. Define the validation schema using Zod
const signUpSchema = z.object({
  name: z.string().min(1, "Name is required."),
  email: z
    .string()
    .min(1, "Email is required.")
    .email("Please enter a valid email address."),
  password: z.string().min(6, "Password must be at least 6 characters long."),
})

export function SignUpForm() {
  // Router for navigation after successful signup
  const router = useRouter()
  // show password toggle
  const [showPassword, setShowPassword] = React.useState(false)
  // 2. Initialize the form with React Hook Form and Zod
  const form = useForm<z.infer<typeof signUpSchema>>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
    },
  })

  const {
    formState: { isSubmitting, errors },
  } = form

  // 3. Handle form submission
  async function onSubmit(data: z.infer<typeof signUpSchema>) {
    const result = await signUpWithPassword(
      data.name,
      data.email,
      data.password
    )

    if (result.success) {
      // On successful signup, redirect to the login page or dashboard.
      router.push("/") // Redirect to the login page after successful signup
    } else {
      toast.error(result.error || "Signup failed. Please try again.")
    }
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)}>
      <FieldGroup>
        <AuthHeader
          title="Sign Up"
          description="Create an account"
          linkText="Sign In"
          linkHref={appRoutes.auth.login}
        />

        {/* Name Field */}
        <Controller
          name="name"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="name">Name</FieldLabel>
              <CustomInput
                {...field}
                id="name"
                type="text"
                placeholder="Your Name"
                aria-invalid={fieldState.invalid}
                autoComplete="off"
                prefixIcon={<User size="16" />} // Optional: Add a user icon if desired
              />
              {/* Render error message if invalid */}
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
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
                autoComplete="off"
                prefixIcon={<Mail size="16" />} // Optional: Add an email icon if desired
              />
              {/* Render error message if invalid */}
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />

        {/* Password Field */}
        <Controller
          name="password"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="password">Password</FieldLabel>
              <CustomInput
                {...field}
                id="password"
                type={showPassword ? "text" : "password"} // Toggle between text and password type
                placeholder="••••••••"
                aria-invalid={fieldState.invalid}
                autoComplete="new-password"
                prefixIcon={<Lock size="16" />}
                suffixIcon={
                  <CustomButton
                    type="button"
                    variant="ghost"
                    onClick={() => setShowPassword(!showPassword)}
                    className="hover:bg-transparent focus:outline-none"
                  >
                    {showPassword ? (
                      <EyeIcon size="16" />
                    ) : (
                      <EyeOff size="16" />
                    )}
                  </CustomButton>
                }
              />
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
            {isSubmitting ? <Spinner /> : "sign up"}
          </CustomButton>
        </Field>

        <FieldSeparator className="my-1">Or</FieldSeparator>

        <Field className="grid gap-4 sm:grid-cols-1">
          <GoogleSignInButton lastLoginMethod="" />
        </Field>
      </FieldGroup>
    </form>
  )
}


