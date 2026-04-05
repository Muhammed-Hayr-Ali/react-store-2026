// =====================================================
// 🛡️ CSRF Protection - Double Submit Cookie Pattern
// =====================================================
// ✅ يحمي من CSRF attacks
// ✅ يستخدم Double Submit Cookie pattern
// ✅ متوافق مع Next.js App Router
// =====================================================

import { cookies } from "next/headers";
import { NextResponse } from "next/server";

const CSRF_COOKIE_NAME = "csrf-token";
const CSRF_HEADER_NAME = "x-csrf-token";
const TOKEN_LENGTH = 48;

export function generateCsrfToken(): string {
  const bytes = new Uint8Array(TOKEN_LENGTH);
  crypto.getRandomValues(bytes);
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export async function getCsrfToken(): Promise<string> {
  const cookieStore = await cookies();
  const existingToken = cookieStore.get(CSRF_COOKIE_NAME)?.value;

  if (existingToken) {
    return existingToken;
  }

  const newToken = generateCsrfToken();

  cookieStore.set(CSRF_COOKIE_NAME, newToken, {
    httpOnly: false,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 60 * 60 * 24,
    path: "/",
  });

  return newToken;
}

export async function validateCsrfToken(
  request: Request,
): Promise<{ valid: boolean; response?: NextResponse }> {
  const cookieStore = await cookies();
  const cookieToken = cookieStore.get(CSRF_COOKIE_NAME)?.value;

  const headerToken = request.headers.get(CSRF_HEADER_NAME);

  if (!cookieToken || !headerToken || cookieToken !== headerToken) {
    return {
      valid: false,
      response: NextResponse.json(
        { error: "Invalid CSRF token" },
        { status: 403 },
      ),
    };
  }

  return { valid: true };
}

export function csrfProtectionMiddleware(
  request: Request,
): NextResponse | null {
  const method = request.method.toUpperCase();
  const safeMethods = ["GET", "HEAD", "OPTIONS"];

  if (safeMethods.includes(method)) {
    return null;
  }

  const cookieHeader = request.headers.get("cookie") || "";
  const headerToken = request.headers.get(CSRF_HEADER_NAME);

  const cookieMatch = cookieHeader.match(
    new RegExp(`${CSRF_COOKIE_NAME}=([^;]+)`),
  );
  const cookieToken = cookieMatch?.[1];

  if (!cookieToken || !headerToken || cookieToken !== headerToken) {
    return NextResponse.json({ error: "Invalid CSRF token" }, { status: 403 });
  }

  return null;
}

export async function setCsrfCookie(): Promise<NextResponse> {
  const token = generateCsrfToken();
  const cookieStore = await cookies();

  cookieStore.set(CSRF_COOKIE_NAME, token, {
    httpOnly: false,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 60 * 60 * 24,
    path: "/",
  });

  return NextResponse.json({ csrfToken: token });
}
