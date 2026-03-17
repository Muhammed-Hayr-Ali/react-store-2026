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
 * ✅ Support for canonical URLs and keywords
 */

import { Metadata } from "next";
import { siteConfig } from "@/lib/config/site_config";

/**
 * Configuration interface for creating page-specific metadata.
 */
interface SeoConfig {
    /**
     * The page-specific title (required).
     * Will be combined with the site name as: `{title} | {siteName}`.
     */
    title: string;

    /**
     * Page description (optional).
     * Falls back to `siteConfig.description` if not provided.
     */
    description?: string;

    /**
     * Relative path for this page (e.g., "/about").
     * Used to generate canonical URL and OG URL.
     */
    path?: string;

    /**
     * Array or string of keywords for the page.
     * Merged with default site keywords.
     */
    keywords?: string[] | string;

    /**
     * Locale for this page (e.g., "en_US").
     * @default siteConfig.locale
     */
    locale?: string;

    /**
     * Override the default site name used in title composition.
     * @default siteConfig.name
     */
    siteName?: string;

    /**
     * Prevent search engines from indexing this page.
     * @default false
     */
    noindex?: boolean;

    /**
     * Absolute or root-relative path to the Open Graph image.
     * @default siteConfig.icons.icon
     */
    image?: string;

    /**
     * Open Graph type (website, article, etc.)
     * @default "website"
     */
    type?: "website" | "article";

}

/**
 * Factory function that generates a complete Next.js `Metadata` object.
 *
 * @param config - SEO configuration for the current page
 * @returns A fully compliant `Metadata` object ready for Next.js
 */
export function createMetadata({
    title,
    description = siteConfig.description,
    path = "",
    keywords,
    locale = siteConfig.locale,
    siteName = siteConfig.name,
    noindex = false,
    image,
    type = "website",
}: SeoConfig): Metadata {
    const fullTitle = `${title} | ${siteName}`;
    const robots = noindex ? "noindex, follow" : siteConfig.robots;
    const url = `${siteConfig.url}${path}`;
    
    // Process keywords: combine page keywords with site defaults
    const combinedKeywords = Array.isArray(keywords)
        ? [...keywords, ...siteConfig.keywords]
        : keywords
            ? [keywords, ...siteConfig.keywords]
            : siteConfig.keywords;

    // Default image fallback
    const finalImage = image || siteConfig.icons.apple || "/logo.png";

    return {
        title: fullTitle,
        description,
        keywords: combinedKeywords,
        robots,
        alternates: {
            canonical: url,
        },
        metadataBase: new URL(siteConfig.url),
        
        openGraph: {
            title: fullTitle,
            description,
            url,
            siteName,
            images: [
                {
                    url: finalImage,
                    width: 1200,
                    height: 630,
                    alt: title,
                },
            ],
            locale,
            type,
        },

        twitter: {
            card: "summary_large_image",
            title: fullTitle,
            description,
            images: [finalImage],
            creator: siteConfig.twitterHandle,
        },

        icons: siteConfig.icons,
        manifest: "/manifest.json",
        appleWebApp: {
            capable: true,
            statusBarStyle: "default",
            title: siteName,
        },
    };
}