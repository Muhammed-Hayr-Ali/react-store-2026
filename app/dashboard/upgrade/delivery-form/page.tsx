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
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"

export default function DeliveryFormPage() {
  const router = useRouter()
  const supabase = createBrowserClient()

  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    company_name: "",
    phone: "",
    email: "",
    license_number: "",
    insurance_number: "",
    vehicle_types: "motorcycle",
    coverage_areas: "",
    max_delivery_radius: "10",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    setLoading(true)

    try {
      // الحصول على المستخدم
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        alert("يجب تسجيل الدخول أولاً")
        router.push("/auth/signin")
        return
      }

      // 1. إنشاء سجل موظف التوصيل
      const { data: partner, error: partnerError } = await supabase
        .from("delivery_partners")
        .insert({
          user_id: user.id,
          company_name: formData.company_name,
          is_individual: true,
          vehicle_types: [formData.vehicle_types],
          phone: formData.phone,
          email: formData.email,
          license_number: formData.license_number,
          insurance_number: formData.insurance_number,
          coverage_areas: [{ city: formData.coverage_areas, zones: [] }],
          max_delivery_radius: parseInt(formData.max_delivery_radius),
          account_status: "pending",
        })
        .select()
        .single()

      if (partnerError) throw partnerError

      // 2. الانتقال لصفحة اختيار الخطة
      router.push(`/dashboard/upgrade/delivery-plans?partner_id=${partner.id}`)
    } catch (error: unknown) {
      const err = error as { message?: string }
      console.error("Error creating delivery partner:", err)
      alert("حدث خطأ. يرجى المحاولة مرة أخرى.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto max-w-2xl px-4 py-8">
      <Link href="/dashboard/upgrade">
        <Button variant="ghost" className="mb-4 gap-2">
          <ArrowLeft className="h-4 w-4" />
          العودة
        </Button>
      </Link>

      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">معلومات موظف التوصيل</CardTitle>
          <CardDescription>
            أدخل معلوماتك للانضمام لفريق التوصيل
          </CardDescription>
        </CardHeader>

        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="company_name">اسم الشركة/الفردي</Label>
              <Input
                id="company_name"
                value={formData.company_name}
                onChange={(e) =>
                  setFormData({ ...formData, company_name: e.target.value })
                }
                placeholder="اسمك أو اسم شركتك"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="phone">رقم الهاتف *</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) =>
                    setFormData({ ...formData, phone: e.target.value })
                  }
                  placeholder="0501234567"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">البريد الإلكتروني *</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  placeholder="email@example.com"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="vehicle_types">نوع المركبة</Label>
              <select
                id="vehicle_types"
                value={formData.vehicle_types}
                onChange={(e) =>
                  setFormData({ ...formData, vehicle_types: e.target.value })
                }
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="motorcycle">دراجة نارية</option>
                <option value="car">سيارة</option>
                <option value="van">فان</option>
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="coverage_areas">مدينة التغطية</Label>
              <Input
                id="coverage_areas"
                value={formData.coverage_areas}
                onChange={(e) =>
                  setFormData({ ...formData, coverage_areas: e.target.value })
                }
                placeholder="الرياض"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="max_delivery_radius">
                أقصى مسافة للتوصيل (كم)
              </Label>
              <Input
                id="max_delivery_radius"
                type="number"
                value={formData.max_delivery_radius}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    max_delivery_radius: e.target.value,
                  })
                }
                placeholder="10"
              />
            </div>

            <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
              <p className="text-sm text-blue-800">
                <strong>ملاحظة:</strong> بعد الموافقة من الإدارة، ستختار خطة
                الاشتراك وتبدأ العمل.
              </p>
            </div>
          </CardContent>

          <CardFooter>
            <Button
              type="submit"
              className="w-full"
              size="lg"
              disabled={loading}
            >
              {loading ? "جاري الحفظ..." : "حفظ والمتابعة"}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
