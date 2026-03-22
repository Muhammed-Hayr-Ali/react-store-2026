"use client"

import { Suspense, useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CheckCircle, Clock, ArrowRight } from "lucide-react"
import Link from "next/link"
import { useTranslations } from "next-intl"
import { appRouter } from "@/lib/app-routes"

function UpgradeSuccessContent() {
  const t = useTranslations("Dashboard.success")
  const searchParams = useSearchParams()
  const type = searchParams.get("type") || "seller"
  const [countdown, setCountdown] = useState(60)

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => (prev > 0 ? prev - 1 : prev))
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  useEffect(() => {
    if (countdown === 0) {
      window.location.href = appRouter.dashboard
    }
  }, [countdown])

  const isSeller = type === "seller"

  return (
    <div className="container mx-auto px-4 py-16">
      <div className="mx-auto max-w-2xl">
        <Card className="border-green-200 bg-green-50">
          <CardHeader className="text-center">
            <CheckCircle className="mx-auto mb-4 h-20 w-20 text-green-500" />
            <CardTitle className="text-3xl">{t("requestReceivedTitle")}</CardTitle>
            <CardDescription className="text-lg">
              {isSeller ? t("sellerRequestReceivedDesc") : t("deliveryRequestReceivedDesc")}
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6 text-center">
            <div className="rounded-lg border border-blue-200 bg-blue-50 p-6">
              <h3 className="mb-4 flex items-center justify-center gap-2 font-bold">
                <Clock className="h-5 w-5" />
                {t("nextSteps")}
              </h3>
              <ol className="list-inside list-decimal space-y-3 text-right">
                <li>{t("step1Review")}</li>
                <li>{t("step2Contact")}</li>
                <li>{t("step3Payment")}</li>
                <li>{t("step4Activate")}</li>
              </ol>
            </div>

            <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
              <p className="text-sm text-amber-800 font-medium">
                {t("contactSoonMessage")}
              </p>
              <p className="text-xs text-amber-700 mt-2">
                {t("contactTimeframe")}
              </p>
            </div>

            <div className="text-sm text-gray-600">
              <p>{t("trackStatusPrompt")}</p>
              <Link 
                href="/dashboard/upgrade/status"
                className="text-blue-600 hover:underline font-medium"
              >
                {t("trackStatusButton")}
              </Link>
            </div>
          </CardContent>

          <CardFooter className="flex flex-col gap-4">
            <Link href={appRouter.dashboard} className="w-full">
              <Button className="w-full gap-2" size="lg">
                <ArrowRight className="h-4 w-4" />
                {t("backToDashboard")}
              </Button>
            </Link>
            
            <div className="text-center text-sm text-gray-500">
              {t("autoRedirect")} <span className="font-bold">{countdown}</span> {t("seconds")}
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}

export default function UpgradeSuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="container mx-auto px-4 py-16 text-center">
          <p className="text-gray-500">Loading...</p>
        </div>
      }
    >
      <UpgradeSuccessContent />
    </Suspense>
  )
}
