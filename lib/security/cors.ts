// =====================================================
// 🛡️ CORS Configuration
// =====================================================
// ✅ يتحكم في النطاقات المسموح لها بالوصول للـ API
// ✅ يمنع الطلبات من مصادر غير موثوقة
// ✅ يسمح بالنطاقات المحددة فقط
// =====================================================

import { NextResponse } from "next/server";

const ALLOWED_ORIGINS = [
  process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
  ...(process.env.ALLOWED_ORIGINS?.split(",") || []),
].filter(Boolean);

const ALLOWED_METHODS = ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"];
const ALLOWED_HEADERS = [
  "Content-Type",
  "Authorization",
  "X-CSRF-Token",
  "Accept",
  "Accept-Language",
];
const MAX_AGE = 86400;

function isAllowedOrigin(origin: string): boolean {
  return ALLOWED_ORIGINS.includes(origin);
}

export function corsHeaders(origin?: string | null): Record<string, string> {
  const headers: Record<string, string> = {
    "Access-Control-Allow-Methods": ALLOWED_METHODS.join(", "),
    "Access-Control-Allow-Headers": ALLOWED_HEADERS.join(", "),
    "Access-Control-Max-Age": String(MAX_AGE),
  };

  if (origin && isAllowedOrigin(origin)) {
    headers["Access-Control-Allow-Origin"] = origin;
    headers["Access-Control-Allow-Credentials"] = "true";
  }

  return headers;
}

export function handleCors(request: Request): NextResponse | null {
  const origin = request.headers.get("origin");

  if (request.method === "OPTIONS") {
    if (!origin || !isAllowedOrigin(origin)) {
      return new NextResponse("Forbidden", { status: 403 });
    }

    return new NextResponse(null, {
      status: 204,
      headers: corsHeaders(origin),
    });
  }

  if (origin && !isAllowedOrigin(origin)) {
    return NextResponse.json({ error: "Origin not allowed" }, { status: 403 });
  }

  return null;
}

export function withCors(
  response: NextResponse,
  request: Request,
): NextResponse {
  const origin = request.headers.get("origin");
  const headers = corsHeaders(origin);

  for (const [key, value] of Object.entries(headers)) {
    response.headers.set(key, value);
  }

  return response;
}
