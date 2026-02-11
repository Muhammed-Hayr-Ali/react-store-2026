import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}







/**
 * يستخرج رسالة خطأ من كائن `unknown`.
 * إذا لم يتم العثور على رسالة، يُرجع رسالة افتراضية.
 * @param {unknown} error - الخطأ الذي تم التقاطه من كتلة `catch`.
 * @param {string} [defaultMessage] - رسالة اختيارية ليتم إرجاعها إذا لم يتم العثور على رسالة خطأ.
 * @returns {string} رسالة الخطأ كسلسلة نصية.
 */
export function getErrorMessage(
  error: unknown,
  defaultMessage: string = "An unexpected error occurred."
): string {
  // تحقق مما إذا كان `error` كائنًا ويحتوي على خاصية `message`
  if (error && typeof error === 'object' && 'message' in error) {
    // تأكد من أن `message` هو سلسلة نصية
    if (typeof error.message === 'string') {
      return error.message;
    }
  }
  
  // إذا لم يكن كذلك، أرجع الرسالة الافتراضية
  return defaultMessage;
}
