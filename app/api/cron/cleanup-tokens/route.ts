// =====================================================
// 🧹 Cron Job: Cleanup Expired Password Reset Tokens
// =====================================================
// 📅 Schedule: Daily at 2:00 AM (configured in vercel.json)
// 🔒 Protected by CRON_SECRET
// =====================================================

import { createAdminClient } from "@/lib/database/supabase/admin"
import { NextResponse } from "next/server"

// Force dynamic rendering - Required for API routes
export const dynamic = "force-dynamic"
export const runtime = "nodejs"

export async function GET() {
  // ── Security: Verify cron secret ──────────────────
  const cronSecret = process.env.CRON_SECRET
  if (cronSecret) {
    const { headers } = await import("next/headers")
    const headersList = await headers()
    const authHeader = headersList.get("authorization")

    if (authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
  }

  try {
    console.log("🧹 Starting cleanup of expired password reset tokens...")
    const supabase = createAdminClient()

    // ── Call cleanup function ────────────────────────
    const { data, error } = await supabase.rpc("cleanup_expired_reset_tokens", {
      p_batch_size: 5000,
    } as never)

    if (error) {
      console.error("❌ Cleanup failed:", error)
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      )
    }

    const deletedCount = (data as number) ?? 0

    console.log(`✅ Cleanup complete. Deleted ${deletedCount} tokens.`)

    return NextResponse.json({
      success: true,
      deletedCount,
      message: `Deleted ${deletedCount} expired/used tokens.`,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error("❌ Cron job error:", error)

    if (error instanceof Error) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json(
      { success: false, error: "Unknown error" },
      { status: 500 }
    )
  }
}
