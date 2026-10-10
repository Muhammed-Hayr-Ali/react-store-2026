"use client"

/**
 * @file components/dashboard/notifications/broadcasts/admin-notifications-table.tsx
 * @description Standard TanStack Table v8 data table for admin notifications and broadcasts.
 * Fully compliant with React 19, strict VisibilityState, RTL-first layout, and zero hallucinated APIs.
 */

import * as React from "react"
import Link from "next/link"
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
  AlertCircleIcon,
  AlertTriangleIcon,
  CalendarIcon,
  CheckCircle2Icon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronsLeftIcon,
  ChevronsRightIcon,
  CircleCheckIcon,
  Columns3Icon,
  EllipsisVerticalIcon,
  ExternalLinkIcon,
  EyeIcon,
  FilterIcon,
  InfoIcon,
  LayersIcon,
  MegaphoneIcon,
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
import { useIsMobile } from "@/hooks/use-mobile"

import type { AdminNotificationRecord } from "@/lib/actions/notifications/types"
import DeleteNotificationDialog from "./delete-notification-dialog"
import NotificationForm from "./notification-form-sheet"
import BroadcastForm from "./broadcast-form-sheet"
import { NotificationDetailsDialog } from "./notification-details-dialog"
import { AdminChannelsDialog } from "../channels/admin-channels-dialog"

interface DisplayNotificationRecord extends AdminNotificationRecord {
  isBroadcastGroup?: boolean
  recipientCount?: number
  groupedIds?: string[]
}

const HIDEABLE_COLUMNS = ["type", "is_read", "recipient", "created_at"]

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

function renderTypeIcon(type: string) {
  switch (type) {
    case "success":
      return <CheckCircle2Icon className="size-3.5 text-emerald-500" />
    case "warning":
      return <AlertTriangleIcon className="size-3.5 text-amber-500" />
    case "error":
      return <AlertCircleIcon className="size-3.5 text-rose-500" />
    case "info":
    default:
      return <InfoIcon className="size-3.5 text-blue-500" />
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
  const t = useTranslations("NotificationsManagement")
  const isMobile = useIsMobile()

  const [data, setData] = React.useState<AdminNotificationRecord[]>(
    () => initialData
  )
  const [currentTab, setCurrentTab] = React.useState<string>("all")
  const [searchQuery, setSearchQuery] = React.useState("")
  const [isGrouped, setIsGrouped] = React.useState<boolean>(true)

  // مزامنة حالة البيانات عند تحديث props الصفحة
  React.useEffect(() => {
    setData(initialData)
  }, [initialData])

  const handleDeleteSuccess = React.useCallback(
    (deletedId: string, groupedIds?: string[]) => {
      if (groupedIds && groupedIds.length > 0) {
        const idsSet = new Set(groupedIds)
        setData((prev) => prev.filter((item) => !idsSet.has(item.id)))
      } else {
        setData((prev) => prev.filter((item) => item.id !== deletedId))
      }
    },
    []
  )

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
      if (currentTab === "broadcast" && !item.isBroadcastGroup) return false

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
  }, [processedData, currentTab, searchQuery])

  const unreadCount = React.useMemo(
    () => processedData.filter((i) => !i.is_read && !i.isBroadcastGroup).length,
    [processedData]
  )
  const readCount = React.useMemo(
    () => processedData.filter((i) => i.is_read && !i.isBroadcastGroup).length,
    [processedData]
  )
  const broadcastCount = React.useMemo(
    () => processedData.filter((i) => i.isBroadcastGroup).length,
    [processedData]
  )

  // ضبط عزل الأعمدة للجوال وفق VisibilityState المعياري
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

  // بناء الأعمدة عبر TanStack Table v8 المعياري الصارم
  const columns = React.useMemo<ColumnDef<DisplayNotificationRecord>[]>(
    () => [
      // 1. First Column: Identifier & Preview (Pinned Visible)
      {
        id: "title",
        accessorKey: "title",
        enableHiding: false,
        header: t("COLUMN_NOTIFICATION"),
        cell: ({ row }) => (
          <div className="flex items-center gap-2.5">
            <div className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-secondary text-foreground">
              {renderTypeIcon(row.original.type)}
            </div>
            <div className="flex max-w-xs min-w-0 flex-col sm:max-w-md">
              <NotificationDetailsDialog
                notification={row.original}
                trigger={
                  <span className="cursor-pointer truncate text-xs font-semibold text-foreground transition-colors hover:text-primary hover:underline">
                    {row.original.title}
                  </span>
                }
              />
              <span className="truncate text-[11px] text-muted-foreground">
                {row.original.message}
              </span>
            </div>
          </div>
        ),
      },
      // 2. Notification Type Badge (Hideable)
      {
        id: "type",
        accessorKey: "type",
        enableHiding: true,
        header: () => <div className="text-center">{t("COLUMN_TYPE")}</div>,
        cell: ({ row }) => (
          <div className="flex justify-center">
            <Badge
              variant="outline"
              className="px-2 py-0.5 text-[10px] capitalize"
            >
              {row.original.type}
            </Badge>
          </div>
        ),
      },
      // 3. Read / Broadcast Status (Hideable)
      {
        id: "is_read",
        accessorKey: "is_read",
        enableHiding: true,
        header: () => <div className="text-center">{t("COLUMN_STATUS")}</div>,
        cell: ({ row }) => {
          if (row.original.isBroadcastGroup) {
            return (
              <div className="flex justify-center">
                <Badge
                  variant="outline"
                  className="gap-1 border-blue-500/30 px-2 py-0.5 text-xs text-blue-600 dark:text-blue-400"
                >
                  <MegaphoneIcon className="size-3" />
                  {t("STATUS_BROADCAST")}
                </Badge>
              </div>
            )
          }
          return (
            <div className="flex justify-center">
              {row.original.is_read ? (
                <Badge
                  variant="outline"
                  className="gap-1 px-2 py-0.5 text-xs text-muted-foreground"
                >
                  <CircleCheckIcon className="size-3" />
                  {t("STATUS_READ")}
                </Badge>
              ) : (
                <Badge
                  variant="outline"
                  className="gap-1 border-emerald-500/30 px-2 py-0.5 text-xs text-emerald-600 dark:text-emerald-400"
                >
                  <span className="size-1.5 animate-pulse rounded-full bg-emerald-500" />
                  {t("STATUS_UNREAD")}
                </Badge>
              )}
            </div>
          )
        },
      },
      // 4. Recipient Details (Hideable)
      {
        id: "recipient",
        enableHiding: true,
        header: t("COLUMN_RECIPIENT"),
        cell: ({ row }) => {
          if (row.original.isBroadcastGroup) {
            return (
              <div className="flex items-center gap-1.5 text-xs">
                <Badge
                  variant="secondary"
                  className="gap-1 px-2 py-0.5 text-xs font-normal"
                >
                  <UsersIcon className="size-3 text-primary" />
                  <span>
                    {t("RECIPIENTS_COUNT", {
                      count: row.original.recipientCount ?? 0,
                    })}
                  </span>
                </Badge>
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
                {fullName || t("USER_ACCOUNT")}
              </div>
              <div className="font-mono text-[11px] text-muted-foreground">
                {email}
              </div>
            </div>
          )
        },
      },
      // 5. Submitted At Timestamp (Hideable)
      {
        id: "created_at",
        accessorKey: "created_at",
        enableHiding: true,
        header: t("COLUMN_SUBMITTED"),
        cell: ({ row }) => (
          <div
            className="text-xs text-muted-foreground"
            suppressHydrationWarning
          >
            <div className="flex items-center gap-1 font-mono text-[11px]">
              <CalendarIcon className="size-3 shrink-0 text-muted-foreground" />
              <span>{formatDate(row.original.created_at)}</span>
            </div>
            <div className="mt-0.5 font-mono text-[10px] text-muted-foreground/70">
              {formatTime(row.original.created_at)}
            </div>
          </div>
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
                  <EllipsisVerticalIcon className="size-4" />
                  <span className="sr-only">{t("ACTIONS_LABEL")}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-44 text-xs">
                <NotificationDetailsDialog
                  notification={row.original}
                  trigger={
                    <DropdownMenuItem
                      onSelect={(e) => e.preventDefault()}
                      className="flex cursor-pointer items-center"
                    >
                      <EyeIcon className="me-2 size-3.5" />
                      {t("VIEW_DETAILS")}
                    </DropdownMenuItem>
                  }
                />

                {row.original.link && (
                  <DropdownMenuItem asChild>
                    <Link
                      href={row.original.link}
                      target="_blank"
                      className="flex cursor-pointer items-center"
                    >
                      <ExternalLinkIcon className="me-2 size-3.5" />
                      {t("RELATED_LINK")}
                    </Link>
                  </DropdownMenuItem>
                )}

                <DropdownMenuSeparator />

                <DeleteNotificationDialog
                  item={row.original}
                  onSuccess={handleDeleteSuccess}
                  trigger={
                    <DropdownMenuItem
                      onSelect={(e) => e.preventDefault()}
                      className="flex cursor-pointer items-center text-destructive focus:bg-destructive/10 focus:text-destructive"
                    >
                      <Trash2Icon className="me-2 size-3.5" />
                      <span>
                        {row.original.isBroadcastGroup
                          ? t("DELETE_BROADCAST")
                          : t("DELETE_ACTION")}
                      </span>
                    </DropdownMenuItem>
                  }
                />
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        ),
      },
    ],
    [t, handleDeleteSuccess]
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
    title: t("COLUMN_NOTIFICATION"),
    type: t("COLUMN_TYPE"),
    is_read: t("COLUMN_STATUS"),
    recipient: t("COLUMN_RECIPIENT"),
    created_at: t("COLUMN_SUBMITTED"),
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
          {/* Grouping Toggle Button */}
          <Button
            type="button"
            variant={isGrouped ? "secondary" : "outline"}
            size="sm"
            onClick={() => setIsGrouped((prev) => !prev)}
            className="h-8 gap-1.5 text-xs"
            title={t("GROUPING_TOGGLE_TITLE")}
          >
            <LayersIcon className="size-3.5" />
            <span className="hidden sm:inline">
              {isGrouped ? t("GROUPED_LABEL") : t("INDIVIDUAL_LABEL")}
            </span>
          </Button>

          {/* Quick Channels Dialog Trigger */}
          <AdminChannelsDialog />

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
                    {processedData.length}
                  </Badge>
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => {
                    setCurrentTab("unread")
                    table.setPageIndex(0)
                  }}
                  className="flex cursor-pointer items-center justify-between"
                >
                  <span>{t("FILTER_UNREAD")}</span>
                  <Badge variant="secondary" className="px-1 py-0 text-[10px]">
                    {unreadCount}
                  </Badge>
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => {
                    setCurrentTab("read")
                    table.setPageIndex(0)
                  }}
                  className="flex cursor-pointer items-center justify-between"
                >
                  <span>{t("FILTER_READ")}</span>
                  <Badge variant="secondary" className="px-1 py-0 text-[10px]">
                    {readCount}
                  </Badge>
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => {
                    setCurrentTab("broadcast")
                    table.setPageIndex(0)
                  }}
                  className="flex cursor-pointer items-center justify-between"
                >
                  <span>{t("FILTER_BROADCAST")}</span>
                  <Badge variant="secondary" className="px-1 py-0 text-[10px]">
                    {broadcastCount}
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
                  ? "bg-muted font-semibold text-foreground shadow-xs"
                  : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
              }`}
            >
              {t("FILTER_UNREAD")}
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
                  ? "bg-muted font-semibold text-foreground shadow-xs"
                  : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
              }`}
            >
              {t("FILTER_READ")}
              <Badge
                variant="secondary"
                className="ms-1.5 px-1.5 py-0 text-[10px]"
              >
                {readCount}
              </Badge>
            </button>

            <button
              type="button"
              onClick={() => {
                setCurrentTab("broadcast")
                table.setPageIndex(0)
              }}
              className={`inline-flex h-full items-center justify-center rounded-sm px-2.5 text-xs font-medium transition-colors ${
                currentTab === "broadcast"
                  ? "bg-muted font-semibold text-foreground shadow-xs"
                  : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
              }`}
            >
              {t("FILTER_BROADCAST")}
              <Badge
                variant="secondary"
                className="ms-1.5 px-1.5 py-0 text-[10px]"
              >
                {broadcastCount}
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

          {/* Broadcast Form Trigger */}
          <div className="sm:hidden">
            <BroadcastForm
              trigger={
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  className="size-8"
                  title={t("BROADCAST_BUTTON")}
                >
                  <MegaphoneIcon className="size-3.5" />
                  <span className="sr-only">{t("BROADCAST_BUTTON")}</span>
                </Button>
              }
            />
          </div>
          <div className="hidden sm:inline-flex">
            <BroadcastForm />
          </div>

          {/* New Individual Notification Form Trigger */}
          <div className="sm:hidden">
            <NotificationForm
              users={users}
              trigger={
                <Button
                  type="button"
                  variant="default"
                  size="icon"
                  className="size-8"
                  title={t("NEW_NOTIFICATION")}
                >
                  <PlusIcon className="size-3.5" />
                  <span className="sr-only">{t("NEW_NOTIFICATION")}</span>
                </Button>
              }
            />
          </div>
          <div className="hidden sm:inline-flex">
            <NotificationForm
              users={users}
              trigger={
                <Button
                  type="button"
                  variant="default"
                  size="sm"
                  className="h-8 gap-1.5 px-3 text-xs"
                >
                  <PlusIcon className="size-3.5" />
                  <span>{t("NEW_NOTIFICATION")}</span>
                </Button>
              }
            />
          </div>
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
                    {t("NO_NOTIFICATIONS_FOUND")}
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
