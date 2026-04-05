"use client";

import { useTranslations } from "next-intl";
import Link from "next/link";
<<<<<<< HEAD
import { useState, useActionState } from "react";
=======
import { useState } from "react";
import { useForm } from "react-hook-form";
>>>>>>> f36a4adfff5056eceaacf66323cb179b9952a5a2
import { useRouter } from "next/navigation";

import { signInWithPassword } from "@/lib/actions/authentication/signInWithPassword";
import { signInWithGoogle } from "@/lib/actions/authentication/signIn-with-google";
<<<<<<< HEAD
=======
import type { SignInInput } from "@/lib/actions/authentication/types";
>>>>>>> f36a4adfff5056eceaacf66323cb179b9952a5a2
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
import { Spinner } from "../ui/spinner";
import { AppLogo } from "../shared/app-logo";
import { toast } from "sonner";
import { appRouter } from "@/lib/navigation";
<<<<<<< HEAD
import { CsrfTokenInput } from "../shared/csrf-token-input";
=======
>>>>>>> f36a4adfff5056eceaacf66323cb179b9952a5a2

export default function SignInForm({
  className,
  ...props
}: React.ComponentProps<"form">) {
  const t = useTranslations("Auth");
<<<<<<< HEAD
  const tErrors = useTranslations("Errors");
  const router = useRouter();
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  const [state, formAction, isPending] = useActionState(
    async (_prevState: unknown, formData: FormData) => {
      const result = await signInWithPassword(_prevState, formData);

      if (!result.success) {
        const message = tErrors.has(result.error)
          ? tErrors(result.error)
          : result.error;
        toast.error(message);
        return result;
      }

      router.push(appRouter.home);
      router.refresh();
      return result;
    },
    { success: false, error: "" },
  );

  const handleGoogleSignIn = async () => {
    setIsGoogleLoading(true);
=======
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignInInput>();

  const onSubmit = async (data: SignInInput) => {
    const result = await signInWithPassword(data);

    if (!result.success) {
      toast.error(result.error);
      return;
    }
    router.push(appRouter.home);
    router.refresh();
  };

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
>>>>>>> f36a4adfff5056eceaacf66323cb179b9952a5a2
    const result = await signInWithGoogle();
    if (!result.success) {
      toast.error(result.error);
      return;
    }
    router.push(appRouter.home);
    router.refresh();
  };

  return (
    <form
      className={cn("flex flex-col gap-8", className)}
      {...props}
<<<<<<< HEAD
      action={formAction}
    >
      <CsrfTokenInput />
=======
      onSubmit={handleSubmit(onSubmit)}
    >
>>>>>>> f36a4adfff5056eceaacf66323cb179b9952a5a2
      <FieldGroup className="gap-6">
        <div className="mb-2 flex flex-col items-center gap-3 text-center">
          <Link href={appRouter.home}>
            <AppLogo size="lg" />
          </Link>
          <h1 className="mt-2 text-2xl font-bold">{t("signIn")}</h1>
          <p className="text-sm text-balance text-muted-foreground">
            {t("enterDetailsSignIn")}
          </p>
        </div>
        <Field>
          <FieldLabel htmlFor="email">{t("email")}</FieldLabel>
          <Input
            id="email"
<<<<<<< HEAD
            name="email"
            type="email"
            autoComplete="email"
            placeholder={t("emailPlaceholder")}
            disabled={isPending}
          />
=======
            type="email"
            autoComplete="email"
            placeholder={t("emailPlaceholder")}
            disabled={isSubmitting}
            aria-invalid={errors.email ? "true" : "false"}
            {...register("email", {
              required: t("emailRequired"),
              pattern: {
                value:
                  /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/,
                message: t("invalidEmail"),
              },
              maxLength: {
                value: 100,
                message: t("emailTooLong"),
              },
              minLength: {
                value: 8,
                message: t("emailTooShort"),
              },
            })}
          />
          {errors.email && (
            <FieldDescription>{errors.email.message}</FieldDescription>
          )}
>>>>>>> f36a4adfff5056eceaacf66323cb179b9952a5a2
        </Field>
        <Field>
          <FieldLabel htmlFor="password">{t("password")}</FieldLabel>
          <Input
            id="password"
<<<<<<< HEAD
            name="password"
            type="password"
            autoComplete="current-password"
            placeholder={t("passwordPlaceholder")}
            disabled={isPending}
          />
          <FieldDescription className="flex items-center justify-between text-xs">
            <span>{t("passwordRequirement")}</span>
            <Link
              href={appRouter.forgotPassword}
              className="text-primary hover:underline"
            >
              {t("forgotPassword")}
            </Link>
          </FieldDescription>
        </Field>
        <Field>
          <Button type="submit" disabled={isPending}>
            {isPending ? <Spinner /> : t("submitSignIn")}
=======
            type="password"
            autoComplete="current-password"
            placeholder={t("passwordPlaceholder")}
            disabled={isSubmitting}
            aria-invalid={errors.password ? "true" : "false"}
            {...register("password", {
              required: t("passwordRequired"),
              maxLength: {
                value: 100,
                message: t("passwordTooLong"),
              },
              minLength: {
                value: 8,
                message: t("passwordTooShort"),
              },
            })}
          />
          {errors.password ? (
            <FieldDescription>{errors.password.message}</FieldDescription>
          ) : (
            <FieldDescription className="flex items-center justify-between text-xs">
              <span>{t("passwordRequirement")}</span>
              <Link
                href={appRouter.forgotPassword}
                className="text-primary hover:underline"
              >
                {t("forgotPassword")}
              </Link>
            </FieldDescription>
          )}
        </Field>
        <Field>
          <Button
            type="button"
            onClick={handleSubmit(onSubmit)}
            disabled={isSubmitting}
          >
            {isSubmitting ? <Spinner /> : t("submitSignIn")}
>>>>>>> f36a4adfff5056eceaacf66323cb179b9952a5a2
          </Button>
        </Field>
        <FieldSeparator className="my-2">{t("continueWith")}</FieldSeparator>
        <Field>
          <Button
            variant="outline"
            type="button"
            onClick={handleGoogleSignIn}
<<<<<<< HEAD
            disabled={isGoogleLoading}
          >
            {isGoogleLoading ? (
=======
            disabled={isLoading}
          >
            {isLoading ? (
>>>>>>> f36a4adfff5056eceaacf66323cb179b9952a5a2
              <Spinner />
            ) : (
              <div className="flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                  <path
                    d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z"
                    fill="currentColor"
                  />
                </svg>
                {t("loginWithGoogle")}
              </div>
            )}
          </Button>
        </Field>
        <FieldDescription className="text-center text-sm">
          {t("haveAccount")} <Link href={appRouter.signUp}>{t("signUp")}</Link>
        </FieldDescription>

        <p className="mt-4 px-8 text-center text-xs text-muted-foreground">
          {t("termsAndPrivacy")}{" "}
          <Link
            href={appRouter.terms}
            className="underline underline-offset-4 transition-colors hover:text-primary"
          >
            {t("terms")}
          </Link>{" "}
          {t("and") || "&"}{" "}
          <Link
            href={appRouter.privacy}
            className="underline underline-offset-4 transition-colors hover:text-primary"
          >
            {t("privacy")}
          </Link>
          .
        </p>
      </FieldGroup>
    </form>
  );
}
