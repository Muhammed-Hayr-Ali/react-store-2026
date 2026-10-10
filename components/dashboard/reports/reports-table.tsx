"use client"

/**
 * @file components/dashboard/reports/reports-table.tsx
 * @description Standard TanStack Table v8 data table for admin reports and moderation.
 * Fully compliant with React 19, strict VisibilityState, uncontrolled delete dialog triggers,
 * RTL-first layout, and permission gating via <Can />.
 */

import * as React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useTranslations } from "next-intl"
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnFiltersState,
  type SortingState,
  type VisibilityState,
} from "@tanstack/react-table"
import {
  CircleCheckIcon,
  CircleXIcon,
  ClockIcon,
  EyeIcon,
  FilterIcon,
  MoreHorizontalIcon,
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
import { Can } from "@/components/shared/can"
import { PERMISSIONS } from "@/lib/actions/role"
import { useIsMobile } from "@/hooks/use-mobile"
import { appRoutes } from "@/lib/config/app-routes"

import type {
  ReportStatus,
  ReportWithDetails,
} from "@/lib/actions/reports/types"
import DeleteReportDialog from "./delete-report-dialog"

const HIDEABLE_COLUMNS = ["target_type", "status", "reporter", "created_at"]

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
  total,
  initialIsMobile = false,
}: ReportsTableProps) {
  const t = useTranslations("ReportsManagement")
  const isMobile = useIsMobile()
  const router = useRouter()

  const [data, setData] = React.useState<ReportWithDetails[]>(() => initialData)
  const [currentTab, setCurrentTab] = React.useState<string>("all")
  const [targetTypeFilter, setTargetTypeFilter] = React.useState<string>("all")
  const [searchQuery, setSearchQuery] = React.useState("")

  React.useEffect(() => {
    setData(initialData)
  }, [initialData])

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
        report.contact_email ||
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
    React.useState<VisibilityState>(() => {
      const initial: VisibilityState = {}
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
    pageSize: initialIsMobile ? 20 : 10,
  })

  React.useEffect(() => {
    setColumnVisibility((prev) => {
      const nextVisibility: VisibilityState = { ...prev }
      HIDEABLE_COLUMNS.forEach((colId) => {
        nextVisibility[colId] = !isMobile
      })
      return nextVisibility
    })

    setPagination((prev) => ({
      ...prev,
      pageSize: isMobile ? 20 : 10,
      pageIndex: 0,
    }))
  }, [isMobile])

  const getStatusBadge = (status: ReportStatus) => {
    switch (status) {
      case "pending":
        return (
          <Badge
            variant="outline"
            className="gap-1 border-destructive/30 px-2 py-0.5 text-xs text-destructive"
          >
            <span className="size-1.5 animate-pulse rounded-full bg-destructive" />
            {t("STATUS_PENDING")}
          </Badge>
        )
      case "under_review":
        return (
          <Badge
            variant="outline"
            className="gap-1 border-amber-500/30 px-2 py-0.5 text-xs text-amber-600 dark:text-amber-400"
          >
            <ClockIcon className="size-3" />
            {t("STATUS_UNDER_REVIEW")}
          </Badge>
        )
      case "resolved":
        return (
          <Badge
            variant="outline"
            className="gap-1 border-emerald-500/30 px-2 py-0.5 text-xs text-emerald-600 dark:text-emerald-400"
          >
            <CircleCheckIcon className="size-3 fill-emerald-500 text-background" />
            {t("STATUS_RESOLVED")}
          </Badge>
        )
      case "dismissed":
        return (
          <Badge
            variant="outline"
            className="gap-1 px-2 py-0.5 text-xs text-muted-foreground"
          >
            <CircleXIcon className="size-3 fill-muted-foreground text-background" />
            {t("STATUS_DISMISSED")}
          </Badge>
        )
    }
  }

  const columns = React.useMemo<ColumnDef<ReportWithDetails>[]>(
    () => [
      // 1. First Column: Reported Item Identifier (Pinned Visible)
      {
        id: "reason",
        accessorKey: "reason",
        enableHiding: false,
        header: t("COLUMN_REPORTED_ITEM"),
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
                  {report.details || t("NO_DETAILS_PROVIDED")}
                </span>
              </div>
            </div>
          )
        },
      },
      // 2. Target Type (Hideable)
      {
        id: "target_type",
        accessorKey: "target_type",
        enableHiding: true,
        header: t("COLUMN_TYPE"),
        cell: ({ row }) => (
          <Badge
            variant="outline"
            className="px-2 py-0.5 text-xs text-muted-foreground capitalize"
          >
            {row.original.target_type.replace("_", " ")}
          </Badge>
        ),
      },
      // 3. Moderation Status (Hideable)
      {
        id: "status",
        accessorKey: "status",
        enableHiding: true,
        header: () => <div className="text-center">{t("COLUMN_STATUS")}</div>,
        cell: ({ row }) => (
          <div className="flex justify-center">
            {getStatusBadge(row.original.status)}
          </div>
        ),
      },
      // 4. Reporter Profile (Hideable)
      {
        id: "reporter",
        enableHiding: true,
        header: t("COLUMN_REPORTER"),
        cell: ({ row }) => {
          const reporter = row.original.reporter
          const fullName = [reporter?.first_name, reporter?.last_name]
            .filter(Boolean)
            .join(" ")
          const email = reporter?.email || row.original.contact_email || ""

          return (
            <div className="flex items-center gap-2">
              <div className="flex size-6 shrink-0 items-center justify-center rounded-full bg-secondary text-muted-foreground">
                <UserIcon className="size-3" />
              </div>
              <div className="flex min-w-0 flex-col">
                <span className="truncate text-xs font-medium text-foreground">
                  {fullName || t("GUEST_USER")}
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
      },
      // 5. Submitted At (Hideable)
      {
        id: "created_at",
        accessorKey: "created_at",
        enableHiding: true,
        header: t("COLUMN_SUBMITTED"),
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
      },
      // 6. Last Column: Actions Dropdown (Pinned Visible)
      {
        id: "actions",
        enableHiding: false,
        cell: ({ row }) => (
          <div className="flex items-center justify-end">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="flex size-7 text-muted-foreground data-[state=open]:bg-muted"
                >
                  <MoreHorizontalIcon className="size-4" />
                  <span className="sr-only">{t("ACTIONS_LABEL")}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-44 text-xs">
                <DropdownMenuItem asChild>
                  <Link
                    href={`${appRoutes.dashboard.admin.reports}/${row.original.id}`}
                    className="flex cursor-pointer items-center"
                  >
                    <EyeIcon className="me-2 size-3.5" />
                    {t("INSPECT_DETAILS")}
                  </Link>
                </DropdownMenuItem>

                <Can permission={PERMISSIONS.DELETE_REPORT}>
                  <DeleteReportDialog
                    reportId={row.original.id}
                    reportReason={row.original.reason}
                    onDeleted={(deletedId) => {
                      setData((prev) =>
                        prev.filter((item) => item.id !== deletedId)
                      )
                      router.refresh()
                    }}
                  >
                    <DropdownMenuItem
                      onSelect={(e) => e.preventDefault()}
                      className="cursor-pointer text-destructive focus:bg-destructive/10 focus:text-destructive"
                    >
                      <Trash2Icon className="me-2 size-3.5" />
                      <span>{t("DELETE_REPORT")}</span>
                    </DropdownMenuItem>
                  </DeleteReportDialog>
                </Can>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        ),
      },
    ],
    [t, router]
  )

  const table = useReactTable({
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
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  })

  const columnLabelsMap: Record<string, string> = {
    reason: t("COLUMN_REPORTED_ITEM"),
    target_type: t("COLUMN_TYPE"),
    status: t("COLUMN_STATUS"),
    reporter: t("COLUMN_REPORTER"),
    created_at: t("COLUMN_SUBMITTED"),
  }

  return (
    <div className="flex w-full flex-col justify-start gap-4">
      {/* Interactive Toolbar */}
      <div className="flex w-full items-center gap-2">
        {/* Search Input */}
        <div className="relative min-w-0 flex-1">
          <SearchIcon className="absolute inset-s-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder={t("SEARCH_PLACEHOLDER")}
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
              <span className="sr-only">{t("CLEAR_SEARCH")}</span>
            </button>
          )}
        </div>

        <div className="flex shrink-0 items-center gap-2">
          {/* Mobile Filter Dropdown */}
          <div className="block sm:hidden">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  className="size-8"
                  title={t("FILTER_BUTTON")}
                >
                  <FilterIcon className="size-3.5" />
                  <span className="sr-only">{t("FILTER_BUTTON")}</span>
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
                  <span>{t("FILTER_ALL")}</span>
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
                  <span>{t("FILTER_PENDING")}</span>
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
                  <span>{t("FILTER_REVIEW")}</span>
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
                  <span>{t("FILTER_RESOLVED")}</span>
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
                  <span>{t("FILTER_DISMISSED")}</span>
                  <Badge variant="secondary" className="px-1 py-0 text-[10px]">
                    {dismissedCount}
                  </Badge>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Desktop Filter Pills */}
          <div className="hidden h-8 items-center overflow-hidden rounded-md border border-input bg-background p-0.5 sm:inline-flex">
            <button
              type="button"
              onClick={() => {
                setCurrentTab("all")
                table.setPageIndex(0)
              }}
              className={`inline-flex h-full items-center justify-center rounded-sm px-2.5 text-xs font-medium transition-colors ${
                currentTab === "all"
                  ? "bg-muted font-semibold text-foreground shadow-xs"
                  : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
              }`}
            >
              {t("FILTER_ALL")}
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
                  ? "bg-muted font-semibold text-foreground shadow-xs"
                  : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
              }`}
            >
              {t("FILTER_PENDING")}
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
                  ? "bg-muted font-semibold text-foreground shadow-xs"
                  : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
              }`}
            >
              {t("FILTER_REVIEW")}
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
                  ? "bg-muted font-semibold text-foreground shadow-xs"
                  : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
              }`}
            >
              {t("FILTER_RESOLVED")}
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
                  ? "bg-muted font-semibold text-foreground shadow-xs"
                  : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
              }`}
            >
              {t("FILTER_DISMISSED")}
              <Badge
                variant="secondary"
                className="ms-1.5 px-1.5 py-0 text-[10px]"
              >
                {dismissedCount}
              </Badge>
            </button>
          </div>

          {/* Target Type Filter Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                className="size-8"
                title={t("FILTER_TYPE_TITLE")}
              >
                <ListFilterIcon className="size-3.5" />
                <span className="sr-only">{t("FILTER_TYPE_TITLE")}</span>
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
                <span>{t("FILTER_TYPE_ALL")}</span>
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
                <span>{t("FILTER_TYPE_PRODUCT")}</span>
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
                <span>{t("FILTER_TYPE_REVIEW")}</span>
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
                <span>{t("FILTER_TYPE_ISSUE")}</span>
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
                <span>{t("FILTER_TYPE_GENERAL")}</span>
                {targetTypeFilter === "general" && (
                  <span className="font-bold text-primary">✓</span>
                )}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Column Visibility Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                className="size-8"
                title={t("TOGGLE_COLUMNS")}
              >
                <Columns3Icon className="size-3.5" />
                <span className="sr-only">{t("TOGGLE_COLUMNS")}</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40 text-xs">
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
                    onCheckedChange={(value) =>
                      col.toggleVisibility(Boolean(value))
                    }
                  >
                    {columnLabelsMap[col.id] || col.id}
                  </DropdownMenuCheckboxItem>
                ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Table Shell */}
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
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
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
                      <TableCell key={cell.id} className="py-2.5">
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
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
                    {t("NO_REPORTS_FOUND")}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Standard Pagination Footer */}
      <div className="flex flex-col items-center justify-between gap-3 px-1 sm:flex-row">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Label htmlFor="rows-per-page" className="text-xs font-medium">
            {t("ROWS_PER_PAGE")}
          </Label>
          <Select
            value={`${table.getState().pagination.pageSize}`}
            onValueChange={(value) => table.setPageSize(Number(value))}
          >
            <SelectTrigger
              size="sm"
              className="h-8 w-18 text-xs"
              id="rows-per-page"
            >
              <SelectValue placeholder={table.getState().pagination.pageSize} />
            </SelectTrigger>
            <SelectContent side="top" className="text-xs">
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
          <span className="ms-2">
            {t("PAGE_COUNTER", {
              page: table.getState().pagination.pageIndex + 1,
              total: table.getPageCount() || 1,
            })}
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          <Button
            variant="outline"
            className="hidden size-8 p-0 sm:flex"
            onClick={() => table.setPageIndex(0)}
            disabled={!table.getCanPreviousPage()}
            title={t("FIRST_PAGE")}
          >
            <ChevronsLeftIcon className="size-4 rtl:rotate-180" />
            <span className="sr-only">{t("FIRST_PAGE")}</span>
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="size-8"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
            title={t("PREVIOUS_PAGE")}
          >
            <ChevronLeftIcon className="size-4 rtl:rotate-180" />
            <span className="sr-only">{t("PREVIOUS_PAGE")}</span>
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="size-8"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
            title={t("NEXT_PAGE")}
          >
            <ChevronRightIcon className="size-4 rtl:rotate-180" />
            <span className="sr-only">{t("NEXT_PAGE")}</span>
          </Button>
          <Button
            variant="outline"
            className="hidden size-8 sm:flex"
            size="icon"
            onClick={() => table.setPageIndex(table.getPageCount() - 1)}
            disabled={!table.getCanNextPage()}
            title={t("LAST_PAGE")}
          >
            <ChevronsRightIcon className="size-4 rtl:rotate-180" />
            <span className="sr-only">{t("LAST_PAGE")}</span>
          </Button>
        </div>
      </div>
    </div>
  )
}
