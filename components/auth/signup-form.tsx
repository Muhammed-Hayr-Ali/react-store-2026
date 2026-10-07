/**
 * @file components/auth/signup-form.tsx
 */

"use client"

import React from "react"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { Controller, useForm } from "react-hook-form"
import {
  EyeIcon,
  EyeOff,
  Lock,
  Mail,
  User,
  AlertCircleIcon,
  XIcon,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldSeparator,
} from "@/components/ui/field"
import { Spinner } from "@/components/ui/spinner"
import { CustomInput } from "@/components/ui/custom-input"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AuthHeader } from "./header"
import { GoogleSignInButton } from "./google-sign-in-button"

import {
  signUpWithPassword,
  signUpWithPasswordSchema,
  type SignUpWithPasswordInput,
} from "@/lib/actions/authentication"
import { appRoutes } from "@/lib/config/app-routes"

export function SignUpForm() {
  const router = useRouter()
  const [showPassword, setShowPassword] = React.useState(false)
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null)

  const form = useForm<SignUpWithPasswordInput>({
    resolver: zodResolver(signUpWithPasswordSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
    },
  })

  const {
    formState: { isSubmitting, errors },
  } = form

  async function onSubmit(data: SignUpWithPasswordInput) {
    setErrorMessage(null)
    const result = await signUpWithPassword(data)

    if (result.success) {
      router.refresh()
      router.replace(appRoutes.home)
    } else {
      setErrorMessage(result.error || "Signup failed. Please try again.")
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

        {errorMessage && (
          <Alert variant="destructive" className="relative pr-9">
            <AlertCircleIcon className="size-4" />
            <AlertTitle>Action Required</AlertTitle>
            <AlertDescription className="text-xs">
              {errorMessage}
            </AlertDescription>
            <button
              type="button"
              onClick={() => setErrorMessage(null)}
              className="absolute top-3 right-3 cursor-pointer text-muted-foreground hover:text-foreground"
            >
              <XIcon className="size-4" />
            </button>
          </Alert>
        )}

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
                autoComplete="name"
                prefixIcon={<User size="16" />}
              />
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
                autoComplete="email"
                prefixIcon={<Mail size="16" />}
              />
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

        {errors.root && (
          <FieldError errors={[{ message: errors.root.message }]} />
        )}

        <Field>
          <Button type="submit" disabled={isSubmitting} className="uppercase">
            {isSubmitting ? <Spinner /> : "sign up"}
          </Button>
        </Field>

        <FieldSeparator className="my-1">Or</FieldSeparator>

        <Field className="grid gap-4 sm:grid-cols-1">
          <GoogleSignInButton lastLoginMethod="" />
        </Field>
      </FieldGroup>
    </form>
  )
}
