// =====================================================
// 🛡️ Environment Variable Validation
// =====================================================
// ✅ يتحقق من وجود جميع المتغيرات المطلوبة
// ✅ يمنع تشغيل التطبيق بدون إعدادات صحيحة
// ✅ يحذر من الإعدادات غير الآمنة
// =====================================================

const requiredEnvVars = [
  "NEXT_PUBLIC_SUPABASE_URL",
  "NEXT_PUBLIC_SUPABASE_ANON_KEY",
  "SUPABASE_SERVICE_ROLE_KEY",
  "NEXT_PUBLIC_APP_URL",
  "CRON_SECRET",
] as const;

const sensitiveEnvVars = [
  "SUPABASE_SERVICE_ROLE_KEY",
  "SUPABASE_SECRET_KEY",
  "EMAIL_PASSWORD",
  "EXCHANGERATE_API_KEY",
  "ONESIGNAL_APP_ID",
  "NEWSLETTER_JWT_SECRET",
] as const;

type EnvValidationResult = {
  valid: boolean;
  missing: string[];
  warnings: string[];
};

export function validateEnv(): EnvValidationResult {
  const missing: string[] = [];
  const warnings: string[] = [];

  for (const envVar of requiredEnvVars) {
    if (!process.env[envVar]) {
      missing.push(envVar);
    }
  }

  for (const envVar of sensitiveEnvVars) {
    const value = process.env[envVar];
    if (value) {
      if (value.startsWith("your-") || value.includes("change_this")) {
        warnings.push(
          `⚠️ ${envVar} يحتوي على قيمة افتراضية - يجب تغييرها`,
        );
      }
      if (value.length < 16 && envVar.includes("SECRET")) {
        warnings.push(
          `⚠️ ${envVar} قصير جداً - يجب أن يكون 32 حرف على الأقل`,
        );
      }
    }
  }

  if (
    process.env.NEXT_PUBLIC_APP_URL?.includes("localhost") &&
    process.env.NODE_ENV === "production"
  ) {
    warnings.push(
      "⚠️ NEXT_PUBLIC_APP_URL يحتوي على localhost في بيئة الإنتاج",
    );
  }

  return {
    valid: missing.length === 0,
    missing,
    warnings,
  };
}

export function validateEnvOrThrow(): void {
  const result = validateEnv();

  if (!result.valid) {
    console.error("❌ متغيرات البيئة المطلوبة مفقودة:");
    result.missing.forEach((v) => console.error(`  - ${v}`));
    throw new Error(
      `Missing required environment variables: ${result.missing.join(", ")}`,
    );
  }

  if (result.warnings.length > 0) {
    console.warn("⚠️ تحذيرات أمان:");
    result.warnings.forEach((w) => console.warn(w));
  }

  console.log("✅ Environment variables validated");
}
