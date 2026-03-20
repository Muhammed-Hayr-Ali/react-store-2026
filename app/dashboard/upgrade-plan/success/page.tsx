"use client"

import { useEffect, useState } from "react"
import { createBrowserClient } from "@/lib/supabase/createBrowserClient"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { CheckCircle, Clock, MessageSquare } from "lucide-react"
import Link from "next/link"

export default function UpgradeSuccessPage() {
  const supabase = createBrowserClient()
  const [requestId, setRequestId] = useState<string | null>(null)

  useEffect(() => {
    async function getLastRequest() {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (user) {
        const { data: sellerData } = await supabase
          .from("sellers")
          .select("id")
          .eq("user_id", user.id)
          .single()

        if (sellerData) {
          const { data: requests } = await supabase
            .from("seller_upgrade_requests")
            .select("id")
            .eq("seller_id", sellerData.id)
            .order("created_at", { ascending: false })
            .limit(1)

          if (requests && requests.length > 0) {
            setRequestId(requests[0].id)
          }
        }
      }
    }

    getLastRequest()
  })

  return (
    <div className="container mx-auto px-4 py-16">
      <div className="mx-auto max-w-2xl">
        {/* Success Icon */}
        <div className="mb-8 text-center">
          <div className="mb-6 inline-flex h-24 w-24 items-center justify-center rounded-full bg-green-100">
            <CheckCircle className="h-16 w-16 text-green-500" />
          </div>

          <h1 className="mb-4 text-4xl font-bold">تم استلام طلبك بنجاح!</h1>
          <p className="text-xl text-gray-600">
            شكراً لثقتك بنا. فريقنا سيتواصل معك قريباً.
          </p>
        </div>

        {/* Request Info */}
        {requestId && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>معلومات الطلب</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">رقم الطلب:</span>
                <span className="font-mono font-bold">
                  #{requestId.slice(0, 8).toUpperCase()}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">حالة الطلب:</span>
                <span className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-yellow-500" />
                  <span className="font-bold text-yellow-600">
                    قيد المراجعة
                  </span>
                </span>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Next Steps */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>الخطوات التالية</CardTitle>
            <CardDescription>ماذا سيحدث بعد الإرسال</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex gap-4">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary font-bold text-white">
                  1
                </div>
                <div>
                  <h3 className="mb-1 font-bold">مراجعة الطلب</h3>
                  <p className="text-gray-600">
                    ستقوم الإدارة بمراجعة طلبك خلال 24 ساعة
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary font-bold text-white">
                  2
                </div>
                <div>
                  <h3 className="mb-1 font-bold">التواصل معك</h3>
                  <p className="text-gray-600">
                    سنتواصل معك عبر طريقة التواصل التي اخترتها
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary font-bold text-white">
                  3
                </div>
                <div>
                  <h3 className="mb-1 font-bold">إرسال رابط الدفع</h3>
                  <p className="text-gray-600">سنرسل لك رابط الدفع الآمن</p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary font-bold text-white">
                  4
                </div>
                <div>
                  <h3 className="mb-1 font-bold">تفعيل الاشتراك</h3>
                  <p className="text-gray-600">
                    بعد استلام الدفع، سيتم تفعيل اشتراكك فوراً
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Contact Info */}
        <Card className="mb-8 border-blue-200 bg-blue-50">
          <CardContent className="py-6">
            <div className="flex items-start gap-4">
              <MessageSquare className="mt-1 h-6 w-6 shrink-0 text-blue-500" />
              <div>
                <h3 className="mb-2 font-bold">هل لديك أسئلة؟</h3>
                <p className="mb-3 text-gray-600">
                  فريق الدعم جاهز لمساعدتك في أي وقت
                </p>
                <div className="flex gap-4 text-sm">
                  <a
                    href="mailto:support@marketna.com"
                    className="text-blue-600 hover:underline"
                  >
                    📧 support@marketna.com
                  </a>
                  <a
                    href="tel:+966501234567"
                    className="text-blue-600 hover:underline"
                  >
                    📱 +966 50 123 4567
                  </a>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex flex-col justify-center gap-4 sm:flex-row">
          <Link href="/dashboard/upgrade-requests">
            <Button size="lg" className="w-full sm:w-auto">
              عرض حالة الطلب
            </Button>
          </Link>
          <Link href="/dashboard">
            <Button variant="outline" size="lg" className="w-full sm:w-auto">
              العودة للوحة التحكم
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
