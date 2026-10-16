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
            <Skeleton className="h-7 w-36 rounded-md sm:h-8" />
          </div>
          <Skeleton className="mt-2 h-4 w-80 max-w-full rounded-md" />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2 sm:gap-3">
        {Array.from({ length: 3 }).map((_, index) => (
          <div
            key={index}
            className="flex items-center justify-between rounded-xl border border-border bg-card px-3 py-2.5 shadow-xs sm:px-4 sm:py-3"
          >
            <div className="min-w-0 flex-1 space-y-1 sm:space-y-1.5">
              <Skeleton className="h-2.5 w-16 rounded-md sm:h-3 sm:w-24" />
              <Skeleton className="h-5 w-8 rounded-md sm:h-6 sm:w-12" />
            </div>
            <Skeleton className="size-7 shrink-0 rounded-lg sm:size-8" />
          </div>
        ))}
      </div>

      <div className="flex w-full items-center gap-2">
        <Skeleton className="h-8 min-w-0 flex-1 rounded-md" />
        <div className="flex shrink-0 items-center gap-2">
          <Skeleton className="block size-8 rounded-md sm:hidden" />
          <div className="hidden h-8 items-center gap-1 rounded-md border border-input bg-background p-0.5 sm:inline-flex">
            <Skeleton className="h-full w-14 rounded-sm" />
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
                <TableHead className="w-[35%]">
                  <Skeleton className="h-4 w-24 rounded-md" />
                </TableHead>
                <TableHead className="hidden md:table-cell">
                  <Skeleton className="h-4 w-32 rounded-md" />
                </TableHead>
                <TableHead className="text-end">
                  <div className="flex justify-end">
                    <Skeleton className="h-4 w-12 rounded-md" />
                  </div>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell className="py-3">
                    <Skeleton className="h-4 w-32 rounded-md" />
                  </TableCell>
                  <TableCell className="hidden py-3 md:table-cell">
                    <Skeleton className="h-5 w-24 rounded-full" />
                  </TableCell>
                  <TableCell className="py-3">
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
    </div>
  )
}
