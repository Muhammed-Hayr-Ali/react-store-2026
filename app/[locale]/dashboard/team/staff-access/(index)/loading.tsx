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
      <div className="flex items-center gap-3 border-b border-border/40 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <Skeleton className="size-7 rounded-lg" />
            <Skeleton className="h-7 w-44 rounded-md sm:h-8" />
          </div>
          <Skeleton className="mt-2 h-4 w-80 max-w-full rounded-md" />
        </div>
      </div>

      <div className="flex w-full items-center gap-2">
        <Skeleton className="h-8 min-w-0 flex-1 rounded-md" />
        <div className="flex shrink-0 items-center gap-2">
          <Skeleton className="block size-8 rounded-md sm:hidden" />
          <div className="hidden h-8 items-center gap-1 rounded-md border border-input bg-background p-0.5 sm:inline-flex">
            <Skeleton className="h-full w-14 rounded-sm" />
            <Skeleton className="h-full w-20 rounded-sm" />
            <Skeleton className="h-full w-24 rounded-sm" />
          </div>
          <Skeleton className="size-8 rounded-md" />
        </div>
      </div>

      <div className="w-full overflow-hidden rounded-xl border border-border bg-card shadow-xs">
        <div className="overflow-x-auto">
          <Table className="w-full">
            <TableHeader className="bg-muted/40">
              <TableRow>
                <TableHead className="w-[45%]">
                  <Skeleton className="h-4 w-20 rounded-md" />
                </TableHead>
                <TableHead className="hidden md:table-cell">
                  <Skeleton className="h-4 w-16 rounded-md" />
                </TableHead>
                <TableHead className="text-end">
                  <div className="flex justify-end">
                    <Skeleton className="h-4 w-8 rounded-md" />
                  </div>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {Array.from({ length: 7 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell className="py-2.5">
                    <div className="flex items-center gap-2.5">
                      <Skeleton className="size-7 shrink-0 rounded-full" />
                      <div className="space-y-1">
                        <Skeleton className="h-3.5 w-28 rounded-md" />
                        <Skeleton className="h-3 w-36 max-w-full rounded-md" />
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="hidden py-2.5 md:table-cell">
                    <div className="flex flex-wrap gap-1.5">
                      <Skeleton className="h-5 w-20 rounded-full" />
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

      <div className="flex flex-col items-center justify-between gap-3 px-1 sm:flex-row">
        <div className="flex items-center gap-2">
          <Skeleton className="h-4 w-20 rounded-md" />
          <Skeleton className="h-8 w-18 rounded-md" />
          <Skeleton className="h-4 w-24 rounded-md" />
        </div>
        <div className="flex items-center gap-1.5">
          <Skeleton className="hidden size-8 rounded-md sm:block" />
          <Skeleton className="size-8 rounded-md" />
          <Skeleton className="size-8 rounded-md" />
          <Skeleton className="hidden size-8 rounded-md sm:block" />
        </div>
      </div>
    </div>
  )
}
