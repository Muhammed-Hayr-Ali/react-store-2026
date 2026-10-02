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
  PlusIcon,
  ChevronsLeftIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronsRightIcon,
  ExternalLinkIcon,
  Trash2Icon,
  PencilIcon,
  CopyIcon,
  LinkIcon,
} from "lucide-react"

import { AdminProductSummary } from "@/lib/actions/products/types"
import { appRoutes } from "@/lib/config/app-routes"
import { duplicateProduct } from "@/lib/actions/products/mutations/duplicate"
import DeleteProductDialog from "../delete/delete-product-dialog"

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

  const [productToDelete, setProductToDelete] =
    React.useState<AdminProductSummary | null>(null)

  if (initialData !== prevInitialData) {
    setPrevInitialData(initialData)
    setData(initialData)
  }

  const filteredData = React.useMemo(() => {
    if (currentTab === "active") {
      return data.filter((item) => item.is_active)
    }
    if (currentTab === "low-stock") {
      return data.filter((item) => item.total_stock <= 10)
    }
    return data
  }, [data, currentTab])

  const activeCount = React.useMemo(
    () => data.filter((item) => item.is_active).length,
    [data]
  )
  const lowStockCount = React.useMemo(
    () => data.filter((item) => item.total_stock <= 10).length,
    [data]
  )

  // التهيئة الابتدائية المباشرة بحسب ما وصل من السيرفر
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

  // تحديث القيم في حال تم تدوير الشاشة أو تغيير حجم النافذة في المتصفح
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
                    onClick={() => setProductToDelete(row.original)}
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

  const getFilterLabel = () => {
    switch (currentTab) {
      case "active":
        return { label: "Active", count: activeCount }
      case "low-stock":
        return { label: "Low Stock", count: lowStockCount }
      default:
        return { label: "All Products", count: data.length }
    }
  }

  const activeFilterInfo = getFilterLabel()

  return (
    <div className="flex w-full flex-col justify-start gap-4">
      {/* Table Header Controls */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        {/* شاشات سطح المكتب والتابلت */}
        <div className="hidden sm:block">
          <Tabs
            value={currentTab}
            onValueChange={(val) => {
              setCurrentTab(val as "all" | "active" | "low-stock")
              table.setPageIndex(0)
            }}
          >
            <TabsList className="flex">
              <TabsTrigger value="all">
                All Products{" "}
                <Badge variant="secondary" className="ms-1.5">
                  {data.length}
                </Badge>
              </TabsTrigger>
              <TabsTrigger value="active">
                Active{" "}
                <Badge variant="secondary" className="ms-1.5">
                  {activeCount}
                </Badge>
              </TabsTrigger>
              <TabsTrigger value="low-stock">
                Low Stock{" "}
                <Badge variant="secondary" className="ms-1.5">
                  {lowStockCount}
                </Badge>
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {/* شاشات الجوال الصغيرة */}
        <div className="block sm:hidden">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="h-8 gap-1 px-2 text-[11px] font-medium"
              >
                <span>{activeFilterInfo.label}</span>
                <Badge
                  variant="secondary"
                  className="ms-0.5 h-4.5 px-1 text-[10px] tabular-nums"
                >
                  {activeFilterInfo.count}
                </Badge>
                <ChevronDownIcon className="ms-0.5 size-3 opacity-60" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-36 text-xs">
              <DropdownMenuItem
                className="flex cursor-pointer items-center justify-between py-1.5 text-xs"
                onClick={() => {
                  setCurrentTab("all")
                  table.setPageIndex(0)
                }}
              >
                <span>All Products</span>
                <Badge variant="secondary" className="text-[10px] tabular-nums">
                  {data.length}
                </Badge>
              </DropdownMenuItem>
              <DropdownMenuItem
                className="flex cursor-pointer items-center justify-between py-1.5 text-xs"
                onClick={() => {
                  setCurrentTab("active")
                  table.setPageIndex(0)
                }}
              >
                <span>Active</span>
                <Badge variant="secondary" className="text-[10px] tabular-nums">
                  {activeCount}
                </Badge>
              </DropdownMenuItem>
              <DropdownMenuItem
                className="flex cursor-pointer items-center justify-between py-1.5 text-xs"
                onClick={() => {
                  setCurrentTab("low-stock")
                  table.setPageIndex(0)
                }}
              >
                <span>Low Stock</span>
                <Badge variant="secondary" className="text-[10px] tabular-nums">
                  {lowStockCount}
                </Badge>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* أدوات التحكم الإضافية */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="h-8 text-xs sm:h-9"
              >
                <Columns3Icon className="me-1 size-3.5 sm:me-1.5" />
                <span className="xs:inline hidden">Columns</span>
                <ChevronDownIcon className="ms-1 size-3 opacity-60 sm:ms-1.5 sm:size-3.5" />
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

          <Button asChild size="sm" className="h-8 text-xs sm:h-9">
            <Link
              href={appRoutes.dashboard.products.create}
              className="flex items-center"
            >
              <PlusIcon className="size-3.5" />
              <span className="hidden sm:block">Create New Product</span>
            </Link>
          </Button>
        </div>
      </div>

      {/* Main Table Container */}
      <div className="w-full overflow-hidden rounded-lg border">
        <Table className="w-full">
          <TableHeader className="sticky top-0 z-10 bg-muted">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id} colSpan={header.colSpan}>
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
                <TableRow key={row.id}>
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
                  className="h-24 text-center text-muted-foreground"
                >
                  No products found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination Footer */}
      <div className="flex items-center justify-between px-1">
        <div className="flex w-full items-center gap-8 lg:w-fit">
          <div className="hidden items-center gap-2 lg:flex">
            <Label htmlFor="rows-per-page" className="text-sm font-medium">
              Rows per page
            </Label>
            <Select
              value={`${table.state.pagination.pageSize}`}
              onValueChange={(value) => {
                table.setPageSize(Number(value))
              }}
            >
              <SelectTrigger size="sm" className="w-20" id="rows-per-page">
                <SelectValue placeholder={table.state.pagination.pageSize} />
              </SelectTrigger>
              <SelectContent side="top">
                <SelectGroup>
                  {[10, 20, 30, 40, 50].map((pageSize) => (
                    <SelectItem key={pageSize} value={`${pageSize}`}>
                      {pageSize}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
          <div className="flex w-fit items-center justify-center text-sm font-medium">
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
        product={productToDelete}
        isOpen={Boolean(productToDelete)}
        onOpenChange={(open) => {
          if (!open) setProductToDelete(null)
        }}
        onSuccess={(deletedId) => {
          setData((prev) => prev.filter((item) => item.id !== deletedId))
        }}
      />
    </div>
  )
}
