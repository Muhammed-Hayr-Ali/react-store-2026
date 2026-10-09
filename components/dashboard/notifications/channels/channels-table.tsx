"use client"

import * as React from "react"
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
  RadioTowerIcon,
  SearchIcon,
  Trash2Icon,
  PencilIcon,
  XIcon,
  Columns3Icon,
  ChevronsLeftIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronsRightIcon,
  FilterIcon,
  PlusIcon,
  EllipsisVerticalIcon,
  LockIcon,
  CheckCircle2Icon,
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

import { NotificationChannelRecord } from "@/lib/actions/notifications/types"
import { updateNotificationChannel } from "@/lib/actions/notifications"
import { ChannelFormSheet } from "./channel-form-sheet"
import { DeleteChannelDialog } from "./delete-channel-dialog"

const features = tableFeatures({
  columnFilteringFeature,
  columnVisibilityFeature,
  rowPaginationFeature,
  rowSortingFeature,
  filteredRowModel: createFilteredRowModel(),
  paginatedRowModel: createPaginatedRowModel(),
  sortedRowModel: createSortedRowModel(),
})

const columnHelper = createColumnHelper<
  typeof features,
  NotificationChannelRecord
>()

const HIDEABLE_COLUMNS = ["slug", "description", "policy", "is_active"]

const columnLabelsMap: Record<string, string> = {
  name: "Channel",
  slug: "Slug",
  description: "Description",
  policy: "Policy",
  is_active: "Active",
}

interface ChannelsTableProps {
  channels: NotificationChannelRecord[]
  initialIsMobile?: boolean
}

export function ChannelsTable({
  channels: initialData,
  initialIsMobile = false,
}: ChannelsTableProps) {
  const [data, setData] = React.useState(() => initialData)
  const [prevInitialData, setPrevInitialData] = React.useState(initialData)
  const [currentTab, setCurrentTab] = React.useState<string>("all")
  const [searchQuery, setSearchQuery] = React.useState("")
  const [isPending, startTransition] = useTransition()

  if (initialData !== prevInitialData) {
    setPrevInitialData(initialData)
    setData(initialData)
  }

  const handleToggleActive = (id: string, currentActive: boolean) => {
    startTransition(async () => {
      await updateNotificationChannel({ id, isActive: !currentActive })
      setData((prev) =>
        prev.map((item) =>
          item.id === id ? { ...item, is_active: !currentActive } : item
        )
      )
    })
  }

  const filteredData = React.useMemo(() => {
    return data.filter((item) => {
      if (currentTab === "active" && !item.is_active) return false
      if (currentTab === "mandatory" && !item.is_mandatory) return false
      if (currentTab === "optional" && item.is_mandatory) return false

      if (!searchQuery.trim()) return true
      const q = searchQuery.toLowerCase().trim()
      const name = (item.name || "").toLowerCase()
      const nameAr = (item.name_ar || "").toLowerCase()
      const slug = (item.slug || "").toLowerCase()

      return name.includes(q) || nameAr.includes(q) || slug.includes(q)
    })
  }, [data, currentTab, searchQuery])

  const activeCount = React.useMemo(
    () => data.filter((c) => c.is_active).length,
    [data]
  )
  const mandatoryCount = React.useMemo(
    () => data.filter((c) => c.is_mandatory).length,
    [data]
  )
  const optionalCount = React.useMemo(
    () => data.filter((c) => !c.is_mandatory).length,
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

  const columns = React.useMemo(
    () =>
      columnHelper.columns([
        columnHelper.accessor("name", {
          id: "name",
          header: "Channel",
          cell: ({ row }) => (
            <div className="flex items-center gap-2.5">
              <div className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-secondary text-foreground">
                <RadioTowerIcon className="size-3.5 text-primary" />
              </div>
              <div className="flex max-w-xs min-w-0 flex-col sm:max-w-md">
                <span className="truncate text-xs font-semibold text-foreground">
                  {row.original.name}
                </span>
                <span className="truncate font-mono text-[11px] text-muted-foreground">
                  /{row.original.slug}
                </span>
              </div>
            </div>
          ),
          enableHiding: false,
        }),

        columnHelper.accessor("description", {
          id: "description",
          header: "Description",
          cell: ({ row }) => (
            <span className="block max-w-xs truncate text-xs text-muted-foreground">
              {row.original.description || "—"}
            </span>
          ),
        }),

        columnHelper.display({
          id: "policy",
          header: () => <div className="text-center">Policy</div>,
          cell: ({ row }) => (
            <div className="flex items-center justify-center gap-1.5">
              {row.original.is_mandatory ? (
                <Badge
                  variant="outline"
                  className="gap-1 border-blue-500/30 px-2 py-0.5 text-xs text-blue-600 dark:text-blue-400"
                >
                  <LockIcon className="size-3" />
                  Mandatory
                </Badge>
              ) : (
                <Badge
                  variant="outline"
                  className="gap-1 px-2 py-0.5 text-xs text-muted-foreground"
                >
                  Optional
                </Badge>
              )}
              {row.original.default_enabled && (
                <Badge
                  variant="secondary"
                  className="gap-1 px-1.5 py-0.5 text-[10px] font-normal"
                >
                  Auto-Subscribed
                </Badge>
              )}
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
                  handleToggleActive(row.original.id, row.original.is_active)
                }
                aria-label="Toggle channel status"
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
                  <ChannelFormSheet
                    channel={row.original}
                    trigger={
                      <DropdownMenuItem
                        onSelect={(e) => e.preventDefault()}
                        className="flex cursor-pointer items-center"
                      >
                        <PencilIcon className="me-2 size-3.5" />
                        Edit Channel
                      </DropdownMenuItem>
                    }
                  />

                  {!row.original.is_mandatory && (
                    <>
                      <DropdownMenuSeparator />
                      <DeleteChannelDialog
                        channel={row.original}
                        onSuccess={(deletedId) =>
                          setData((prev) =>
                            prev.filter((c) => c.id !== deletedId)
                          )
                        }
                        trigger={
                          <DropdownMenuItem
                            onSelect={(e) => e.preventDefault()}
                            className="flex cursor-pointer items-center text-destructive focus:bg-destructive/10 focus:text-destructive"
                          >
                            <Trash2Icon className="me-2 size-3.5" />
                            Delete Channel
                          </DropdownMenuItem>
                        }
                      />
                    </>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          ),
          enableHiding: false,
        }),
      ]),
    [isPending]
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
            placeholder="Search channels..."
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
          {/* منيو الموبايل */}
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
                    setCurrentTab("mandatory")
                    table.setPageIndex(0)
                  }}
                  className="flex cursor-pointer items-center justify-between"
                >
                  <span>Mandatory</span>
                  <Badge variant="secondary" className="px-1 py-0 text-[10px]">
                    {mandatoryCount}
                  </Badge>
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => {
                    setCurrentTab("optional")
                    table.setPageIndex(0)
                  }}
                  className="flex cursor-pointer items-center justify-between"
                >
                  <span>Optional</span>
                  <Badge variant="secondary" className="px-1 py-0 text-[10px]">
                    {optionalCount}
                  </Badge>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* التابات الديسكتوب المطابقة للفلاش سيلز */}
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
                setCurrentTab("mandatory")
                table.setPageIndex(0)
              }}
              className={`inline-flex h-full items-center justify-center rounded-sm px-2.5 text-xs font-medium transition-colors ${
                currentTab === "mandatory"
                  ? "bg-muted font-semibold text-foreground"
                  : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
              }`}
            >
              Mandatory
              <Badge
                variant="secondary"
                className="ms-1.5 px-1.5 py-0 text-[10px]"
              >
                {mandatoryCount}
              </Badge>
            </button>

            <button
              type="button"
              onClick={() => {
                setCurrentTab("optional")
                table.setPageIndex(0)
              }}
              className={`inline-flex h-full items-center justify-center rounded-sm px-2.5 text-xs font-medium transition-colors ${
                currentTab === "optional"
                  ? "bg-muted font-semibold text-foreground"
                  : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
              }`}
            >
              Optional
              <Badge
                variant="secondary"
                className="ms-1.5 px-1.5 py-0 text-[10px]"
              >
                {optionalCount}
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

          {/* زر إنشاء القناة بنمط زر Create Flash Sale */}
          <ChannelFormSheet
            trigger={
              <>
                <Button
                  variant="default"
                  size="icon"
                  className="size-8 sm:hidden"
                  title="Create Channel"
                >
                  <PlusIcon className="size-3.5" />
                  <span className="sr-only">Create Channel</span>
                </Button>
                <Button
                  variant="default"
                  size="sm"
                  className="hidden h-8 gap-1.5 px-3 text-xs sm:inline-flex"
                >
                  <PlusIcon className="size-3.5" />
                  <span>Create Channel</span>
                </Button>
              </>
            }
          />
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
                    No notification channels found matching your search.
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
