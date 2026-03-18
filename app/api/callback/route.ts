// app/callback/route.ts
import { createServerClient } from "@/lib/supabase/createServerClient"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get("code")
  // نحتفظ باسم مختلف لخطأ البارامتر لتمييزه
  const urlError = searchParams.get("error")
  const next = searchParams.get("next") || "/" // صفحة الوجهة بعد الدخول

  // 1. التعامل مع أخطاء المصادقة القادمة من الرابط مباشرة
  if (urlError) {
    console.error("Auth Callback Error from URL:", urlError)

    // تنظيف رسالة الخطأ من الأحرف الخاصة
    const cleanError = encodeURIComponent(urlError.split("#")[0])

    // توجيه المستخدم إلى صفحة خطأ المصادقة
    return NextResponse.redirect(`${origin}/auth-error?error=${cleanError}`)
  }

  // 2. إذا كان هناك كود، نقوم بتبادله للحصول على الجلسة
  if (code) {
    try {
      const supabase = await createServerClient()

      // نقوم بتبادل الكود مع السيرفر
      // هذه الدالة تقوم بتحديث الكوكيز تلقائيًا
      const { error: exchangeError } =
        await supabase.auth.exchangeCodeForSession(code)

      if (exchangeError) {
        console.error("Token Exchange Error:", exchangeError.message)
        // تنظيف رسالة الخطأ
        const cleanError = encodeURIComponent(
          exchangeError.message.split("#")[0]
        )
        return NextResponse.redirect(`${origin}/callback=${cleanError}`)
      }

      // ✅ ملاحظة: لا نحتاج هنا لاستدعاء getUser() إلا إذا أردنا استخدام بيانات المستخدم الآن
      // الجلسة تم إنشاؤها والكوكيز تم تعيينها بنجاح.
    } catch (err) {
      console.error("Unexpected Error in Callback:", err)
      const cleanError = encodeURIComponent(
        err instanceof Error ? err.message.split("#")[0] : "unknown_error"
      )
      return NextResponse.redirect(`${origin}/auth-error?error=${cleanError}`)
    }
  }

  // 3. التوجيه النهائي
  // نستخدم 'next' لتوجيه المستخدم للصفحة التي كان يريد زيارتها قبل تسجيل الدخول
  // نستخدم encodeURI لضمان سلامة الرابط
  return NextResponse.redirect(`${origin}${encodeURI(next)}`)
}
