import { Skeleton } from "@/components/ui/skeleton"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

export default function Loading() {
  return (
    <div className="mx-auto w-full max-w-7xl animate-pulse space-y-6 px-2 py-4 md:px-4 md:py-6">
      {/* 1. Header Skeleton مطابق لترويسة صفحة المنتجات */}
      <div className="flex flex-col gap-3 border-b border-border/40 pb-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <Skeleton className="size-7 rounded-lg" />
            <Skeleton className="h-7 w-36 rounded-md sm:h-8" />
          </div>
          <Skeleton className="mt-2 h-4 w-80 max-w-full rounded-md" />
        </div>

        <Skeleton className="h-9 w-36 rounded-md sm:ms-auto" />
      </div>

      {/* 2. Controls Bar Skeleton (بارتفاع h-8 ومحاذاة مطابقة لـ products-table) */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        {/* حقل البحث */}
        <Skeleton className="h-8 w-full rounded-md sm:w-64" />

        {/* مجموعة الفلاتر وزر الأعمدة */}
        <div className="flex flex-wrap items-center gap-2">
          {/* شريط الفلترة المسطح */}
          <div className="inline-flex h-8 items-center gap-1 rounded-md border border-input bg-background p-0.5">
            <Skeleton className="h-full w-14 rounded-sm" />
            <Skeleton className="h-full w-16 rounded-sm" />
            <Skeleton className="h-full w-20 rounded-sm" />
          </div>

          {/* زر الأعمدة المربع size-8 */}
          <Skeleton className="size-8 rounded-md" />
        </div>
      </div>

      {/* 3. حاوية الجدول باستخدام مكونات Table لمنع الـ Layout Shift */}
      <div className="w-full overflow-hidden rounded-xl border border-border bg-card shadow-xs">
        <div className="overflow-x-auto">
          <Table className="w-full">
            <TableHeader className="bg-muted/40">
              <TableRow>
                {/* Product */}
                <TableHead className="w-[25%]">
                  <Skeleton className="h-4 w-20 rounded-md" />
                </TableHead>
                {/* Category (مخفي بالجوال) */}
                <TableHead className="hidden w-[12%] md:table-cell">
                  <Skeleton className="h-4 w-16 rounded-md" />
                </TableHead>
                {/* Brand (مخفي بالجوال) */}
                <TableHead className="hidden w-[12%] md:table-cell">
                  <Skeleton className="h-4 w-14 rounded-md" />
                </TableHead>
                {/* Variants (مخفي بالجوال) */}
                <TableHead className="hidden w-[10%] text-center md:table-cell">
                  <div className="flex justify-center">
                    <Skeleton className="h-4 w-14 rounded-md" />
                  </div>
                </TableHead>
                {/* Stock (مخفي بالجوال) */}
                <TableHead className="hidden w-[10%] text-center md:table-cell">
                  <div className="flex justify-center">
                    <Skeleton className="h-4 w-12 rounded-md" />
                  </div>
                </TableHead>
                {/* Price Range (مخفي بالجوال) */}
                <TableHead className="hidden w-[13%] md:table-cell">
                  <Skeleton className="h-4 w-18 rounded-md" />
                </TableHead>
                {/* Status (مخفي بالجوال) */}
                <TableHead className="hidden w-[10%] text-center md:table-cell">
                  <div className="flex justify-center">
                    <Skeleton className="h-4 w-14 rounded-md" />
                  </div>
                </TableHead>
                {/* Actions */}
                <TableHead className="w-[8%] text-end">
                  <div className="flex justify-end">
                    <Skeleton className="h-4 w-8 rounded-md" />
                  </div>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {Array.from({ length: 7 }).map((_, i) => (
                <TableRow key={i}>
                  {/* Product Name */}
                  <TableCell>
                    <Skeleton className="h-4 w-36 rounded-md" />
                  </TableCell>

                  {/* Category Badge */}
                  <TableCell className="hidden md:table-cell">
                    <Skeleton className="h-5 w-20 rounded-md" />
                  </TableCell>

                  {/* Brand */}
                  <TableCell className="hidden md:table-cell">
                    <Skeleton className="h-4 w-16 rounded-md" />
                  </TableCell>

                  {/* Variants Badge */}
                  <TableCell className="hidden text-center md:table-cell">
                    <div className="flex justify-center">
                      <Skeleton className="h-5 w-8 rounded-md" />
                    </div>
                  </TableCell>

                  {/* Stock Pill */}
                  <TableCell className="hidden text-center md:table-cell">
                    <div className="flex justify-center">
                      <Skeleton className="h-5 w-12 rounded-full" />
                    </div>
                  </TableCell>

                  {/* Price Range */}
                  <TableCell className="hidden md:table-cell">
                    <Skeleton className="h-4 w-24 rounded-md" />
                  </TableCell>

                  {/* Status Badge */}
                  <TableCell className="hidden text-center md:table-cell">
                    <div className="flex justify-center">
                      <Skeleton className="h-5 w-16 rounded-md" />
                    </div>
                  </TableCell>

                  {/* Actions Button */}
                  <TableCell className="text-end">
                    <div className="flex justify-end">
                      <Skeleton className="size-7 rounded-md" />
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* 4. شريط الترقيم Footer المطابق للجدول القياسي */}
      <div className="flex items-center justify-between px-1">
        <div className="flex w-full items-center gap-8 lg:w-fit">
          {/* Rows per page */}
          <div className="hidden items-center gap-2 lg:flex">
            <Skeleton className="h-4 w-20 rounded-md" />
            <Skeleton className="h-8 w-20 rounded-md" />
          </div>
          {/* Page indicator */}
          <Skeleton className="h-4 w-24 rounded-md" />
          {/* Pagination buttons */}
          <div className="ms-auto flex items-center gap-2 lg:ms-0">
            <Skeleton className="hidden size-8 rounded-md lg:block" />
            <Skeleton className="size-8 rounded-md" />
            <Skeleton className="size-8 rounded-md" />
            <Skeleton className="hidden size-8 rounded-md lg:block" />
          </div>
        </div>
      </div>
    </div>
  )
}
