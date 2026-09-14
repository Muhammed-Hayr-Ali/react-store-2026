"use client"

import * as React from "react"
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
import { signInWithPassword } from "@/lib/actions/authentication/signInWithPassword"
import Link from "next/link"
import { Spinner } from "../ui/spinner"
import { EyeIcon, EyeOff, Lock, Mail } from "lucide-react"
import { appRoutes } from "@/lib/config/app-routes"
import { GoogleSignInButton } from "./google-sign-in-button"
import { AuthHeader } from "./header"
import { Badge } from "../ui/badge"
import { toast } from "sonner"
import { CustomInput } from "../ui/custom-input"

// 1. Define the validation schema using Zod
const loginSchema = z.object({
  email: z
    .string()
    .min(1, "Email is required.")
    .email("Please enter a valid email address."),
  password: z.string().min(6, "Password must be at least 6 characters long."),
})

interface LoginFormProps {
  lastLoginMethod: string | undefined
}

export function LoginForm({ lastLoginMethod }: LoginFormProps) {
  //Router for navigation after successful login
  const router = useRouter()
  // show password toggle
  const [showPassword, setShowPassword] = React.useState(false)
  // 2. Initialize the form with React Hook Form and Zod
  const form = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  })

  const {
    formState: { isSubmitting, errors },
  } = form

  // 3. Handle form submission
  async function onSubmit(data: z.infer<typeof loginSchema>) {
    const result = await signInWithPassword(data.email, data.password)

    if (result.success) {
      // On successful login, refresh the page to let the server-side logic handle redirection.
      router.push(appRoutes.home) // Redirect to the home page or dashboard after successful login
    } else {
      toast.error(result.error || "Invalid email or password.")
    }
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)}>
      <FieldGroup>
        <AuthHeader
          title="Welcome,"
          description="Sign in to continue"
          linkText="Sign Up"
          linkHref={appRoutes.auth.signup}
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
                autoComplete="current-password"
                prefixIcon={<Lock size="16" />} // Optional: Add a password icon if desired
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
              <div className="mt-1 flex items-center justify-end">
                <Link
                  href={appRoutes.auth.forgotPassword}
                  className="text-xs text-muted-foreground hover:underline"
                >
                  Forgot password?
                </Link>
              </div>
            </Field>
          )}
        />

        {/* Display server-side errors */}
        {errors.root && (
          <FieldError errors={[{ message: errors.root.message }]} />
        )}

        <Field>
          <div className="relative w-full">
            {lastLoginMethod === "email" && (
              <div className="absolute -top-2.5 -right-2.5 z-50 rtl:right-auto rtl:-left-2.5">
                <Badge
                  variant="secondary"
                  className="h-4 border-muted-foreground/50 px-1.5 text-[10px] font-normal text-muted-foreground dark:border-muted-foreground/50 dark:text-muted-foreground/50"
                >
                  Last used
                </Badge>
              </div>
            )}
            <CustomButton
              type="submit"
              disabled={isSubmitting}
              className="w-full uppercase"
            >
              {isSubmitting ? <Spinner /> : "sign In"}
            </CustomButton>
          </div>
        </Field>

        <FieldSeparator className="-amber-400 my-1">Or</FieldSeparator>

        <Field className="grid gap-4 sm:grid-cols-1">
          <GoogleSignInButton lastLoginMethod={lastLoginMethod} />
        </Field>
      </FieldGroup>
    </form>
  )
}
