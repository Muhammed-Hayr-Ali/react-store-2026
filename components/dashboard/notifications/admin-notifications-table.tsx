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
  AlertCircleIcon,
  AlertTriangleIcon,
  CheckCircle2Icon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronsLeftIcon,
  ChevronsRightIcon,
  Columns3Icon,
  ExternalLinkIcon,
  EyeIcon,
  FilterIcon,
  InfoIcon,
  LayersIcon,
  MegaphoneIcon,
  MoreVerticalIcon,
  PlusIcon,
  SearchIcon,
  Trash2Icon,
  UsersIcon,
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
import { NotificationDetailsDialog } from "./notification-details-dialog"

interface DisplayNotificationRecord extends AdminNotificationRecord {
  isBroadcastGroup?: boolean
  recipientCount?: number
  groupedIds?: string[]
}

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
  DisplayNotificationRecord
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

// دالة إرجاع الأيقونة واللون المخصص لكل نوع
function renderTypeIcon(type: string) {
  switch (type) {
    case "success":
      return <CheckCircle2Icon className="size-4 shrink-0 text-emerald-500" />
    case "warning":
      return <AlertTriangleIcon className="size-4 shrink-0 text-amber-500" />
    case "error":
      return <AlertCircleIcon className="size-4 shrink-0 text-rose-500" />
    case "info":
    default:
      return <InfoIcon className="size-4 shrink-0 text-blue-500" />
  }
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
  const [isGrouped, setIsGrouped] = React.useState<boolean>(true)

  // حالات الديالوجات والشيتات
  const [itemToDelete, setItemToDelete] =
    React.useState<DisplayNotificationRecord | null>(null)
  const [selectedForDetails, setSelectedForDetails] =
    React.useState<DisplayNotificationRecord | null>(null)
  const [isIndividualOpen, setIsIndividualOpen] = React.useState(false)
  const [isBroadcastOpen, setIsBroadcastOpen] = React.useState(false)

  if (initialData !== prevInitialData) {
    setPrevInitialData(initialData)
    setData(initialData)
  }

  // تجميع الإشعارات المتطابقة
  const processedData = React.useMemo<DisplayNotificationRecord[]>(() => {
    if (!isGrouped) {
      return data.map((item) => ({
        ...item,
        isBroadcastGroup: false,
        recipientCount: 1,
        groupedIds: [item.id],
      }))
    }

    const groupsMap = new Map<string, AdminNotificationRecord[]>()

    data.forEach((item) => {
      const minuteStamp = item.created_at ? item.created_at.slice(0, 16) : ""
      const key = `${item.title}__${item.message}__${item.type}__${minuteStamp}`

      if (!groupsMap.has(key)) {
        groupsMap.set(key, [])
      }
      groupsMap.get(key)!.push(item)
    })

    const result: DisplayNotificationRecord[] = []
    groupsMap.forEach((records) => {
      const first = records[0]
      if (records.length > 1) {
        result.push({
          ...first,
          isBroadcastGroup: true,
          recipientCount: records.length,
          groupedIds: records.map((r) => r.id),
        })
      } else {
        result.push({
          ...first,
          isBroadcastGroup: false,
          recipientCount: 1,
          groupedIds: [first.id],
        })
      }
    })

    return result
  }, [data, isGrouped])

  const filteredData = React.useMemo(() => {
    return processedData.filter((item) => {
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
  }, [processedData, currentTab, typeFilter, searchQuery])

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
            <div
              onClick={() => setSelectedForDetails(row.original)}
              className="group flex max-w-xs min-w-0 cursor-pointer items-center gap-2.5 sm:max-w-sm md:max-w-md"
            >
              {/* أيقونة النوع */}
              <div className="flex size-7 shrink-0 items-center justify-center rounded-md bg-muted/60">
                {renderTypeIcon(row.original.type)}
              </div>

              {/* العنوان وزر البث (نص الرسالة مخفي الآن ليبقى الجدول نظيفاً) */}
              <div className="flex items-center gap-1.5 truncate">
                <span className="truncate font-semibold text-foreground transition-colors group-hover:text-primary">
                  {row.original.title}
                </span>
                {row.original.isBroadcastGroup && (
                  <Badge
                    variant="secondary"
                    className="shrink-0 gap-1 px-1.5 py-0 text-[10px] font-normal"
                  >
                    <MegaphoneIcon className="size-2.5" />
                    Broadcast
                  </Badge>
                )}
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
          cell: ({ row }) => {
            if (row.original.isBroadcastGroup) {
              return (
                <span className="text-xs text-muted-foreground">Grouped</span>
              )
            }
            return (
              <span
                className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${
                  row.original.is_read
                    ? "bg-muted text-muted-foreground"
                    : "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                }`}
              >
                {row.original.is_read ? "Read" : "Unread"}
              </span>
            )
          },
        }),

        columnHelper.display({
          id: "recipient",
          header: "Recipient",
          cell: ({ row }) => {
            if (row.original.isBroadcastGroup) {
              return (
                <div className="flex items-center gap-1.5 text-xs">
                  <span className="inline-flex items-center gap-1 rounded-md bg-secondary/80 px-2 py-1 font-medium text-foreground">
                    <UsersIcon className="size-3 text-primary" />
                    <span>{row.original.recipientCount} Recipients</span>
                  </span>
                </div>
              )
            }

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
                  <DropdownMenuItem
                    onClick={() => setSelectedForDetails(row.original)}
                    className="flex cursor-pointer items-center gap-2"
                  >
                    <EyeIcon className="size-3.5" />
                    View Details
                  </DropdownMenuItem>
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
                    {row.original.isBroadcastGroup
                      ? "Delete Broadcast"
                      : "Delete"}
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
        <div className="flex w-full items-center gap-2">
          {/* حقل البحث */}
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

          <div className="flex shrink-0 items-center gap-2">
            {/* زر التجميع الذكي */}
            <Button
              type="button"
              variant={isGrouped ? "secondary" : "outline"}
              size="sm"
              onClick={() => setIsGrouped((prev) => !prev)}
              className="h-8 gap-1.5 text-xs"
              title="Group broadcast notifications"
            >
              <LayersIcon className="size-3.5" />
              <span className="hidden sm:inline">
                {isGrouped ? "Grouped" : "Individual"}
              </span>
            </Button>

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
                  {processedData.length}
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

            {/* فلتر النوع */}
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

            {/* زر إظهار/إخفاء الأعمدة */}
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

            {/* أزرار الإجراءات */}
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={() => setIsBroadcastOpen(true)}
              className="size-8 sm:hidden"
              title="Broadcast Notification"
            >
              <MegaphoneIcon className="size-3.5" />
              <span className="sr-only">Broadcast Notification</span>
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsBroadcastOpen(true)}
              className="hidden h-8 gap-1.5 px-3 text-xs sm:inline-flex"
            >
              <MegaphoneIcon className="size-3.5" />
              <span>Broadcast</span>
            </Button>

            <Button
              type="button"
              variant="default"
              size="icon"
              onClick={() => setIsIndividualOpen(true)}
              className="size-8 sm:hidden"
              title="New Notification"
            >
              <PlusIcon className="size-3.5" />
              <span className="sr-only">New Notification</span>
            </Button>
            <Button
              type="button"
              variant="default"
              size="sm"
              onClick={() => setIsIndividualOpen(true)}
              className="hidden h-8 gap-1.5 px-3 text-xs sm:inline-flex"
            >
              <PlusIcon className="size-3.5" />
              <span>New Notification</span>
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

      {/* دايلوج عرض تفاصيل الإشعار */}
      <NotificationDetailsDialog
        isOpen={Boolean(selectedForDetails)}
        onOpenChange={(open) => !open && setSelectedForDetails(null)}
        notification={selectedForDetails}
      />

      {/* دايلوج تأكيد الحذف */}
      <DeleteNotificationDialog
        isOpen={Boolean(itemToDelete)}
        onOpenChange={(open) => !open && setItemToDelete(null)}
        item={itemToDelete}
        onSuccess={(deletedId) => {
          if (itemToDelete?.groupedIds && itemToDelete.groupedIds.length > 0) {
            const idsToDelete = new Set(itemToDelete.groupedIds)
            setData((prev) => prev.filter((item) => !idsToDelete.has(item.id)))
          } else {
            setData((prev) => prev.filter((item) => item.id !== deletedId))
          }
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
