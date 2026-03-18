import { createAdminClient } from "@/lib/supabase/createAdminClient "
import { NextResponse } from "next/server"

// Force dynamic rendering - Required for API routes
export const dynamic = "force-dynamic"
export const runtime = "nodejs"

/**
 * Cron Job Handler for Cleaning Up Expired Password Reset Tokens
 *
 * Called automatically by Vercel Cron based on vercel.json schedule
 * Can also be called manually for testing
 *
 * @example
 * curl -H "Authorization: Bearer YOUR_CRON_SECRET" \
 *   http://localhost:3000/api/cron/cleanup-tokens
 */
export async function GET(request: Request) {
  try {
    // 1. التحقق من أن الطلب قادم من المصدر الموثوق
    const authHeader = request.headers.get("authorization")
    const expectedAuth = `Bearer ${process.env.CRON_SECRET}`

    // التحقق من وجود CRON_SECRET
    if (!process.env.CRON_SECRET) {
      console.error("❌ CRON_SECRET is not configured")
      return new NextResponse(
        JSON.stringify({
          success: false,
          error: "CRON_SECRET not configured",
        }),
        { status: 500 }
      )
    }

    // التحقق من صحة الـ header
    if (authHeader !== expectedAuth) {
      console.warn("⚠️ Unauthorized cron attempt")
      return new NextResponse(
        JSON.stringify({
          success: false,
          error: "Unauthorized - Invalid CRON_SECRET",
        }),
        { status: 401 }
      )
    }

    // 2. التحقق من وجود متغيرات البيئة
    if (
      !process.env.NEXT_PUBLIC_SUPABASE_URL ||
      !process.env.SUPABASE_SERVICE_ROLE_KEY
    ) {
      console.error("❌ Supabase credentials not configured")
      return new NextResponse(
        JSON.stringify({
          success: false,
          error: "Supabase credentials not configured",
        }),
        { status: 500 }
      )
    }

    // 3. الاتصال بـ Supabase باستخدام Service Role
    const supabase = createAdminClient()

    // 4. استدعاء دالة التنظيف
    console.log("🧹 Starting cleanup of expired tokens...")
    const { data, error } = await supabase.rpc("cleanup_expired_reset_tokens")

    if (error) {
      console.error("❌ Cleanup failed:", error)
      throw error
    }

    console.log(`✅ Cleanup completed. Deleted ${data} tokens.`)

    return NextResponse.json({
      success: true,
      message: "Cleanup completed successfully",
      deleted_count: data,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error("❌ Cron job error:", error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Cleanup failed",
      },
      { status: 500 }
    )
  }
}
