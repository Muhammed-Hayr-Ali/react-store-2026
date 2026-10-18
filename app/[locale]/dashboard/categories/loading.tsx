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
      <div className="flex flex-col gap-3 border-b border-border/40 pb-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <Skeleton className="size-7 rounded-lg" />
            <Skeleton className="h-7 w-40 rounded-md sm:h-8" />
          </div>
          <Skeleton className="mt-2 h-4 w-80 max-w-full rounded-md" />
        </div>
      </div>

      {/* هيكل التحميل لبطاقات الملخص الثلاثة (بشكل أفقي متجاوب grid-cols-3) */}
      <div className="grid grid-cols-3 gap-2 sm:gap-3">
        {Array.from({ length: 3 }, (_, index) => (
          <div
            key={index}
            className="flex items-center justify-between rounded-xl border border-border bg-card px-3 py-2.5 sm:px-4 sm:py-3 shadow-xs"
          >
            <div className="space-y-1 sm:space-y-1.5 min-w-0 flex-1">
              <Skeleton className="h-2.5 w-16 sm:h-3 sm:w-24 rounded-md" />
              <Skeleton className="h-5 w-8 sm:h-6 sm:w-12 rounded-md" />
            </div>
            <Skeleton className="size-7 sm:size-8 shrink-0 rounded-lg" />
          </div>
        ))}
      </div>

      <div className="flex w-full items-center gap-2">
        <Skeleton className="h-8 min-w-0 flex-1 rounded-md" />
        <div className="flex shrink-0 items-center gap-2">
          <Skeleton className="size-8 rounded-md sm:hidden" />
          <div className="hidden h-8 items-center gap-1 rounded-md border border-input bg-background p-0.5 sm:flex">
            <Skeleton className="h-full w-14 rounded-sm" />
            <Skeleton className="h-full w-16 rounded-sm" />
            <Skeleton className="h-full w-16 rounded-sm" />
          </div>
          <Skeleton className="size-8 rounded-md" />
          <Skeleton className="size-8 rounded-md sm:w-28" />
        </div>
      </div>

      <div className="w-full overflow-hidden rounded-xl border border-border bg-card shadow-xs">
        <div className="overflow-x-auto">
          <Table className="w-full">
            <TableHeader className="bg-muted/40">
              <TableRow>
                <TableHead className="w-[40%]">
                  <Skeleton className="h-4 w-24 rounded-md" />
                </TableHead>
                <TableHead>
                  <Skeleton className="h-4 w-12 rounded-md" />
                </TableHead>
                <TableHead className="text-center">
                  <div className="flex justify-center">
                    <Skeleton className="h-4 w-16 rounded-md" />
                  </div>
                </TableHead>
                <TableHead className="text-end">
                  <div className="flex justify-end">
                    <Skeleton className="h-4 w-8 rounded-md" />
                  </div>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {Array.from({ length: 7 }, (_, index) => (
                <TableRow key={index}>
                  <TableCell className="py-2.5">
                    <div className="flex items-center gap-2.5">
                      <Skeleton className="size-7 shrink-0 rounded-lg" />
                      <div className="min-w-0 space-y-1">
                        <Skeleton className="h-3.5 w-28 max-w-full rounded-md" />
                        <Skeleton className="h-3 w-32 max-w-full rounded-md" />
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="py-2.5">
                    <Skeleton className="h-4 w-8 rounded-md" />
                  </TableCell>
                  <TableCell className="py-2.5">
                    <div className="flex justify-center">
                      <Skeleton className="h-5 w-16 rounded-full" />
                    </div>
                  </TableCell>
                  <TableCell className="py-2.5">
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

      <div className="flex w-full flex-nowrap items-center justify-between gap-2 px-1 py-1">
        <div className="flex min-w-0 shrink items-center gap-1.5 sm:gap-2">
          <Skeleton className="hidden h-4 w-20 rounded-md sm:block" />
          <Skeleton className="h-8 w-18 shrink-0 rounded-md" />
          <Skeleton className="ms-1.5 h-4 w-24 shrink-0 rounded-md sm:ms-2" />
        </div>
        <div className="flex shrink-0 items-center gap-1 sm:gap-1.5">
          <Skeleton className="hidden size-8 rounded-md sm:block" />
          <Skeleton className="size-8 rounded-md" />
          <Skeleton className="size-8 rounded-md" />
          <Skeleton className="hidden size-8 rounded-md sm:block" />
        </div>
      </div>
    </div>
  )
}
