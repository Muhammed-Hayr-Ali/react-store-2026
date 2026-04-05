// =====================================================
// 🛡️ Rate Limiter - IP-based Request Throttling
// =====================================================
// ✅ يحد من عدد الطلبات من نفس IP
// ✅ يستخدم Map مدمج (بدون dependencies إضافية)
// ✅ مناسب لـ Node.js single-instance
// =====================================================

type RateLimitConfig = {
  maxRequests: number;
  windowMs: number;
};

type RateLimitInfo = {
  requests: number;
  resetTime: number;
};

const rateLimitStore = new Map<string, RateLimitInfo>();
const cleanupInterval = 10 * 60 * 1000;

function cleanup() {
  const now = Date.now();
  for (const [key, info] of rateLimitStore.entries()) {
    if (now > info.resetTime) {
      rateLimitStore.delete(key);
    }
  }
}

setInterval(cleanup, cleanupInterval);

function getClientIP(headers: Headers): string {
  const forwarded = headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0].trim();
  }
  const realIp = headers.get("x-real-ip");
  if (realIp) return realIp.trim();
  return "unknown";
}

export function checkRateLimit(
  headers: Headers,
  config: RateLimitConfig = { maxRequests: 100, windowMs: 15 * 60 * 1000 },
): {
  success: boolean;
  remaining: number;
  limit: number;
  reset: number;
} {
  const ip = getClientIP(headers);
  const now = Date.now();
  const key = `rl:${ip}`;

  let info = rateLimitStore.get(key);

  if (!info || now > info.resetTime) {
    info = {
      requests: 0,
      resetTime: now + config.windowMs,
    };
    rateLimitStore.set(key, info);
  }

  info.requests++;

  const remaining = Math.max(0, config.maxRequests - info.requests);

  return {
    success: info.requests <= config.maxRequests,
    remaining,
    limit: config.maxRequests,
    reset: info.resetTime,
  };
}

export function rateLimitHeaders(
  result: ReturnType<typeof checkRateLimit>,
): Record<string, string> {
  return {
    "X-RateLimit-Limit": String(result.limit),
    "X-RateLimit-Remaining": String(result.remaining),
    "X-RateLimit-Reset": String(Math.floor(result.reset / 1000)),
  };
}

export function rateLimitResponse(
  result: ReturnType<typeof checkRateLimit>,
): Response | null {
  if (!result.success) {
    const headers = new Headers({
      "Content-Type": "application/json",
      ...rateLimitHeaders(result),
      "Retry-After": String(Math.ceil((result.reset - Date.now()) / 1000)),
    });

    return new Response(
      JSON.stringify({
        error: "Too Many Requests",
        message: "تم تجاوز الحد المسموح، حاول لاحقاً",
        retryAfter: Math.ceil((result.reset - Date.now()) / 1000),
      }),
      { status: 429, headers },
    );
  }
  return null;
}
