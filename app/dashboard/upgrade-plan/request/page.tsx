"use client"

import { useState, useEffect, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
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
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { ArrowLeft, CheckCircle } from "lucide-react"
import Link from "next/link"

function UpgradeRequestForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const supabase = createBrowserClient()
  const planId = searchParams.get("plan")

  const [loading, setLoading] = useState(false)
  const [plan, setPlan] = useState<any>(null)
  const [sellerId, setSellerId] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    contactMethod: "email",
    contactValue: "",
    notes: "",
  })

  useEffect(() => {
    async function loadData() {
      // تحميل معلومات الخطة
      if (planId) {
        const { data: planData } = await supabase
          .from("seller_subscription_plans")
          .select("*")
          .eq("id", planId)
          .single()

        if (planData) setPlan(planData)
      }

      // الحصول على معرف البائع
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (user) {
        const { data: sellerData } = await supabase
          .from("sellers")
          .select("id")
          .eq("user_id", user.id)
          .single()

        if (sellerData) setSellerId(sellerData.id)
      }
    }

    loadData()
  }, [planId])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      if (!sellerId || !planId) {
        throw new Error("بيانات غير مكتملة")
      }

      const { error } = await supabase.rpc("create_upgrade_request", {
        p_seller_id: sellerId,
        p_target_plan_id: planId,
        p_contact_method: formData.contactMethod,
        p_contact_value: formData.contactValue,
        p_seller_notes: formData.notes,
      })

      if (error) throw error

      // الانتقال لصفحة النجاح
      router.push("/dashboard/upgrade-plan/success")
    } catch (error: any) {
      console.error("Error submitting upgrade request:", error)
      alert("حدث خطأ. يرجى المحاولة مرة أخرى.")
    } finally {
      setLoading(false)
    }
  }

  if (!plan) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <p className="text-gray-500">جاري التحميل...</p>
      </div>
    )
  }

  return (
    <div className="container mx-auto max-w-2xl px-4 py-8">
      {/* Back Button */}
      <Link href="/dashboard/upgrade-plan">
        <Button variant="ghost" className="mb-4 gap-2">
          <ArrowLeft className="h-4 w-4" />
          العودة للخطط
        </Button>
      </Link>

      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">طلب ترقية الاشتراك</CardTitle>
          <CardDescription>
            املأ المعلومات التالية وسنتواصل معك قريباً
          </CardDescription>
        </CardHeader>

        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-6">
            {/* معلومات الخطة */}
            <div className="rounded-lg bg-primary/5 p-4">
              <h3 className="mb-2 font-bold">الخطة المختارة</h3>
              <div className="flex items-center justify-between">
                <span className="text-lg">{plan.name_ar}</span>
                <span className="text-2xl font-bold">
                  ${plan.price_usd}/شهر
                </span>
              </div>
              <p className="mt-2 text-sm text-gray-500">
                {plan.max_products} منتج
              </p>
            </div>

            {/* طريقة التواصل */}
            <div className="space-y-3">
              <Label>طريقة التواصل المفضلة</Label>
              <RadioGroup
                value={formData.contactMethod}
                onValueChange={(value) =>
                  setFormData({ ...formData, contactMethod: value })
                }
                className="grid grid-cols-3 gap-4"
              >
                <div>
                  <RadioGroupItem
                    value="email"
                    id="email"
                    className="peer sr-only"
                  />
                  <Label
                    htmlFor="email"
                    className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 peer-data-[state=checked]:border-primary hover:bg-accent hover:text-accent-foreground [&:has([data-state=checked])]:border-primary"
                  >
                    📧
                    <span className="mt-2">البريد</span>
                  </Label>
                </div>

                <div>
                  <RadioGroupItem
                    value="phone"
                    id="phone"
                    className="peer sr-only"
                  />
                  <Label
                    htmlFor="phone"
                    className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 peer-data-[state=checked]:border-primary hover:bg-accent hover:text-accent-foreground [&:has([data-state=checked])]:border-primary"
                  >
                    📱
                    <span className="mt-2">الهاتف</span>
                  </Label>
                </div>

                <div>
                  <RadioGroupItem
                    value="whatsapp"
                    id="whatsapp"
                    className="peer sr-only"
                  />
                  <Label
                    htmlFor="whatsapp"
                    className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 peer-data-[state=checked]:border-primary hover:bg-accent hover:text-accent-foreground [&:has([data-state=checked])]:border-primary"
                  >
                    💬
                    <span className="mt-2">WhatsApp</span>
                  </Label>
                </div>
              </RadioGroup>
            </div>

            {/* معلومات التواصل */}
            <div className="space-y-2">
              <Label htmlFor="contactValue">
                {formData.contactMethod === "email"
                  ? "البريد الإلكتروني"
                  : formData.contactMethod === "phone"
                    ? "رقم الهاتف"
                    : "رقم WhatsApp"}
              </Label>
              <Input
                id="contactValue"
                type={formData.contactMethod === "email" ? "email" : "tel"}
                placeholder={
                  formData.contactMethod === "email"
                    ? "example@email.com"
                    : formData.contactMethod === "phone"
                      ? "+966501234567"
                      : "+966501234567"
                }
                value={formData.contactValue}
                onChange={(e) =>
                  setFormData({ ...formData, contactValue: e.target.value })
                }
                required
              />
            </div>

            {/* ملاحظات إضافية */}
            <div className="space-y-2">
              <Label htmlFor="notes">ملاحظات إضافية (اختياري)</Label>
              <Textarea
                id="notes"
                placeholder="أي معلومات إضافية تود مشاركتها..."
                value={formData.notes}
                onChange={(e) =>
                  setFormData({ ...formData, notes: e.target.value })
                }
                rows={4}
              />
            </div>

            {/* تنبيه */}
            <div className="flex gap-3 rounded-lg border border-blue-200 bg-blue-50 p-4">
              <CheckCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-blue-500" />
              <div className="text-sm text-blue-800">
                <p className="mb-1 font-bold">ماذا سيحدث بعد الإرسال؟</p>
                <ol className="list-inside list-decimal space-y-1">
                  <li>ستراجع الإدارة طلبك خلال 24 ساعة</li>
                  <li>
                    سنتواصل معك عبر{" "}
                    {formData.contactMethod === "email"
                      ? "البريد"
                      : formData.contactMethod === "phone"
                        ? "الهاتف"
                        : "WhatsApp"}
                  </li>
                  <li>سنرسل لك رابط الدفع</li>
                  <li>بعد الدفع، سيتم تفعيل اشتراكك فوراً</li>
                </ol>
              </div>
            </div>
          </CardContent>

          <CardFooter>
            <Button
              type="submit"
              className="w-full"
              size="lg"
              disabled={loading}
            >
              {loading ? "جاري الإرسال..." : "إرسال طلب الترقية"}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}

export default function UpgradeRequestPage() {
  return (
    <Suspense
      fallback={
        <div className="container mx-auto px-4 py-8 text-center">
          <p className="text-gray-500">جاري التحميل...</p>
        </div>
      }
    >
      <UpgradeRequestForm />
    </Suspense>
  )
}
