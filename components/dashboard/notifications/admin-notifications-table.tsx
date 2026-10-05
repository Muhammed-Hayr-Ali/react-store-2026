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
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronsLeftIcon,
  ChevronsRightIcon,
  Columns3Icon,
  ExternalLinkIcon,
  FilterIcon,
  MegaphoneIcon,
  MoreVerticalIcon,
  PlusIcon,
  SearchIcon,
  Trash2Icon,
  XIcon,
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

import { AdminNotificationRecord } from "@/lib/actions/notifications/types"
import DeleteNotificationDialog from "./delete-notification-dialog"
import NotificationForm from "./notification-form"
import BroadcastForm from "./broadcast-form"

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
  AdminNotificationRecord
>()

const HIDEABLE_COLUMNS = ["type", "is_read", "recipient", "created_at"]

const columnLabelsMap: Record<string, string> = {
  title: "Title",
  type: "Type",
  is_read: "Status",
  recipient: "Recipient",
  created_at: "Submitted",
}

function formatDate(isoString: string): string {
  const d = new Date(isoString)
  if (isNaN(d.getTime())) return ""
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`
}

function formatTime(isoString: string): string {
  const d = new Date(isoString)
  if (isNaN(d.getTime())) return ""
  return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`
}

interface AdminNotificationsTableProps {
  notifications: AdminNotificationRecord[]
  initialIsMobile?: boolean
  users?: {
    id: string
    first_name?: string | null
    last_name?: string | null
    email?: string | null
  }[]
}

export function AdminNotificationsTable({
  notifications: initialData,
  initialIsMobile = false,
  users = [],
}: AdminNotificationsTableProps) {
  const [data, setData] = React.useState<AdminNotificationRecord[]>(
    () => initialData
  )
  const [prevInitialData, setPrevInitialData] =
    React.useState<AdminNotificationRecord[]>(initialData)
  const [currentTab, setCurrentTab] = React.useState<string>("all")
  const [typeFilter, setTypeFilter] = React.useState<string>("all")
  const [searchQuery, setSearchQuery] = React.useState("")

  const [itemToDelete, setItemToDelete] =
    React.useState<AdminNotificationRecord | null>(null)

  // حالات فتح الشيتات
  const [isIndividualOpen, setIsIndividualOpen] = React.useState(false)
  const [isBroadcastOpen, setIsBroadcastOpen] = React.useState(false)


  if (initialData !== prevInitialData) {
    setPrevInitialData(initialData)
    setData(initialData)
  }

  const filteredData = React.useMemo(() => {
    return data.filter((item) => {
      if (currentTab === "read" && !item.is_read) return false
      if (currentTab === "unread" && item.is_read) return false

      if (typeFilter !== "all" && item.type !== typeFilter) {
        return false
      }

      if (!searchQuery.trim()) return true
      const q = searchQuery.toLowerCase().trim()
      const title = (item.title || "").toLowerCase()
      const message = (item.message || "").toLowerCase()
      const profile = item.profiles
      const recipientName = [profile?.first_name, profile?.last_name]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
      const email = (profile?.email || "").toLowerCase()

      return (
        title.includes(q) ||
        message.includes(q) ||
        recipientName.includes(q) ||
        email.includes(q)
      )
    })
  }, [data, currentTab, typeFilter, searchQuery])

  const unreadCount = React.useMemo(
    () => data.filter((n) => !n.is_read).length,
    [data]
  )
  const readCount = React.useMemo(
    () => data.filter((n) => n.is_read).length,
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
        columnHelper.accessor("title", {
          id: "title",
          header: "Title",
          cell: ({ row }) => (
            <div className="max-w-xs min-w-0 sm:max-w-sm md:max-w-md">
              <div className="font-semibold text-foreground">
                {row.original.title}
              </div>
            </div>
          ),
          enableHiding: false,
        }),

        columnHelper.accessor("type", {
          id: "type",
          header: "Type",
          cell: ({ row }) => (
            <Badge variant="outline" className="text-[10px] capitalize">
              {row.original.type}
            </Badge>
          ),
        }),

        columnHelper.accessor("is_read", {
          id: "is_read",
          header: "Status",
          cell: ({ row }) => (
            <span
              className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${
                row.original.is_read
                  ? "bg-muted text-muted-foreground"
                  : "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
              }`}
            >
              {row.original.is_read ? "Read" : "Unread"}
            </span>
          ),
        }),

        columnHelper.display({
          id: "recipient",
          header: "Recipient",
          cell: ({ row }) => {
            const profile = row.original.profiles
            const fullName = [profile?.first_name, profile?.last_name]
              .filter(Boolean)
              .join(" ")
            const email = profile?.email || row.original.user_id

            return (
              <div className="truncate text-xs">
                <div className="font-medium text-foreground">
                  {fullName || "User Account"}
                </div>
                <div className="text-[11px] text-muted-foreground">{email}</div>
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
                    className="size-7 text-muted-foreground data-[state=open]:bg-muted"
                  >
                    <MoreVerticalIcon className="size-4" />
                    <span className="sr-only">Actions</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-44 text-xs">
                  {row.original.link && (
                    <DropdownMenuItem asChild>
                      <Link
                        href={row.original.link}
                        target="_blank"
                        className="flex cursor-pointer items-center gap-2"
                      >
                        <ExternalLinkIcon className="size-3.5" />
                        Related Link
                      </Link>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem
                    onClick={() => setItemToDelete(row.original)}
                    className="flex cursor-pointer items-center gap-2 text-destructive focus:bg-destructive/10 focus:text-destructive"
                  >
                    <Trash2Icon className="size-3.5" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          ),
          enableHiding: false,
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
    <>
      <div className="flex w-full flex-col justify-start gap-4">
        {/* شريط الإجراءات والبحث */}
        <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-1 items-center gap-2">
            <div className="relative min-w-0 flex-1">
              <SearchIcon className="absolute inset-s-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search notifications..."
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

            {/* فلتر التبويب (Read / Unread / All) */}
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
                  setCurrentTab("unread")
                  table.setPageIndex(0)
                }}
                className={`inline-flex h-full items-center justify-center rounded-sm px-2.5 text-xs font-medium transition-colors ${
                  currentTab === "unread"
                    ? "bg-muted font-semibold text-foreground"
                    : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                }`}
              >
                Unread
                <Badge
                  variant="secondary"
                  className="ms-1.5 px-1.5 py-0 text-[10px]"
                >
                  {unreadCount}
                </Badge>
              </button>

              <button
                type="button"
                onClick={() => {
                  setCurrentTab("read")
                  table.setPageIndex(0)
                }}
                className={`inline-flex h-full items-center justify-center rounded-sm px-2.5 text-xs font-medium transition-colors ${
                  currentTab === "read"
                    ? "bg-muted font-semibold text-foreground"
                    : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                }`}
              >
                Read
                <Badge
                  variant="secondary"
                  className="ms-1.5 px-1.5 py-0 text-[10px]"
                >
                  {readCount}
                </Badge>
              </button>
            </div>

            {/* زر فلترة النوع */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  className="size-8"
                  title="Filter by Type"
                >
                  <FilterIcon className="size-3.5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-40 text-xs">
                {["all", "info", "success", "warning", "error"].map((type) => (
                  <DropdownMenuItem
                    key={type}
                    onClick={() => {
                      setTypeFilter(type)
                      table.setPageIndex(0)
                    }}
                    className="flex cursor-pointer items-center justify-between capitalize"
                  >
                    <span>{type}</span>
                    {typeFilter === type && (
                      <span className="font-bold text-primary">✓</span>
                    )}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* زر الأعمدة */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  className="size-8"
                  title="Toggle Columns"
                >
                  <Columns3Icon className="size-3.5" />
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

          {/* أزرار الإجراءات لفتح الشيتات */}
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsBroadcastOpen(true)}
              className="h-8 gap-1.5 text-xs"
            >
              <MegaphoneIcon className="size-3.5" />
              Broadcast
            </Button>

            <Button
              type="button"
              size="sm"
              onClick={() => setIsIndividualOpen(true)}
              className="h-8 gap-1.5 text-xs shadow-xs"
            >
              <PlusIcon className="size-3.5" />
              New Notification
            </Button>
          </div>
        </div>

        {/* عرض الجدول */}
        <div className="w-full overflow-hidden rounded-xl border border-border bg-card shadow-xs">
          <div className="overflow-x-auto">
            <Table className="w-full">
              <TableHeader className="bg-muted/40">
                {table.getHeaderGroups().map((headerGroup) => (
                  <TableRow key={headerGroup.id}>
                    {headerGroup.headers.map((header) => (
                      <TableHead
                        key={header.id}
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
                      No notifications found matching your criteria.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </div>

        {/* الترقيم (Pagination) */}
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

      {/* دايلوج تأكيد الحذف */}
      <DeleteNotificationDialog
        isOpen={Boolean(itemToDelete)}
        onOpenChange={(open) => !open && setItemToDelete(null)}
        item={itemToDelete}
        onSuccess={(deletedId) => {
          setData((prev) => prev.filter((item) => item.id !== deletedId))
          setItemToDelete(null)
        }}
      />

      {/* شيت إرسال إشعار فردي */}
      <NotificationForm
        isOpen={isIndividualOpen}
        onOpenChange={setIsIndividualOpen}
        users={users}
        onSuccess={() => {
          setIsIndividualOpen(false)
        }}
      />

      {/* شيت بث إشعار جماعي */}
      <BroadcastForm
        isOpen={isBroadcastOpen}
        onOpenChange={setIsBroadcastOpen}
        onSuccess={() => {
          setIsBroadcastOpen(false)
        }}
      />
    </>
  )
}
