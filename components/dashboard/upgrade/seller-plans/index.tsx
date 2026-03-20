"use client"

import { useState, useEffect, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { createBrowserClient } from "@/lib/supabase/createBrowserClient"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { CheckCircle2 } from "lucide-react"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { useTranslations } from "next-intl"
import { appRouter } from "@/lib/app-routes"
import { createUpgradeRequest } from "@/lib/actions/subscriptions/createUpgradeRequest"

interface Plan {
  id: string
  name: string
  name_ar: string
  price_usd: number
  max_products: number
  features_ar: string[]
  is_popular?: boolean
}

function SellerPlansContent() {
  const t = useTranslations("Dashboard.sellerPlans")
  const router = useRouter()
  const searchParams = useSearchParams()
  const supabase = createBrowserClient()
  const sellerId = searchParams.get("seller_id")

  const [loading, setLoading] = useState<string | null>(null)
  const [plans, setPlans] = useState<Plan[]>([])

  useEffect(() => {
    async function loadPlans() {
      const { data, error } = await supabase
        .from("seller_subscription_plans")
        .select("*")
        .eq("plan_type", "seller")
        .eq("is_active", true)
        .order("sort_order")

      if (!error && data) {
        setPlans(data)
      }
    }

    loadPlans()
  }, [])

  const handleSelectPlan = async (plan: Plan) => {
    setLoading(plan.id)

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user || !sellerId) {
        alert("Incomplete data")
        router.push(appRouter.upgrade)
        return
      }

      const result = await createUpgradeRequest({
        sellerId,
        planId: plan.id,
        contactMethod: "email",
        contactValue: user.email || "",
        notes: `Upgrade to ${plan.name_ar} plan`,
      })

      if (!result.success) {
        alert("An error occurred. Please try again.")
        return
      }

      router.push("/en/dashboard/upgrade/success?type=seller")
    } catch (error: unknown) {
      const err = error as { message?: string }
      console.error("Error creating upgrade request:", err)
      alert("An error occurred. Please try again.")
    } finally {
      setLoading(null)
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Link href={appRouter.upgrade}>
        <Button variant="ghost" className="mb-4 gap-2">
          <ArrowLeft className="h-4 w-4" />
          {t("back")}
        </Button>
      </Link>

      <div className="mb-12 text-center">
        <h1 className="mb-4 text-4xl font-bold">{t("title")}</h1>
        <p className="text-lg text-gray-600">{t("description")}</p>
      </div>

      <div className="mx-auto grid max-w-6xl grid-cols-1 gap-8 md:grid-cols-3">
        {plans.map((plan) => (
          <Card
            key={plan.id}
            className={`relative flex flex-col ${
              plan.is_popular ? "scale-105 border-primary shadow-lg" : ""
            }`}
          >
            {plan.is_popular && (
              <Badge className="absolute -top-3 right-4 bg-primary">
                {t("mostPopular")}
              </Badge>
            )}

            <CardHeader className="pb-6 text-center">
              <CardTitle className="text-2xl">{plan.name_ar}</CardTitle>
              <CardDescription className="mt-2 text-3xl font-bold">
                ${plan.price_usd}
                <span className="text-sm font-normal text-gray-500">
                  {t("perMonth")}
                </span>
              </CardDescription>
            </CardHeader>

            <CardContent className="flex-1">
              <ul className="space-y-3">
                {plan.features_ar.map((feature, index) => (
                  <li key={index} className="flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5 flex-shrink-0 text-green-500" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </CardContent>

            <CardFooter>
              <Button
                className="w-full"
                size="lg"
                disabled={loading === plan.id}
                onClick={() => handleSelectPlan(plan)}
              >
                {loading === plan.id ? t("selecting") : t("selectPlan")}
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>

      <div className="mx-auto mt-12 max-w-4xl">
        <Card className="border-yellow-200 bg-yellow-50">
          <CardContent className="py-6">
            <h3 className="mb-4 text-center font-bold">{t("whatHappens")}</h3>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <div className="text-center">
                <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-primary font-bold text-white">
                  1
                </div>
                <p className="text-sm">{t("step1")}</p>
              </div>
              <div className="text-center">
                <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-primary font-bold text-white">
                  2
                </div>
                <p className="text-sm">{t("step2")}</p>
              </div>
              <div className="text-center">
                <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-primary font-bold text-white">
                  3
                </div>
                <p className="text-sm">{t("step3")}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default function SellerPlansPage() {
  return (
    <Suspense
      fallback={
        <div className="container mx-auto px-4 py-8 text-center">
          <p className="text-gray-500">Loading...</p>
        </div>
      }
    >
      <SellerPlansContent />
    </Suspense>
  )
}
