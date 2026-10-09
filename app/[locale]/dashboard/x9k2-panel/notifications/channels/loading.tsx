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
        <Skeleton className="h-8 w-28 rounded-md" />
      </div>

      <div className="w-full overflow-hidden rounded-xl border border-border bg-card shadow-xs">
        <div className="overflow-x-auto">
          <Table className="w-full">
            <TableHeader className="bg-muted/40">
              <TableRow>
                <TableHead><Skeleton className="h-4 w-20 rounded-md" /></TableHead>
                <TableHead><Skeleton className="h-4 w-16 rounded-md" /></TableHead>
                <TableHead><Skeleton className="h-4 w-24 rounded-md" /></TableHead>
                <TableHead><Skeleton className="h-4 w-16 rounded-md" /></TableHead>
                <TableHead className="w-[70px] text-end"><Skeleton className="h-4 w-8 rounded-md" /></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {Array.from({ length: 4 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell><Skeleton className="h-4 w-32 rounded-md" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-20 rounded-md" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-48 rounded-md" /></TableCell>
                  <TableCell><Skeleton className="h-5 w-12 rounded-full" /></TableCell>
                  <TableCell className="text-end"><Skeleton className="size-7 rounded-md ml-auto" /></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  )
}