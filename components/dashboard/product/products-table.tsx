"use client"

/**
 * @file components/dashboard/product/products-table.tsx
 * @description Standard TanStack Table v8 data table for admin product catalog management.
 * Fully compliant with React 19, strict VisibilityState, uncontrolled delete dialogs,
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
import { toast } from "sonner"
import {
  CircleCheckIcon,
  CircleXIcon,
  MoreHorizontalIcon,
  Columns3Icon,
  ChevronsLeftIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronsRightIcon,
  ExternalLinkIcon,
  Trash2Icon,
  PencilIcon,
  CopyIcon,
  LinkIcon,
  SearchIcon,
  XIcon,
  FilterIcon,
  PlusIcon,
  PackageIcon,
} from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
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
import { appRoutes } from "@/lib/config/app-routes"

import type { AdminProductSummary } from "@/lib/actions/products/types"
import { duplicateProduct } from "@/lib/actions/products/mutations/duplicate"
import DeleteProductDialog from "./delete-product-dialog"

const HIDEABLE_COLUMNS = [
  "category_name",
  "brand_name",
  "variants_count",
  "total_stock",
  "price_range",
  "is_active",
]

interface ProductsTableProps {
  data: AdminProductSummary[]
  initialIsMobile?: boolean
}

export function ProductsTable({
  data: initialData,
  initialIsMobile = false,
}: ProductsTableProps) {
  const t = useTranslations("ProductsManagement")
  const isMobile = useIsMobile()
  const router = useRouter()

  const [data, setData] = React.useState<AdminProductSummary[]>(
    () => initialData
  )
  const [currentTab, setCurrentTab] = React.useState<
    "all" | "active" | "low-stock"
  >("all")
  const [searchQuery, setSearchQuery] = React.useState("")

  // مزامنة حالة البيانات عند تحديث props الصفحة
  React.useEffect(() => {
    setData(initialData)
  }, [initialData])

  const filteredData = React.useMemo(() => {
    return data.filter((item) => {
      if (currentTab === "active" && !item.is_active) return false
      if (currentTab === "low-stock" && item.total_stock > 10) return false

      if (!searchQuery.trim()) return true
      const q = searchQuery.toLowerCase().trim()
      const name = (item.name || "").toLowerCase()
      const category = (item.category_name || "").toLowerCase()
      const brand = (item.brand_name || "").toLowerCase()
      const slug = (item.slug || "").toLowerCase()

      return (
        name.includes(q) ||
        category.includes(q) ||
        brand.includes(q) ||
        slug.includes(q)
      )
    })
  }, [data, currentTab, searchQuery])

  const activeCount = React.useMemo(
    () => data.filter((item) => item.is_active).length,
    [data]
  )
  const lowStockCount = React.useMemo(
    () => data.filter((item) => item.total_stock <= 10).length,
    [data]
  )

  // ضبط عزل الأعمدة للجوال وفق VisibilityState المعياري
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>(() => {
      const initialVisibility: VisibilityState = {}
      HIDEABLE_COLUMNS.forEach((colId) => {
        initialVisibility[colId] = !initialIsMobile
      })
      return initialVisibility
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

  // بناء الأعمدة عبر TanStack Table v8 المعياري
  const columns = React.useMemo<ColumnDef<AdminProductSummary>[]>(
    () => [
      // 1. First Column: Identifier & Slug (Pinned Visible)
      {
        id: "name",
        accessorKey: "name",
        enableHiding: false,
        header: t("COLUMN_PRODUCT"),
        cell: ({ row }) => {
          const product = row.original
          return (
            <div className="flex items-center gap-2.5">
              <div className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-secondary text-foreground">
                <PackageIcon className="size-3.5 text-primary" />
              </div>
              <div className="flex max-w-xs min-w-0 flex-col sm:max-w-md">
                <Can
                  permission={PERMISSIONS.UPDATE_PRODUCT}
                  fallback={
                    <span className="truncate text-xs font-semibold text-foreground">
                      {product.name}
                    </span>
                  }
                >
                  <Link
                    href={`${appRoutes.dashboard.admin.products}/${product.slug}/edit`}
                    className="truncate text-xs font-semibold text-foreground transition-colors hover:text-primary hover:underline"
                  >
                    {product.name}
                  </Link>
                </Can>
                <span className="truncate font-mono text-[11px] text-muted-foreground">
                  /{product.slug}
                </span>
              </div>
            </div>
          )
        },
      },
      // 2. Category Name Badge (Hideable)
      {
        id: "category_name",
        accessorKey: "category_name",
        enableHiding: true,
        header: t("COLUMN_CATEGORY"),
        cell: ({ row }) => (
          <Badge
            variant="outline"
            className="px-2 py-0.5 text-xs text-muted-foreground"
          >
            {row.original.category_name || "—"}
          </Badge>
        ),
      },
      // 3. Brand Name (Hideable)
      {
        id: "brand_name",
        accessorKey: "brand_name",
        enableHiding: true,
        header: t("COLUMN_BRAND"),
        cell: ({ row }) => (
          <span className="text-xs font-medium text-foreground">
            {row.original.brand_name || "—"}
          </span>
        ),
      },
      // 4. Variants Count (Hideable)
      {
        id: "variants_count",
        accessorKey: "variants_count",
        enableHiding: true,
        header: () => <div className="text-center">{t("COLUMN_VARIANTS")}</div>,
        cell: ({ row }) => (
          <div className="text-center tabular-nums">
            <Badge variant="secondary" className="px-2 py-0.5 text-xs">
              {row.original.variants_count}
            </Badge>
          </div>
        ),
      },
      // 5. Total Stock Quantity (Hideable)
      {
        id: "total_stock",
        accessorKey: "total_stock",
        enableHiding: true,
        header: () => <div className="text-center">{t("COLUMN_STOCK")}</div>,
        cell: ({ row }) => {
          const stock = row.original.total_stock
          const isLow = stock <= 10
          return (
            <div className="text-center tabular-nums">
              <span
                className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                  isLow
                    ? "bg-amber-500/10 text-amber-600 dark:text-amber-400"
                    : "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                }`}
              >
                {stock}
              </span>
            </div>
          )
        },
      },
      // 6. Price Range in Dollars (Hideable)
      {
        id: "price_range",
        enableHiding: true,
        header: t("COLUMN_PRICE_RANGE"),
        cell: ({ row }) => {
          const min = (row.original.min_price / 100).toFixed(2)
          const max = (row.original.max_price / 100).toFixed(2)
          const isSinglePrice =
            row.original.min_price === row.original.max_price

          return (
            <div className="flex items-center gap-1 text-xs font-semibold tabular-nums">
              <span>\${min}</span>
              {!isSinglePrice && (
                <>
                  <span className="text-muted-foreground">-</span>
                  <span>\${max}</span>
                </>
              )}
            </div>
          )
        },
      },
      // 7. Active Status Badge (Hideable)
      {
        id: "is_active",
        accessorKey: "is_active",
        enableHiding: true,
        header: () => <div className="text-center">{t("COLUMN_STATUS")}</div>,
        cell: ({ row }) => (
          <div className="flex justify-center">
            <Badge
              variant="outline"
              className={`gap-1 px-2 py-0.5 text-xs ${
                row.original.is_active
                  ? "border-emerald-500/30 text-emerald-600 dark:text-emerald-400"
                  : "text-muted-foreground"
              }`}
            >
              {row.original.is_active ? (
                <CircleCheckIcon className="size-3 fill-emerald-500 text-background" />
              ) : (
                <CircleXIcon className="size-3 fill-muted-foreground text-background" />
              )}
              {row.original.is_active
                ? t("STATUS_ACTIVE")
                : t("STATUS_INACTIVE")}
            </Badge>
          </div>
        ),
      },
      // 8. Last Column: Actions Dropdown (Pinned Visible)
      {
        id: "actions",
        enableHiding: false,
        cell: ({ row }) => (
          <div className="flex items-center justify-end">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="flex size-7 text-muted-foreground data-[state=open]:bg-muted"
                  size="icon"
                >
                  <MoreHorizontalIcon className="size-4" />
                  <span className="sr-only">{t("ACTIONS_LABEL")}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-44 text-xs">
                <DropdownMenuItem asChild>
                  <Link
                    href={`/product/${row.original.slug}`}
                    target="_blank"
                    className="flex cursor-pointer items-center"
                  >
                    <ExternalLinkIcon className="me-2 size-3.5" />
                    {t("VIEW_IN_STORE")}
                  </Link>
                </DropdownMenuItem>

                <Can permission={PERMISSIONS.UPDATE_PRODUCT}>
                  <DropdownMenuItem asChild>
                    <Link
                      href={`${appRoutes.dashboard.admin.products}/${row.original.slug}/edit`}
                      className="flex cursor-pointer items-center"
                    >
                      <PencilIcon className="me-2 size-3.5" />
                      {t("EDIT_PRODUCT")}
                    </Link>
                  </DropdownMenuItem>
                </Can>

                <Can permission={PERMISSIONS.CREATE_PRODUCT}>
                  <DropdownMenuItem
                    className="cursor-pointer"
                    onClick={() => {
                      toast.promise(duplicateProduct(row.original.id), {
                        loading: t("DUPLICATING_PRODUCT"),
                        success: (res) => {
                          if (!res.success) throw new Error(res.error)
                          router.refresh()
                          return t("PRODUCT_DUPLICATED_SUCCESS")
                        },
                        error: t("FAILED_TO_DUPLICATE"),
                      })
                    }}
                  >
                    <CopyIcon className="me-2 size-3.5" />
                    {t("DUPLICATE_PRODUCT")}
                  </DropdownMenuItem>
                </Can>

                <DropdownMenuItem
                  className="cursor-pointer"
                  onClick={() => {
                    navigator.clipboard.writeText(
                      `${window.location.origin}/product/${row.original.slug}`
                    )
                    toast.success(t("LINK_COPIED_SUCCESS"))
                  }}
                >
                  <LinkIcon className="me-2 size-3.5" />
                  {t("COPY_STORE_LINK")}
                </DropdownMenuItem>

                <Can permission={PERMISSIONS.DELETE_PRODUCT}>
                  <DropdownMenuSeparator />
                  {/* Uncontrolled DeleteProductDialog Trigger */}
                  <DeleteProductDialog
                    productId={row.original.id}
                    productName={row.original.name}
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
                      <span>{t("DELETE_PRODUCT")}</span>
                    </DropdownMenuItem>
                  </DeleteProductDialog>
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
    name: t("COLUMN_PRODUCT"),
    category_name: t("COLUMN_CATEGORY"),
    brand_name: t("COLUMN_BRAND"),
    variants_count: t("COLUMN_VARIANTS"),
    total_stock: t("COLUMN_STOCK"),
    price_range: t("COLUMN_PRICE_RANGE"),
    is_active: t("COLUMN_STATUS"),
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
                    setCurrentTab("low-stock")
                    table.setPageIndex(0)
                  }}
                  className="flex cursor-pointer items-center justify-between"
                >
                  <span>{t("FILTER_LOW_STOCK")}</span>
                  <Badge variant="secondary" className="px-1 py-0 text-[10px]">
                    {lowStockCount}
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
                setCurrentTab("low-stock")
                table.setPageIndex(0)
              }}
              className={`inline-flex h-full items-center justify-center rounded-sm px-2.5 text-xs font-medium transition-colors ${
                currentTab === "low-stock"
                  ? "bg-muted font-semibold text-foreground shadow-xs"
                  : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
              }`}
            >
              {t("FILTER_LOW_STOCK")}
              <Badge
                variant="secondary"
                className="ms-1.5 px-1.5 py-0 text-[10px]"
              >
                {lowStockCount}
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
                  (column) =>
                    typeof column.accessorFn !== "undefined" &&
                    column.getCanHide()
                )
                .map((column) => (
                  <DropdownMenuCheckboxItem
                    key={column.id}
                    checked={column.getIsVisible()}
                    onCheckedChange={(value) =>
                      column.toggleVisibility(Boolean(value))
                    }
                  >
                    {columnLabelsMap[column.id] || column.id}
                  </DropdownMenuCheckboxItem>
                ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Dual Responsive CTA Button */}
          <Can permission={PERMISSIONS.CREATE_PRODUCT}>
            <Link href={appRoutes.dashboard.admin.create_products}>
              <Button
                variant="default"
                size="icon"
                className="size-8 sm:hidden"
                title={t("ADD_PRODUCT")}
              >
                <PlusIcon className="size-3.5" />
                <span className="sr-only">{t("ADD_PRODUCT")}</span>
              </Button>
              <Button
                variant="default"
                size="sm"
                className="hidden h-8 gap-1.5 px-3 text-xs sm:inline-flex"
              >
                <PlusIcon className="size-3.5" />
                <span>{t("ADD_PRODUCT")}</span>
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
                    {t("NO_PRODUCTS_FOUND")}
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

// Backward-compatibility alias
export { ProductsTable as DataTable }
