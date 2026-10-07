"use client"

import * as React from "react"
import Link from "next/link"
import { useParams } from "next/navigation"
import { useTransition } from "react"
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
  CalendarIcon,
  ClockIcon,
  ExternalLinkIcon,
  EllipsisVerticalIcon,
  PackageIcon,
  PencilIcon,
  SearchIcon,
  Trash2Icon,
  CircleCheckIcon,
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

import { toggleFlashSaleStatus } from "@/lib/actions/flash-sales/mutations/toggle-status"
import { deleteFlashSale } from "@/lib/actions/flash-sales/mutations/delete"
import { AdminFlashSaleItem } from "@/lib/actions/flash-sales"
import { appRoutes } from "@/lib/config/app-routes"

const features = tableFeatures({
  columnFilteringFeature,
  columnVisibilityFeature,
  rowPaginationFeature,
  rowSortingFeature,
  filteredRowModel: createFilteredRowModel(),
  paginatedRowModel: createPaginatedRowModel(),
  sortedRowModel: createSortedRowModel(),
})

const columnHelper = createColumnHelper<typeof features, AdminFlashSaleItem>()

const HIDEABLE_COLUMNS = ["status", "duration", "item_count", "is_active"]

const columnLabelsMap: Record<string, string> = {
  title: "Campaign",
  status: "Status",
  duration: "Duration",
  item_count: "Products",
  is_active: "Active",
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

interface FlashSalesTableProps {
  sales: AdminFlashSaleItem[]
  initialIsMobile?: boolean
}

export function FlashSalesTable({
  sales: initialData,
  initialIsMobile = false,
}: FlashSalesTableProps) {
  const [data, setData] = React.useState(() => initialData)
  const [prevInitialData, setPrevInitialData] = React.useState(initialData)
  const [currentTab, setCurrentTab] = React.useState<string>("all")
  const [searchQuery, setSearchQuery] = React.useState("")
  const [isPending, startTransition] = useTransition()
  const params = useParams()
  const locale = (params?.locale as string) || "en"

  if (initialData !== prevInitialData) {
    setPrevInitialData(initialData)
    setData(initialData)
  }

  const handleToggle = (id: string, currentActive: boolean) => {
    startTransition(async () => {
      await toggleFlashSaleStatus(id, !currentActive)
      setData((prev) =>
        prev.map((item) =>
          item.id === id ? { ...item, is_active: !currentActive } : item
        )
      )
    })
  }

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this flash sale?")) {
      startTransition(async () => {
        await deleteFlashSale(id)
        setData((prev) => prev.filter((item) => item.id !== id))
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

  const getStatusBadge = (status: AdminFlashSaleItem["status"]) => {
    switch (status) {
      case "active":
        return (
          <Badge
            variant="outline"
            className="gap-1 border-emerald-500/30 px-2 py-0.5 text-xs text-emerald-600 dark:text-emerald-400"
          >
            <span className="size-1.5 animate-pulse rounded-full bg-emerald-500" />
            Active
          </Badge>
        )
      case "scheduled":
        return (
          <Badge
            variant="outline"
            className="gap-1 border-blue-500/30 px-2 py-0.5 text-xs text-blue-600 dark:text-blue-400"
          >
            <ClockIcon className="size-3" />
            Scheduled
          </Badge>
        )
      case "expired":
        return (
          <Badge
            variant="outline"
            className="gap-1 px-2 py-0.5 text-xs text-muted-foreground"
          >
            <CircleXIcon className="size-3 fill-muted-foreground text-background" />
            Expired
          </Badge>
        )
      case "disabled":
        return (
          <Badge
            variant="outline"
            className="gap-1 border-amber-500/30 px-2 py-0.5 text-xs text-amber-600 dark:text-amber-400"
          >
            Disabled
          </Badge>
        )
    }
  }

  const columns = React.useMemo(
    () =>
      columnHelper.columns([
        columnHelper.accessor("title", {
          id: "title",
          header: "Campaign",
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
          enableHiding: false,
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
          id: "duration",
          header: "Duration",
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
        }),

        columnHelper.accessor("item_count", {
          id: "item_count",
          header: () => <div className="text-center">Products</div>,
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
        }),

        columnHelper.accessor("is_active", {
          id: "is_active",
          header: () => <div className="text-center">Active</div>,
          cell: ({ row }) => (
            <div className="flex justify-center">
              <Switch
                checked={row.original.is_active}
                disabled={isPending}
                onCheckedChange={() =>
                  handleToggle(row.original.id, row.original.is_active)
                }
                aria-label="Toggle flash sale status"
              />
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
                      href={`${appRoutes.dashboard.admin.flashSales}/${row.original.id}/edit`}
                      className="flex cursor-pointer items-center"
                    >
                      <PencilIcon className="me-2 size-3.5" />
                      Edit Campaign
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link
                      href={`/${locale}/deals/${row.original.slug}`}
                      target="_blank"
                      className="flex cursor-pointer items-center"
                    >
                      <ExternalLinkIcon className="me-2 size-3.5" />
                      View Page
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    variant="destructive"
                    onClick={() => handleDelete(row.original.id)}
                    className="flex cursor-pointer items-center text-destructive focus:bg-destructive/10 focus:text-destructive"
                  >
                    <Trash2Icon className="me-2 size-3.5" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          ),
          enableHiding: false,
        }),
      ]),
    [isPending, locale]
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
            placeholder="Search campaigns..."
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
                    setCurrentTab("active")
                    table.setPageIndex(0)
                  }}
                  className="flex cursor-pointer items-center justify-between"
                >
                  <span>Active</span>
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
                  <span>Scheduled</span>
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
                  <span>Expired</span>
                  <Badge variant="secondary" className="px-1 py-0 text-[10px]">
                    {expiredCount}
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
                setCurrentTab("active")
                table.setPageIndex(0)
              }}
              className={`inline-flex h-full items-center justify-center rounded-sm px-2.5 text-xs font-medium transition-colors ${
                currentTab === "active"
                  ? "bg-muted font-semibold text-foreground"
                  : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
              }`}
            >
              Active
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
                  ? "bg-muted font-semibold text-foreground"
                  : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
              }`}
            >
              Scheduled
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
                  ? "bg-muted font-semibold text-foreground"
                  : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
              }`}
            >
              Expired
              <Badge
                variant="secondary"
                className="ms-1.5 px-1.5 py-0 text-[10px]"
              >
                {expiredCount}
              </Badge>
            </button>
          </div>

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

          <Link href={appRoutes.dashboard.admin.create_flashSales}>
            <Button
              variant="default"
              size="icon"
              className="size-8 sm:hidden"
              title="Create Flash Sale"
            >
              <PlusIcon className="size-3.5" />
              <span className="sr-only">Create Flash Sale</span>
            </Button>
            <Button
              variant="default"
              size="sm"
              className="hidden h-8 gap-1.5 px-3 text-xs sm:inline-flex"
            >
              <PlusIcon className="size-3.5" />
              <span>Create Flash Sale</span>
            </Button>
          </Link>
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
                    No flash sales found matching your search.
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
    </div>
  )
}
