// src/lib/metadata.ts

/**
 * 📌 Unified Metadata Factory for SEO and Social Media
 *
 * Generates consistent, production-ready metadata for Next.js pages
 * following best practices for search engines (Google) and social platforms (Open Graph, Twitter).
 *
 * ✅ Centralized control over site identity (`siteConfig`)
 * ✅ Automatic title composition: `{pageTitle} | {Site Name}`
 * ✅ Built-in support for `noindex` (e.g., error pages)
 * ✅ Pre-configured Open Graph + Twitter Cards
 * ✅ Type-safe and reusable across all pages
 *
 * @example Basic usage in a page
 * ```ts
 * // app/about/page.tsx
 * import { createMetadata } from "@/lib/metadata";
 *
 * export const metadata = createMetadata({
 *   title: "من نحن",
 *   description: "تعرف على فريق ماركتنا ورؤيتنا التجارية.",
 * });
 * ```
 *
 * @example No-index usage (e.g., 404 page)
 * ```ts
 * export const metadata = createMetadata({
 *   title: "الصفحة غير موجودة",
 *   noindex: true,
 * });
 * ```
 */

// Standard Next.js Metadata type
import { Metadata } from "next";
import { siteConfig } from "./config/site";

// Centralized site configuration (name, URL, default description, etc.)

/**
 * Configuration interface for creating page-specific metadata.
 *
 * All properties are optional except `title`, ensuring minimal yet flexible usage.
 */
interface SeoConfig {
  /**
   * The page-specific title (required).
   * Will be combined with the site name as: `{title} | {siteName}`.
   *
   * @example "اتصل بنا", "تفاصيل المنتج"
   */
  title: string;

  /**
   * Page description (optional).
   * Falls back to `siteConfig.description` if not provided.
   *
   * ⚠️ Keep under 160 characters for optimal SEO.
   *
   * @default siteConfig.description
   */
  description?: string;

  /**
   * Override the default site name used in title composition.
   * Useful for multi-brand sites or localized names.
   *
   * @default siteConfig.name
   */
  siteName?: string;

  /**
   * Prevent search engines from indexing this page.
   * Ideal for 404, 500, admin, or staging pages.
   *
   * When `true`, sets `robots = "noindex, follow"`.
   *
   * @default false
   */
  noindex?: boolean;

  /**
   * Absolute or root-relative path to the Open Graph image.
   * Must be a publicly accessible image (placed in `/public`).
   *
   * ⚠️ Recommended: Use `1200×630` pixels for best social sharing results.
   *
   * @default "/logo.png"
   */
  image?: string;
}

/**
 * Factory function that generates a complete Next.js `Metadata` object.
 *
 * @param config - SEO configuration for the current page
 * @returns A fully compliant `Metadata` object ready for Next.js
 *
 * @see {@link https://nextjs.org/docs/app/api-reference/functions/generate-metadata Next.js Metadata Docs}
 * @see {@link https://ogp.me Open Graph Protocol}
 * @see {@link https://developer.twitter.com/en/docs/twitter-for-websites/cards Twitter Cards}
 */
export function createMetadata({
  title,
  description = siteConfig.description,
  siteName = siteConfig.name,
  noindex = false,
  image = "@/public/logo.png",
}: SeoConfig): Metadata {
  // Construct full title: "Page Title | Site Name"
  const fullTitle = `${title} | ${siteName}`;

  // Handle robots directive based on indexing preference
  const robots = noindex ? "noindex, follow" : siteConfig.defaultRobots;

  return {
    title: fullTitle,
    description,
    robots,

    // Ensure absolute URLs for canonical links and Open Graph
    metadataBase: new URL(siteConfig.url),

    // Open Graph (Facebook, LinkedIn, WhatsApp, etc.)
    openGraph: {
      title: fullTitle,
      description,
      images: [{ url: image }], // Use object form for future extensibility
      url: siteConfig.url,
      type: "website",
      locale: "ar_SA", // 👈 يمكنك جعله ديناميكيًا حسب اللغة لاحقًا
    },

    // Twitter Cards
    twitter: {
      card: "summary_large_image",
      title: fullTitle,
      description,
      images: [image],
    },
  };
}
