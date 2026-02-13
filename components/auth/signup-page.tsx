"use client";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldSeparator,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { useLocale } from "next-intl";
import React from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import { Spinner } from "@/components/ui/spinner";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { AppLogo } from "../custom-ui/app-logo";
import { signInWithGoogle } from "@/lib/actions/signIn-with-google";
import { signUpWithPassword } from "@/lib/actions/auth";

type Inputs = {
  first_name: string;
  last_name: string;
  email: string;
  password: string;
  confirmPassword: string;
};

export function SignupPage({
  className,
  ...props
}: React.ComponentProps<"form">) {
  const locale = useLocale();
  const router = useRouter();
  const [isLoading, setIsLoading] = React.useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    getValues,
  } = useForm<Inputs>();

  const onSubmit: SubmitHandler<Inputs> = async (formData) => {
    const { data, error } = await signUpWithPassword({
      first_name: formData.first_name,
      last_name: formData.last_name,
      email: formData.email,
      password: formData.password,
      locale,
    });

    if (error) {
      toast.error(error);
    }

    if (!data) {
      toast.error("Something went wrong");
    }
    if (data) {
      router.refresh();
      // delay navigation
      await new Promise((resolve) => setTimeout(resolve, 1000));
      router.push("/");
    }
  };

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    try {
      await signInWithGoogle(locale);
    } catch (error) {
      toast.error((error as Error).message);
      setIsLoading(false);
    }
  };

  return (
    <form
      className={cn("flex flex-col gap-6", className)}
      {...props}
      onSubmit={handleSubmit(onSubmit)}
    >
      <FieldGroup>
        <div className="flex flex-col items-center gap-1 text-center">
          <AppLogo />
          <h1 className="text-2xl font-bold mt-4">Create your account</h1>
          <p className="text-muted-foreground text-sm text-balance">
            Fill in the form below to create your account
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field>
            <FieldLabel htmlFor="first_name">First Name</FieldLabel>
            <Input
              id="first_name"
              type="text"
              autoComplete="first_name"
              placeholder="John"
              disabled={isSubmitting}
              aria-invalid={errors.first_name ? "true" : "false"}
              {...register("first_name", {
                required: "Please enter your full first name",
              })}
            />
            {errors.first_name && (
              <FieldDescription>{errors.first_name.message}</FieldDescription>
            )}
          </Field>

          <Field>
            <FieldLabel htmlFor="last_name">Last Name</FieldLabel>
            <Input
              id="last_name"
              type="text"
              autoComplete="last_name"
              placeholder="Doe"
              disabled={isSubmitting}
              aria-invalid={errors.last_name ? "true" : "false"}
              {...register("last_name", {
                required: "last_name enter your full first name",
              })}
            />

            {errors.last_name && (
              <FieldDescription>{errors.last_name.message}</FieldDescription>
            )}
          </Field>
        </div>
        <Field>
          <FieldLabel htmlFor="email">Email</FieldLabel>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            placeholder="you@domain.com"
            disabled={isSubmitting}
            aria-invalid={errors.email ? "true" : "false"}
            {...register("email", {
              required: "Please enter an email address.",
              pattern: {
                value:
                  /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/,
                message: "Please enter a valid email address.",
              },
              maxLength: {
                value: 100,
                message: "Email is too long.",
              },
              minLength: {
                value: 8,
                message: "Email must be at least 8 characters.",
              },
            })}
          />
          {errors.email && (
            <FieldDescription>{errors.email.message}</FieldDescription>
          )}
          <FieldDescription className="text-xs">
            We&apos;ll use this to contact you. We will not share your email
            with anyone else.
          </FieldDescription>
        </Field>
        <Field>
          <FieldLabel htmlFor="password">Password</FieldLabel>
          <Input
            id="password"
            type="password"
            autoComplete="new-password"
            placeholder="••••••••"
            disabled={isSubmitting}
            aria-invalid={errors.password ? "true" : "false"}
            {...register("password", {
              required: "Please enter a password.",
              maxLength: {
                value: 100,
                message: "Password is too long.",
              },
              minLength: {
                value: 8,
                message: "Password must be at least 8 characters.",
              },
            })}
          />
          {errors.password ? (
            <FieldDescription>{errors.password.message}</FieldDescription>
          ) : (
            <FieldDescription className="text-xs">
              Must be at least 8 characters long.
            </FieldDescription>
          )}
        </Field>
        <Field>
          <FieldLabel htmlFor="confirm-password">Confirm Password</FieldLabel>
          <Input
            id="confirm-password"
            type="password"
            autoComplete="new-password"
            placeholder="••••••••"
            disabled={isSubmitting}
            aria-invalid={errors.confirmPassword ? "true" : "false"}
            {...register("confirmPassword", {
              required: "Please confirm your password.",
              maxLength: {
                value: 100,
                message: "Password is too long.",
              },
              minLength: {
                value: 8,
                message: "Password must be at least 8 characters.",
              },
              validate: (value) => {
                const { password } = getValues();
                return value === password || "Passwords do not match!"; // إرجاع رسالة خطأ هو الأفضل
              },
            })}
          />
          {errors.confirmPassword && (
            <FieldDescription>
              {errors.confirmPassword.message}
            </FieldDescription>
          )}
        </Field>
        <Field>
          <Button
            type="button"
            onClick={handleSubmit(onSubmit)}
            disabled={isSubmitting}
          >
            {isSubmitting ? <Spinner /> : "Create Account"}
          </Button>
        </Field>
        <FieldSeparator>Or continue with</FieldSeparator>
        <Field>
          <Button
            variant="outline"
            type="button"
            onClick={handleGoogleSignIn}
            disabled={isLoading}
          >
            {isLoading ? (
              <Spinner />
            ) : (
              <div className="flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                  <path
                    d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z"
                    fill="currentColor"
                  />
                </svg>
                Login with Google
              </div>
            )}
          </Button>
          <FieldDescription className="text-center">
            Already have an account?{" "}
            <Link href={`/${locale}/auth/login`}>Sign in</Link>
          </FieldDescription>
        </Field>
      </FieldGroup>
    </form>
  );
}
