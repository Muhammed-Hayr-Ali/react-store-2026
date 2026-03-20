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

interface Plan {
  id: string
  name: string
  name_ar: string
  price_usd: number
  max_orders_per_day: number
  commission_rate: number
  features_ar: string[]
  is_popular?: boolean
}

function DeliveryPlansContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const supabase = createBrowserClient()
  const partnerId = searchParams.get("partner_id")

  const [loading, setLoading] = useState<string | null>(null)
  const [plans, setPlans] = useState<Plan[]>([])

  useEffect(() => {
    async function loadPlans() {
      const { data, error } = await supabase
        .from("delivery_subscription_plans")
        .select("*")
        .eq("plan_type", "delivery_partner")
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
      const { data: { user } } = await supabase.auth.getUser()

      if (!user || !partnerId) {
        alert("بيانات غير مكتملة")
        router.push("/dashboard/upgrade")
        return
      }

      const { error } = await supabase.rpc("create_delivery_upgrade_request", {
        p_partner_id: partnerId,
        p_target_plan_id: plan.id,
        p_contact_method: "email",
        p_contact_value: user.email || "",
        p_seller_notes: `طلب ترقية إلى خطة ${plan.name_ar}`,
      })

      if (error) throw error

      router.push("/dashboard/upgrade/success?type=delivery")
    } catch (error: unknown) {
      const err = error as { message?: string }
      console.error("Error creating upgrade request:", err)
      alert("حدث خطأ. يرجى المحاولة مرة أخرى.")
    } finally {
      setLoading(null)
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Link href="/dashboard/upgrade">
        <Button variant="ghost" className="mb-4 gap-2">
          <ArrowLeft className="h-4 w-4" />
          العودة
        </Button>
      </Link>

      <div className="mb-12 text-center">
        <h1 className="mb-4 text-4xl font-bold">اختر خطة الاشتراك</h1>
        <p className="text-lg text-gray-600">
          بعد موافقة الإدارة، ستبدأ اشتراكك بهذه الخطة
        </p>
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
                الأكثر شعبية
              </Badge>
            )}

            <CardHeader className="pb-6 text-center">
              <CardTitle className="text-2xl">{plan.name_ar}</CardTitle>
              <CardDescription className="mt-2 text-3xl font-bold">
                ${plan.price_usd}
                <span className="text-sm font-normal text-gray-500">/شهر</span>
              </CardDescription>
            </CardHeader>

            <CardContent className="flex-1">
              <ul className="space-y-3">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 flex-shrink-0 text-green-500" />
                  <span>{plan.max_orders_per_day === 999 ? 'طلبات غير محدودة' : `${plan.max_orders_per_day} طلب/يوم`}</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 flex-shrink-0 text-green-500" />
                  <span>عمولة {plan.commission_rate}%</span>
                </li>
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
                {loading === plan.id ? "جاري الإرسال..." : "اختيار هذه الخطة"}
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  )
}

export default function DeliveryPlansPage() {
  return (
    <Suspense
      fallback={
        <div className="container mx-auto px-4 py-8 text-center">
          <p className="text-gray-500">جاري التحميل...</p>
        </div>
      }
    >
      <DeliveryPlansContent />
    </Suspense>
  )
}
