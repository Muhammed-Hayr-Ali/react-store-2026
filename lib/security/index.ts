// =====================================================
// 🛡️ Security Module - Client-Safe Exports Only
// =====================================================
// ⚠️ هذا الملف يُستخدم في Client Components
// لا تُضف هنا أي ملف يستخدم:
//   - next/headers, next/navigation (server-only)
//   - fs, crypto (Node.js only)
// =====================================================

export {
  checkRateLimit,
  rateLimitHeaders,
  rateLimitResponse,
} from "./rate-limiter";

export {
  sanitizeHtml,
  sanitizeText,
  sanitizeUrl,
  escapeHtml,
  sanitizeAttributeValue,
} from "./sanitization";

export {
  auditLog,
  logAuthentication,
  logSecurityEvent,
  logApiCall,
} from "./audit-logger";

export {
  signInSchema,
  signUpSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  verifyMfaSchema,
  paginationSchema,
  idParamSchema,
  validateInput,
  emailSchema,
  passwordSchema,
} from "./validation-schemas";

export type {
  SignInInput,
  SignUpInput,
  ForgotPasswordInput,
  ResetPasswordInput,
  VerifyMfaInput,
} from "./validation-schemas";
