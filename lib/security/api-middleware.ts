// =====================================================
// 🛡️ API Route Security Middleware
// =====================================================
// ✅ يطبق Rate Limiting + CORS على كل API Routes
// ✅ يستخدم كـ wrapper للـ route handlers
// =====================================================

import { NextResponse } from "next/server";
import {
  checkRateLimit,
  rateLimitHeaders,
  handleCors,
  logSecurityEvent,
  logApiCall,
} from "@/lib/security";

type ApiHandler = (request: Request) => Promise<NextResponse>;

const DEFAULT_RATE_LIMIT = {
  maxRequests: 100,
  windowMs: 15 * 60 * 1000,
};

const AUTH_RATE_LIMIT = {
  maxRequests: 20,
  windowMs: 15 * 60 * 1000,
};

function isAuthRoute(path: string): boolean {
  return (
    path.includes("/sign-in") ||
    path.includes("/sign-up") ||
    path.includes("/forgot-password") ||
    path.includes("/reset-password") ||
    path.includes("/auth")
  );
}

export function withApiSecurity(handler: ApiHandler): ApiHandler {
  return async function securedHandler(request: Request) {
    const startTime = Date.now();
    const path = new URL(request.url).pathname;

    const corsResponse = handleCors(request);
    if (corsResponse) return corsResponse;

    const rateLimitConfig = isAuthRoute(path) ? AUTH_RATE_LIMIT : DEFAULT_RATE_LIMIT;
    const rateLimit = checkRateLimit(request.headers, rateLimitConfig);

    if (!rateLimit.success) {
      logSecurityEvent("RATE_LIMIT_EXCEEDED", request.headers, { path });

      return new NextResponse(
        JSON.stringify({
          error: "Too Many Requests",
          message: "تم تجاوز الحد المسموح، حاول لاحقاً",
        }),
        {
          status: 429,
          headers: {
            "Content-Type": "application/json",
            ...rateLimitHeaders(rateLimit),
            "Retry-After": String(
              Math.ceil((rateLimit.reset - Date.now()) / 1000),
            ),
          },
        },
      );
    }

    try {
      const response = await handler(request);

      const headers = rateLimitHeaders(rateLimit);
      for (const [key, value] of Object.entries(headers)) {
        response.headers.set(key, value);
      }

      const duration = Date.now() - startTime;
      logApiCall(path, request.method, response.status, request.headers, duration);

      return response;
    } catch (error) {
      logSecurityEvent("SUSPICIOUS_ACTIVITY", request.headers, {
        path,
        error: error instanceof Error ? error.message : "unknown",
      });

      return NextResponse.json(
        { error: "Internal Server Error" },
        { status: 500 },
      );
    }
  };
}
