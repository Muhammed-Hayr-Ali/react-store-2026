// =====================================================
// 🧹 Cron Job: Cleanup Expired Password Reset Tokens
// =====================================================
// 📅 Schedule: Daily at 2:00 AM (configured in vercel.json)
// 🔒 Protected by CRON_SECRET + Rate Limiting
// =====================================================

import { createAdminClient } from "@/lib/database/supabase/admin";
import { NextResponse } from "next/server";
import {
  checkRateLimit,
  rateLimitHeaders,
  logSecurityEvent,
} from "@/lib/security";

// Force dynamic rendering - Required for API routes
export const dynamic = "force-dynamic";
export const runtime = "nodejs";

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
      endpoint: "/api/cron/cleanup-tokens",
    });
    return NextResponse.json(
      { error: "Too Many Requests" },
      { status: 429, headers: rateLimitHeaders(rateLimit) },
    );
  }

  if (!(await verifyCronSecret(request))) {
    logSecurityEvent("UNAUTHORIZED_ACCESS", request.headers, {
      endpoint: "/api/cron/cleanup-tokens",
    });
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    console.log("🧹 Starting cleanup of expired password reset tokens...");
    const supabase = createAdminClient();

    // ── Call cleanup function ────────────────────────
    const { data, error } = await supabase.rpc("cleanup_expired_reset_tokens", {
      p_batch_size: 5000,
    } as never);

    if (error) {
      console.error("❌ Cleanup failed:", error);
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 },
      );
    }

    const deletedCount = (data as number) ?? 0;

    console.log(`✅ Cleanup complete. Deleted ${deletedCount} tokens.`);

    return NextResponse.json({
      success: true,
      deletedCount,
      message: `Deleted ${deletedCount} expired/used tokens.`,
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
