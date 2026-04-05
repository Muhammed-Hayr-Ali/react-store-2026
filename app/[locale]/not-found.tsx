import Link from "next/link";
import { routing } from "@/i18n/routing";

export default function NotFound() {
  return (
    <div className="min-h-[80vh] flex items-center justify-center">
      <div className="text-center p-8 max-w-lg">
        <div className="text-9xl font-bold text-gray-200 dark:text-gray-800 mb-4">
          404
        </div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-4">
          الصفحة غير موجودة
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mb-8">
          الصفحة التي تبحث عنها غير موجودة أو تم نقلها أو حذفها.
        </p>
        <div className="space-x-4 space-x-reverse">
          <Link
            href={`/${routing.defaultLocale}`}
            className="inline-block px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            العودة للرئيسية
          </Link>
        </div>
      </div>
    </div>
  );
}
