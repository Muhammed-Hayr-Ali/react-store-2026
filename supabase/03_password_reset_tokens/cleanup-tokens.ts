import { createClient } from "@supabase/supabase-js"
import { NextResponse } from "next/server"

export async function GET(request: Request) {
  // 1. التحقق من أن الطلب قادم من المصدر الموثوق (اختياري لكن مفضل)
  const authHeader = request.headers.get("authorization")
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new NextResponse("Unauthorized", { status: 401 })
  }

  // 2. الاتصال بـ Supabase باستخدام Service Role (للتجاوز سياسات RLS)
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  try {
    // 3. استدعاء دالة التنظيف
    const { data, error } = await supabase.rpc("cleanup_expired_reset_tokens")

    if (error) throw error

    return NextResponse.json({
      success: true,
      message: "Cleanup completed",
      deleted_count: data,
    })
  } catch (error) {
    console.error("Cleanup failed:", error)
    return NextResponse.json(
      { success: false, error: "Cleanup failed" },
      { status: 500 }
    )
  }
}
