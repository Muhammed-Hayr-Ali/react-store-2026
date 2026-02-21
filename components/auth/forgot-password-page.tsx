"use client";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { useForm, SubmitHandler } from "react-hook-form";
import { Spinner } from "@/components/ui/spinner";
import { toast } from "sonner";
import Link from "next/link";
import React from "react";
import { AppLogo } from "../custom-ui/app-logo";
import { generatePasswordResetLink } from "@/lib/actions/forgot-password";
import { useLocale } from "next-intl";

type Inputs = {
  email: string;
};

export function ForgotPasswordPage({
  className,
  ...props
}: React.ComponentProps<"form">) {
  const locale = useLocale();
  console.log(locale);
  const [countdown, setCountdown] = React.useState(0);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<Inputs>();

  React.useEffect(() => {
    let timer: NodeJS.Timeout | null = null;
    if (countdown > 0) {
      timer = setTimeout(() => setCountdown((prev) => prev - 1), 1000);
    }
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [countdown]);

  const onSubmit: SubmitHandler<Inputs> = async (formData) => {
    if (!formData.email) {
      toast.error("Email is required");
      return;
    }

    const { error } = await generatePasswordResetLink({
      email: formData.email,
      locale: locale as "ar" | "en" | undefined,
    });

    if (error) {
      console.error(error);
      toast.error(error);
      return;
    }
    toast.success("Send reset password link sccessfully");
    setCountdown(60);
  };

  return (
    <form
      className={cn("flex flex-col gap-6", className)}
      {...props}
      onSubmit={handleSubmit(onSubmit)}
    >
      <FieldGroup>
        <div className="flex flex-col items-center gap-1 text-center">
          <Link href="/">
            <AppLogo />
          </Link>
          <h1 className="text-2xl font-bold  mt-4">Forgot Password</h1>
          <p className="text-muted-foreground text-sm text-balance">
            Enter your email to receive a link to reset your password
          </p>
        </div>
        <Field>
          <FieldLabel htmlFor="email">Email</FieldLabel>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            placeholder="you@domain.com"
            disabled={isSubmitting || countdown > 0}
            aria-invalid={errors.email ? "true" : "false"}
            {...register("email", {
              required: "Email is required",
              pattern: {
                value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                message: "Invalid email address",
              },
              maxLength: {
                value: 100,
                message: "Email must be less than 100 characters",
              },
              minLength: {
                value: 3,
                message: "Email must be at least 3 characters",
              },
            })}
          />
          {errors.email && (
            <FieldDescription>{errors.email.message}</FieldDescription>
          )}
        </Field>

        <Field>
          <Button
            type="button"
            onClick={handleSubmit(onSubmit)}
            disabled={isSubmitting || countdown > 0}
          >
            {isSubmitting ? (
              <Spinner />
            ) : countdown > 0 ? (
              `Resend in ${countdown} s`
            ) : (
              "Reset Password"
            )}
          </Button>
        </Field>
        <Field>
          <FieldDescription className="text-center">
            Already have an account? <Link href={`/auth/login`}>Sign in</Link>
          </FieldDescription>
        </Field>
      </FieldGroup>
    </form>
  );
}
