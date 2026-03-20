"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createBrowserClient } from "@/lib/supabase/createBrowserClient"
import { appRouter } from "@/lib/app-routes"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Store, Bike, ArrowRight } from "lucide-react"
import { useTranslations } from "next-intl"

export default function UpgradeAccount() {
  const t = useTranslations("Dashboard.upgrade")
  const router = useRouter()
  const supabase = createBrowserClient()
  const [loading, setLoading] = useState<string | null>(null)

  const handleSelectType = async (type: "seller" | "delivery") => {
    setLoading(type)

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        router.push(appRouter.signIn)
        return
      }

      if (type === "seller") {
        router.push(appRouter.upgradeSellerForm)
      } else {
        router.push(appRouter.upgradeDeliveryForm)
      }
    } catch (error: unknown) {
      const err = error as { message?: string }
      console.error("Error selecting account type:", err)
    } finally {
      setLoading(null)
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-12 text-center">
        <h1 className="mb-4 text-4xl font-bold">{t("title")}</h1>
        <p className="text-lg text-gray-600">{t("description")}</p>
      </div>

      <div className="mx-auto grid max-w-4xl grid-cols-1 gap-8 md:grid-cols-2">
        {/* Seller Card */}
        <Card
          className="cursor-pointer transition-shadow hover:shadow-lg"
          onClick={() => handleSelectType("seller")}
        >
          <CardHeader className="text-center">
            <Store className="mx-auto mb-4 h-16 w-16 text-primary" />
            <CardTitle className="text-2xl">{t("seller")}</CardTitle>
            <CardDescription>{t("sellerDescription")}</CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <ul className="space-y-2 text-right">
              <li className="flex items-center gap-2">
                <span className="text-green-500">✓</span>
                {t("sellerFeature1")}
              </li>
              <li className="flex items-center gap-2">
                <span className="text-green-500">✓</span>
                {t("sellerFeature2")}
              </li>
              <li className="flex items-center gap-2">
                <span className="text-green-500">✓</span>
                {t("sellerFeature3")}
              </li>
              <li className="flex items-center gap-2">
                <span className="text-green-500">✓</span>
                {t("sellerFeature4")}
              </li>
            </ul>
          </CardContent>
          <CardFooter>
            <Button className="w-full gap-2" disabled={loading === "seller"}>
              {t("selectSeller")}
              <ArrowRight className="h-4 w-4" />
            </Button>
          </CardFooter>
        </Card>

        {/* Delivery Card */}
        <Card
          className="cursor-pointer transition-shadow hover:shadow-lg"
          onClick={() => handleSelectType("delivery")}
        >
          <CardHeader className="text-center">
            <Bike className="mx-auto mb-4 h-16 w-16 text-primary" />
            <CardTitle className="text-2xl">{t("delivery")}</CardTitle>
            <CardDescription>{t("deliveryDescription")}</CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <ul className="space-y-2 text-right">
              <li className="flex items-center gap-2">
                <span className="text-green-500">✓</span>
                {t("deliveryFeature1")}
              </li>
              <li className="flex items-center gap-2">
                <span className="text-green-500">✓</span>
                {t("deliveryFeature2")}
              </li>
              <li className="flex items-center gap-2">
                <span className="text-green-500">✓</span>
                {t("deliveryFeature3")}
              </li>
              <li className="flex items-center gap-2">
                <span className="text-green-500">✓</span>
                {t("deliveryFeature4")}
              </li>
            </ul>
          </CardContent>
          <CardFooter>
            <Button className="w-full gap-2" disabled={loading === "delivery"}>
              {t("selectDelivery")}
              <ArrowRight className="h-4 w-4" />
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}
