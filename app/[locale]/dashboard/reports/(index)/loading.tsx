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
      {/* 1. Header Skeleton مطابق لترويسة صفحة البلاغات */}
      <div className="flex flex-col gap-3 border-b border-border/40 pb-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <Skeleton className="size-7 rounded-lg" />
            <Skeleton className="h-7 w-48 rounded-md sm:h-8" />
          </div>
          <Skeleton className="mt-2 h-4 w-80 max-w-full rounded-md" />
        </div>
      </div>

      {/* 2. Controls Bar Skeleton (بارتفاع h-8 ومحاذاة مطابقة لـ reports-table) */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        {/* حقل البحث */}
        <Skeleton className="h-8 w-full rounded-md sm:w-64" />

        {/* مجموعة الفلاتر، القائمة المنسدلة، وزر الأعمدة */}
        <div className="flex flex-wrap items-center gap-2">
          {/* شريط الفلترة التبويبي المسطح */}
          <div className="inline-flex h-8 items-center gap-1 rounded-md border border-input bg-background p-0.5">
            <Skeleton className="h-full w-12 rounded-sm" />
            <Skeleton className="h-full w-16 rounded-sm" />
            <Skeleton className="h-full w-16 rounded-sm" />
            <Skeleton className="h-full w-16 rounded-sm" />
            <Skeleton className="h-full w-16 rounded-sm" />
          </div>

          {/* قائمة اختيار نوع الهدف Target Type Select */}
          <Skeleton className="h-8 w-28 rounded-md" />

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
                {/* Reported Item */}
                <TableHead className="w-[35%]">
                  <Skeleton className="h-4 w-28 rounded-md" />
                </TableHead>
                {/* Type (مخفي بالجوال) */}
                <TableHead className="hidden w-[12%] md:table-cell">
                  <Skeleton className="h-4 w-12 rounded-md" />
                </TableHead>
                {/* Status (مخفي بالجوال) */}
                <TableHead className="hidden w-[15%] md:table-cell">
                  <Skeleton className="h-4 w-14 rounded-md" />
                </TableHead>
                {/* Reporter (مخفي بالجوال) */}
                <TableHead className="hidden w-[18%] md:table-cell">
                  <Skeleton className="h-4 w-16 rounded-md" />
                </TableHead>
                {/* Submitted (مخفي بالجوال) */}
                <TableHead className="hidden w-[12%] md:table-cell">
                  <Skeleton className="h-4 w-18 rounded-md" />
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
              {Array.from({ length: 6 }).map((_, i) => (
                <TableRow key={i}>
                  {/* Reported Item Reason & Details */}
                  <TableCell>
                    <div className="space-y-1.5 py-1">
                      <Skeleton className="h-4 w-44 rounded-md" />
                      <Skeleton className="h-3 w-32 rounded-md" />
                    </div>
                  </TableCell>

                  {/* Target Type Badge */}
                  <TableCell className="hidden md:table-cell">
                    <Skeleton className="h-5 w-16 rounded-md" />
                  </TableCell>

                  {/* Status Badge */}
                  <TableCell className="hidden md:table-cell">
                    <Skeleton className="h-5 w-20 rounded-full" />
                  </TableCell>

                  {/* Reporter Name */}
                  <TableCell className="hidden md:table-cell">
                    <Skeleton className="h-4 w-28 rounded-md" />
                  </TableCell>

                  {/* Submitted Date & Time */}
                  <TableCell className="hidden md:table-cell">
                    <div className="space-y-1">
                      <Skeleton className="h-3.5 w-20 rounded-md" />
                      <Skeleton className="h-2.5 w-14 rounded-md" />
                    </div>
                  </TableCell>

                  {/* Actions Dropdown Button */}
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

      {/* 4. شريط الترقيم القياسي Footer المطابق حرفياً لـ reports-table */}
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
