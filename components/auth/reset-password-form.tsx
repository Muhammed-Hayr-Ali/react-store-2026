<<<<<<< HEAD
"use client";

import {
  useState,
  useTransition,
  useEffect,
  Suspense,
  useActionState,
} from "react";
import { useSearchParams } from "next/navigation";
import { toast } from "sonner";
import {
  resetPassword,
  verifyResetToken,
} from "@/lib/actions/authentication/resetPassword";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FieldLabel, FieldDescription } from "@/components/ui/field";
import { Spinner } from "@/components/ui/spinner";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { appRouter } from "@/lib/navigation";
import { CheckCircleIcon, LockIcon } from "lucide-react";
import { CsrfTokenInput } from "../shared/csrf-token-input";

function ResetPasswordFormContent() {
  const t = useTranslations("ResetPassword");
  const tErrors = useTranslations("Errors");
  const router = useRouter();
  const searchParams = useSearchParams();

  const token = searchParams.get("token");

  const [isValidating, setIsValidating] = useState(true);
  const [isTokenValid, setIsTokenValid] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const [state, formAction, isPending] = useActionState(
    async (_prevState: unknown, formData: FormData) => {
      if (!token) {
        toast.error(t("missingToken"));
        return { success: false, error: t("missingToken") };
      }

      const result = await resetPassword(_prevState, formData);

      if (result.success) {
        setIsSuccess(true);
        toast.success(t("successTitle"));

        setTimeout(() => {
          router.push(appRouter.signIn);
        }, 3000);
      } else {
        const message = tErrors.has(result.error)
          ? tErrors(result.error)
          : result.error;
        toast.error(message || t("invalidToken"));
      }

      return result;
    },
    { success: false, error: "" },
  );

  useEffect(() => {
    if (!token) {
      setIsValidating(false);
      setIsTokenValid(false);
      toast.error(t("missingToken"));
      return;
=======
"use client"

import { useState, useTransition, useEffect, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import { useForm } from "react-hook-form"
import { toast } from "sonner"
import {
  resetPassword,
  verifyResetToken,
} from "@/lib/actions/authentication/resetPassword"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { FieldLabel, FieldDescription } from "@/components/ui/field"
import { Spinner } from "@/components/ui/spinner"
import { useTranslations } from "next-intl"
import { useRouter } from "next/navigation"
import { appRouter } from "@/lib/navigation"
import { CheckCircleIcon, LockIcon } from "lucide-react"

function ResetPasswordFormContent() {
  const t = useTranslations("ResetPassword")
  const router = useRouter()
  const searchParams = useSearchParams()

  // قراءة التوكن مباشرة من searchParams
  const token = searchParams.get("token")

  const [isPending, startTransition] = useTransition()
  const [isValidating, setIsValidating] = useState(true)
  const [isTokenValid, setIsTokenValid] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<{ password: string; confirmPassword: string }>()

  const password = watch("password")

  // التحقق من الرمز عند تحميل الصفحة
  useEffect(() => {
    if (!token) {
      setIsValidating(false)
      setIsTokenValid(false)
      toast.error(t("missingToken"))
      return
>>>>>>> f36a4adfff5056eceaacf66323cb179b9952a5a2
    }

    const verifyToken = async () => {
      try {
<<<<<<< HEAD
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
=======
        const result = await verifyResetToken(token)
        setIsTokenValid(result.isValid)

        if (!result.isValid) {
          toast.error(t("invalidToken"))
        }
      } catch {
        toast.error(t("verificationError"))
      } finally {
        setIsValidating(false)
      }
    }

    verifyToken()
  }, [token, t])

  const onSubmit = async (data: {
    password: string
    confirmPassword: string
  }) => {
    if (!token) {
      toast.error(t("missingToken"))
      return
    }

    startTransition(async () => {
      const result = await resetPassword(token, data.password)

      if (result.success) {
        setIsSuccess(true)
        toast.success(t("successTitle"))

        // إعادة التوجيه لتسجيل الدخول بعد 3 ثواني
        setTimeout(() => {
          router.push(appRouter.signIn)
        }, 3000)
      } else {
        toast.error(result.error || t("invalidToken"))
      }
    })
  }
>>>>>>> f36a4adfff5056eceaacf66323cb179b9952a5a2

  if (isValidating) {
    return (
      <div className="flex flex-col items-center justify-center space-y-4 py-12">
        <Spinner className="h-8 w-8" />
        <p className="text-muted-foreground">{t("validatingToken")}</p>
      </div>
<<<<<<< HEAD
    );
=======
    )
>>>>>>> f36a4adfff5056eceaacf66323cb179b9952a5a2
  }

  if (!isTokenValid) {
    return (
      <div className="space-y-6 text-center">
        <div className="space-y-2">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-100 dark:bg-red-900">
            <LockIcon className="h-8 w-8 text-red-600 dark:text-red-400" />
          </div>
          <h2 className="text-2xl font-semibold">{t("invalidTokenTitle")}</h2>
          <p className="text-muted-foreground">
            {t("invalidTokenDescription")}
          </p>
        </div>

        <Button
          variant="outline"
          className="w-full"
          onClick={() => router.push(appRouter.forgotPassword)}
        >
          {t("requestNewLink")}
        </Button>
      </div>
<<<<<<< HEAD
    );
=======
    )
>>>>>>> f36a4adfff5056eceaacf66323cb179b9952a5a2
  }

  if (isSuccess) {
    return (
      <div className="space-y-6 text-center">
        <div className="space-y-2">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-900">
            <CheckCircleIcon className="h-8 w-8 text-green-600 dark:text-green-400" />
          </div>
          <h2 className="text-2xl font-semibold">{t("successTitle")}</h2>
          <p className="text-muted-foreground">{t("successDescription")}</p>
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
<<<<<<< HEAD
    );
=======
    )
>>>>>>> f36a4adfff5056eceaacf66323cb179b9952a5a2
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2 text-center">
        <h1 className="text-2xl font-semibold">{t("title")}</h1>
        <p className="text-muted-foreground">{t("description")}</p>
      </div>

<<<<<<< HEAD
      <form action={formAction} className="space-y-4">
        <CsrfTokenInput />
        <input type="hidden" name="token" value={token || ""} />

=======
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
>>>>>>> f36a4adfff5056eceaacf66323cb179b9952a5a2
        <div className="space-y-2">
          <FieldLabel htmlFor="password">{t("newPassword")}</FieldLabel>
          <Input
            id="password"
<<<<<<< HEAD
            name="password"
=======
>>>>>>> f36a4adfff5056eceaacf66323cb179b9952a5a2
            type="password"
            autoComplete="new-password"
            placeholder="••••••••"
            disabled={isPending}
<<<<<<< HEAD
          />
=======
            aria-invalid={errors.password ? "true" : "false"}
            {...register("password", {
              required: t("passwordRequired"),
              minLength: {
                value: 8,
                message: t("passwordMinLength"),
              },
              maxLength: {
                value: 72,
                message: t("passwordMaxLength"),
              },
            })}
          />
          {errors.password && (
            <FieldDescription className="text-destructive">
              {errors.password.message}
            </FieldDescription>
          )}
>>>>>>> f36a4adfff5056eceaacf66323cb179b9952a5a2
        </div>

        <div className="space-y-2">
          <FieldLabel htmlFor="confirmPassword">
            {t("confirmPassword")}
          </FieldLabel>
          <Input
            id="confirmPassword"
<<<<<<< HEAD
            name="confirmPassword"
=======
>>>>>>> f36a4adfff5056eceaacf66323cb179b9952a5a2
            type="password"
            autoComplete="new-password"
            placeholder="••••••••"
            disabled={isPending}
<<<<<<< HEAD
          />
=======
            aria-invalid={errors.confirmPassword ? "true" : "false"}
            {...register("confirmPassword", {
              required: t("confirmPasswordRequired"),
              validate: (value) => value === password || t("passwordsMatch"),
            })}
          />
          {errors.confirmPassword && (
            <FieldDescription className="text-destructive">
              {errors.confirmPassword.message}
            </FieldDescription>
          )}
>>>>>>> f36a4adfff5056eceaacf66323cb179b9952a5a2
        </div>

        <Button type="submit" className="w-full" disabled={isPending}>
          {isPending ? (
            <>
              <Spinner className="ml-2" />
              {t("resetting")}
            </>
          ) : (
            t("resetPassword")
          )}
        </Button>
      </form>

      <div className="text-center">
        <Button
          variant="link"
          className="text-muted-foreground"
          onClick={() => router.push(appRouter.signIn)}
        >
          {t("backToSignIn")}
        </Button>
      </div>
    </div>
<<<<<<< HEAD
  );
=======
  )
>>>>>>> f36a4adfff5056eceaacf66323cb179b9952a5a2
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
<<<<<<< HEAD
  );
=======
  )
>>>>>>> f36a4adfff5056eceaacf66323cb179b9952a5a2
}
