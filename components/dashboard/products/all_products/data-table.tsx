"use client"

import * as React from "react"
import Link from "next/link"
import {
  closestCenter,
  DndContext,
  KeyboardSensor,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type UniqueIdentifier,
} from "@dnd-kit/core"
import { restrictToVerticalAxis } from "@dnd-kit/modifiers"
import {
  arrayMove,
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import {
  columnFilteringFeature,
  columnVisibilityFeature,
  createColumnHelper,
  createFilteredRowModel,
  createPaginatedRowModel,
  createSortedRowModel,
  FlexRender,
  rowPaginationFeature,
  rowSelectionFeature,
  rowSortingFeature,
  tableFeatures,
  useTable,
  type ColumnFiltersState,
  type ColumnVisibilityState,
  type Row,
  type SortingState,
} from "@tanstack/react-table"
import { toast } from "sonner"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
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
  GripVerticalIcon,
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
  rowSelectionFeature,
  rowSortingFeature,
  filteredRowModel: createFilteredRowModel(),
  paginatedRowModel: createPaginatedRowModel(),
  sortedRowModel: createSortedRowModel(),
})

const columnHelper = createColumnHelper<typeof features, AdminProductSummary>()

// -----------------------------------------------------------------------------
// 2. Drag Handle Component (dnd-kit)
// -----------------------------------------------------------------------------
function DragHandle({ id }: { id: string }) {
  const { attributes, listeners } = useSortable({ id })

  return (
    <Button
      {...attributes}
      {...listeners}
      variant="ghost"
      size="icon"
      className="size-7 text-muted-foreground hover:bg-transparent"
    >
      <GripVerticalIcon className="size-3 text-muted-foreground" />
      <span className="sr-only">Drag to reorder</span>
    </Button>
  )
}

// -----------------------------------------------------------------------------
// 3. Draggable Table Row Component
// -----------------------------------------------------------------------------
function DraggableRow({
  row,
}: {
  row: Row<typeof features, AdminProductSummary>
}) {
  const { transform, transition, setNodeRef, isDragging } = useSortable({
    id: row.original.id,
  })

  return (
    <TableRow
      data-state={row.getIsSelected() && "selected"}
      data-dragging={isDragging}
      ref={setNodeRef}
      className="relative z-0 data-[dragging=true]:z-10 data-[dragging=true]:opacity-80"
      style={{
        transform: CSS.Transform.toString(transform),
        transition: transition,
      }}
    >
      {row.getVisibleCells().map((cell) => (
        <TableCell key={cell.id}>
          <FlexRender cell={cell} />
        </TableCell>
      ))}
    </TableRow>
  )
}

// -----------------------------------------------------------------------------
// 4. Main DataTable Component
// -----------------------------------------------------------------------------
export function DataTable({
  data: initialData,
}: {
  data: AdminProductSummary[]
}) {
  const [data, setData] = React.useState(() => initialData)
  const [prevInitialData, setPrevInitialData] = React.useState(initialData)
  const [currentTab, setCurrentTab] = React.useState<
    "all" | "active" | "low-stock"
  >("all")

  // حالة المنتج المحدد للحذف
  const [productToDelete, setProductToDelete] =
    React.useState<AdminProductSummary | null>(null)

  // مزامنة البيانات أثناء مرحلة التصيير (Render Phase)
  if (initialData !== prevInitialData) {
    setPrevInitialData(initialData)
    setData(initialData)
  }

  // فلترة المنتجات بناءً على التبويب النشط
  const filteredData = React.useMemo(() => {
    if (currentTab === "active") {
      return data.filter((item) => item.is_active)
    }
    if (currentTab === "low-stock") {
      return data.filter((item) => item.total_stock <= 10)
    }
    return data
  }, [data, currentTab])

  // حساب الأعداد للشارات في التبويبات
  const activeCount = React.useMemo(
    () => data.filter((item) => item.is_active).length,
    [data]
  )
  const lowStockCount = React.useMemo(
    () => data.filter((item) => item.total_stock <= 10).length,
    [data]
  )

  // حالات الجدول
  const [rowSelection, setRowSelection] = React.useState({})
  const [columnVisibility, setColumnVisibility] =
    React.useState<ColumnVisibilityState>({})
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  )
  const [sorting, setSorting] = React.useState<SortingState>([])
  const [pagination, setPagination] = React.useState({
    pageIndex: 0,
    pageSize: 10,
  })

  // إعداد السحب والإفلات
  const sortableId = React.useId()
  const sensors = useSensors(
    useSensor(MouseSensor, {}),
    useSensor(TouchSensor, {}),
    useSensor(KeyboardSensor, {})
  )

  const dataIds = React.useMemo<UniqueIdentifier[]>(
    () => filteredData?.map(({ id }) => id) || [],
    [filteredData]
  )

  // تعريف الأعمدة داخل المكوّن للوصول إلى setProductToDelete
  const columns = React.useMemo(
    () =>
      columnHelper.columns([
        columnHelper.display({
          id: "drag",
          header: () => null,
          cell: ({ row }) => <DragHandle id={row.original.id} />,
        }),

        columnHelper.display({
          id: "select",
          header: ({ table }) => (
            <div className="flex items-center justify-center">
              <Checkbox
                checked={
                  table.getIsAllPageRowsSelected() ||
                  (table.getIsSomePageRowsSelected() && "indeterminate")
                }
                onCheckedChange={(value) =>
                  table.toggleAllPageRowsSelected(!!value)
                }
                aria-label="Select all"
              />
            </div>
          ),
          cell: ({ row }) => (
            <div className="flex items-center justify-center">
              <Checkbox
                checked={row.getIsSelected()}
                onCheckedChange={(value) => row.toggleSelected(!!value)}
                aria-label="Select row"
              />
            </div>
          ),
          enableSorting: false,
          enableHiding: false,
        }),

        columnHelper.accessor("name", {
          header: "Product",
          cell: ({ row }) => (
            <div className="flex flex-col">
              <span className="font-semibold text-foreground">
                {row.original.name}
              </span>
              <span className="font-mono text-xs text-muted-foreground">
                /{row.original.slug}
              </span>
            </div>
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
            <div className="flex items-center justify-end gap-1">
              <Link
                href={`/product/${row.original.slug}`}
                target="_blank"
                className="inline-flex size-7 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                title="Preview in Store"
              >
                <ExternalLinkIcon className="size-3.5" />
                <span className="sr-only">Preview</span>
              </Link>

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
                <DropdownMenuContent align="end" className="w-40">
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
                    Copy Store Link
                  </DropdownMenuItem>

                  <DropdownMenuSeparator />

                  {/* فتح دايلوج الحذف */}
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
      rowSelection,
      columnFilters,
      pagination,
    },
    getRowId: (row) => row.id,
    enableRowSelection: true,
    onRowSelectionChange: setRowSelection,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onPaginationChange: setPagination,
  })

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    if (active && over && active.id !== over.id) {
      setData((currentData) => {
        const oldIndex = currentData.findIndex((item) => item.id === active.id)
        const newIndex = currentData.findIndex((item) => item.id === over.id)
        if (oldIndex !== -1 && newIndex !== -1) {
          return arrayMove(currentData, oldIndex, newIndex)
        }
        return currentData
      })
    }
  }

  return (
    <div className="flex w-full flex-col justify-start gap-4">
      {/* Table Header Controls */}
      <div className="flex items-center justify-between">
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

        <div className="flex items-center gap-2">
          {/* Column Visibility Selector */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">
                <Columns3Icon className="me-1.5 size-3.5" />
                Columns
                <ChevronDownIcon className="ms-1.5 size-3.5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-36">
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
                      {column.id}
                    </DropdownMenuCheckboxItem>
                  )
                })}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Add Product Button */}
          <Button asChild>
            <Link
              href={appRoutes.dashboard.products.create}
              className="flex items-center"
            >
              <PlusIcon className="me-1.5 size-3.5" />
              Create New Product
            </Link>
          </Button>
        </div>
      </div>

      {/* Main Table Container */}
      <div className="w-full overflow-hidden rounded-lg border">
        <DndContext
          collisionDetection={closestCenter}
          modifiers={[restrictToVerticalAxis]}
          onDragEnd={handleDragEnd}
          sensors={sensors}
          id={sortableId}
        >
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
            <TableBody className="**:data-[slot=table-cell]:first:w-8">
              {table.getRowModel().rows?.length ? (
                <SortableContext
                  items={dataIds}
                  strategy={verticalListSortingStrategy}
                >
                  {table.getRowModel().rows.map((row) => (
                    <DraggableRow key={row.id} row={row} />
                  ))}
                </SortableContext>
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
        </DndContext>
      </div>

      {/* Pagination & Selection Stats Footer */}
      <div className="flex items-center justify-between px-1">
        <div className="hidden flex-1 text-sm text-muted-foreground lg:flex">
          {table.getFilteredSelectedRowModel().rows.length} of{" "}
          {table.getFilteredRowModel().rows.length} row(s) selected.
        </div>
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
