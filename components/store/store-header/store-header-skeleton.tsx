/**
 * @file components/store/store-header/store-header-skeleton.tsx
 * @description الهيكل العظمي لهيدر المتجر، بنفس تخطيط ونقاط تجاوب الأصل.
 */

import { Skeleton } from "@/components/ui/skeleton"
import { STORE_CONTAINER } from "@/lib/config/app_config"
import { cn } from "@/lib/utils"
import { hideScrollbar } from "./store-header-shared"

/** أزرار الصف العلوي: الحساب / المفضلة / السلة */
function HeaderActionSkeleton({
  labelClass,
  hasChevron = false,
  className,
}: {
  labelClass: string
  hasChevron?: boolean
  className?: string
}) {
  return (
    <div className={cn("flex h-10 items-center gap-2 px-3", className)}>
      <Skeleton className="size-5 rounded-md lg:size-4" />
      <Skeleton className={cn("hidden h-3 lg:block", labelClass)} />
      {hasChevron && <Skeleton className="hidden size-3 lg:block" />}
    </div>
  )
}

export function StoreHeaderSkeleton() {
  return (
    <div
      aria-hidden="true"
      className="w-full border-b border-border/60 bg-background"
    >
      <div className={STORE_CONTAINER}>
        {/* الصف الأول: الشعار والبحث والأزرار */}
        <div className="flex h-20 items-center justify-between gap-4 sm:gap-6">
          <Skeleton className="size-7 shrink-0 rounded-md md:size-8" />

          <div className="hidden max-w-lg flex-1 md:block">
            <Skeleton className="h-11 w-full rounded-xl" />
          </div>

          <div className="-me-3 flex shrink-0 items-center">
            <HeaderActionSkeleton labelClass="w-10" hasChevron />
            <HeaderActionSkeleton
              labelClass="w-12"
              className="hidden sm:flex"
            />
            <HeaderActionSkeleton labelClass="w-8" />
          </div>
        </div>

        {/* البحث على الجوال */}
        <div className="pb-3 md:hidden">
          <Skeleton className="h-10 w-full rounded-xl" />
        </div>
      </div>

      <div className="border-t border-border/60" />

      {/* الصف الثاني: روابط التنقل والتفضيلات */}
      <div className={STORE_CONTAINER}>
        <div
          className={cn(
            "-mx-3 flex h-13 items-center justify-between gap-2 overflow-x-auto px-3 sm:gap-4",
            hideScrollbar
          )}
        >
          <div className="-ms-2.5 flex shrink-0 items-center gap-2">
            {/* زر التصنيفات */}
            <div className="flex h-9 items-center gap-1.5 px-2.5">
              <Skeleton className="size-3.5" />
              <Skeleton className="h-3 w-12" />
              <Skeleton className="size-3.5" />
            </div>

            <span className="mx-1 hidden h-4 w-px bg-border md:flex" />

            {/* الأحدث والمميز */}
            {Array.from({ length: 2 }, (_, index) => (
              <div key={index} className="hidden h-9 items-center px-2.5 md:flex">
                <Skeleton className="h-3 w-10" />
              </div>
            ))}

            {/* العروض */}
            <div className="hidden h-9 items-center gap-1 px-2.5 md:flex">
              <Skeleton className="size-3.5" />
              <Skeleton className="h-3 w-10" />
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-2">
            {/* أقل من lg: أزرار القوائم (العملة، اللغة، المظهر) */}
            <Skeleton className="h-9 w-12 rounded-lg sm:w-20 lg:hidden" />
            <Skeleton className="h-9 w-8.5 rounded-lg sm:w-24 lg:hidden" />
            <Skeleton className="h-9 w-8.5 rounded-lg sm:w-22 lg:hidden" />

            {/* من lg: الأزرار المجزأة، ونصوص المظهر تظهر من xl */}
            <Skeleton className="hidden h-8 w-32 rounded-xl lg:block" />
            <Skeleton className="hidden h-8 w-40 rounded-xl lg:block" />
            <Skeleton className="hidden h-8 w-27 rounded-xl lg:block xl:w-56" />
          </div>
        </div>
      </div>
    </div>
  )
}
