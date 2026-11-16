/**
 * @file app/[locale]/(store)/search/page.tsx
 * @description Store search results page displaying filtered products or empty state when no results match.
 */

import { APP_CONFIG } from "@/lib/config/app_config"
import { createMetadata } from "@/lib/config/metadata_generator"
import { getTranslations } from "next-intl/server"
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"
import { SearchIcon } from "lucide-react"

interface SearchPageProps {
  searchParams: Promise<{ q?: string }>
  params: Promise<{ locale: string }>
}

// دالة لتوليد الميتا داتا ديناميكياً استناداً إلى كلمة البحث واللغة
export async function generateMetadata({ searchParams }: SearchPageProps) {
  const { q } = await searchParams
  const t = await getTranslations("Search")

  const searchQuery = q ? decodeURIComponent(q) : ""
  const title = searchQuery
    ? `${t("resultsFor", { query: searchQuery })}`
    : t("title")
  const description = t("description")

  return createMetadata({
    siteName: APP_CONFIG.NAME,
    title,
    description,
    noindex: !searchQuery, // منع أرشفة صفحات البحث الفارغة
  })
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const { q } = await searchParams
  const t = await getTranslations("Search")

  const searchQuery = q ? decodeURIComponent(q) : ""

  return (
    <div className="flex h-full w-full flex-col items-center justify-center px-4 md:px-6 lg:px-8">
      <Empty className="w-full max-w-md rounded-2xl border border-dashed p-8 text-center">
        <EmptyHeader className="flex flex-col items-center">
          <EmptyMedia
            variant="icon"
            className="mb-4 flex size-16 items-center justify-center rounded-full bg-muted/60 text-muted-foreground"
          >
            <SearchIcon className="size-8 stroke-[1.5]" />
          </EmptyMedia>
          <EmptyTitle className="text-lg font-semibold tracking-tight text-foreground">
            {searchQuery
              ? t("noResultsTitle", {
                  query: searchQuery,
                })
              : t("emptyTitle")}
          </EmptyTitle>
          <EmptyDescription className="mt-1.5 max-w-xs text-sm text-muted-foreground">
            {searchQuery
              ? t("noResultsDescription")
              : t("emptyDescription")}
          </EmptyDescription>
        </EmptyHeader>
      </Empty>
    </div>
  )
}
