/**
 * @file lib/actions/validation.ts
 * @description تنسيق تفاصيل أخطاء التحقق الناتجة عن مخططات الإدخال.
 */

import type { ZodError } from "zod"

/**
 * تحول أخطاء التحقق إلى تفاصيل مناسبة لنتائج الأكشن.
 */
export function getValidationDetails(
  error: ZodError
): Record<string, string[]> {
  const details: Record<string, string[]> = {}

  for (const issue of error.issues) {
    const path = issue.path.join(".") || "input"
    details[path] ??= []
    details[path].push(issue.message)
  }

  return details
}
