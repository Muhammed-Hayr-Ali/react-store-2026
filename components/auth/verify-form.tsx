<<<<<<< HEAD
"use client";

import { useTranslations } from "next-intl";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import { verifyMfaForLogin } from "@/lib/actions/mfa/verify-mfa";
import { Button } from "@/components/ui/button";
=======
"use client"

import { useTranslations } from "next-intl"
import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"

import { verifyMfaForLogin } from "@/lib/actions/mfa/verify-mfa"
import { Button } from "@/components/ui/button"
>>>>>>> f36a4adfff5056eceaacf66323cb179b9952a5a2
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
<<<<<<< HEAD
} from "@/components/ui/input-otp";
=======
} from "@/components/ui/input-otp"
>>>>>>> f36a4adfff5056eceaacf66323cb179b9952a5a2
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
<<<<<<< HEAD
} from "@/components/ui/card";
import { toast } from "sonner";
import { Spinner } from "@/components/ui/spinner";
import { ShieldCheckIcon } from "lucide-react";
import { appRouter } from "@/lib/navigation";

export default function VerifyForm() {
  const t = useTranslations("Verify");
  const tErrors = useTranslations("Errors");
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [code, setCode] = useState("");
=======
} from "@/components/ui/card"
import { toast } from "sonner"
import { Spinner } from "@/components/ui/spinner"
import { ShieldCheckIcon } from "lucide-react"
import { appRouter } from "@/lib/navigation"

export default function VerifyForm() {
  const t = useTranslations("Verify")
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [code, setCode] = useState("")
>>>>>>> f36a4adfff5056eceaacf66323cb179b9952a5a2

  const handleVerify = () => {
    startTransition(async () => {
      if (!code) {
<<<<<<< HEAD
        toast.error(t("enterCodeError"));
        return;
      }

      const result = await verifyMfaForLogin(code);

      if (!result.data) {
        const message =
          result.error && tErrors.has(result.error)
            ? tErrors(result.error)
            : t("verifyFailed");
        toast.error(message);
        return;
      }

      toast.success(t("verifySuccess"));
      router.push(appRouter.home);
    });
  };
=======
        toast.error(t("enterCodeError"))
        return
      }

      const result = await verifyMfaForLogin(code)

      if (!result.data) {
        toast.error(result.error || t("verifyFailed"))
        return
      }

      toast.success(t("verifySuccess"))
      router.push(appRouter.home)
    })
  }
>>>>>>> f36a4adfff5056eceaacf66323cb179b9952a5a2

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary">
            <ShieldCheckIcon className="h-6 w-6 text-primary-foreground" />
          </div>
          <CardTitle className="text-2xl">{t("title")}</CardTitle>
          <CardDescription>{t("description")}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6 pt-6">
<<<<<<< HEAD
=======
         

>>>>>>> f36a4adfff5056eceaacf66323cb179b9952a5a2
          <div className="flex justify-center">
            <InputOTP
              maxLength={6}
              value={code}
              onChange={setCode}
              disabled={isPending}
              onComplete={() => handleVerify()}
            >
              <InputOTPGroup dir="ltr">
                <InputOTPSlot index={0} />
                <InputOTPSlot index={1} />
                <InputOTPSlot index={2} />
                <InputOTPSlot index={3} />
                <InputOTPSlot index={4} />
                <InputOTPSlot index={5} />
              </InputOTPGroup>
            </InputOTP>
          </div>

          <Button
            onClick={handleVerify}
            disabled={isPending || code.length !== 6}
            className="w-full"
            size="lg"
          >
            {isPending ? <Spinner /> : t("verifyAndContinue")}
          </Button>
        </CardContent>
      </Card>
    </div>
<<<<<<< HEAD
  );
=======
  )
>>>>>>> f36a4adfff5056eceaacf66323cb179b9952a5a2
}
