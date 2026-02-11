// app/callback/route.ts
import { createServerClient } from "@/lib/supabase/createServerClient";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
// استخدم عميل الخادم هنا!

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const error = searchParams.get("error");

  // إذا كان هناك رمز في الرابط، قم بتبادله
  if (code) {
    const supabase = await createServerClient();

    // هذه الدالة تقوم بتبادل الرمز وتعيين الكوكي الآمن (HttpOnly) تلقائيًا
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (error) {
      console.error("Auth Callback Error:", error.message);
      // في حالة الفشل، أعد التوجيه إلى صفحة خطأ
      return NextResponse.redirect(`${origin}/error`);
    }
  }

  if (error) {
    console.error("Auth Callback Error:", error);
    // في حالة الفشل، أعد التوجيه إلى صفحة خطاء
    return NextResponse.redirect(`${origin}/auth-error?error=${error}`);
  }

  // بعد النجاح (أو إذا لم يكن هناك رمز)، أعد التوجيه إلى الصفحة الرئيسية
  return NextResponse.redirect(origin);
}
