"use client"

import * as React from "react"
import Link from "next/link"
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
import { toast } from "sonner"

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
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  CircleCheckIcon,
  CircleXIcon,
  EllipsisVerticalIcon,
  Columns3Icon,
  ChevronDownIcon,
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
} from "lucide-react"

import { AdminProductSummary } from "@/lib/actions/products/types"
import { duplicateProduct } from "@/lib/actions/products/mutations/duplicate"
import DeleteProductDialog from "./delete-product-dialog"

// -----------------------------------------------------------------------------
// 1. TanStack Table Features Registration
// -----------------------------------------------------------------------------
const features = tableFeatures({
  columnFilteringFeature,
  columnVisibilityFeature,
  rowPaginationFeature,
  rowSortingFeature,
  filteredRowModel: createFilteredRowModel(),
  paginatedRowModel: createPaginatedRowModel(),
  sortedRowModel: createSortedRowModel(),
})

const columnHelper = createColumnHelper<typeof features, AdminProductSummary>()

const HIDEABLE_COLUMNS = [
  "category_name",
  "brand_name",
  "variants_count",
  "total_stock",
  "price_range",
  "is_active",
]

const columnLabelsMap: Record<string, string> = {
  name: "Product",
  category_name: "Category",
  brand_name: "Brand",
  variants_count: "Variants",
  total_stock: "Stock",
  price_range: "Price Range",
  is_active: "Status",
}

function getColumnTitle(column: {
  id: string
  columnDef: { header?: unknown }
}): string {
  if (columnLabelsMap[column.id]) {
    return columnLabelsMap[column.id]
  }
  const header = column.columnDef.header
  if (typeof header === "string") {
    return header
  }
  return column.id
    .replace(/_/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase())
}

interface DataTableProps {
  data: AdminProductSummary[]
  initialIsMobile?: boolean
}

// -----------------------------------------------------------------------------
// 2. Main DataTable Component
// -----------------------------------------------------------------------------
export function DataTable({
  data: initialData,
  initialIsMobile = false,
}: DataTableProps) {
  const [data, setData] = React.useState(() => initialData)
  const [prevInitialData, setPrevInitialData] = React.useState(initialData)
  const [currentTab, setCurrentTab] = React.useState<
    "all" | "active" | "low-stock"
  >("all")
  const [searchQuery, setSearchQuery] = React.useState("")

  const [productModal, setProductModal] = React.useState<{
    type: "delete" | null
    data: AdminProductSummary | null
  }>({
    type: null,
    data: null,
  })

  if (initialData !== prevInitialData) {
    setPrevInitialData(initialData)
    setData(initialData)
  }

  // فلترة مدمجة تجمع بين التبويبات والبحث النصي السريع
  const filteredData = React.useMemo(() => {
    return data.filter((item) => {
      if (currentTab === "active" && !item.is_active) return false
      if (currentTab === "low-stock" && item.total_stock > 10) return false

      if (!searchQuery.trim()) return true
      const q = searchQuery.toLowerCase().trim()
      const name = (item.name || "").toLowerCase()
      const category = (item.category_name || "").toLowerCase()
      const brand = (item.brand_name || "").toLowerCase()

      return name.includes(q) || category.includes(q) || brand.includes(q)
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

  const [columnVisibility, setColumnVisibility] =
    React.useState<ColumnVisibilityState>(() => {
      const initialVisibility: ColumnVisibilityState = {}
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
    pageSize: initialIsMobile ? 14 : 10,
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

    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  const columns = React.useMemo(
    () =>
      columnHelper.columns([
        columnHelper.accessor("name", {
          header: "Product",
          cell: ({ row }) => (
            <span className="font-semibold text-foreground">
              {row.original.name}
            </span>
          ),
          enableHiding: false,
        }),

        columnHelper.accessor("category_name", {
          header: "Category",
          cell: ({ row }) => (
            <Badge
              variant="outline"
              className="px-2 py-0.5 text-xs text-muted-foreground"
            >
              {row.original.category_name || "—"}
            </Badge>
          ),
        }),

        columnHelper.accessor("brand_name", {
          header: "Brand",
          cell: ({ row }) => (
            <span className="text-xs font-medium text-foreground">
              {row.original.brand_name || "—"}
            </span>
          ),
        }),

        columnHelper.accessor("variants_count", {
          header: () => <div className="text-center">Variants</div>,
          cell: ({ row }) => (
            <div className="text-center tabular-nums">
              <Badge variant="secondary" className="px-2 py-0.5 text-xs">
                {row.original.variants_count}
              </Badge>
            </div>
          ),
        }),

        columnHelper.accessor("total_stock", {
          header: () => <div className="text-center">Stock</div>,
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
        }),

        columnHelper.display({
          id: "price_range",
          header: "Price Range",
          cell: ({ row }) => {
            const min = (row.original.min_price / 100).toFixed(2)
            const max = (row.original.max_price / 100).toFixed(2)
            const isSinglePrice =
              row.original.min_price === row.original.max_price

            return (
              <div className="flex items-center gap-1 text-xs font-semibold tabular-nums">
                <span>${min}</span>
                {!isSinglePrice && (
                  <>
                    <span className="text-muted-foreground">-</span>
                    <span>${max}</span>
                  </>
                )}
              </div>
            )
          },
        }),

        columnHelper.accessor("is_active", {
          header: () => <div className="text-center">Status</div>,
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
                {row.original.is_active ? "Active" : "Inactive"}
              </Badge>
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
                    className="flex size-7 text-muted-foreground data-[state=open]:bg-muted"
                    size="icon"
                  >
                    <EllipsisVerticalIcon className="size-4" />
                    <span className="sr-only">Actions</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-44">
                  <DropdownMenuItem asChild>
                    <Link
                      href={`/product/${row.original.slug}`}
                      target="_blank"
                      className="flex cursor-pointer items-center"
                    >
                      <ExternalLinkIcon className="me-2 size-3.5" />
                      View in Store
                    </Link>
                  </DropdownMenuItem>

                  <DropdownMenuItem asChild>
                    <Link
                      href={`/dashboard/products/${row.original.slug}/edit`}
                      className="flex cursor-pointer items-center"
                    >
                      <PencilIcon className="me-2 size-3.5" />
                      Edit Product
                    </Link>
                  </DropdownMenuItem>

                  <DropdownMenuItem
                    className="cursor-pointer"
                    onClick={async () => {
                      toast.promise(duplicateProduct(row.original.id), {
                        loading: "Duplicating product...",
                        success: (res) => {
                          if (!res.success) throw new Error(res.error)
                          return "Product duplicated successfully!"
                        },
                        error: "Failed to duplicate product",
                      })
                    }}
                  >
                    <CopyIcon className="me-2 size-3.5" />
                    Duplicate
                  </DropdownMenuItem>

                  <DropdownMenuItem
                    className="cursor-pointer"
                    onClick={() => {
                      navigator.clipboard.writeText(
                        `${window.location.origin}/product/${row.original.slug}`
                      )
                      toast.success("Product link copied!")
                    }}
                  >
                    <LinkIcon className="me-2 size-3.5" />
                    Copy Store Link
                  </DropdownMenuItem>

                  <DropdownMenuSeparator />

                  <DropdownMenuItem
                    variant="destructive"
                    className="cursor-pointer text-destructive focus:bg-destructive/10 focus:text-destructive"
                    onClick={() =>
                      setProductModal({ type: "delete", data: row.original })
                    }
                  >
                    <Trash2Icon className="me-2 size-3.5" />
                    Delete Product
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          ),
        }),
      ]),
    []
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
      {/* Controls Bar الموحد المتناسق مع باقي الجداول */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        {/* حقل البحث السريع مع زر المسح */}
        <div className="relative w-full sm:max-w-xs">
          <SearchIcon className="absolute inset-s-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search products by name, category or brand..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value)
              table.setPageIndex(0)
            }}
            className="h-9 ps-8 pe-8 text-xs"
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

        {/* التبويبات وقائمة الأعمدة الموحدة */}
        <div className="flex flex-wrap items-center gap-2">
          <Tabs
            value={currentTab}
            onValueChange={(val) => {
              setCurrentTab(val as "all" | "active" | "low-stock")
              table.setPageIndex(0)
            }}
          >
            <TabsList className="h-9">
              <TabsTrigger value="all" className="text-xs">
                All{" "}
                <Badge variant="secondary" className="ms-1.5 px-1.5 py-0">
                  {data.length}
                </Badge>
              </TabsTrigger>
              <TabsTrigger value="active" className="text-xs">
                Active{" "}
                <Badge variant="secondary" className="ms-1.5 px-1.5 py-0">
                  {activeCount}
                </Badge>
              </TabsTrigger>
              <TabsTrigger value="low-stock" className="text-xs">
                Low Stock{" "}
                <Badge variant="secondary" className="ms-1.5 px-1.5 py-0">
                  {lowStockCount}
                </Badge>
              </TabsTrigger>
            </TabsList>
          </Tabs>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="h-9 text-xs">
                <Columns3Icon className="me-1.5 size-3.5" />
                <span>Columns</span>
                <ChevronDownIcon className="ms-1.5 size-3 opacity-60" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40">
              {table
                .getAllColumns()
                .filter(
                  (column) =>
                    typeof column.accessorFn !== "undefined" &&
                    column.getCanHide()
                )
                .map((column) => {
                  return (
                    <DropdownMenuCheckboxItem
                      key={column.id}
                      checked={column.getIsVisible()}
                      onCheckedChange={(value) =>
                        column.toggleVisibility(!!value)
                      }
                    >
                      {getColumnTitle(column)}
                    </DropdownMenuCheckboxItem>
                  )
                })}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Main Table Container مع دعم التمرير السلس على الجوال */}
      <div className="w-full overflow-hidden rounded-xl border border-border bg-card shadow-xs">
        <div className="overflow-x-auto">
          <Table className="w-full">
            <TableHeader className="bg-muted/40">
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => {
                    return (
                      <TableHead
                        key={header.id}
                        colSpan={header.colSpan}
                        className="text-xs font-medium text-muted-foreground"
                      >
                        {header.isPlaceholder ? null : (
                          <FlexRender header={header} />
                        )}
                      </TableHead>
                    )
                  })}
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
                    No products found matching your search.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Pagination Footer */}
      <div className="flex items-center justify-between px-1">
        <div className="flex w-full items-center gap-8 lg:w-fit">
          <div className="hidden items-center gap-2 lg:flex">
            <Label htmlFor="rows-per-page" className="text-xs font-medium">
              Rows per page
            </Label>
            <Select
              value={`${table.state.pagination.pageSize}`}
              onValueChange={(value) => {
                table.setPageSize(Number(value))
              }}
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

      {/* دايلوج تأكيد الحذف */}
      <DeleteProductDialog
        isOpen={productModal.type === "delete" ? "delete" : null}
        item={productModal.data}
        onOpenChange={(open) => {
          if (!open) setProductModal({ type: null, data: null })
        }}
        onSuccess={(deletedId) => {
          setData((prev) => prev.filter((item) => item.id !== deletedId))
        }}
      />
    </div>
  )
}
