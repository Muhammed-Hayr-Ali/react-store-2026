"use client"

import * as React from "react"
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
import { z } from "zod"

import { Badge } from "@/components/ui/badge"
import { CustomButton } from "@/components/ui/custom-button"

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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

import {
  ChevronDownIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronsLeftIcon,
  ChevronsRightIcon,
  CircleCheckIcon,
  CircleXIcon,
  Columns2Icon,
  EllipsisVerticalIcon,
  GripVertical,
  PlusIcon,
} from "lucide-react"
import { toast } from "sonner"
import CreateCategorySheet from "./create-category"
import DeleteCategoryDialog from "./delete-category"
import DetailsCategorySheet from "./details-category"
import UpdateCategorySheet from "./update-category"
import { duplicateCategory } from "@/lib/actions/categories/duplicate-category"

// New in v9: declare the features this table uses — anything you don't
// register is tree-shaken out of the bundle.
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

const columnHelper = createColumnHelper<
  typeof features,
  z.infer<typeof schema>
>()

export const schema = z.object({
  id: z.string(), // UUID
  parent_id: z.string().nullable(),
  name: z.string(),
  name_ar: z.string().nullable(),
  slug: z.string(),
  description: z.string().nullable(),
  image_url: z.string().nullable(),
  image_alt: z.string().nullable(),
  is_active: z.boolean(),
  sort_order: z.number(),
  created_at: z.string(),
  updated_at: z.string(),
})

export type Category = z.infer<typeof schema>

// Create a separate component for the drag handle
function DragHandle({ id }: { id: string }) {
  const { attributes, listeners } = useSortable({
    id,
  })

  return (
    <CustomButton
      {...attributes}
      {...listeners}
      variant="ghost"
      size="icon"
      className="size-7 text-muted-foreground hover:bg-transparent"
    >
      <GripVertical className="size-3 text-muted-foreground" />
      <span className="sr-only">Drag to reorder</span>
    </CustomButton>
  )
}

// Drag Column
const columns = columnHelper.columns([
  columnHelper.display({
    id: "drag",
    header: () => null,
    cell: ({ row }) => <DragHandle id={row.original.id} />,
  }),

  // Parent ID Column (مخفي ويستخدم للفلترة فقط)
  columnHelper.accessor("parent_id", {
    id: "parent_id",
    header: "Parent ID",
    enableHiding: false,
    enableColumnFilter: true,
    // ✅ التصحيح: التحقق من أن القيمة الممررة هي "main"
    filterFn: (row, id, value) => {
      if (value === "main") {
        return row.getValue(id) === null
      }
      return true
    },
  }),

  // Name Column
  columnHelper.accessor("name", {
    header: "Category Name",
    cell: ({ row, table }) => {
      const meta = table.options.meta as {
        onOpen: ({ isOpen, item }: { isOpen: string; item: Category }) => void
      }
      return (
        <CustomButton
          variant="link"
          className="w-fit px-0 text-left text-sm font-normal text-foreground"
          onClick={() => meta.onOpen({ isOpen: "details", item: row.original })}
        >
          {row.original.name}
        </CustomButton>
      )
    },
  }),

  // slug
  columnHelper.accessor("slug", {
    header: "Slug",
    cell: ({ row }) => (
      <Badge
        variant="secondary"
        className="gap-1 rounded-full px-1.5 text-xs font-normal text-muted-foreground"
      >
        {row.original.slug}
      </Badge>
    ),
  }),

  // is active column
  columnHelper.accessor("is_active", {
    header: "Status",
    cell: ({ row }) => (
      <Badge
        variant="outline"
        className="gap-1 rounded-full px-1 text-xs font-normal text-muted-foreground"
      >
        {row.original.is_active ? (
          <CircleCheckIcon className="size-3.5 text-green-500 dark:text-green-400" />
        ) : (
          <CircleXIcon className="size-3.5 text-red-500 dark:text-red-400" />
        )}
        {row.original.is_active ? "Active" : "Inactive"}
      </Badge>
    ),
    enableColumnFilter: true,
    // ✅ إضافة دالة الفلترة المخصصة للأعمدة من نوع Boolean
    filterFn: (row, id, value) => {
      return row.getValue(id) === value
    },
  }),

  // sort order
  columnHelper.accessor("sort_order", {
    header: "Sort Order",
    cell: ({ row }) => (
      <span className="text-muted-foreground">{row.original.sort_order}</span>
    ),
  }),

  // actions
  columnHelper.display({
    id: "actions",
    header: "Actions",
    cell: ({ row, table }) => {
      const meta = table.options.meta as {
        onOpen: ({ isOpen, item }: { isOpen: string; item: Category }) => void
        duplicateCategory: (categoryToDuplicate: Category) => void
      }
      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <CustomButton
              variant="ghost"
              className="flex size-8 text-muted-foreground data-[state=open]:bg-muted"
              size="icon"
            >
              <EllipsisVerticalIcon />
              <span className="sr-only">Open menu</span>
            </CustomButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-32">
            <DropdownMenuItem
              onClick={() =>
                meta.onOpen({ isOpen: "update", item: row.original })
              }
            >
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => meta.duplicateCategory(row.original)}
            >
              Make a copy
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              variant="destructive"
              onClick={() =>
                meta.onOpen({ isOpen: "delete", item: row.original })
              }
            >
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )
    },
  }),
])

function DraggableRow({
  row,
}: {
  row: Row<typeof features, z.infer<typeof schema>>
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

export function CategoriesTable({
  data: initialData,
}: {
  data: z.infer<typeof schema>[]
}) {
  const [data, setData] = React.useState(() => initialData)
  const [rowSelection, setRowSelection] = React.useState({})
  const [columnVisibility, setColumnVisibility] =
    React.useState<ColumnVisibilityState>({
      parent_id: false, // Hide the parent_id column by default
    })
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  )
  const [sorting, setSorting] = React.useState<SortingState>([])
  const [pagination, setPagination] = React.useState({
    pageIndex: 0,
    pageSize: 10,
  })
  const sortableId = React.useId()
  const sensors = useSensors(
    useSensor(MouseSensor, {}),
    useSensor(TouchSensor, {}),
    useSensor(KeyboardSensor, {})
  )

  // // Dialog & sheet state for delete confirmation
  // const [actions, setActions] = React.useState<{
  //   isOpen: string | null
  //   item: Category | null
  //   items: Category[] | null
  // }>({
  //   isOpen: null,
  //   item: null,
  //   items: null,
  // })

  // Dialog & sheet state
  const [dialogState, setDialogState] = React.useState<{
    activeDialog: string | null
    data: Category | null
  }>({
    activeDialog: null,
    data: null,
  })

  // handle Dialog Close
  const handleDialogChange = (open: boolean) => {
    if (!open) {
      setDialogState({ activeDialog: null, data: null })
    }
  }

  // handle Open Dialog
  const openDialog = (dialogName: string, data?: Category | null) => {
    setDialogState({
      activeDialog: dialogName,
      data: data || null,
    })
  }

  // Handle Duplicate Category
  const handleDuplicateCategory = async (categoryToDuplicate: Category) => {
    toast.promise(
      (async () => {
        // 1. استدعاء الأكشن المخصص للنسخ مباشرة (نمرر فقط الـ ID)
        const result = await duplicateCategory(categoryToDuplicate.id)

        // 2. التحقق من النتيجة ورمي خطأ إذا فشل
        if (!result.success) {
          throw new Error(
            result.error === "CATEGORY_NOT_FOUND"
              ? "Category not found"
              : "Failed to duplicate category"
          )
        }

        // 3. التحقق الصريح من وجود البيانات (Type Narrowing)
        if (!result.data) {
          throw new Error(
            "Category duplicated but no data was returned from server."
          )
        }

        return result.data
      })(),
      {
        loading: "Duplicating category...",
        success: (newlyCreatedCategory) => {
          // 4. إضافة التصنيف الجديد للقائمة وترتيبها فوراً حسب sort_order
          setData((prev) => {
            const updatedData = [...prev, newlyCreatedCategory]
            return updatedData.sort((a, b) => a.sort_order - b.sort_order)
          })
          return "Category duplicated successfully."
        },
        error: (err) =>
          err.message || "Failed to duplicate category. Please try again.",
      }
    )
  }

  // Filter State
  const [statusFilter, setStatusFilter] = React.useState<string>("all")
  // Handle Filter
  function handleFilterChange(value: string) {
    setStatusFilter(value)

    if (value === "all") {
      table.setColumnFilters((prev) =>
        prev.filter((f) => f.id !== "is_active" && f.id !== "parent_id")
      )
    }
    if (value === "active") {
      table.setColumnFilters((prev) => {
        const filtered = prev.filter(
          (f) => f.id !== "is_active" && f.id !== "parent_id"
        )
        return [...filtered, { id: "is_active", value: true }]
      })
    }
    if (value === "inactive") {
      table.setColumnFilters((prev) => {
        const filtered = prev.filter(
          (f) => f.id !== "is_active" && f.id !== "parent_id"
        )
        return [...filtered, { id: "is_active", value: false }]
      })
    }
    if (value === "mainCategories") {
      table.setColumnFilters((prev) => {
        // إزالة أي فلترة سابقة على is_active أو parent_id لتجنب التعارض
        const filtered = prev.filter(
          (f) => f.id !== "is_active" && f.id !== "parent_id"
        )
        // إضافة الفلتر الجديد بقيمة "main"
        return [...filtered, { id: "parent_id", value: "main" }]
      })
    }
  }
  // CRUD Operations

  // Handle Create Success
  function handleCreateSuccess(newCategory: Category) {
    setData((prev) => {
      const updatedData = [...prev, newCategory]
      return updatedData.sort((a, b) => a.sort_order - b.sort_order)
    })
  }

  // Handle Update Success
  function handleUpdateSuccess(updatedCategory: Category) {
    setData((prev) =>
      prev.map((item) =>
        item.id === updatedCategory.id ? updatedCategory : item
      )
    )
  }

  // Handle Delete Success
  function handleDeleteSuccess(deletedCategoryId: string) {
    setData((prev) => prev.filter((item) => item.id !== deletedCategoryId))
  }

  // Drag and Drop
  const dataIds = React.useMemo<UniqueIdentifier[]>(
    () => data?.map(({ id }) => id) || [],
    [data]
  )
  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    if (active && over && active.id !== over.id) {
      setData((data) => {
        const oldIndex = dataIds.indexOf(active.id)
        const newIndex = dataIds.indexOf(over.id)
        return arrayMove(data, oldIndex, newIndex)
      })
    }
  }

  // use Table
  const table = useTable({
    features,
    data,
    columns,
    state: {
      sorting,
      columnVisibility,
      rowSelection,
      columnFilters,
      pagination,
    },
    getRowId: (row) => row.id.toString(),
    enableRowSelection: true,
    onRowSelectionChange: setRowSelection,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onPaginationChange: setPagination,
    meta: {
      onOpen: ({ isOpen, item }: { isOpen: string; item: Category }) => {
        openDialog(isOpen, item)
      },

      duplicateCategory: handleDuplicateCategory,
    },
  })

  return (
    <>
      <Tabs
        value={statusFilter}
        className="w-full flex-col justify-start gap-6"
      >
        <div className="flex items-center justify-between px-4 md:px-6">
          <Label htmlFor="view-selector" className="sr-only">
            Filter by Status
          </Label>

          <Select value={statusFilter} onValueChange={handleFilterChange}>
            <SelectTrigger
              className="flex w-fit md:hidden"
              size="sm"
              id="view-selector"
            >
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>

              <SelectItem value="active">
                Active ({data.filter((item) => item.is_active === true).length})
              </SelectItem>

              <SelectItem value="inactive">
                Inactive (
                {data.filter((item) => item.is_active === false).length})
              </SelectItem>

              <SelectItem value="mainCategories">
                Main Categories (
                {data.filter((item) => item.parent_id === null).length})
              </SelectItem>
            </SelectContent>
          </Select>

          <TabsList
            defaultValue={statusFilter}
            className="hidden **:data-[slot=badge]:size-5 **:data-[slot=badge]:rounded-full **:data-[slot=badge]:bg-muted-foreground/30 **:data-[slot=badge]:px-1 md:flex"
          >
            <TabsTrigger value="all" onClick={() => handleFilterChange("all")}>
              All
            </TabsTrigger>
            <TabsTrigger
              value="active"
              onClick={() => handleFilterChange("active")}
            >
              Active ({data.filter((item) => item.is_active === true).length})
            </TabsTrigger>
            <TabsTrigger
              value="inactive"
              onClick={() => handleFilterChange("inactive")}
            >
              Inactive ({data.filter((item) => item.is_active === false).length}
              )
            </TabsTrigger>

            <TabsTrigger
              value="mainCategories"
              onClick={() => handleFilterChange("mainCategories")}
            >
              Main Categories (
              {data.filter((item) => item.parent_id === null).length})
            </TabsTrigger>
          </TabsList>

          <div className="flex items-center gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <CustomButton variant="outline" size="sm">
                  <Columns2Icon />
                  <span className="hidden lg:inline">Customize Columns</span>
                  <span className="lg:hidden">Columns</span>
                  <ChevronDownIcon />
                </CustomButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                {table
                  .getAllColumns()
                  .filter(
                    (column) =>
                      typeof column.accessorFn !== "undefined" &&
                      column.getCanHide()
                  )
                  .map((column) => {
                    const columnName =
                      typeof column.columnDef.header === "string"
                        ? column.columnDef.header
                        : column.id

                    return (
                      <DropdownMenuCheckboxItem
                        key={column.id}
                        className="capitalize"
                        checked={column.getIsVisible()}
                        onCheckedChange={(value) =>
                          column.toggleVisibility(!!value)
                        }
                      >
                        {columnName}
                      </DropdownMenuCheckboxItem>
                    )
                  })}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Create Category */}
            <CustomButton
              variant="outline"
              size="sm"
              onClick={() =>
                // setActions({ isOpen: "create", item: null, items: data })
                openDialog("create")
              }
            >
              <PlusIcon />
              <span className="hidden lg:inline">Create Category</span>
            </CustomButton>
          </div>
        </div>

        {/* ✅ عرض الجدول لكل حالات الفلتر */}
        {["all", "active", "inactive", "mainCategories"].map((tabValue) => (
          <TabsContent
            key={tabValue}
            value={tabValue}
            className="relative flex flex-col gap-4 overflow-auto px-4 lg:px-6"
          >
            <div className="overflow-hidden rounded-lg border">
              <DndContext
                collisionDetection={closestCenter}
                modifiers={[restrictToVerticalAxis]}
                onDragEnd={handleDragEnd}
                sensors={sensors}
                id={sortableId}
              >
                <Table>
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
                          className="h-24 text-center"
                        >
                          No results.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </DndContext>
            </div>
            <div className="flex items-center justify-between px-4">
              <div className="hidden flex-1 text-sm text-muted-foreground lg:flex">
                {table.getFilteredSelectedRowModel().rows.length} of{" "}
                {table.getFilteredRowModel().rows.length} row(s) selected.
              </div>
              <div className="flex w-full items-center gap-8 lg:w-fit">
                <div className="hidden items-center gap-2 lg:flex">
                  <Label
                    htmlFor="rows-per-page"
                    className="text-sm font-medium"
                  >
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
                      className="w-20"
                      id="rows-per-page"
                    >
                      <SelectValue
                        placeholder={table.state.pagination.pageSize}
                      />
                    </SelectTrigger>
                    <SelectContent side="top">
                      {[10, 20, 30, 40, 50].map((pageSize) => (
                        <SelectItem key={pageSize} value={`${pageSize}`}>
                          {pageSize}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex w-fit items-center justify-center text-sm font-medium">
                  Page {table.state.pagination.pageIndex + 1} of{" "}
                  {table.getPageCount()}
                </div>
                <div className="ml-auto flex items-center gap-2 lg:ml-0">
                  <CustomButton
                    variant="outline"
                    className="hidden h-8 w-8 p-0 lg:flex"
                    onClick={() => table.setPageIndex(0)}
                    disabled={!table.getCanPreviousPage()}
                  >
                    <span className="sr-only">Go to first page</span>
                    <ChevronsLeftIcon />
                  </CustomButton>
                  <CustomButton
                    variant="outline"
                    className="size-8"
                    size="icon"
                    onClick={() => table.previousPage()}
                    disabled={!table.getCanPreviousPage()}
                  >
                    <span className="sr-only">Go to previous page</span>
                    <ChevronLeftIcon />
                  </CustomButton>
                  <CustomButton
                    variant="outline"
                    className="size-8"
                    size="icon"
                    onClick={() => table.nextPage()}
                    disabled={!table.getCanNextPage()}
                  >
                    <span className="sr-only">Go to next page</span>
                    <ChevronRightIcon />
                  </CustomButton>
                  <CustomButton
                    variant="outline"
                    className="hidden size-8 lg:flex"
                    size="icon"
                    onClick={() => table.setPageIndex(table.getPageCount() - 1)}
                    disabled={!table.getCanNextPage()}
                  >
                    <span className="sr-only">Go to last page</span>
                    <ChevronsRightIcon />
                  </CustomButton>
                </div>
              </div>
            </div>
          </TabsContent>
        ))}
      </Tabs>
      {/* Sheets & Dialogs */}
      <DetailsCategorySheet
        isOpen={dialogState.activeDialog}
        onOpenChange={handleDialogChange}
        item={dialogState.data}
      />
      <CreateCategorySheet
        isOpen={dialogState.activeDialog}
        onOpenChange={handleDialogChange}
        items={data.filter(
          (item) => item.parent_id === null && item.is_active === true
        )}
        onSuccess={handleCreateSuccess}
      />
      <DeleteCategoryDialog
        isOpen={dialogState.activeDialog}
        onOpenChange={handleDialogChange}
        item={dialogState.data}
        onSuccess={handleDeleteSuccess}
      />
      <UpdateCategorySheet
        isOpen={dialogState.activeDialog}
        onOpenChange={handleDialogChange}
        item={dialogState.data}
        items={data.filter(
          (item) => item.parent_id === null && item.is_active === true
        )}
        onSuccess={handleUpdateSuccess}
      />
    </>
  )
}
