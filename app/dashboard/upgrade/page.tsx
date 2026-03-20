"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
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
import { Store, Bike, ArrowRight } from "lucide-react"

export default function UpgradeAccountPage() {
  const router = useRouter()
  const supabase = createBrowserClient()
  const [loading, setLoading] = useState<string | null>(null)

  const handleSelectType = async (type: "seller" | "delivery") => {
    setLoading(type)

    try {
      // التحقق من أن المستخدم مسجل دخول
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        alert("يجب تسجيل الدخول أولاً")
        router.push("/auth/signin")
        return
      }

      if (type === "seller") {
        // الانتقال لصفحة معلومات البائع
        router.push("/dashboard/upgrade/seller-form")
      } else {
        // الانتقال لصفحة معلومات التوصيل
        router.push("/dashboard/upgrade/delivery-form")
      }
    } catch (error: unknown) {
      const err = error as { message?: string }
      console.error("Error selecting account type:", err)
      alert("حدث خطأ. يرجى المحاولة مرة أخرى.")
    } finally {
      setLoading(null)
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-12 text-center">
        <h1 className="mb-4 text-4xl font-bold">ترقية حسابك</h1>
        <p className="text-lg text-gray-600">
          اختر نوع الحساب الذي تريد الترقية إليه
        </p>
      </div>

      {/* Account Type Cards */}
      <div className="mx-auto grid max-w-4xl grid-cols-1 gap-8 md:grid-cols-2">
        {/* بائع */}
        <Card
          className="cursor-pointer transition-shadow hover:shadow-lg"
          onClick={() => handleSelectType("seller")}
        >
          <CardHeader className="text-center">
            <Store className="mx-auto mb-4 h-16 w-16 text-primary" />
            <CardTitle className="text-2xl">بائع</CardTitle>
            <CardDescription>بع منتجاتك في منصتنا</CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <ul className="space-y-2 text-right">
              <li className="flex items-center gap-2">
                <span className="text-green-500">✓</span>
                إدارة المنتجات
              </li>
              <li className="flex items-center gap-2">
                <span className="text-green-500">✓</span>
                متابعة الطلبات
              </li>
              <li className="flex items-center gap-2">
                <span className="text-green-500">✓</span>
                إحصائيات المبيعات
              </li>
              <li className="flex items-center gap-2">
                <span className="text-green-500">✓</span>
                دعم فني مخصص
              </li>
            </ul>
          </CardContent>
          <CardFooter>
            <Button className="w-full gap-2" disabled={loading === "seller"}>
              اختيار بائع
              <ArrowRight className="h-4 w-4" />
            </Button>
          </CardFooter>
        </Card>

        {/* موظف توصيل */}
        <Card
          className="cursor-pointer transition-shadow hover:shadow-lg"
          onClick={() => handleSelectType("delivery")}
        >
          <CardHeader className="text-center">
            <Bike className="mx-auto mb-4 h-16 w-16 text-primary" />
            <CardTitle className="text-2xl">موظف توصيل</CardTitle>
            <CardDescription>انضم لفريق التوصيل</CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <ul className="space-y-2 text-right">
              <li className="flex items-center gap-2">
                <span className="text-green-500">✓</span>
                قبول طلبات التوصيل
              </li>
              <li className="flex items-center gap-2">
                <span className="text-green-500">✓</span>
                تحديد مناطق التغطية
              </li>
              <li className="flex items-center gap-2">
                <span className="text-green-500">✓</span>
                متابعة الأرباح
              </li>
              <li className="flex items-center gap-2">
                <span className="text-green-500">✓</span>
                مرونة في الوقت
              </li>
            </ul>
          </CardContent>
          <CardFooter>
            <Button className="w-full gap-2" disabled={loading === "delivery"}>
              اختيار موظف توصيل
              <ArrowRight className="h-4 w-4" />
            </Button>
          </CardFooter>
        </Card>
      </div>

      {/* معلومات إضافية */}
      <div className="mx-auto mt-12 max-w-4xl">
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="py-6">
            <h3 className="mb-4 text-center font-bold">كيف يعمل النظام؟</h3>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
              <div className="text-center">
                <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-primary font-bold text-white">
                  1
                </div>
                <p className="text-sm">اختر نوع الحساب</p>
              </div>
              <div className="text-center">
                <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-primary font-bold text-white">
                  2
                </div>
                <p className="text-sm">أدخل المعلومات</p>
              </div>
              <div className="text-center">
                <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-primary font-bold text-white">
                  3
                </div>
                <p className="text-sm">اختر خطة الاشتراك</p>
              </div>
              <div className="text-center">
                <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-primary font-bold text-white">
                  4
                </div>
                <p className="text-sm">الإدارة توافق وتفعّل</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
