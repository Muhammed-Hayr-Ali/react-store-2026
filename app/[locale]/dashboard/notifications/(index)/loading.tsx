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
      {/* 1. Trivial Header Skeleton */}
      <div className="flex flex-col gap-3 border-b border-border/40 pb-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <Skeleton className="size-7 rounded-lg" />
            <Skeleton className="h-7 w-36 rounded-md sm:h-8" />
          </div>
          <Skeleton className="mt-2 h-4 w-80 max-w-full rounded-md" />
        </div>
      </div>

      {/* 2. Unified Controls Bar Skeleton (Search + Mobile Dropdown / Desktop Tabs + Columns Toggle + Action Button) */}
      <div className="flex w-full items-center gap-2">
        {/* Search Input Skeleton */}
        <Skeleton className="h-8 min-w-0 flex-1 rounded-md" />

        {/* Right Action Group */}
        <div className="flex shrink-0 items-center gap-2">
          {/* Mobile Filter Dropdown Button Skeleton */}
          <Skeleton className="block size-8 rounded-md sm:hidden" />

          {/* Desktop Tabs Filter Skeleton */}
          <div className="hidden h-8 items-center gap-1 rounded-md border border-input bg-background p-0.5 sm:inline-flex">
            <Skeleton className="h-full w-14 rounded-sm" />
            <Skeleton className="h-full w-16 rounded-sm" />
            <Skeleton className="h-full w-20 rounded-sm" />
          </div>

          {/* Toggle Columns Button Skeleton */}
          <Skeleton className="size-8 rounded-md" />

          {/* Create/Add Button Skeleton */}
          <Skeleton className="h-8 w-8 rounded-md sm:w-28" />
        </div>
      </div>

      {/* 3. Table Container Skeleton */}
      <div className="w-full overflow-hidden rounded-xl border border-border bg-card shadow-xs">
        <div className="overflow-x-auto">
          <Table className="w-full">
            <TableHeader className="bg-muted/40">
              <TableRow>
                <TableHead className="w-[25%]">
                  <Skeleton className="h-4 w-20 rounded-md" />
                </TableHead>
                <TableHead className="hidden w-[12%] md:table-cell">
                  <Skeleton className="h-4 w-16 rounded-md" />
                </TableHead>
                <TableHead className="hidden w-[12%] md:table-cell">
                  <Skeleton className="h-4 w-14 rounded-md" />
                </TableHead>
                <TableHead className="hidden w-[10%] text-center md:table-cell">
                  <div className="flex justify-center">
                    <Skeleton className="h-4 w-14 rounded-md" />
                  </div>
                </TableHead>
                <TableHead className="hidden w-[10%] text-center md:table-cell">
                  <div className="flex justify-center">
                    <Skeleton className="h-4 w-12 rounded-md" />
                  </div>
                </TableHead>
                <TableHead className="hidden w-[13%] md:table-cell">
                  <Skeleton className="h-4 w-18 rounded-md" />
                </TableHead>
                <TableHead className="hidden w-[10%] text-center md:table-cell">
                  <div className="flex justify-center">
                    <Skeleton className="h-4 w-14 rounded-md" />
                  </div>
                </TableHead>
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
                  <TableCell>
                    <Skeleton className="h-4 w-36 rounded-md" />
                  </TableCell>

                  <TableCell className="hidden md:table-cell">
                    <Skeleton className="h-5 w-20 rounded-md" />
                  </TableCell>

                  <TableCell className="hidden md:table-cell">
                    <Skeleton className="h-4 w-16 rounded-md" />
                  </TableCell>

                  <TableCell className="hidden text-center md:table-cell">
                    <div className="flex justify-center">
                      <Skeleton className="h-5 w-8 rounded-md" />
                    </div>
                  </TableCell>

                  <TableCell className="hidden text-center md:table-cell">
                    <div className="flex justify-center">
                      <Skeleton className="h-5 w-12 rounded-full" />
                    </div>
                  </TableCell>

                  <TableCell className="hidden md:table-cell">
                    <Skeleton className="h-4 w-24 rounded-md" />
                  </TableCell>

                  <TableCell className="hidden text-center md:table-cell">
                    <div className="flex justify-center">
                      <Skeleton className="h-5 w-16 rounded-md" />
                    </div>
                  </TableCell>

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

      {/* 4. Pagination Footer Skeleton */}
      <div className="flex items-center justify-between px-1">
        <div className="flex w-full items-center gap-8 lg:w-fit">
          <div className="hidden items-center gap-2 lg:flex">
            <Skeleton className="h-4 w-20 rounded-md" />
            <Skeleton className="h-8 w-20 rounded-md" />
          </div>
          <Skeleton className="h-4 w-24 rounded-md" />
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
