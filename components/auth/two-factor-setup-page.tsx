"use client"

import { useTranslations } from "next-intl"
import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { CopyIcon } from "@/components/shared/new-icons"

import { enrollMfa, verifyMfa } from "@/lib/actions/mfa/mfa"
import { Button } from "@/components/ui/button"
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { toast } from "sonner"
import { appRouter } from "@/lib/config/app_router"
import { Spinner } from "../ui/spinner"
import { cn } from "@/lib/utils"

export default function TwoFactorSetupPage() {
  const t = useTranslations("TwoFactor")
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [code, setCode] = useState("")
  const [qrCode, setQrCode] = useState<string | null>(null)
  const [secretKey, setSecretKey] = useState<string | null>(null)
  const [factorId, setFactorId] = useState<string | null>(null)
  const [step, setStep] = useState<"setup" | "verify">("setup")

  const handleEnroll = async () => {
    startTransition(async () => {
      const result = await enrollMfa()

      if (!result.success || !result.data) {
        toast.error(t("enrollFailed"))
        return
      }

      setQrCode(result.data.totp.qr_code)
      setSecretKey(result.data.totp.secret)
      setFactorId(result.data.id)
      setStep("verify")
      toast.success(t("scanQrCodeSuccess"))
    })
  }

  const handleVerify = () => {
    startTransition(async () => {
      if (!factorId || !code) {
        toast.error(t("enterCodeError"))
        return
      }

      const result = await verifyMfa(factorId, code)

      if (!result.success) {
        toast.error(t("verifyFailed"))
        return
      }

      toast.success(t("verifySuccess"))
      router.push(appRouter.home)
    })
  }

  const handleSkip = () => {
    router.push(appRouter.home)
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">{t("title")}</CardTitle>
          <CardDescription>{t("description")}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {step === "setup" ? (
            <div className="space-y-4">
              <div className="space-y-2 text-center">
                <h3 className="text-lg font-semibold">{t("setupTitle")}</h3>
                <p className="text-sm text-muted-foreground">
                  {t("setupDescription")}
                </p>
              </div>

              <Button
                onClick={handleEnroll}
                disabled={isPending}
                className="w-full"
                size="lg"
              >
                {isPending ? <Spinner /> : t("startSetup")}
              </Button>

              <Button
                variant="ghost"
                onClick={handleSkip}
                disabled={isPending}
                className="w-full"
              >
                {t("skip")}
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {qrCode && (
                <div className="flex justify-center">
                  <div
                    className={cn(
                      "rounded-lg border p-4",
                      isPending && "opacity-50"
                    )}
                  >
                    <Image
                      src={qrCode.trimEnd()}
                      alt="QR Code"
                      width={200}
                      height={200}
                      className="mx-auto"
                    />
                  </div>
                </div>
              )}

              <div className="space-y-2 text-center">
                <h3 className="text-lg font-semibold">{t("verifyTitle")}</h3>
                <p className="text-sm text-muted-foreground">
                  {t("verifyDescription")}
                </p>
              </div>

              {secretKey && (
                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    {t("secretKey") || "Secret Key"}
                  </label>
                  <p className="text-xs text-muted-foreground">
                    {t("secretKeyDescription") ||
                      "If you can't scan the QR code, enter this key manually"}
                  </p>
                  <div className="flex items-center gap-2 rtl:flex-row-reverse">
                    <code className="dir-ltr flex-1 rounded-md bg-muted px-3 py-2 text-center font-mono text-sm">
                      {secretKey}
                    </code>
                    <Button
                      type="button"
                      variant="secondary"
                      className="hidden h-9 w-12 sm:inline-flex"
                      onClick={() => {
                        navigator.clipboard.writeText(secretKey)
                        toast.success(t("copiedToClipboard") || "Copied!")
                      }}
                    >
                      <CopyIcon className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}

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

              <Button
                variant="ghost"
                onClick={handleSkip}
                disabled={isPending}
                className="w-full"
              >
                {t("skip")}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
