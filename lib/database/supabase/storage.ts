/**
 * الحصول على الرابط العام المباشر لملف من حاوية site-assets
 * @param path مسار الملف داخل الحاوية أو رابط كامل أو null
 */
export function getSiteAssetUrl(
  path: string | null | undefined
): string | null {
  if (!path) return null

  // إذا كان الرابط كاملاً بالفعل (http/https) يتم إرجاعه كما هو
  if (path.startsWith("http://") || path.startsWith("https://")) {
    return path
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  if (!supabaseUrl) return path

  // إزالة الشرطة المائلة الأولى إن وجدت لتفادي ازدواجية المسار
  const cleanPath = path.startsWith("/") ? path.slice(1) : path

  return `${supabaseUrl}/storage/v1/object/public/site-assets/${cleanPath}`
}
