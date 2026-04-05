// =====================================================
// 🗑️ Cron Job: Cleanup Old Notifications
// =====================================================
// 📅 Schedule: Daily at 3:00 AM (configured in vercel.json)
// 🔒 Protected by CRON_SECRET + Rate Limiting
// =====================================================

import { createAdminClient } from "@/lib/database/supabase/admin";
import { NextResponse } from "next/server";
import { checkRateLimit, rateLimitHeaders } from "@/lib/security/rate-limiter";
import { logSecurityEvent } from "@/lib/security/audit-logger";

// Force dynamic rendering - Required for API routes
export const dynamic = "force-dynamic";

async function verifyCronSecret(request: Request): Promise<boolean> {
  const cronSecret = process.env.CRON_SECRET;
  if (
    !cronSecret ||
    cronSecret === "marketna_cron_secret_2026_change_this_in_production"
  ) {
    return false;
  }

  const authHeader = request.headers.get("authorization");
  return authHeader === `Bearer ${cronSecret}`;
}

export async function GET(request: Request) {
  const rateLimit = checkRateLimit(request.headers, {
    maxRequests: 10,
    windowMs: 60 * 60 * 1000,
  });

  if (!rateLimit.success) {
    logSecurityEvent("RATE_LIMIT_EXCEEDED", request.headers, {
      endpoint: "/api/cron/cleanup-notifications",
    });
    return NextResponse.json(
      { error: "Too Many Requests" },
      { status: 429, headers: rateLimitHeaders(rateLimit) },
    );
  }

  if (!(await verifyCronSecret(request))) {
    logSecurityEvent("UNAUTHORIZED_ACCESS", request.headers, {
      endpoint: "/api/cron/cleanup-notifications",
    });
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    console.log("🗑️ Starting cleanup of old notifications...");
    const supabase = createAdminClient();

    // ── Calculate cutoff date ───────────────────────
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - 90);
    const cutoffISOString = cutoffDate.toISOString();

    // ── Fetch old read notifications to delete ──────
    const { data: oldNotifications, error: fetchError } = await supabase
      .from("sys_notification")
      .select("id")
      .lt("created_at", cutoffISOString)
      .eq("is_read", true)
      .limit(5000);

    if (fetchError) {
      console.error("❌ Failed to fetch old notifications:", fetchError);
      return NextResponse.json(
        { success: false, error: fetchError.message },
        { status: 500 },
      );
    }

    if (!oldNotifications || oldNotifications.length === 0) {
      console.log("✅ No old notifications to clean up.");
      return NextResponse.json({
        success: true,
        deletedCount: 0,
        message: "No read notifications older than 90 days found.",
        timestamp: new Date().toISOString(),
      });
    }

    // ── Delete old notifications ────────────────────
    const notificationIds = oldNotifications.map((n) => n.id);

    const { error: deleteError } = await supabase
      .from("sys_notification")
      .delete()
      .in("id", notificationIds);

    if (deleteError) {
      console.error("❌ Failed to delete notifications:", deleteError);
      return NextResponse.json(
        { success: false, error: deleteError.message },
        { status: 500 },
      );
    }

    const deletedCount = notificationIds.length;
    console.log(`✅ Cleanup complete. Deleted ${deletedCount} notifications.`);

    return NextResponse.json({
      success: true,
      deletedCount,
      message: `Deleted ${deletedCount} read notifications older than 90 days.`,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("❌ Cron job error:", error);

    if (error instanceof Error) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 },
      );
    }

    return NextResponse.json(
      { success: false, error: "Unknown error" },
      { status: 500 },
    );
  }
}
