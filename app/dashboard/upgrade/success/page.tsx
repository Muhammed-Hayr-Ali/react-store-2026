"use client"

import { useSearchParams, Suspense } from "next/navigation"
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

function UpgradeSuccessContent() {
  const searchParams = useSearchParams()
  const type = searchParams.get("type") || "seller"

  return (
    <div className="container mx-auto px-4 py-16">
      <div className="mx-auto max-w-2xl">
        <Card>
          <CardHeader className="text-center">
            <CheckCircle className="mx-auto mb-4 h-20 w-20 text-green-500" />
            <CardTitle className="text-3xl">تم إرسال طلبك بنجاح!</CardTitle>
            <CardDescription className="text-lg">
              {type === "seller"
                ? "تم استلام معلومات متجرك وخطة الاشتراك"
                : "تم استلام معلوماتك وخطة الاشتراك"}
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6 text-center">
            <div className="rounded-lg border border-blue-200 bg-blue-50 p-6">
              <h3 className="mb-4 flex items-center justify-center gap-2 font-bold">
                <Clock className="h-5 w-5" />
                الخطوات التالية
              </h3>
              <ol className="list-inside list-decimal space-y-3 text-right">
                <li>ستقوم الإدارة بمراجعة طلبك خلال 24-48 ساعة</li>
                <li>
                  سنتواصل معك عبر البريد الإلكتروني للموافقة أو الطلب معلومات
                  إضافية
                </li>
                <li>بعد الموافقة، سنرسل لك رابط الدفع للاشتراك</li>
                <li>بعد الدفع، سيتم تفعيل حسابك واشتراكك فوراً</li>
              </ol>
            </div>

            <div className="text-sm text-gray-600">
              <p>يمكنك متابعة حالة طلبك من:</p>
              <Link href="/dashboard/upgrade/status">
                <Button variant="link">صفحة حالة الطلب</Button>
              </Link>
            </div>
          </CardContent>

          <CardFooter className="flex justify-center gap-4">
            <Link href="/dashboard">
              <Button variant="outline">العودة للوحة التحكم</Button>
            </Link>
            <Link href="/dashboard/upgrade/status">
              <Button>متابعة حالة الطلب</Button>
            </Link>
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
          <p className="text-gray-500">جاري التحميل...</p>
        </div>
      }
    >
      <UpgradeSuccessContent />
    </Suspense>
  )
}
