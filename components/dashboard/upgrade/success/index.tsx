"use client"

import { Suspense } from "react"
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
import { CheckCircle, Clock } from "lucide-react"
import Link from "next/link"
import { useTranslations } from "next-intl"
import { appRouter } from "@/lib/app-routes"

function UpgradeSuccessContent() {
  const t = useTranslations("Dashboard.success")
  const searchParams = useSearchParams()
  const type = searchParams.get("type") || "seller"

  return (
    <div className="container mx-auto px-4 py-16">
      <div className="mx-auto max-w-2xl">
        <Card>
          <CardHeader className="text-center">
            <CheckCircle className="mx-auto mb-4 h-20 w-20 text-green-500" />
            <CardTitle className="text-3xl">{t("title")}</CardTitle>
            <CardDescription className="text-lg">
              {type === "seller"
                ? t("descriptionSeller")
                : t("descriptionDelivery")}
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6 text-center">
            <div className="rounded-lg border border-blue-200 bg-blue-50 p-6">
              <h3 className="mb-4 flex items-center justify-center gap-2 font-bold">
                <Clock className="h-5 w-5" />
                {t("nextSteps")}
              </h3>
              <ol className="list-inside list-decimal space-y-3 text-right">
                <li>{t("step1")}</li>
                <li>{t("step2")}</li>
                <li>{t("step3")}</li>
                <li>{t("step4")}</li>
              </ol>
            </div>

            <div className="text-sm text-gray-600">
              <p>{t("trackStatus")}</p>
              <Link href={appRouter.upgradeStatus}>
                <Button variant="link">{t("trackStatusButton")}</Button>
              </Link>
            </div>
          </CardContent>

          <CardFooter className="flex justify-center gap-4">
            <Link href="/en/dashboard">
              <Button variant="outline">{t("backToDashboard")}</Button>
            </Link>
            <Link href="/en/dashboard/upgrade/status">
              <Button>{t("trackStatusButton")}</Button>
            </Link>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}

export default function UpgradeSuccess() {
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
