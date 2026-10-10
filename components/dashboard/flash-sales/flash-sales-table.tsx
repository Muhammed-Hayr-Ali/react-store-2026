"use client"

/**
 * @file components/dashboard/flash-sales/flash-sales-table.tsx
 * @description Standard TanStack Table v8 implementation for flash sales management.
 * Compliant with React 19, RTL-first layout, dynamic mobile column isolation,
 * permission gating via <Can />, and zero hallucinated table APIs.
 */

import * as React from "react"
import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
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
  CalendarIcon,
  ClockIcon,
  ExternalLinkIcon,
  MoreHorizontalIcon,
  PackageIcon,
  PencilIcon,
  SearchIcon,
  Trash2Icon,
  CircleXIcon,
  XIcon,
  Columns3Icon,
  ChevronsLeftIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronsRightIcon,
  FilterIcon,
  PlusIcon,
  ZapIcon,
} from "lucide-react"
import { toast } from "sonner"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
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
import { toggleFlashSaleStatus } from "@/lib/actions/flash-sales/mutations/toggle-status"
import { deleteFlashSale } from "@/lib/actions/flash-sales/mutations/delete"
import type { AdminFlashSaleItem } from "@/lib/actions/flash-sales"
import { appRoutes } from "@/lib/config/app-routes"

const HIDEABLE_COLUMNS = ["status", "duration", "item_count", "is_active"]

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

interface FlashSalesTableProps {
  sales: AdminFlashSaleItem[]
  initialIsMobile?: boolean
}

export function FlashSalesTable({
  sales: initialData,
  initialIsMobile = false,
}: FlashSalesTableProps) {
  const t = useTranslations("FlashSalesManagement")
  const isMobile = useIsMobile()
  const router = useRouter()
  const params = useParams()
  const locale = (params?.locale as string) || "en"

  const [data, setData] = React.useState<AdminFlashSaleItem[]>(initialData)
  const [currentTab, setCurrentTab] = React.useState<string>("all")
  const [searchQuery, setSearchQuery] = React.useState("")
  const [isPending, startTransition] = React.useTransition()

  // مزامنة حالة البيانات عند تحديث props الصفحة عبر router.refresh()
  React.useEffect(() => {
    setData(initialData)
  }, [initialData])

  const handleToggle = (id: string, currentActive: boolean) => {
    const nextStatus = !currentActive
    setData((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, is_active: nextStatus } : item
      )
    )

    startTransition(async () => {
      const res = await toggleFlashSaleStatus(id, nextStatus)
      if (res.success) {
        toast.success(t("STATUS_UPDATED_SUCCESS"))
        router.refresh()
      } else {
        setData((prev) =>
          prev.map((item) =>
            item.id === id ? { ...item, is_active: currentActive } : item
          )
        )
        toast.error(res.error || t("FAILED_TO_UPDATE_STATUS"))
      }
    })
  }

  const handleDelete = (id: string) => {
    if (confirm(t("DELETE_CONFIRM"))) {
      startTransition(async () => {
        const res = await deleteFlashSale(id)
        if (res.success) {
          setData((prev) => prev.filter((item) => item.id !== id))
          toast.success(t("STATUS_DELETED_SUCCESS"))
          router.refresh()
        } else {
          toast.error(res.error || t("FAILED_TO_DELETE"))
        }
      })
    }
  }

  const filteredData = React.useMemo(() => {
    return data.filter((item) => {
      const matchesTab = currentTab === "all" || item.status === currentTab
      if (!matchesTab) return false

      if (!searchQuery.trim()) return true
      const q = searchQuery.toLowerCase().trim()
      const title = (item.title || "").toLowerCase()
      const titleAr = (item.title_ar || "").toLowerCase()
      const slug = (item.slug || "").toLowerCase()

      return title.includes(q) || titleAr.includes(q) || slug.includes(q)
    })
  }, [data, currentTab, searchQuery])

  const activeCount = React.useMemo(
    () => data.filter((s) => s.status === "active").length,
    [data]
  )
  const scheduledCount = React.useMemo(
    () => data.filter((s) => s.status === "scheduled").length,
    [data]
  )
  const expiredCount = React.useMemo(
    () => data.filter((s) => s.status === "expired").length,
    [data]
  )

  // عزل رؤية الأعمدة على الجوال وفق وثيقة المعايير
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

  const getStatusBadge = (status: AdminFlashSaleItem["status"]) => {
    switch (status) {
      case "active":
        return (
          <Badge
            variant="outline"
            className="gap-1 border-emerald-500/30 px-2 py-0.5 text-xs text-emerald-600 dark:text-emerald-400"
          >
            <span className="size-1.5 animate-pulse rounded-full bg-emerald-500" />
            {t("STATUS_ACTIVE")}
          </Badge>
        )
      case "scheduled":
        return (
          <Badge
            variant="outline"
            className="gap-1 border-blue-500/30 px-2 py-0.5 text-xs text-blue-600 dark:text-blue-400"
          >
            <ClockIcon className="size-3" />
            {t("STATUS_SCHEDULED")}
          </Badge>
        )
      case "expired":
        return (
          <Badge
            variant="outline"
            className="gap-1 px-2 py-0.5 text-xs text-muted-foreground"
          >
            <CircleXIcon className="size-3 fill-muted-foreground text-background" />
            {t("STATUS_EXPIRED")}
          </Badge>
        )
      case "disabled":
        return (
          <Badge
            variant="outline"
            className="gap-1 border-amber-500/30 px-2 py-0.5 text-xs text-amber-600 dark:text-amber-400"
          >
            {t("STATUS_DISABLED")}
          </Badge>
        )
    }
  }

  // تعريف الأعمدة وفق TanStack Table v8 المعياري الصارم
  const columns = React.useMemo<ColumnDef<AdminFlashSaleItem>[]>(
    () => [
      // 1. First Column: Identifier (Pinned Visible)
      {
        id: "title",
        accessorKey: "title",
        enableHiding: false,
        header: t("COLUMN_CAMPAIGN"),
        cell: ({ row }) => (
          <div className="flex items-center gap-2.5">
            <div className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-secondary text-foreground">
              <ZapIcon className="size-3.5 text-amber-500" />
            </div>
            <div className="flex max-w-xs min-w-0 flex-col sm:max-w-md">
              <Link
                href={`${appRoutes.dashboard.admin.flashSales}/${row.original.id}/edit`}
                className="truncate text-xs font-semibold text-foreground transition-colors hover:text-primary hover:underline"
              >
                {row.original.title}
              </Link>
              <span className="truncate font-mono text-[11px] text-muted-foreground">
                /{row.original.slug}
              </span>
            </div>
          </div>
        ),
      },
      // 2. Status Badge (Hideable)
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
      // 3. Duration Window (Hideable)
      {
        id: "duration",
        enableHiding: true,
        header: t("COLUMN_DURATION"),
        cell: ({ row }) => (
          <div
            className="text-xs text-muted-foreground"
            suppressHydrationWarning
          >
            <div className="flex items-center gap-1 font-mono text-[11px]">
              <CalendarIcon className="size-3 shrink-0 text-muted-foreground" />
              <span>{formatDate(row.original.starts_at)}</span>
              <span>→</span>
              <span>{formatDate(row.original.ends_at)}</span>
            </div>
            <div className="mt-0.5 font-mono text-[10px] text-muted-foreground/70">
              {formatTime(row.original.starts_at)} -{" "}
              {formatTime(row.original.ends_at)}
            </div>
          </div>
        ),
      },
      // 4. Products Count (Hideable)
      {
        id: "item_count",
        accessorKey: "item_count",
        enableHiding: true,
        header: () => <div className="text-center">{t("COLUMN_PRODUCTS")}</div>,
        cell: ({ row }) => (
          <div className="flex justify-center">
            <Badge
              variant="outline"
              className="gap-1 px-2 py-0.5 text-xs text-foreground"
            >
              <PackageIcon className="size-3 text-muted-foreground" />
              <span>{row.original.item_count}</span>
            </Badge>
          </div>
        ),
      },
      // 5. Active Status Switch (Hideable)
      {
        id: "is_active",
        accessorKey: "is_active",
        enableHiding: true,
        header: () => <div className="text-center">{t("COLUMN_ACTIVE")}</div>,
        cell: ({ row }) => (
          <Can
            permission={PERMISSIONS.UPDATE_FLASH_SALE}
            fallback={
              <div className="flex justify-center">
                <span className="text-[11px] text-muted-foreground">
                  {row.original.is_active
                    ? t("STATUS_ACTIVE")
                    : t("STATUS_DISABLED")}
                </span>
              </div>
            }
          >
            <div className="flex justify-center">
              <Switch
                checked={row.original.is_active}
                disabled={isPending}
                onCheckedChange={() =>
                  handleToggle(row.original.id, row.original.is_active)
                }
                aria-label={t("TOGGLE_STATUS_LABEL")}
              />
            </div>
          </Can>
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
                <Can permission={PERMISSIONS.UPDATE_FLASH_SALE}>
                  <DropdownMenuItem asChild>
                    <Link
                      href={`${appRoutes.dashboard.admin.flashSales}/${row.original.id}/edit`}
                      className="flex cursor-pointer items-center"
                    >
                      <PencilIcon className="me-2 size-3.5" />
                      {t("EDIT_CAMPAIGN")}
                    </Link>
                  </DropdownMenuItem>
                </Can>
                <DropdownMenuItem asChild>
                  <Link
                    href={`/${locale}/deals/${row.original.slug}`}
                    target="_blank"
                    className="flex cursor-pointer items-center"
                  >
                    <ExternalLinkIcon className="me-2 size-3.5" />
                    {t("VIEW_PAGE")}
                  </Link>
                </DropdownMenuItem>
                <Can permission={PERMISSIONS.DELETE_FLASH_SALE}>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    variant="destructive"
                    onClick={() => handleDelete(row.original.id)}
                    className="flex cursor-pointer items-center text-destructive focus:bg-destructive/10 focus:text-destructive"
                  >
                    <Trash2Icon className="me-2 size-3.5" />
                    {t("DELETE_CAMPAIGN")}
                  </DropdownMenuItem>
                </Can>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        ),
      },
    ],
    [t, isPending, locale]
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
    title: t("COLUMN_CAMPAIGN"),
    status: t("COLUMN_STATUS"),
    duration: t("COLUMN_DURATION"),
    item_count: t("COLUMN_PRODUCTS"),
    is_active: t("COLUMN_ACTIVE"),
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
          {/* Mobile Filter Tabs */}
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
                    setCurrentTab("active")
                    table.setPageIndex(0)
                  }}
                  className="flex cursor-pointer items-center justify-between"
                >
                  <span>{t("FILTER_ACTIVE")}</span>
                  <Badge variant="secondary" className="px-1 py-0 text-[10px]">
                    {activeCount}
                  </Badge>
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => {
                    setCurrentTab("scheduled")
                    table.setPageIndex(0)
                  }}
                  className="flex cursor-pointer items-center justify-between"
                >
                  <span>{t("FILTER_SCHEDULED")}</span>
                  <Badge variant="secondary" className="px-1 py-0 text-[10px]">
                    {scheduledCount}
                  </Badge>
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => {
                    setCurrentTab("expired")
                    table.setPageIndex(0)
                  }}
                  className="flex cursor-pointer items-center justify-between"
                >
                  <span>{t("FILTER_EXPIRED")}</span>
                  <Badge variant="secondary" className="px-1 py-0 text-[10px]">
                    {expiredCount}
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
                setCurrentTab("active")
                table.setPageIndex(0)
              }}
              className={`inline-flex h-full items-center justify-center rounded-sm px-2.5 text-xs font-medium transition-colors ${
                currentTab === "active"
                  ? "bg-muted font-semibold text-foreground shadow-xs"
                  : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
              }`}
            >
              {t("FILTER_ACTIVE")}
              <Badge
                variant="secondary"
                className="ms-1.5 px-1.5 py-0 text-[10px]"
              >
                {activeCount}
              </Badge>
            </button>

            <button
              type="button"
              onClick={() => {
                setCurrentTab("scheduled")
                table.setPageIndex(0)
              }}
              className={`inline-flex h-full items-center justify-center rounded-sm px-2.5 text-xs font-medium transition-colors ${
                currentTab === "scheduled"
                  ? "bg-muted font-semibold text-foreground shadow-xs"
                  : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
              }`}
            >
              {t("FILTER_SCHEDULED")}
              <Badge
                variant="secondary"
                className="ms-1.5 px-1.5 py-0 text-[10px]"
              >
                {scheduledCount}
              </Badge>
            </button>

            <button
              type="button"
              onClick={() => {
                setCurrentTab("expired")
                table.setPageIndex(0)
              }}
              className={`inline-flex h-full items-center justify-center rounded-sm px-2.5 text-xs font-medium transition-colors ${
                currentTab === "expired"
                  ? "bg-muted font-semibold text-foreground shadow-xs"
                  : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
              }`}
            >
              {t("FILTER_EXPIRED")}
              <Badge
                variant="secondary"
                className="ms-1.5 px-1.5 py-0 text-[10px]"
              >
                {expiredCount}
              </Badge>
            </button>
          </div>

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

          {/* Action Button: Dual Mobile/Desktop Responsive CTA */}
          <Can permission={PERMISSIONS.CREATE_FLASH_SALE}>
            <Link href={appRoutes.dashboard.admin.create_flashSales}>
              <Button
                variant="default"
                size="icon"
                className="size-8 sm:hidden"
                title={t("CREATE_FLASH_SALE")}
              >
                <PlusIcon className="size-3.5" />
                <span className="sr-only">{t("CREATE_FLASH_SALE")}</span>
              </Button>
              <Button
                variant="default"
                size="sm"
                className="hidden h-8 gap-1.5 px-3 text-xs sm:inline-flex"
              >
                <PlusIcon className="size-3.5" />
                <span>{t("CREATE_FLASH_SALE")}</span>
              </Button>
            </Link>
          </Can>
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
                    {t("NO_FLASH_SALES_FOUND")}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Pagination Footer */}
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
