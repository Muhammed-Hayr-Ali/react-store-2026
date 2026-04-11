"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { useRouter } from "next/navigation";

import {
  resetPassword,
  verifyResetToken,
} from "@/lib/actions/authentication/resetPassword";
import {
  resetPasswordSchema,
  type ResetPasswordFormValues,
} from "@/lib/validations/resetPasswordSchema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Spinner } from "@/components/ui/spinner";
import { useTranslations } from "next-intl";
import { appRouter } from "@/lib/navigation";
import { ArrowLeftIcon, CheckCircleIcon, LockIcon } from "lucide-react";
import { AppLogo } from "../shared/app-logo";
import Link from "next/link";

function ResetPasswordFormContent() {
  const t = useTranslations("Auth");
  const tErrors = useTranslations("Errors");
  const router = useRouter();
  const searchParams = useSearchParams();

  const token = searchParams.get("token");

  const [isValidating, setIsValidating] = useState(true);
  const [isTokenValid, setIsTokenValid] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      token: token || "",
      password: "",
      confirm_password: "",
    },
    mode: "onChange",
  });

  // Translate validation errors
  const translateError = (errorKey: string | undefined): string => {
    if (!errorKey) return "";
    return tErrors.has(errorKey) ? tErrors(errorKey) : errorKey;
  };

  async function onSubmit(data: ResetPasswordFormValues) {
    if (!token) {
      toast.error(t("missingToken"));
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await resetPassword({
        token,
        password: data.password,
        confirm_password: data.confirm_password,
      });

      if (result.success) {
        setIsSuccess(true);
        toast.success(t("successTitle"));

        setTimeout(() => {
          router.push(appRouter.signIn);
        }, 3000);
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

  useEffect(() => {
    if (!token) {
      setIsValidating(false);
      setIsTokenValid(false);
      toast.error(t("missingToken"));
      return;
    }

    const verifyToken = async () => {
      try {
        const result = await verifyResetToken(token);
        setIsTokenValid(result.isValid);

        if (!result.isValid) {
          toast.error(t("invalidToken"));
        }
      } catch {
        toast.error(t("verificationError"));
      } finally {
        setIsValidating(false);
      }
    };

    verifyToken();
  }, [token, t]);

  if (isValidating) {
    return (
      <div className="flex flex-col items-center justify-center space-y-4 py-12">
        <Spinner className="h-8 w-8" />
        <p className="text-muted-foreground">{t("validatingToken")}</p>
      </div>
    );
  }

  if (!isTokenValid) {
    return (
      <div className="space-y-6 text-center">
        <div className="mb-2 flex flex-col items-center gap-3 text-center">
          <Link href={appRouter.home}>
            <AppLogo size="lg" />
          </Link>
        </div>

        <div className="space-y-2">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-100 dark:bg-red-900">
            <LockIcon className="h-8 w-8 text-red-600 dark:text-red-400" />
          </div>
          <h2 className="text-2xl font-semibold">{t("invalidTokenTitle")}</h2>
          <p className="text-muted-foreground">{t("invalidTokenDesc")}</p>
        </div>

        <Button
          variant="outline"
          className="w-full"
          onClick={() => router.push(appRouter.forgotPassword)}
        >
          {t("requestNewLink")}
        </Button>
      </div>
    );
  }

  if (isSuccess) {
    return (
      <div className="space-y-6 text-center">
        <div className="mb-2 flex flex-col items-center gap-3 text-center">
          <Link href={appRouter.home}>
            <AppLogo size="lg" />
          </Link>
        </div>

        <div className="space-y-2">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-900">
            <CheckCircleIcon className="h-8 w-8 text-green-600 dark:text-green-400" />
          </div>
          <h2 className="text-2xl font-semibold">{t("successTitle")}</h2>
          <p className="text-muted-foreground">{t("successDesc")}</p>
        </div>

        <div className="space-y-4">
          <Button
            variant="outline"
            className="w-full"
            onClick={() => router.push(appRouter.signIn)}
          >
            {t("goToSignIn")}
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
          <h1 className="mt-2 text-2xl font-bold">{t("resetPasswordTitle")}</h1>
          <p className="text-sm text-balance text-muted-foreground">
            {t("resetPasswordDesc")}
          </p>
        </div>

        <Controller
          name="password"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor={field.name}>{t("newPassword")}</FieldLabel>
              <Input
                {...field}
                id={field.name}
                type="password"
                autoComplete="new-password"
                placeholder={t("passwordPlaceholder")}
                disabled={isSubmitting}
                aria-invalid={fieldState.invalid}
              />
              <FieldDescription className="text-xs">
                {t("passwordHint")}
              </FieldDescription>
              {fieldState.invalid && (
                <FieldError>
                  {translateError(fieldState.error?.message)}
                </FieldError>
              )}
            </Field>
          )}
        />

        <Controller
          name="confirm_password"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor={field.name}>
                {t("confirmPassword")}
              </FieldLabel>
              <Input
                {...field}
                id={field.name}
                type="password"
                autoComplete="new-password"
                placeholder={t("passwordPlaceholder")}
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
                {t("resetting")}
              </>
            ) : (
              t("resetPassword")
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

export default function ResetPasswordForm() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold">Loading...</h1>
          </div>
        </div>
      }
    >
      <ResetPasswordFormContent />
    </Suspense>
  );
}
