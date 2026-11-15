"use client"

/**
 * @file components/store/search-bar.tsx
 * @description Storefront search bar component with icon input, voice search action, and filter toggle.
 */

import { useRouter, useSearchParams } from "next/navigation"
import { useLocale, useTranslations } from "next-intl"
import { Button } from "@/components/ui/button"
import { IconInput } from "@/components/ui/icon-input"
import { MicIcon, SearchIcon, SlidersVerticalIcon } from "lucide-react"

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
        className="h-11 min-w-0 flex-1 text-base sm:text-sm"
        prefixIcon={
          <SearchIcon aria-hidden className="size-5 text-muted-foreground" />
        }
        suffixIcon={
          <button
            type="button"
            aria-label="Voice search"
            className="focus:outline-hidden hover:text-foreground transition-colors"
            onClick={() => {
              // يمكنك إضافة منطق البحث الصوتي هنا مستقبلاً
              console.log("Voice search clicked")
            }}
          >
            <MicIcon aria-hidden className="size-5 text-muted-foreground hover:text-primary" />
          </button>
        }
      />
      <Button
        type="button"
        variant="outline"
        size="icon"
        aria-label="Filter products"
        onClick={onOpenFilters}
        className="size-11 shrink-0"
      >
        <SlidersVerticalIcon aria-hidden className="size-5" />
      </Button>
    </form>
  )
}