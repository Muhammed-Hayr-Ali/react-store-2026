/**
 * @file app/[locale]/(store)/wishlist/loading.tsx
 * @description Loading skeleton for the wishlist page, matching the exact page layout and product grid structure.
 */

import * as React from "react"

export default function WishlistLoading() {
  return (
    <div className="container space-y-8 py-8 animate-pulse">
      {/* رأس الصفحة الوهمي */}
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <div className="h-6 w-36 rounded-md bg-muted" />
          <div className="h-4 w-64 rounded-md bg-muted/60" />
        </div>
        {/* أزرار التحكم بالعرض الوهمية */}
        <div className="h-9 w-16 rounded-full bg-muted/60" />
      </div>

      {/* شبكة بطاقات المنتجات الوهمية (Skeletons) متوافقة مع الـ Grid الحقيقي */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 sm:gap-6 lg:grid-cols-4">
        {Array.from({ length: 8 }).map((_, index) => (
          <div
            key={index}
            className="flex flex-col overflow-hidden rounded-2xl bg-muted/50 p-2.5 space-y-3"
          >
            {/* مكان الصورة المربع */}
            <div className="aspect-square w-full rounded-xl bg-muted" />

            {/* مكان النصوص (العنوان والوصف) */}
            <div className="space-y-1.5 px-1">
              <div className="h-4 w-3/4 rounded bg-muted" />
              <div className="h-3 w-1/2 rounded bg-muted/70" />
            </div>

            {/* مكان السعر وزر الإضافة */}
            <div className="flex items-center justify-between px-1 pt-1">
              <div className="h-4 w-16 rounded bg-muted" />
              <div className="size-7 rounded-full bg-muted" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}