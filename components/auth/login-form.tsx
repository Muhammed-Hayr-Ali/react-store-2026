"use client"

import * as React from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { Controller, useForm } from "react-hook-form"
import Link from "next/link"
import { EyeIcon, EyeOff, Lock, Mail } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldSeparator,
} from "@/components/ui/field"
import { Spinner } from "@/components/ui/spinner"
import { Badge } from "@/components/ui/badge"
import { CustomInput } from "@/components/ui/custom-input"
import { AuthHeader } from "./header"
import { GoogleSignInButton } from "./google-sign-in-button"

import {
  signInWithPassword,
  signInWithPasswordSchema,
  type SignInWithPasswordInput,
} from "@/lib/actions/authentication"
import { appRoutes } from "@/lib/config/app-routes"

interface LoginFormProps {
  lastLoginMethod: string | undefined
}

export function LoginForm({ lastLoginMethod }: LoginFormProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirectTarget = searchParams.get("redirect") || appRoutes.home
  const [showPassword, setShowPassword] = React.useState(false)

  const form = useForm<SignInWithPasswordInput>({
    resolver: zodResolver(signInWithPasswordSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  })

  const {
    formState: { isSubmitting, errors },
  } = form

  async function onSubmit(data: SignInWithPasswordInput) {
    const result = await signInWithPassword(data)

    if (result.success) {
      router.refresh()
      router.replace(redirectTarget)
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
                autoComplete="current-password"
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
            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full uppercase"
            >
              {isSubmitting ? <Spinner /> : "sign In"}
            </Button>
          </div>
        </Field>

        <FieldSeparator className="my-1">Or</FieldSeparator>

        <Field className="grid gap-4 sm:grid-cols-1">
          <GoogleSignInButton lastLoginMethod={lastLoginMethod} />
        </Field>
      </FieldGroup>
    </form>
  )
}
