import { Skeleton } from "@/components/ui/skeleton"

export default function Loading() {
  return (
    <div className="mx-auto w-full max-w-6xl px-4 pt-4 pb-8 sm:px-6 sm:pt-4 sm:pb-12 lg:px-8">
      {/* 1. هيكل روابط التنقل السريع (Breadcrumb) */}
      <div className="mb-4 flex items-center gap-2 sm:mb-6">
        <Skeleton className="h-4 w-12" />
        <span className="text-muted-foreground/40">/</span>
        <Skeleton className="h-4 w-20" />
        <span className="text-muted-foreground/40">/</span>
        <Skeleton className="h-4 w-32" />
      </div>

      {/* 2. قسم تفاصيل المنتج (شبكة من عمودين مماثلة لـ ProductDetailsPage) */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 lg:gap-12">
        {/* معرض الصور (اليسار/اليمين حسب اللغة) */}
        <div className="space-y-4 lg:col-span-6">
          <Skeleton className="aspect-square w-full rounded-2xl" />
          <div className="flex gap-3">
            <Skeleton className="size-18 rounded-xl" />
            <Skeleton className="size-18 rounded-xl" />
            <Skeleton className="size-18 rounded-xl" />
          </div>
        </div>

        {/* تفاصيل السعر، الاسم، وأزرار الشراء */}
        <div className="flex flex-col space-y-5 lg:col-span-6">
          <div className="space-y-2">
            <Skeleton className="h-4 w-24 rounded-full" />
            <Skeleton className="h-8 w-3/4 rounded-lg" />
            <Skeleton className="h-4 w-32" />
          </div>

          <div className="space-y-1">
            <Skeleton className="h-9 w-36 rounded-md" />
            <Skeleton className="h-4 w-24" />
          </div>

          <div className="space-y-2 pt-2">
            <Skeleton className="h-4 w-16" />
            <div className="flex gap-2">
              <Skeleton className="h-9 w-20 rounded-md" />
              <Skeleton className="h-9 w-20 rounded-md" />
              <Skeleton className="h-9 w-20 rounded-md" />
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <Skeleton className="h-11 flex-1 rounded-xl" />
            <Skeleton className="h-11 w-28 rounded-xl" />
          </div>

          <div className="space-y-2 pt-4">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
            <Skeleton className="h-4 w-2/3" />
          </div>
        </div>
      </div>

      {/* 3. هيكل قسم المراجعات والتقييمات في الأسفل */}
      <div className="mt-12 border-t border-border/60 pt-10 sm:mt-16 sm:pt-12">
        <div className="space-y-4">
          <Skeleton className="h-6 w-36" />
          <Skeleton className="h-24 w-full rounded-xl" />
        </div>
      </div>
    </div>
  )
}
