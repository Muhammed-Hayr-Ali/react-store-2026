"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createBrowserClient } from "@/lib/supabase/createBrowserClient"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CheckCircleIcon } from "@/components/shared/icons"

interface Plan {
  id: string
  name: string
  name_ar: string
  price_usd: number
  max_products: number
  features_ar: string[]
  is_popular?: boolean
  is_current?: boolean
}

export default function UpgradePlanPage() {
  const router = useRouter()
  const supabase = createBrowserClient()
  const [loading, setLoading] = useState<string | null>(null)

  const [plans, setPlans] = useState<Plan[]>([
    {
      id: "",
      name: "free",
      name_ar: "مجانية",
      price_usd: 0,
      max_products: 50,
      features_ar: ["50 منتج", "لوحة تحكم أساسية", "دعم عبر البريد"],
      is_current: true,
    },
    {
      id: "",
      name: "silver",
      name_ar: "فضية",
      price_usd: 29,
      max_products: 200,
      features_ar: ["200 منتج", "إحصائيات متقدمة", "دعم أولوي", "نطاق مخصص"],
      is_popular: true,
    },
    {
      id: "",
      name: "gold",
      name_ar: "ذهبية",
      price_usd: 99,
      max_products: 1000,
      features_ar: [
        "1000 منتج",
        "إحصائيات كاملة",
        "دعم 24/7",
        "وصول API",
        "علامة بيضاء",
      ],
    },
  ])

  // تحميل الخطط عند mounting
  useState(() => {
    async function loadPlans() {
      const { data, error } = await supabase
        .from("seller_subscription_plans")
        .select("*")
        .eq("plan_type", "seller")
        .eq("is_active", true)
        .order("sort_order")

      if (!error && data) {
        setPlans((prev) =>
          prev.map((plan) => {
            const dbPlan = data.find((p) => p.name === plan.name)
            if (dbPlan) {
              return {
                ...plan,
                id: dbPlan.id,
                features_ar: dbPlan.features_ar || plan.features_ar,
              }
            }
            return plan
          })
        )
      }
    }

    loadPlans()
  })

  const handleUpgrade = async (plan: Plan) => {
    if (plan.is_current) return

    setLoading(plan.id)

    try {
      // الحصول على معرف البائع
      const { data: sellerData } = await supabase
        .from("sellers")
        .select("id")
        .eq("user_id", (await supabase.auth.getUser()).data.user?.id)
        .single()

      if (!sellerData) {
        alert("يجب إنشاء متجر أولاً")
        router.push("/dashboard/seller/create")
        return
      }

      // إنشاء طلب الترقية
      const { error } = await supabase.rpc("create_upgrade_request", {
        p_seller_id: sellerData.id,
        p_target_plan_id: plan.id,
        p_contact_method: "email",
        p_contact_value: "",
        p_seller_notes: `ترقية إلى خطة ${plan.name_ar}`,
      })

      if (error) throw error

      // الانتقال لصفحة إكمال الطلب
      router.push(`/dashboard/upgrade-plan/request?plan=${plan.id}`)
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
      {/* Header */}
      <div className="mb-12 text-center">
        <h1 className="mb-4 text-4xl font-bold">اختر الخطة المناسبة لك</h1>
        <p className="text-lg text-gray-600">
          خطط مرنة تناسب جميع احتياجات عملك
        </p>
      </div>

      {/* Plans Grid */}
      <div className="mx-auto grid max-w-6xl grid-cols-1 gap-8 md:grid-cols-3">
        {plans.map((plan) => (
          <Card
            key={plan.id || plan.name}
            className={`relative flex flex-col ${
              plan.is_popular ? "scale-105 border-primary shadow-lg" : ""
            } ${plan.is_current ? "bg-gray-50" : ""}`}
          >
            {/* Popular Badge */}
            {plan.is_popular && (
              <Badge className="absolute -top-3 right-4 bg-primary">
                الأكثر شعبية
              </Badge>
            )}

            {/* Current Plan Badge */}
            {plan.is_current && (
              <Badge className="absolute -top-3 right-4 bg-green-500">
                خطتك الحالية
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
                {plan.features_ar.map((feature, index) => (
                  <li key={index} className="flex items-center gap-2">
                    <CheckCircleIcon className="h-5 w-5 shrink-0 text-green-500" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </CardContent>

            <CardFooter>
              <Button
                className="w-full"
                size="lg"
                disabled={plan.is_current || loading === plan.id}
                onClick={() => handleUpgrade(plan)}
              >
                {plan.is_current ? "خطتك الحالية" : "طلب الترقية"}
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>

      {/* Comparison Table */}
      <div className="mx-auto mt-16 max-w-4xl">
        <h2 className="mb-8 text-center text-2xl font-bold">مقارنة الخطط</h2>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-50">
                <th className="border p-4 text-right">الميزة</th>
                {plans.map((plan) => (
                  <th
                    key={plan.id || plan.name}
                    className="border p-4 text-center"
                  >
                    {plan.name_ar}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="border p-4 font-medium">عدد المنتجات</td>
                {plans.map((plan) => (
                  <td
                    key={plan.id || plan.name}
                    className="border p-4 text-center"
                  >
                    {plan.max_products}
                  </td>
                ))}
              </tr>
              <tr>
                <td className="border p-4 font-medium">السعر الشهري</td>
                {plans.map((plan) => (
                  <td
                    key={plan.id || plan.name}
                    className="border p-4 text-center"
                  >
                    ${plan.price_usd}
                  </td>
                ))}
              </tr>
              <tr>
                <td className="border p-4 font-medium">لوحة التحكم</td>
                {plans.map((plan) => (
                  <td
                    key={plan.id || plan.name}
                    className="border p-4 text-center"
                  >
                    <CheckCircleIcon className="mx-auto h-5 w-5 text-green-500" />
                  </td>
                ))}
              </tr>
              <tr>
                <td className="border p-4 font-medium">الإحصائيات</td>
                {plans.map((plan, index) => (
                  <td
                    key={plan.id || plan.name}
                    className="border p-4 text-center"
                  >
                    {index === 0 ? (
                      <span className="text-gray-400">أساسية</span>
                    ) : index === 1 ? (
                      <CheckCircleIcon className="mx-auto h-5 w-5 text-green-500" />
                    ) : (
                      <CheckCircleIcon className="mx-auto h-5 w-5 text-green-500" />
                    )}
                  </td>
                ))}
              </tr>
              <tr>
                <td className="border p-4 font-medium">الدعم الفني</td>
                {plans.map((plan, index) => (
                  <td
                    key={plan.id || plan.name}
                    className="border p-4 text-center"
                  >
                    {index === 0 ? "بريد" : index === 1 ? "أولوي" : "24/7"}
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* FAQ Section */}
      <div className="mx-auto mt-16 max-w-4xl">
        <h2 className="mb-8 text-center text-2xl font-bold">الأسئلة الشائعة</h2>
        <div className="space-y-4">
          <div className="rounded-lg bg-white p-6 shadow">
            <h3 className="mb-2 font-bold">كيف يمكنني ترقية اشتراكي؟</h3>
            <p className="text-gray-600">
              اختر الخطة التي تريدها واضغط على طلب الترقية. سيقوم فريقنا
              بالتواصل معك خلال 24 ساعة لترتيب عملية الدفع والتفعيل.
            </p>
          </div>
          <div className="rounded-lg bg-white p-6 shadow">
            <h3 className="mb-2 font-bold">ما هي طرق الدفع المتاحة؟</h3>
            <p className="text-gray-600">
              نقبل الدفع عبر بطاقات الائتمان (Stripe)، PayPal، والتحويل البنكي.
            </p>
          </div>
          <div className="rounded-lg bg-white p-6 shadow">
            <h3 className="mb-2 font-bold">هل يمكنني تغيير خطتي لاحقاً؟</h3>
            <p className="text-gray-600">
              نعم، يمكنك الترقية أو downgrade في أي وقت. سيتم احتساب الفرق في
              السعر بشكل تناسبي.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
