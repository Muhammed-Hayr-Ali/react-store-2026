"use client";

import { useState } from "react";
import { toast } from "sonner";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { useRouter } from "next/navigation";

import { requestPasswordReset } from "@/lib/actions/authentication/requestPasswordReset";
import {
  forgotPasswordSchema,
  type ForgotPasswordFormValues,
} from "@/lib/validations/forgotPasswordSchema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Spinner } from "@/components/ui/spinner";
import { useTranslations } from "next-intl";
import { appRouter } from "@/lib/navigation";
import { ArrowLeftIcon, MailIcon } from "lucide-react";
import { AppLogo } from "../shared/app-logo";
import Link from "next/link";

export default function ForgotPasswordForm() {
  const t = useTranslations("Auth");
  const tErrors = useTranslations("Errors");
  const router = useRouter();
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: "",
    },
    mode: "onChange",
  });

  // Translate validation errors
  const translateError = (errorKey: string | undefined): string => {
    if (!errorKey) return "";
    return tErrors.has(errorKey) ? tErrors(errorKey) : errorKey;
  };

  async function onSubmit(data: ForgotPasswordFormValues) {
    setIsSubmitting(true);

    try {
      const result = await requestPasswordReset(data);

      if (result.success) {
        setIsSubmitted(true);
        toast.success(t("checkYourEmail"));
      } else {
        const message =
          result.error && tErrors.has(result.error)
            ? tErrors(result.error)
            : result.error;
        toast.error(message);
      }
    } catch {
      toast.error("An error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  if (isSubmitted) {
    return (
      <div className="space-y-6 text-center">
        <div className="mb-2 flex flex-col items-center gap-3 text-center">
          <Link href={appRouter.home}>
            <AppLogo size="lg" />
          </Link>
        </div>

        <div className="space-y-2">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-900">
            <MailIcon className="h-8 w-8 text-green-600 dark:text-green-400" />
          </div>
          <h2 className="text-2xl font-semibold">{t("checkYourEmail")}</h2>
          <p className="text-muted-foreground">{t("resetInstructions")}</p>
        </div>

        <div className="space-y-4">
          <Button
            variant="outline"
            className="w-full"
            onClick={() => router.push(appRouter.signIn)}
          >
            <ArrowLeftIcon className="ml-2 h-4 w-4" />
            {t("backToSignIn")}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <form
      className="flex flex-col gap-8"
      onSubmit={form.handleSubmit(onSubmit)}
    >
      <FieldGroup className="gap-6">
        <div className="mb-2 flex flex-col items-center gap-3 text-center">
          <Link href={appRouter.home}>
            <AppLogo size="lg" />
          </Link>
          <h1 className="mt-2 text-2xl font-bold">
            {t("forgotPasswordTitle")}
          </h1>
          <p className="text-sm text-balance text-muted-foreground">
            {t("forgotPasswordDesc")}
          </p>
        </div>

        <Controller
          name="email"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor={field.name}>{t("email")}</FieldLabel>
              <Input
                {...field}
                id={field.name}
                type="email"
                autoComplete="email"
                placeholder={t("emailPlaceholder")}
                disabled={isSubmitting}
                aria-invalid={fieldState.invalid}
              />
              {fieldState.invalid && (
                <FieldError>
                  {translateError(fieldState.error?.message)}
                </FieldError>
              )}
            </Field>
          )}
        />

        <Field>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Spinner className="mr-2" />
                {t("sending")}
              </>
            ) : (
              t("sendResetLink")
            )}
          </Button>
        </Field>

        <Field className="text-center">
          <Button
            variant="link"
            className="text-muted-foreground"
            onClick={() => router.push(appRouter.signIn)}
          >
            <ArrowLeftIcon className="ml-2 h-4 w-4" />
            {t("backToSignIn")}
          </Button>
        </Field>
      </FieldGroup>
    </form>
  );
}
