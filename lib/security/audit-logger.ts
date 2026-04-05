// =====================================================
// 📊 Audit Logger - Security Event Tracking
// =====================================================
// ✅ يسجل الأحداث الأمنية الحساسة
// ✅ لا يسجل بيانات حساسة (كلمات مرور، tokens)
// ✅ يساعد في تتبع الهجمات
// =====================================================

type AuditLevel = "info" | "warn" | "error" | "critical";

type AuditEvent = {
  level: AuditLevel;
  action: string;
  userId?: string;
  ip?: string | null;
  userAgent?: string | null;
  details?: Record<string, unknown>;
  timestamp: string;
};

function getClientInfo(headers?: Headers): {
  ip: string | null;
  userAgent: string | null;
} {
  if (!headers) {
    return { ip: null, userAgent: null };
  }
  const forwarded = headers.get("x-forwarded-for");
  const ip = forwarded
    ? forwarded.split(",")[0].trim()
    : headers.get("x-real-ip") || null;
  const userAgent = headers.get("user-agent");
  return { ip, userAgent };
}

function maskSensitiveData(data: Record<string, unknown>): Record<string, unknown> {
  const sensitiveKeys = [
    "password",
    "token",
    "secret",
    "key",
    "authorization",
    "cookie",
    "credit",
    "card",
    "ssn",
  ];

  const masked = { ...data };

  for (const key of Object.keys(masked)) {
    if (sensitiveKeys.some((s) => key.toLowerCase().includes(s))) {
      masked[key] = "***REDACTED***";
    } else if (typeof masked[key] === "string" && masked[key]!.length > 20) {
      masked[key] = `${(masked[key] as string).substring(0, 4)}...${(masked[key] as string).substring((masked[key] as string).length - 4)}`;
    }
  }

  return masked;
}

export function auditLog(
  action: string,
  options: {
    level?: AuditLevel;
    userId?: string;
    headers?: Headers;
    details?: Record<string, unknown>;
  } = {},
): void {
  const {
    level = "info",
    userId,
    headers,
    details = {},
  } = options;

  const { ip, userAgent } = getClientInfo(headers);

  const event: AuditEvent = {
    level,
    action,
    userId,
    ip,
    userAgent,
    details: maskSensitiveData(details),
    timestamp: new Date().toISOString(),
  };

  const logPrefix = {
    info: "ℹ️",
    warn: "⚠️",
    error: "❌",
    critical: "🚨",
  }[level];

  const logMessage = `[AUDIT] ${logPrefix} ${action} | User: ${userId || "anonymous"} | IP: ${ip || "unknown"}`;

  if (level === "error" || level === "critical") {
    console.error(logMessage, event);
  } else if (level === "warn") {
    console.warn(logMessage, event);
  } else {
    console.log(logMessage, event);
  }
}

export function logAuthentication(
  action:
    | "SIGN_IN_SUCCESS"
    | "SIGN_IN_FAILED"
    | "SIGN_UP"
    | "SIGN_OUT"
    | "PASSWORD_RESET_REQUEST"
    | "PASSWORD_RESET_SUCCESS"
    | "MFA_VERIFY_SUCCESS"
    | "MFA_VERIFY_FAILED",
  userId?: string,
  headers?: Headers,
  details?: Record<string, unknown>,
): void {
  const level: AuditLevel =
    action.includes("FAILED") || action.includes("MFA_VERIFY_FAILED")
      ? "warn"
      : "info";

  auditLog(`AUTH:${action}`, {
    level,
    userId,
    headers,
    details,
  });
}

export function logSecurityEvent(
  action:
    | "RATE_LIMIT_EXCEEDED"
    | "CSRF_VALIDATION_FAILED"
    | "UNAUTHORIZED_ACCESS"
    | "SUSPICIOUS_ACTIVITY"
    | "BRUTE_FORCE_DETECTED",
  headers?: Headers,
  details?: Record<string, unknown>,
): void {
  auditLog(`SECURITY:${action}`, {
    level: "critical",
    headers,
    details,
  });
}

export function logApiCall(
  endpoint: string,
  method: string,
  status: number,
  headers?: Headers,
  duration?: number,
): void {
  const level: AuditLevel =
    status >= 500 ? "error" : status >= 400 ? "warn" : "info";

  auditLog(`API:${method} ${endpoint}`, {
    level,
    headers,
    details: { status, duration },
  });
}
