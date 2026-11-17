"use client"

/**
 * @file components/store/search-bar.tsx
 * @description Storefront search bar component with icon input, voice search action, and filter toggle.
 */

import { useRouter, useSearchParams } from "next/navigation"
import { useLocale, useTranslations } from "next-intl"
 import { IconInput } from "@/components/ui/icon-input"
import {   SearchIcon } from "lucide-react"

interface SearchBarProps {
  onOpenFilters?: () => void
}

export default function SearchBar({ onOpenFilters }: SearchBarProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const locale = useLocale()
  
  const t = useTranslations("SearchBar") // أو ملف الترجمة الخاص بك

  const currentQuery = searchParams.get("q") || ""

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    const query = formData.get("q")?.toString().trim()

    if (query) {
      router.push(`/${locale}/search?q=${encodeURIComponent(query)}`)
    } else {
      router.push(`/${locale}/search`)
    }
  }

  return (
    <form
      role="search"
      onSubmit={handleSearch}
      className="flex w-full items-center gap-2 px-4 sm:px-6 lg:px-8"
    >
      <IconInput
        id="search"
        name="q"
        type="search"
        defaultValue={currentQuery}
        inputMode="search"
        enterKeyHint="search"
        autoComplete="off"
        aria-label="Search for products"
        placeholder={t("search_placeholder")}
        className="h-11 min-w-0 flex-1 border-none bg-muted text-base sm:text-sm"
        suffixIcon={
          <SearchIcon aria-hidden className="size-5 text-muted-foreground" />
        }
      />
    </form>
  )
}
