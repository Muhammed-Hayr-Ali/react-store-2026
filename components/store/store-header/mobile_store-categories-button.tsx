"use client"

import * as React from "react"
import { useLocale, useTranslations } from "next-intl"
import { ArrowLeft, ArrowRight, ChevronDown, LayoutGrid } from "lucide-react"

import { cn } from "@/lib/utils"
import { Link } from "@/i18n/navigation"
import { APP_ROUTES } from "@/lib/config/app-routes"
import type {
  SimplifiedRootCategory,
  StoreSubcategory,
} from "@/lib/actions/store/queries/get-all-categories"
import { focusRing, isRtlLocale } from "./store-header-shared"
import {
  MobileMenu,
  MobileMenuBody,
  MobileMenuFooter,
  MobileMenuHeader,
} from "@/components/ui/mobile-menu"

export interface MobileStoreCategoriesButtonProps {
  compact?: boolean
  className?: string
  categories?: SimplifiedRootCategory[]
}

/**
 * تصميم بديل: مستوى واحد (أكورديون) بدل التنقل بين شاشتين.
 * - كل تصنيف بطاقة بصورة مصغّرة، ينفتح مكانه
 * - التصنيفات الفرعية على شكل حبوب (نفس شكل زر "عرض الكل" في سطح المكتب)
 * - تصنيف واحد مفتوح في كل مرة، والأول مفتوح افتراضياً (مثل سطح المكتب)
 */
const chipClass = cn(
  "inline-flex min-h-9 items-center gap-1.5 rounded-full border border-border/80 px-3.5 text-xs font-normal text-foreground/80 transition-colors hover:border-primary/50 hover:bg-primary/5 hover:text-primary active:bg-primary/10",
  focusRing
)

export function MobileStoreCategoriesButton({
  compact = false,
  className,
  categories = [],
}: MobileStoreCategoriesButtonProps) {
  const t = useTranslations("StoreHeader")
  const locale = useLocale()
  const baseId = React.useId()

  const isRtl = isRtlLocale(locale)
  const ArrowIcon = isRtl ? ArrowLeft : ArrowRight

  const [open, setOpen] = React.useState(false)
  const [openId, setOpenId] = React.useState<string | null>(null)

  const getCategoryTitle = React.useCallback(
    (name: string, nameAr: string | null) => (isRtl && nameAr ? nameAr : name),
    [isRtl]
  )

  const openMenu = () => {
    // الأول مفتوح افتراضياً، ونعيد الضبط عند الفتح لا الإغلاق (لتفادي الوميض أثناء الإغلاق)
    setOpenId(categories[0]?.id ?? null)
    setOpen(true)
  }
  const close = React.useCallback(() => setOpen(false), [])

  const triggerClassName = cn(
    "flex items-center rounded-lg px-2.5 font-normal text-foreground transition-colors hover:bg-muted/60 hover:text-primary lg:hidden",
    compact ? "h-8 gap-1" : "h-9 gap-1.5",
    focusRing,
    className
  )

  const triggerContent = (
    <>
      {!compact && (
        <LayoutGrid aria-hidden="true" className="size-3.5 text-primary" />
      )}
      <span>{t("categories")}</span>
    </>
  )

  if (categories.length === 0) {
    return (
      <Link href={APP_ROUTES.CATEGORIES} className={triggerClassName}>
        {triggerContent}
      </Link>
    )
  }

  return (
    <>
      <button
        type="button"
        aria-haspopup="dialog"
        aria-expanded={open}
        className={triggerClassName}
        onClick={openMenu}
      >
        {triggerContent}
        <ChevronDown
          aria-hidden="true"
          className={cn(
            "hidden size-3.5 text-muted-foreground transition-transform duration-200 md:inline-block",
            open && "rotate-90 text-primary ltr:-rotate-90"
          )}
        />
      </button>

      <MobileMenu
        isOpen={open}
        className="top-0"
        onOpenChange={(next: boolean) => (next ? openMenu() : close())}
      >
        <MobileMenuHeader showCloseButton onClose={close}>
          <h2 className="text-lg font-medium text-foreground">
            {t("categories")}
          </h2>
        </MobileMenuHeader>

        <MobileMenuBody className="space-y-2 px-4 py-4">
          {categories.map((category) => {
            const isOpen = openId === category.id
            const title = getCategoryTitle(category.name, category.name_ar)
            const href = `${APP_ROUTES.CATEGORIES}/${category.slug}`
            const panelId = `${baseId}-${category.id}`

            return (
              <section
                key={category.id}
                className={cn(
                  "overflow-hidden rounded-xl border transition-colors duration-200",
                  isOpen
                    ? "border-primary/40 bg-primary/5"
                    : "border-border/70 bg-background"
                )}
              >
                {/* رأس البطاقة: صورة مصغّرة + الاسم + سهم */}
                <h3>
                  <button
                    type="button"
                    aria-expanded={isOpen}
                    aria-controls={panelId}
                    onClick={() => setOpenId(isOpen ? null : category.id)}
                    className={cn(
                      "flex min-h-14 w-full items-center gap-3 p-2.5 text-start text-[13px] transition-colors hover:bg-muted/40",
                      isOpen
                        ? "font-medium text-foreground"
                        : "font-normal text-foreground/85",
                      focusRing,
                      "focus-visible:ring-inset focus-visible:ring-offset-0"
                    )}
                  >
                    <span className="flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-border/60 bg-muted/40">
                      {category.image_url ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={category.image_url}
                          alt=""
                          loading="lazy"
                          decoding="async"
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <LayoutGrid
                          aria-hidden="true"
                          className="size-4 text-muted-foreground/50"
                        />
                      )}
                    </span>

                    <span className="min-w-0 flex-1 truncate">{title}</span>

                    <ChevronDown
                      aria-hidden="true"
                      className={cn(
                        "size-4 shrink-0 text-foreground/50 transition-transform duration-200",
                        isOpen && "rotate-180 text-primary"
                      )}
                    />
                  </button>
                </h3>

                {/* المحتوى: انتقال سلس للارتفاع عبر grid-rows */}
                <div
                  id={panelId}
                  role="region"
                  aria-label={title}
                  inert={!isOpen}
                  className={cn(
                    "grid transition-[grid-template-rows] duration-200 ease-out motion-reduce:transition-none",
                    isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
                  )}
                >
                  <div className="min-h-0 overflow-hidden">
                    <div className="flex flex-wrap gap-2 border-t border-border/50 px-3 pt-3 pb-3.5">
                      <Link
                        href={href}
                        onClick={close}
                        className={cn(
                          chipClass,
                          "border-primary/40 bg-primary/10 text-primary hover:bg-primary/15"
                        )}
                      >
                        <span>{t("viewAll")}</span>
                        <ArrowIcon aria-hidden="true" className="size-3.5" />
                      </Link>

                      {category.subcategories.length > 0 ? (
                        category.subcategories.map((sub: StoreSubcategory) => (
                          <Link
                            key={sub.id}
                            href={`${href}/${sub.slug}`}
                            onClick={close}
                            className={chipClass}
                          >
                            {getCategoryTitle(sub.name, sub.name_ar)}
                          </Link>
                        ))
                      ) : (
                        <p className="w-full py-1 text-xs font-normal text-muted-foreground">
                          {t("noSubcategories")}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </section>
            )
          })}
        </MobileMenuBody>

        {/* الشريط السفلي: نفس شريط سطح المكتب */}
        <MobileMenuFooter className="border-t border-border/70 bg-muted/30 px-4 py-3">
          <div className="flex items-center justify-between gap-4 text-xs font-normal text-foreground/80">
            <Link
              href={APP_ROUTES.CATEGORIES}
              onClick={close}
              className={cn(
                "inline-flex min-h-9 items-center gap-2 rounded-md whitespace-nowrap transition-colors hover:text-primary",
                focusRing
              )}
            >
              <span>{t("allCategories")}</span>
              <ArrowIcon aria-hidden="true" className="size-3.5" />
            </Link>

            <div className="flex items-center gap-5">
              {APP_ROUTES.ACCOUNT && (
                <Link
                  href={APP_ROUTES.ACCOUNT}
                  onClick={close}
                  className={cn(
                    "inline-flex min-h-9 items-center rounded-md whitespace-nowrap transition-colors hover:text-primary",
                    focusRing
                  )}
                >
                  {t("account")}
                </Link>
              )}
              {APP_ROUTES.WISHLIST && (
                <Link
                  href={APP_ROUTES.WISHLIST}
                  onClick={close}
                  className={cn(
                    "inline-flex min-h-9 items-center rounded-md whitespace-nowrap transition-colors hover:text-primary",
                    focusRing
                  )}
                >
                  {t("wishlist")}
                </Link>
              )}
            </div>
          </div>
        </MobileMenuFooter>
      </MobileMenu>
    </>
  )
}