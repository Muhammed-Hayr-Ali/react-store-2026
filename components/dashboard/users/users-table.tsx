"use client"

/**
 * @file components/dashboard/users/users-table.tsx
 * @description Standard TanStack Table v8 data table for user accounts management.
 * Fully compliant with React 19, strict VisibilityState, mobile column isolation,
 * uncontrolled sheets/dialog triggers, RTL-first layout, and permission gating via <Can />.
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
  CircleCheckIcon,
  CircleAlertIcon,
  CircleXIcon,
  MoreHorizontalIcon,
  Columns3Icon,
  ChevronsLeftIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronsRightIcon,
  UserCheckIcon,
  ShieldAlertIcon,
  CopyIcon,
  SearchIcon,
  XIcon,
  FilterIcon,
  PlusIcon,
  PencilIcon,
  Trash2Icon,
} from "lucide-react"
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
import { Can } from "@/components/shared/can"
import { PERMISSIONS } from "@/lib/actions/role"
import { useIsMobile } from "@/hooks/use-mobile"

import type { AdminUserSummary, UserStatus } from "@/lib/actions/users/types"
import { UserStatusDialog } from "./user-status-dialog"
import { DeleteUserDialog } from "./delete-user-dialog"
import { UserFormSheet } from "./user-form-sheet"

const HIDEABLE_COLUMNS = ["phone_number", "roles", "status", "created_at"]

interface UsersTableProps {
  data: AdminUserSummary[]
  initialIsMobile?: boolean
}

export function UsersTable({
  data: initialData,
  initialIsMobile = false,
}: UsersTableProps) {
  const t = useTranslations("UsersManagement")
  const isMobile = useIsMobile()

  const [data, setData] = React.useState<AdminUserSummary[]>(() => initialData)
  const [currentTab, setCurrentTab] = React.useState<"all" | UserStatus>("all")
  const [searchQuery, setSearchQuery] = React.useState("")

  React.useEffect(() => {
    setData(initialData)
  }, [initialData])

  const filteredData = React.useMemo(() => {
    return data.filter((item) => {
      const matchesTab = currentTab === "all" || item.status === currentTab
      if (!matchesTab) return false

      if (!searchQuery.trim()) return true

      const query = searchQuery.toLowerCase().trim()
      const fullName = [item.first_name, item.last_name]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
      const email = (item.email || "").toLowerCase()
      const phone = (item.phone_number || "").toLowerCase()

      return (
        fullName.includes(query) ||
        email.includes(query) ||
        phone.includes(query)
      )
    })
  }, [data, currentTab, searchQuery])

  const activeCount = React.useMemo(
    () => data.filter((item) => item.status === "active").length,
    [data]
  )
  const bannedCount = React.useMemo(
    () => data.filter((item) => item.status === "banned").length,
    [data]
  )

  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>(() => {
      const initial: VisibilityState = {}
      HIDEABLE_COLUMNS.forEach((col) => {
        initial[col] = !initialIsMobile
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
      HIDEABLE_COLUMNS.forEach((col) => {
        nextVisibility[col] = !isMobile
      })
      return nextVisibility
    })

    setPagination((prev) => ({
      ...prev,
      pageSize: isMobile ? 20 : 10,
      pageIndex: 0,
    }))
  }, [isMobile])

  const columns = React.useMemo<ColumnDef<AdminUserSummary>[]>(
    () => [
      // 1. First Column: User Identity (Pinned Visible)
      {
        id: "user",
        accessorFn: (row) =>
          [row.first_name, row.last_name].filter(Boolean).join(" ") ||
          t("ANONYMOUS_USER"),
        header: t("COLUMN_USER"),
        enableHiding: false,
        cell: ({ row }) => {
          const fullName = [row.original.first_name, row.original.last_name]
            .filter(Boolean)
            .join(" ")
          return (
            <div className="flex items-center gap-2.5">
              <div className="flex size-7 shrink-0 items-center justify-center rounded-full bg-secondary text-xs font-bold text-foreground uppercase">
                {row.original.first_name ? (
                  row.original.first_name[0]
                ) : (
                  <UserCheckIcon className="size-3.5" />
                )}
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-semibold text-foreground">
                  {fullName || t("ANONYMOUS_USER")}
                </span>
                <span className="text-[11px] text-muted-foreground">
                  {row.original.email}
                </span>
              </div>
            </div>
          )
        },
      },
      // 2. Phone Number (Hideable)
      {
        id: "phone_number",
        accessorKey: "phone_number",
        header: t("COLUMN_PHONE"),
        enableHiding: true,
        cell: ({ row }) => (
          <span className="text-xs text-muted-foreground">
            {row.original.phone_number || "—"}
          </span>
        ),
      },
      // 3. Assigned Roles (Hideable)
      {
        id: "roles",
        accessorKey: "roles",
        header: t("COLUMN_ROLES"),
        enableHiding: true,
        cell: ({ row }) => (
          <div className="flex flex-wrap gap-1">
            {row.original.roles && row.original.roles.length > 0 ? (
              row.original.roles.map((r) => (
                <Badge
                  key={r}
                  variant="secondary"
                  className="px-1.5 py-0.5 text-[10px] font-semibold uppercase"
                >
                  {r}
                </Badge>
              ))
            ) : (
              <span className="text-xs text-muted-foreground">
                {t("CUSTOMER_ROLE")}
              </span>
            )}
          </div>
        ),
      },
      // 4. Moderation Status Badge (Hideable)
      {
        id: "status",
        accessorKey: "status",
        header: () => <div className="text-center">{t("COLUMN_STATUS")}</div>,
        enableHiding: true,
        cell: ({ row }) => {
          const status = row.original.status
          return (
            <div className="flex justify-center">
              <Badge
                variant="outline"
                className={`gap-1 px-2 py-0.5 text-xs ${
                  status === "active"
                    ? "border-emerald-500/30 text-emerald-600 dark:text-emerald-400"
                    : status === "suspended"
                      ? "border-amber-500/30 text-amber-600 dark:text-amber-400"
                      : "border-destructive/30 text-destructive"
                }`}
              >
                {status === "active" && (
                  <CircleCheckIcon className="size-3 fill-emerald-500 text-background" />
                )}
                {status === "suspended" && (
                  <CircleAlertIcon className="size-3 fill-amber-500 text-background" />
                )}
                {status === "banned" && (
                  <CircleXIcon className="size-3 fill-destructive text-background" />
                )}
                <span className="capitalize">{status}</span>
              </Badge>
            </div>
          )
        },
      },
      // 5. Account Joined Date (Hideable)
      {
        id: "created_at",
        accessorKey: "created_at",
        header: t("COLUMN_JOINED"),
        enableHiding: true,
        cell: ({ row }) => {
          const date = new Date(row.original.created_at)
          return (
            <span className="text-xs text-muted-foreground tabular-nums">
              {date.toLocaleDateString()}
            </span>
          )
        },
      },
      // 6. Last Column: Actions Dropdown (Pinned Visible)
      {
        id: "actions",
        enableHiding: false,
        cell: ({ row }) => {
          const userDisplayName =
            [row.original.first_name, row.original.last_name]
              .filter(Boolean)
              .join(" ") ||
            row.original.email ||
            t("ANONYMOUS_USER")

          return (
            <div className="flex items-center justify-end">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="size-7 text-muted-foreground data-[state=open]:bg-muted"
                  >
                    <MoreHorizontalIcon className="size-4" />
                    <span className="sr-only">{t("ACTIONS_LABEL")}</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-44 text-xs">
                  <DropdownMenuItem
                    className="cursor-pointer"
                    onClick={() => {
                      if (row.original.email) {
                        navigator.clipboard.writeText(row.original.email)
                        toast.success(t("EMAIL_COPIED_SUCCESS"))
                      }
                    }}
                  >
                    <CopyIcon className="me-2 size-3.5" />
                    {t("COPY_EMAIL_ACTION")}
                  </DropdownMenuItem>

                  <Can permission={PERMISSIONS.UPDATE_USER}>
                    <UserFormSheet
                      user={row.original}
                      onSuccess={(updatedUser) => {
                        setData((prev) =>
                          prev.map((u) =>
                            u.id === updatedUser.id ? updatedUser : u
                          )
                        )
                      }}
                    >
                      <DropdownMenuItem
                        onSelect={(e) => e.preventDefault()}
                        className="cursor-pointer"
                      >
                        <PencilIcon className="me-2 size-3.5" />
                        {t("EDIT_USER_ACTION")}
                      </DropdownMenuItem>
                    </UserFormSheet>
                  </Can>

                  <Can permission={PERMISSIONS.UPDATE_USER}>
                    <UserStatusDialog
                      user={row.original}
                      onSuccess={(userId, newStatus, banReason) => {
                        setData((prev) =>
                          prev.map((u) =>
                            u.id === userId
                              ? {
                                  ...u,
                                  status: newStatus,
                                  ban_reason: banReason || null,
                                }
                              : u
                          )
                        )
                      }}
                    >
                      <DropdownMenuItem
                        onSelect={(e) => e.preventDefault()}
                        className="cursor-pointer"
                      >
                        <ShieldAlertIcon className="me-2 size-3.5" />
                        {t("CHANGE_STATUS_ACTION")}
                      </DropdownMenuItem>
                    </UserStatusDialog>
                  </Can>

                  <Can permission={PERMISSIONS.DELETE_USER}>
                    <DropdownMenuSeparator />
                    <DeleteUserDialog
                      userId={row.original.id}
                      userName={userDisplayName}
                      onDeleted={(deletedId) => {
                        setData((prev) =>
                          prev.filter((u) => u.id !== deletedId)
                        )
                      }}
                    >
                      <DropdownMenuItem
                        onSelect={(e) => e.preventDefault()}
                        className="cursor-pointer text-destructive focus:bg-destructive/10 focus:text-destructive"
                      >
                        <Trash2Icon className="me-2 size-3.5" />
                        {t("DELETE_ACCOUNT")}
                      </DropdownMenuItem>
                    </DeleteUserDialog>
                  </Can>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          )
        },
      },
    ],
    [t]
  )

  const table = useReactTable({
    data: filteredData,
    columns,
    state: { sorting, columnVisibility, columnFilters, pagination },
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
    user: t("COLUMN_USER"),
    phone_number: t("COLUMN_PHONE"),
    roles: t("COLUMN_ROLES"),
    status: t("COLUMN_STATUS"),
    created_at: t("COLUMN_JOINED"),
  }

  return (
    <div className="flex w-full flex-col justify-start gap-4">
      {/* Interactive Toolbar */}
      <div className="flex w-full items-center gap-2">
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
                    setCurrentTab("banned")
                    table.setPageIndex(0)
                  }}
                  className="flex cursor-pointer items-center justify-between"
                >
                  <span>{t("FILTER_BANNED")}</span>
                  <Badge variant="secondary" className="px-1 py-0 text-[10px]">
                    {bannedCount}
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
                setCurrentTab("banned")
                table.setPageIndex(0)
              }}
              className={`inline-flex h-full items-center justify-center rounded-sm px-2.5 text-xs font-medium transition-colors ${
                currentTab === "banned"
                  ? "bg-muted font-semibold text-foreground shadow-xs"
                  : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
              }`}
            >
              {t("FILTER_BANNED")}
              <Badge
                variant="secondary"
                className="ms-1.5 px-1.5 py-0 text-[10px]"
              >
                {bannedCount}
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

          {/* Dual Responsive Create User CTA */}
          <Can permission={PERMISSIONS.CREATE_USER}>
            <UserFormSheet
              onSuccess={(newUser) => {
                setData((prev) => [newUser, ...prev])
              }}
            >
              <Button
                variant="default"
                size="icon"
                className="size-8 sm:hidden"
                title={t("CREATE_USER_BUTTON")}
              >
                <PlusIcon className="size-3.5" />
                <span className="sr-only">{t("CREATE_USER_BUTTON")}</span>
              </Button>
            </UserFormSheet>

            <UserFormSheet
              onSuccess={(newUser) => {
                setData((prev) => [newUser, ...prev])
              }}
            >
              <Button
                variant="default"
                size="sm"
                className="hidden h-8 gap-1.5 px-3 text-xs sm:inline-flex"
              >
                <PlusIcon className="size-3.5" />
                <span>{t("CREATE_USER_BUTTON")}</span>
              </Button>
            </UserFormSheet>
          </Can>
        </div>
      </div>

      {/* Table Shell */}
      <div className="w-full overflow-hidden rounded-xl border border-border bg-card shadow-xs">
        <div className="overflow-x-auto">
          <Table className="w-full">
            <TableHeader className="bg-muted/40">
              {table.getHeaderGroups().map((group) => (
                <TableRow key={group.id}>
                  {group.headers.map((header) => (
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
                    {t("NO_USERS_FOUND")}
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
            onValueChange={(val) => table.setPageSize(Number(val))}
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
                {[10, 20, 30, 50].map((size) => (
                  <SelectItem key={size} value={`${size}`} className="text-xs">
                    {size}
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

export { UsersTable as DataTable }
export default UsersTable
