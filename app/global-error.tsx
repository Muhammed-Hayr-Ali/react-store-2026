"use client";

import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Application error:", error);
  }, [error]);

  return (
    <html lang="ar" dir="rtl">
      <body className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center p-8 max-w-md">
          <div className="text-6xl mb-4">⚠️</div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            حدث خطأ غير متوقع
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            نعتذر، حدث خطأ أثناء تحميل الصفحة. يرجى المحاولة مرة أخرى.
          </p>
          <div className="space-y-3">
            <button
              onClick={() => reset()}
              className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              إعادة المحاولة
            </button>
            <button
              onClick={() => (window.location.href = "/")}
              className="w-full px-6 py-3 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors font-medium"
            >
              العودة للرئيسية
            </button>
          </div>
          {process.env.NODE_ENV === "development" && error && (
            <details className="mt-6 p-4 bg-red-50 dark:bg-red-900/20 rounded-lg text-left">
              <summary className="cursor-pointer text-sm font-medium text-red-800 dark:text-red-400">
                تفاصيل الخطأ (للمطورين)
              </summary>
              <pre className="mt-2 text-xs text-red-600 dark:text-red-400 overflow-auto whitespace-pre-wrap">
                {error.message}
                {error.stack && `\n\n${error.stack}`}
              </pre>
            </details>
          )}
        </div>
      </body>
    </html>
  );
}
