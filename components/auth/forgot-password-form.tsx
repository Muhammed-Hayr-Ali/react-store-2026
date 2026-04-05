"use client";

import { useState, useTransition, useActionState } from "react";
import { toast } from "sonner";
import { requestPasswordReset } from "@/lib/actions/authentication/requestPasswordReset";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FieldLabel, FieldDescription } from "@/components/ui/field";
import { Spinner } from "@/components/ui/spinner";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { appRouter } from "@/lib/navigation";
import { ArrowLeftIcon, MailIcon } from "lucide-react";
import { CsrfTokenInput } from "../shared/csrf-token-input";

export default function ForgotPasswordForm() {
  const t = useTranslations("ForgotPassword");
  const tErrors = useTranslations("Errors");
  const router = useRouter();
  const [isSubmitted, setIsSubmitted] = useState(false);

  const [state, formAction, isPending] = useActionState(
    async (_prevState: unknown, formData: FormData) => {
      const result = await requestPasswordReset(_prevState, formData);

      if (result.success) {
        setIsSubmitted(true);
        toast.success(t("emailSent"));
      } else {
        const message = tErrors.has(result.error)
          ? tErrors(result.error)
          : result.error;
        toast.error(message || t("emailSent"));
      }

      return result;
    },
    { success: false, error: "" },
  );

  if (isSubmitted) {
    return (
      <div className="space-y-6 text-center">
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
    <div className="space-y-6">
      <div className="space-y-2 text-center">
        <h1 className="text-2xl font-semibold">{t("title")}</h1>
        <p className="text-muted-foreground">{t("description")}</p>
      </div>

      <form action={formAction} className="space-y-4">
        <CsrfTokenInput />
        <div className="space-y-2">
          <FieldLabel htmlFor="email">{t("email")}</FieldLabel>
          <Input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            placeholder={t("emailPlaceholder")}
            disabled={isPending}
          />
        </div>

        <Button type="submit" className="w-full" disabled={isPending}>
          {isPending ? (
            <>
              <Spinner className="ml-2" />
              {t("sending")}
            </>
          ) : (
            t("sendResetLink")
          )}
        </Button>
      </form>

      <div className="text-center">
        <Button
          variant="link"
          className="text-muted-foreground"
          onClick={() => router.push(appRouter.signIn)}
        >
          <ArrowLeftIcon className="ml-2 h-4 w-4" />
          {t("backToSignIn")}
        </Button>
      </div>
    </div>
  );
}
