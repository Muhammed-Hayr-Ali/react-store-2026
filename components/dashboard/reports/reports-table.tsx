"use client"

import * as React from "react"
import Link from "next/link"
import { useParams } from "next/navigation"
import {
  columnFilteringFeature,
  columnVisibilityFeature,
  createColumnHelper,
  createFilteredRowModel,
  createPaginatedRowModel,
  createSortedRowModel,
  FlexRender,
  rowPaginationFeature,
  rowSortingFeature,
  tableFeatures,
  useTable,
  type ColumnFiltersState,
  type ColumnVisibilityState,
  type SortingState,
} from "@tanstack/react-table"
import {
  CircleCheckIcon,
  CircleXIcon,
  ClockIcon,
  EyeIcon,
  FilterIcon,
  EllipsisVerticalIcon,
  SearchIcon,
  Trash2Icon,
  XIcon,
  Columns3Icon,
  ChevronsLeftIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronsRightIcon,
  ListFilterIcon,
  AlertTriangleIcon,
  UserIcon,
} from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

import {
  ReportStatus,
  ReportWithDetails,
} from "@/lib/actions/reports/types"
import { appRoutes } from "@/lib/config/app-routes"
import DeleteReportDialog from "./delete-report-dialog"

const features = tableFeatures({
  columnFilteringFeature,
  columnVisibilityFeature,
  rowPaginationFeature,
  rowSortingFeature,
  filteredRowModel: createFilteredRowModel(),
  paginatedRowModel: createPaginatedRowModel(),
  sortedRowModel: createSortedRowModel(),
})

const columnHelper = createColumnHelper<typeof features, ReportWithDetails>()

const HIDEABLE_COLUMNS = ["target_type", "status", "reporter", "created_at"]

const columnLabelsMap: Record<string, string> = {
  reason: "Reported Item",
  target_type: "Type",
  status: "Status",
  reporter: "Reporter",
  created_at: "Submitted",
}

function formatDate(isoString: string): string {
  const d = new Date(isoString)
  if (isNaN(d.getTime())) return ""
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, "0")
  const day = String(d.getDate()).padStart(2, "0")
  return `${year}-${month}-${day}`
}

function formatTime(isoString: string): string {
  const d = new Date(isoString)
  if (isNaN(d.getTime())) return ""
  const hours = String(d.getHours()).padStart(2, "0")
  const minutes = String(d.getMinutes()).padStart(2, "0")
  return `${hours}:${minutes}`
}

interface ReportsTableProps {
  reports: ReportWithDetails[]
  total: number
  initialIsMobile?: boolean
}

export function ReportsTable({
  reports: initialData,
  initialIsMobile = false,
}: ReportsTableProps) {
  const [data, setData] = React.useState(() => initialData)
  const [prevInitialData, setPrevInitialData] = React.useState(initialData)
  const [currentTab, setCurrentTab] = React.useState<string>("all")
  const [targetTypeFilter, setTargetTypeFilter] = React.useState<string>("all")
  const [searchQuery, setSearchQuery] = React.useState("")

  const [reportModal, setReportModal] = React.useState<{
    type: "delete" | null
    data: ReportWithDetails | null
  }>({
    type: null,
    data: null,
  })

  const params = useParams()
  const locale = (params?.locale as string) || "en"

  if (initialData !== prevInitialData) {
    setPrevInitialData(initialData)
    setData(initialData)
  }

  const filteredData = React.useMemo(() => {
    return data.filter((report) => {
      if (currentTab !== "all" && report.status !== currentTab) return false

      if (
        targetTypeFilter !== "all" &&
        report.target_type !== targetTypeFilter
      ) {
        return false
      }

      if (!searchQuery.trim()) return true
      const q = searchQuery.toLowerCase().trim()
      const reason = (report.reason || "").toLowerCase()
      const details = (report.details || "").toLowerCase()
      const reporterName = [
        report.reporter?.first_name,
        report.reporter?.last_name,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
      const email = (
        report.reporter?.email ||
        (report as { contact_email?: string }).contact_email ||
        ""
      ).toLowerCase()

      return (
        reason.includes(q) ||
        details.includes(q) ||
        reporterName.includes(q) ||
        email.includes(q)
      )
    })
  }, [data, currentTab, targetTypeFilter, searchQuery])

  const pendingCount = React.useMemo(
    () => data.filter((r) => r.status === "pending").length,
    [data]
  )
  const reviewCount = React.useMemo(
    () => data.filter((r) => r.status === "under_review").length,
    [data]
  )
  const resolvedCount = React.useMemo(
    () => data.filter((r) => r.status === "resolved").length,
    [data]
  )
  const dismissedCount = React.useMemo(
    () => data.filter((r) => r.status === "dismissed").length,
    [data]
  )

  const [columnVisibility, setColumnVisibility] =
    React.useState<ColumnVisibilityState>(() => {
      const initial: ColumnVisibilityState = {}
      HIDEABLE_COLUMNS.forEach((colId) => {
        initial[colId] = !initialIsMobile
      })
      return initial
    })

  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  )
  const [sorting, setSorting] = React.useState<SortingState>([])
  const [pagination, setPagination] = React.useState({
    pageIndex: 0,
    pageSize: initialIsMobile ? 9 : 10,
  })

  React.useEffect(() => {
    const handleResize = () => {
      const isMobile = window.innerWidth < 768
      setPagination((prev) => {
        const nextSize = isMobile ? 20 : 10
        if (prev.pageSize === nextSize) return prev
        return { ...prev, pageSize: nextSize, pageIndex: 0 }
      })

      setColumnVisibility((prev) => {
        const nextVisibility: ColumnVisibilityState = { ...prev }
        HIDEABLE_COLUMNS.forEach((colId) => {
          nextVisibility[colId] = !isMobile
        })
        return nextVisibility
      })
    }

    handleResize()
    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  const getStatusBadge = (status: ReportStatus) => {
    switch (status) {
      case "pending":
        return (
          <Badge
            variant="outline"
            className="gap-1 border-destructive/30 px-2 py-0.5 text-xs text-destructive"
          >
            <span className="size-1.5 animate-pulse rounded-full bg-destructive" />
            Pending
          </Badge>
        )
      case "under_review":
        return (
          <Badge
            variant="outline"
            className="gap-1 border-amber-500/30 px-2 py-0.5 text-xs text-amber-600 dark:text-amber-400"
          >
            <ClockIcon className="size-3" />
            Review
          </Badge>
        )
      case "resolved":
        return (
          <Badge
            variant="outline"
            className="gap-1 border-emerald-500/30 px-2 py-0.5 text-xs text-emerald-600 dark:text-emerald-400"
          >
            <CircleCheckIcon className="size-3 fill-emerald-500 text-background" />
            Resolved
          </Badge>
        )
      case "dismissed":
        return (
          <Badge
            variant="outline"
            className="gap-1 px-2 py-0.5 text-xs text-muted-foreground"
          >
            <CircleXIcon className="size-3 fill-muted-foreground text-background" />
            Dismissed
          </Badge>
        )
    }
  }

  const columns = React.useMemo(
    () =>
      columnHelper.columns([
        columnHelper.accessor("reason", {
          id: "reason",
          header: "Reported Item",
          cell: ({ row }) => {
            const report = row.original
            return (
              <div className="flex items-center gap-2.5">
                <div className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-secondary text-foreground">
                  <AlertTriangleIcon className="size-3.5 text-destructive" />
                </div>
                <div className="flex max-w-xs min-w-0 flex-col sm:max-w-md">
                  <Link
                    href={`${appRoutes.dashboard.admin.reports}/${report.id}`}
                    className="truncate text-xs font-semibold text-foreground transition-colors hover:text-primary hover:underline"
                    title={report.reason}
                  >
                    {report.reason}
                  </Link>
                  <span className="max-w-3xs truncate text-[11px] text-muted-foreground">
                    {report.details || "No additional details"}
                  </span>
                </div>
              </div>
            )
          },
          enableHiding: false,
        }),

        columnHelper.accessor("target_type", {
          id: "target_type",
          header: "Type",
          cell: ({ row }) => (
            <Badge
              variant="outline"
              className="px-2 py-0.5 text-xs text-muted-foreground capitalize"
            >
              {row.original.target_type.replace("_", " ")}
            </Badge>
          ),
        }),

        columnHelper.accessor("status", {
          id: "status",
          header: () => <div className="text-center">Status</div>,
          cell: ({ row }) => (
            <div className="flex justify-center">
              {getStatusBadge(row.original.status)}
            </div>
          ),
        }),

        columnHelper.display({
          id: "reporter",
          header: "Reporter",
          cell: ({ row }) => {
            const reporter = row.original.reporter
            const fullName = [reporter?.first_name, reporter?.last_name]
              .filter(Boolean)
              .join(" ")
            const email =
              reporter?.email ||
              (row.original as { contact_email?: string }).contact_email ||
              ""

            return (
              <div className="flex items-center gap-2">
                <div className="flex size-6 shrink-0 items-center justify-center rounded-full bg-secondary text-muted-foreground">
                  <UserIcon className="size-3" />
                </div>
                <div className="flex min-w-0 flex-col">
                  <span className="truncate text-xs font-medium text-foreground">
                    {fullName || "Guest User"}
                  </span>
                  {email && (
                    <span className="truncate text-[10px] text-muted-foreground">
                      {email}
                    </span>
                  )}
                </div>
              </div>
            )
          },
        }),

        columnHelper.accessor("created_at", {
          id: "created_at",
          header: "Submitted",
          cell: ({ row }) => (
            <div
              className="text-xs text-muted-foreground"
              suppressHydrationWarning
            >
              <div className="font-mono text-[11px]">
                {formatDate(row.original.created_at)}
              </div>
              <div className="font-mono text-[10px] text-muted-foreground/70">
                {formatTime(row.original.created_at)}
              </div>
            </div>
          ),
        }),

        columnHelper.display({
          id: "actions",
          cell: ({ row }) => (
            <div className="flex items-center justify-end">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="flex size-7 text-muted-foreground data-[state=open]:bg-muted"
                  >
                    <EllipsisVerticalIcon className="size-4" />
                    <span className="sr-only">Actions</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-44 text-xs">
                  <DropdownMenuItem asChild>
                    <Link
                      href={`${appRoutes.dashboard.admin.reports}/${row.original.id}`}
                      className="flex cursor-pointer items-center"
                    >
                      <EyeIcon className="me-2 size-3.5" />
                      Inspect Details
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    variant="destructive"
                    onClick={() =>
                      setReportModal({ type: "delete", data: row.original })
                    }
                    className="flex cursor-pointer items-center text-destructive focus:bg-destructive/10 focus:text-destructive"
                  >
                    <Trash2Icon className="me-2 size-3.5" />
                    Delete Report
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          ),
          enableHiding: false,
        }),
      ]),
    [locale ]
  )

  const table = useTable({
    features,
    data: filteredData,
    columns,
    state: {
      sorting,
      columnVisibility,
      columnFilters,
      pagination,
    },
    getRowId: (row) => row.id,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onPaginationChange: setPagination,
  })

  return (
    <div className="flex w-full flex-col justify-start gap-4">
      <div className="flex w-full items-center gap-2">
        <div className="relative min-w-0 flex-1">
          <SearchIcon className="absolute inset-s-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search reports..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value)
              table.setPageIndex(0)
            }}
            className="h-8 w-full ps-8 pe-8 text-xs"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => {
                setSearchQuery("")
                table.setPageIndex(0)
              }}
              className="absolute inset-e-2 top-1/2 -translate-y-1/2 cursor-pointer text-muted-foreground hover:text-foreground"
            >
              <XIcon className="size-3.5" />
            </button>
          )}
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <div className="block sm:hidden">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  className="size-8"
                  title="Filter"
                >
                  <FilterIcon className="size-3.5" />
                  <span className="sr-only">Filter</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-36 text-xs">
                <DropdownMenuItem
                  onClick={() => {
                    setCurrentTab("all")
                    table.setPageIndex(0)
                  }}
                  className="flex cursor-pointer items-center justify-between"
                >
                  <span>All</span>
                  <Badge variant="secondary" className="px-1 py-0 text-[10px]">
                    {data.length}
                  </Badge>
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => {
                    setCurrentTab("pending")
                    table.setPageIndex(0)
                  }}
                  className="flex cursor-pointer items-center justify-between"
                >
                  <span>Pending</span>
                  <Badge variant="secondary" className="px-1 py-0 text-[10px]">
                    {pendingCount}
                  </Badge>
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => {
                    setCurrentTab("under_review")
                    table.setPageIndex(0)
                  }}
                  className="flex cursor-pointer items-center justify-between"
                >
                  <span>Review</span>
                  <Badge variant="secondary" className="px-1 py-0 text-[10px]">
                    {reviewCount}
                  </Badge>
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => {
                    setCurrentTab("resolved")
                    table.setPageIndex(0)
                  }}
                  className="flex cursor-pointer items-center justify-between"
                >
                  <span>Resolved</span>
                  <Badge variant="secondary" className="px-1 py-0 text-[10px]">
                    {resolvedCount}
                  </Badge>
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => {
                    setCurrentTab("dismissed")
                    table.setPageIndex(0)
                  }}
                  className="flex cursor-pointer items-center justify-between"
                >
                  <span>Dismissed</span>
                  <Badge variant="secondary" className="px-1 py-0 text-[10px]">
                    {dismissedCount}
                  </Badge>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <div className="hidden h-8 items-center overflow-hidden rounded-md border border-input bg-background p-0.5 sm:inline-flex">
            <button
              type="button"
              onClick={() => {
                setCurrentTab("all")
                table.setPageIndex(0)
              }}
              className={`inline-flex h-full items-center justify-center rounded-sm px-2.5 text-xs font-medium transition-colors ${
                currentTab === "all"
                  ? "bg-muted font-semibold text-foreground"
                  : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
              }`}
            >
              All
              <Badge
                variant="secondary"
                className="ms-1.5 px-1.5 py-0 text-[10px]"
              >
                {data.length}
              </Badge>
            </button>

            <button
              type="button"
              onClick={() => {
                setCurrentTab("pending")
                table.setPageIndex(0)
              }}
              className={`inline-flex h-full items-center justify-center rounded-sm px-2.5 text-xs font-medium transition-colors ${
                currentTab === "pending"
                  ? "bg-muted font-semibold text-foreground"
                  : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
              }`}
            >
              Pending
              <Badge
                variant="secondary"
                className="ms-1.5 px-1.5 py-0 text-[10px]"
              >
                {pendingCount}
              </Badge>
            </button>

            <button
              type="button"
              onClick={() => {
                setCurrentTab("under_review")
                table.setPageIndex(0)
              }}
              className={`inline-flex h-full items-center justify-center rounded-sm px-2.5 text-xs font-medium transition-colors ${
                currentTab === "under_review"
                  ? "bg-muted font-semibold text-foreground"
                  : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
              }`}
            >
              Review
              <Badge
                variant="secondary"
                className="ms-1.5 px-1.5 py-0 text-[10px]"
              >
                {reviewCount}
              </Badge>
            </button>

            <button
              type="button"
              onClick={() => {
                setCurrentTab("resolved")
                table.setPageIndex(0)
              }}
              className={`inline-flex h-full items-center justify-center rounded-sm px-2.5 text-xs font-medium transition-colors ${
                currentTab === "resolved"
                  ? "bg-muted font-semibold text-foreground"
                  : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
              }`}
            >
              Resolved
              <Badge
                variant="secondary"
                className="ms-1.5 px-1.5 py-0 text-[10px]"
              >
                {resolvedCount}
              </Badge>
            </button>

            <button
              type="button"
              onClick={() => {
                setCurrentTab("dismissed")
                table.setPageIndex(0)
              }}
              className={`inline-flex h-full items-center justify-center rounded-sm px-2.5 text-xs font-medium transition-colors ${
                currentTab === "dismissed"
                  ? "bg-muted font-semibold text-foreground"
                  : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
              }`}
            >
              Dismissed
              <Badge
                variant="secondary"
                className="ms-1.5 px-1.5 py-0 text-[10px]"
              >
                {dismissedCount}
              </Badge>
            </button>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                className="size-8"
                title="Filter by Type"
              >
                <ListFilterIcon className="size-3.5" />
                <span className="sr-only">Filter by Type</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40 text-xs">
              <DropdownMenuItem
                onClick={() => {
                  setTargetTypeFilter("all")
                  table.setPageIndex(0)
                }}
                className="flex cursor-pointer items-center justify-between"
              >
                <span>All Types</span>
                {targetTypeFilter === "all" && (
                  <span className="font-bold text-primary">✓</span>
                )}
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => {
                  setTargetTypeFilter("product")
                  table.setPageIndex(0)
                }}
                className="flex cursor-pointer items-center justify-between"
              >
                <span>Product</span>
                {targetTypeFilter === "product" && (
                  <span className="font-bold text-primary">✓</span>
                )}
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => {
                  setTargetTypeFilter("review")
                  table.setPageIndex(0)
                }}
                className="flex cursor-pointer items-center justify-between"
              >
                <span>Review</span>
                {targetTypeFilter === "review" && (
                  <span className="font-bold text-primary">✓</span>
                )}
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => {
                  setTargetTypeFilter("technical_issue")
                  table.setPageIndex(0)
                }}
                className="flex cursor-pointer items-center justify-between"
              >
                <span>Issue</span>
                {targetTypeFilter === "technical_issue" && (
                  <span className="font-bold text-primary">✓</span>
                )}
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => {
                  setTargetTypeFilter("general")
                  table.setPageIndex(0)
                }}
                className="flex cursor-pointer items-center justify-between"
              >
                <span>General</span>
                {targetTypeFilter === "general" && (
                  <span className="font-bold text-primary">✓</span>
                )}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                className="size-8"
                title="Toggle Columns"
              >
                <Columns3Icon className="size-3.5" />
                <span className="sr-only">Toggle Columns</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40">
              {table
                .getAllColumns()
                .filter(
                  (col) =>
                    typeof col.accessorFn !== "undefined" && col.getCanHide()
                )
                .map((col) => (
                  <DropdownMenuCheckboxItem
                    key={col.id}
                    checked={col.getIsVisible()}
                    onCheckedChange={(value) => col.toggleVisibility(!!value)}
                  >
                    {columnLabelsMap[col.id] || col.id}
                  </DropdownMenuCheckboxItem>
                ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <div className="w-full overflow-hidden rounded-xl border border-border bg-card shadow-xs">
        <div className="overflow-x-auto">
          <Table className="w-full">
            <TableHeader className="bg-muted/40">
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <TableHead
                      key={header.id}
                      colSpan={header.colSpan}
                      className="text-xs font-medium text-muted-foreground"
                    >
                      {header.isPlaceholder ? null : (
                        <FlexRender header={header} />
                      )}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow
                    key={row.id}
                    className="transition-colors hover:bg-muted/20"
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id}>
                        <FlexRender cell={cell} />
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={columns.length}
                    className="h-24 text-center text-xs text-muted-foreground"
                  >
                    No reports found matching your search.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      <div className="flex items-center justify-between px-1">
        <div className="flex w-full items-center gap-8 lg:w-fit">
          <div className="hidden items-center gap-2 lg:flex">
            <Label htmlFor="rows-per-page" className="text-xs font-medium">
              Rows per page
            </Label>
            <Select
              value={`${table.state.pagination.pageSize}`}
              onValueChange={(value) => table.setPageSize(Number(value))}
            >
              <SelectTrigger
                size="sm"
                className="h-8 w-20 text-xs"
                id="rows-per-page"
              >
                <SelectValue placeholder={table.state.pagination.pageSize} />
              </SelectTrigger>
              <SelectContent side="top">
                <SelectGroup>
                  {[10, 20, 30, 40, 50].map((pageSize) => (
                    <SelectItem
                      key={pageSize}
                      value={`${pageSize}`}
                      className="text-xs"
                    >
                      {pageSize}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
          <div className="text-xs font-medium text-muted-foreground">
            Page {table.state.pagination.pageIndex + 1} of{" "}
            {table.getPageCount() || 1}
          </div>
          <div className="ms-auto flex items-center gap-2 lg:ms-0">
            <Button
              variant="outline"
              className="hidden h-8 w-8 p-0 lg:flex"
              onClick={() => table.setPageIndex(0)}
              disabled={!table.getCanPreviousPage()}
            >
              <ChevronsLeftIcon className="size-4" />
            </Button>
            <Button
              variant="outline"
              className="size-8"
              size="icon"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
            >
              <ChevronLeftIcon className="size-4" />
            </Button>
            <Button
              variant="outline"
              className="size-8"
              size="icon"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
            >
              <ChevronRightIcon className="size-4" />
            </Button>
            <Button
              variant="outline"
              className="hidden size-8 lg:flex"
              size="icon"
              onClick={() => table.setPageIndex(table.getPageCount() - 1)}
              disabled={!table.getCanNextPage()}
            >
              <ChevronsRightIcon className="size-4" />
            </Button>
          </div>
        </div>
      </div>

      <DeleteReportDialog
        isOpen={reportModal.type === "delete" ? "delete" : null}
        item={reportModal.data}
        onOpenChange={(open) => {
          if (!open) setReportModal({ type: null, data: null })
        }}
        onSuccess={(deletedId) => {
          setData((prev) => prev.filter((item) => item.id !== deletedId))
        }}
      />
    </div>
  )
}
