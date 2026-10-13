/**
 * @file lib/database/supabase/storage.ts
 * @description Resolves public URLs for files stored in the site-assets bucket.
 */

/**
 * Returns a public URL for a site asset path or an existing absolute URL.
 */
export function getSiteAssetUrl(
  path: string | null | undefined
): string | null {
  if (!path) return null

  // Preserve fully qualified URLs instead of treating them as storage paths.
  if (path.startsWith("http://") || path.startsWith("https://")) {
    return path
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  if (!supabaseUrl) return path

  // Remove a leading slash to avoid a duplicate separator in the URL.
  const cleanPath = path.startsWith("/") ? path.slice(1) : path

  return `${supabaseUrl}/storage/v1/object/public/site-assets/${cleanPath}`
}
