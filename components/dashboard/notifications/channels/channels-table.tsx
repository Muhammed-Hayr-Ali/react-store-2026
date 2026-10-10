"use client"

/**
 * @file components/dashboard/notifications/channels/channels-table.tsx
 * @description Standard TanStack Table v8 implementation for notification channels management.
 * Fully compliant with React 19, strict VisibilityState, mobile column isolation,
 * RTL-first styling, and zero hallucinated table APIs.
 */

import * as React from "react"
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
} from "lucide-react"
import { toast } from "sonner"

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
import { useIsMobile } from "@/hooks/use-mobile"

import type { NotificationChannelRecord } from "@/lib/actions/notifications/types"
import {
  updateNotificationChannel,
  getAllNotificationChannels,
} from "@/lib/actions/notifications"
import { ChannelFormSheet } from "./channel-form-sheet"
import { DeleteChannelDialog } from "./delete-channel-dialog"

const HIDEABLE_COLUMNS = ["description", "policy", "is_active"]

interface ChannelsTableProps {
  channels: NotificationChannelRecord[]
  initialIsMobile?: boolean
}

export function ChannelsTable({
  channels: initialData,
  initialIsMobile = false,
}: ChannelsTableProps) {
  const t = useTranslations("NotificationChannelsManagement")
  const isMobile = useIsMobile()

  const [data, setData] = React.useState<NotificationChannelRecord[]>(
    () => initialData
  )
  const [currentTab, setCurrentTab] = React.useState<string>("all")
  const [searchQuery, setSearchQuery] = React.useState("")
  const [isPending, startTransition] = React.useTransition()

  // مزامنة حالة الجدول عند تحديث props الصفحة
  React.useEffect(() => {
    setData(initialData)
  }, [initialData])

  const refreshChannels = React.useCallback(() => {
    startTransition(async () => {
      const res = await getAllNotificationChannels()
      if (res.success && res.data) {
        setData(res.data)
      }
    })
  }, [])

  const handleToggleActive = (id: string, currentActive: boolean) => {
    const nextActive = !currentActive
    setData((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, is_active: nextActive } : item
      )
    )

    startTransition(async () => {
      const res = await updateNotificationChannel(id, { isActive: nextActive })
      if (res.success) {
        toast.success(t("STATUS_UPDATED_SUCCESS"))
        refreshChannels()
      } else {
        setData((prev) =>
          prev.map((item) =>
            item.id === id ? { ...item, is_active: currentActive } : item
          )
        )
        toast.error(res.error || t("FAILED_TO_UPDATE_STATUS"))
      }
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

  // عزل رؤية الأعمدة على الجوال وفق VisibilityState المعياري
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

  // بناء الأعمدة وفق TanStack Table v8 المعياري
  const columns = React.useMemo<ColumnDef<NotificationChannelRecord>[]>(
    () => [
      // 1. First Column: Channel Identifier (Pinned Visible)
      {
        id: "name",
        accessorKey: "name",
        enableHiding: false,
        header: t("COLUMN_CHANNEL"),
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
      },
      // 2. Channel Description (Hideable)
      {
        id: "description",
        accessorKey: "description",
        enableHiding: true,
        header: t("COLUMN_DESCRIPTION"),
        cell: ({ row }) => (
          <span className="block max-w-xs truncate text-xs text-muted-foreground">
            {row.original.description || "—"}
          </span>
        ),
      },
      // 3. Channel Policy (Hideable)
      {
        id: "policy",
        enableHiding: true,
        header: () => <div className="text-center">{t("COLUMN_POLICY")}</div>,
        cell: ({ row }) => (
          <div className="flex items-center justify-center gap-1.5">
            {row.original.is_mandatory ? (
              <Badge
                variant="outline"
                className="gap-1 border-blue-500/30 px-2 py-0.5 text-xs text-blue-600 dark:text-blue-400"
              >
                <LockIcon className="size-3" />
                {t("POLICY_MANDATORY")}
              </Badge>
            ) : (
              <Badge
                variant="outline"
                className="gap-1 px-2 py-0.5 text-xs text-muted-foreground"
              >
                {t("POLICY_OPTIONAL")}
              </Badge>
            )}
            {row.original.default_enabled && (
              <Badge
                variant="secondary"
                className="gap-1 px-1.5 py-0.5 text-[10px] font-normal"
              >
                {t("AUTO_SUBSCRIBED")}
              </Badge>
            )}
          </div>
        ),
      },
      // 4. Channel Active Switch (Hideable)
      {
        id: "is_active",
        accessorKey: "is_active",
        enableHiding: true,
        header: () => <div className="text-center">{t("COLUMN_ACTIVE")}</div>,
        cell: ({ row }) => (
          <div className="flex justify-center">
            <Switch
              checked={row.original.is_active}
              disabled={isPending}
              onCheckedChange={() =>
                handleToggleActive(row.original.id, row.original.is_active)
              }
              aria-label={t("TOGGLE_STATUS_LABEL")}
            />
          </div>
        ),
      },
      // 5. Last Column: Actions Dropdown (Pinned Visible)
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
                <ChannelFormSheet
                  channel={row.original}
                  onSuccess={refreshChannels}
                  trigger={
                    <DropdownMenuItem
                      onSelect={(e) => e.preventDefault()}
                      className="flex cursor-pointer items-center"
                    >
                      <PencilIcon className="me-2 size-3.5" />
                      {t("EDIT_CHANNEL")}
                    </DropdownMenuItem>
                  }
                />

                {!row.original.is_mandatory && (
                  <>
                    <DropdownMenuSeparator />
                    <DeleteChannelDialog
                      channel={row.original}
                      onSuccess={refreshChannels}
                      trigger={
                        <DropdownMenuItem
                          onSelect={(e) => e.preventDefault()}
                          className="flex cursor-pointer items-center text-destructive focus:bg-destructive/10 focus:text-destructive"
                        >
                          <Trash2Icon className="me-2 size-3.5" />
                          {t("DELETE_CHANNEL")}
                        </DropdownMenuItem>
                      }
                    />
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        ),
      },
    ],
    [t, isPending, refreshChannels]
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
    name: t("COLUMN_CHANNEL"),
    description: t("COLUMN_DESCRIPTION"),
    policy: t("COLUMN_POLICY"),
    is_active: t("COLUMN_ACTIVE"),
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
          {/* Mobile Filter Dropdown */}
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
                    setCurrentTab("mandatory")
                    table.setPageIndex(0)
                  }}
                  className="flex cursor-pointer items-center justify-between"
                >
                  <span>{t("FILTER_MANDATORY")}</span>
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
                  <span>{t("FILTER_OPTIONAL")}</span>
                  <Badge variant="secondary" className="px-1 py-0 text-[10px]">
                    {optionalCount}
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
                setCurrentTab("mandatory")
                table.setPageIndex(0)
              }}
              className={`inline-flex h-full items-center justify-center rounded-sm px-2.5 text-xs font-medium transition-colors ${
                currentTab === "mandatory"
                  ? "bg-muted font-semibold text-foreground shadow-xs"
                  : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
              }`}
            >
              {t("FILTER_MANDATORY")}
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
                  ? "bg-muted font-semibold text-foreground shadow-xs"
                  : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
              }`}
            >
              {t("FILTER_OPTIONAL")}
              <Badge
                variant="secondary"
                className="ms-1.5 px-1.5 py-0 text-[10px]"
              >
                {optionalCount}
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

          {/* Create Channel Trigger */}
          <ChannelFormSheet
            onSuccess={refreshChannels}
            trigger={
              <Button
                variant="default"
                size="sm"
                className="h-8 gap-1.5 px-2.5 text-xs sm:px-3"
              >
                <PlusIcon className="size-3.5" />
                <span className="hidden sm:inline">{t("CREATE_CHANNEL")}</span>
                <span className="sr-only sm:hidden">{t("CREATE_CHANNEL")}</span>
              </Button>
            }
          />
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
                    {t("NO_CHANNELS_FOUND")}
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
