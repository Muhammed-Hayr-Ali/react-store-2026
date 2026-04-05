"use client";

import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Page error:", error);
  }, [error]);

  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="text-center p-8 max-w-md">
        <div className="text-6xl mb-4">⚠️</div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
          حدث خطأ
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          حدث خطأ أثناء تحميل هذه الصفحة. يرجى المحاولة مرة أخرى.
        </p>
        <div className="space-x-3 space-x-reverse">
          <button
            onClick={() => reset()}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            إعادة المحاولة
          </button>
        </div>
        {process.env.NODE_ENV === "development" && error && (
          <details className="mt-6 p-4 bg-red-50 dark:bg-red-900/20 rounded-lg text-left">
            <summary className="cursor-pointer text-sm font-medium text-red-800 dark:text-red-400">
              تفاصيل الخطأ
            </summary>
            <pre className="mt-2 text-xs text-red-600 dark:text-red-400 overflow-auto whitespace-pre-wrap">
              {error.message}
            </pre>
          </details>
        )}
      </div>
    </div>
  );
}
