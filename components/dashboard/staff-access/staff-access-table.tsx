"use client"

/**
 * @file components/dashboard/staff-access/staff-access-table.tsx
 * @description Standard TanStack Table v8 implementation for staff authorization & RBAC access.
 * Fully compliant with React 19, strict VisibilityState, uncontrolled role assignment sheets,
 * mobile column isolation, RTL-first layout, and permission gating via <Can />.
 */

import * as React from "react"
import { useTranslations } from "next-intl"
import { toast } from "sonner"
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
  UserCheckIcon,
  ShieldPlusIcon,
  XIcon,
  ShieldIcon,
  SearchIcon,
  Columns3Icon,
  MoreHorizontalIcon,
  ChevronsLeftIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronsRightIcon,
  FilterIcon,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
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
import { Can } from "@/components/shared/can"
import { PERMISSIONS } from "@/lib/actions/role"
import { useIsMobile } from "@/hooks/use-mobile"

import AssignRoleSheet from "./assign-role-sheet"
import type { UserWithRoles } from "@/lib/actions/role/queries/get-users-with-roles"
import type { RoleRecord } from "@/lib/actions/role/mutations/create-role"
import { removeRoleFromUser } from "@/lib/actions/role/mutations/remove-user-role"

const HIDEABLE_COLUMNS = ["roles"]

interface StaffAccessTableProps {
  initialUsers: UserWithRoles[]
  availableRoles: RoleRecord[]
  initialIsMobile?: boolean
}

export function StaffAccessTable({
  initialUsers,
  availableRoles,
  initialIsMobile = false,
}: StaffAccessTableProps) {
  const t = useTranslations("StaffAccessManagement")
  const isMobile = useIsMobile()

  const [users, setUsers] = React.useState<UserWithRoles[]>(() => initialUsers)
  const [currentTab, setCurrentTab] = React.useState<
    "all" | "assigned" | "unassigned"
  >("all")
  const [searchQuery, setSearchQuery] = React.useState("")
  const [revokingMap, setRevokingMap] = React.useState<Record<string, boolean>>(
    {}
  )

  React.useEffect(() => {
    setUsers(initialUsers)
  }, [initialUsers])

  const handleRevokeRole = async (
    userId: string,
    roleId: string,
    roleName: string
  ) => {
    const key = `${userId}-${roleId}`
    setRevokingMap((prev) => ({ ...prev, [key]: true }))

    try {
      const res = await removeRoleFromUser({ userId, roleId })
      if (res.success) {
        toast.success(t("ROLE_REVOKED_SUCCESS", { role: roleName }))
        setUsers((prev) =>
          prev.map((u) => {
            if (u.id !== userId) return u
            return {
              ...u,
              roles: u.roles.filter((r) => r.id !== roleId),
            }
          })
        )
      } else {
        toast.error(res.error || t("FAILED_TO_REMOVE_ROLE"))
      }
    } catch {
      toast.error(t("UNEXPECTED_REVOKE_ERROR"))
    } finally {
      setRevokingMap((prev) => {
        const next = { ...prev }
        delete next[key]
        return next
      })
    }
  }

  const filteredUsers = React.useMemo(() => {
    return users.filter((user) => {
      const rolesCount = user.roles.length
      if (currentTab === "assigned" && rolesCount === 0) return false
      if (currentTab === "unassigned" && rolesCount > 0) return false

      if (!searchQuery.trim()) return true
      const query = searchQuery.toLowerCase().trim()
      const fullName = [user.first_name, user.last_name]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
      const email = (user.email || "").toLowerCase()
      const rolesMatch = user.roles.some((r) =>
        r.name.toLowerCase().includes(query)
      )

      return fullName.includes(query) || email.includes(query) || rolesMatch
    })
  }, [users, currentTab, searchQuery])

  const assignedCount = React.useMemo(
    () => users.filter((u) => u.roles.length > 0).length,
    [users]
  )
  const unassignedCount = React.useMemo(
    () => users.filter((u) => u.roles.length === 0).length,
    [users]
  )

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

  const columns = React.useMemo<ColumnDef<UserWithRoles>[]>(
    () => [
      // 1. First Column: User Identifier (Pinned Visible)
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
              <div className="flex max-w-xs min-w-0 flex-col">
                <span className="truncate text-xs font-semibold text-foreground">
                  {fullName || t("ANONYMOUS_USER")}
                </span>
                <span className="truncate font-mono text-[11px] text-muted-foreground">
                  {row.original.email || t("NO_EMAIL")}
                </span>
              </div>
            </div>
          )
        },
      },
      // 2. Assigned Roles Badges (Hideable)
      {
        id: "roles",
        accessorKey: "roles",
        header: t("COLUMN_ROLES"),
        enableHiding: true,
        cell: ({ row }) => {
          const userRoles = row.original.roles || []
          return (
            <div className="flex flex-wrap items-center gap-1.5">
              {userRoles.length > 0 ? (
                userRoles.map((role) => {
                  const isRevoking = Boolean(
                    revokingMap[`${row.original.id}-${role.id}`]
                  )
                  return (
                    <Badge
                      key={role.id}
                      variant="secondary"
                      className="gap-1 py-0.5 ps-2 pe-1 text-[11px] font-semibold uppercase"
                    >
                      <ShieldIcon className="size-3 text-primary opacity-70" />
                      <span>{role.name}</span>
                      <Can permission={PERMISSIONS.ASSIGN_ROLE}>
                        <button
                          type="button"
                          disabled={isRevoking}
                          onClick={() =>
                            handleRevokeRole(
                              row.original.id,
                              role.id,
                              role.name
                            )
                          }
                          className="ms-0.5 cursor-pointer rounded-full p-0.5 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                          title={t("REMOVE_ROLE_TITLE", { role: role.name })}
                        >
                          <XIcon className="size-3" />
                        </button>
                      </Can>
                    </Badge>
                  )
                })
              ) : (
                <span className="text-[11px] text-muted-foreground italic">
                  {t("NO_ROLES_ASSIGNED")}
                </span>
              )}
            </div>
          )
        },
      },
      // 3. Last Column: Actions Dropdown (Pinned Visible)
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
                  <MoreHorizontalIcon className="size-4" />
                  <span className="sr-only">{t("ACTIONS_LABEL")}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-40 text-xs">
                <Can permission={PERMISSIONS.ASSIGN_ROLE}>
                  {/* Uncontrolled AssignRoleSheet Trigger with Radix Dropdown Safe Unmounting */}
                  <AssignRoleSheet
                    user={row.original}
                    availableRoles={availableRoles}
                    onSuccess={(userId, assignedRole) => {
                      setUsers((prev) =>
                        prev.map((u) => {
                          if (u.id !== userId) return u
                          return {
                            ...u,
                            roles: [...u.roles, assignedRole],
                          }
                        })
                      )
                    }}
                  >
                    <DropdownMenuItem
                      onSelect={(e) => e.preventDefault()}
                      className="cursor-pointer gap-2"
                    >
                      <ShieldPlusIcon className="size-3.5 text-primary" />
                      <span>{t("ASSIGN_ROLE_BUTTON")}</span>
                    </DropdownMenuItem>
                  </AssignRoleSheet>
                </Can>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        ),
      },
    ],
    [t, revokingMap, availableRoles]
  )

  const table = useReactTable({
    data: filteredUsers,
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
    user: t("COLUMN_USER"),
    roles: t("COLUMN_ROLES"),
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
                    {users.length}
                  </Badge>
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => {
                    setCurrentTab("assigned")
                    table.setPageIndex(0)
                  }}
                  className="flex cursor-pointer items-center justify-between"
                >
                  <span>{t("FILTER_ASSIGNED")}</span>
                  <Badge variant="secondary" className="px-1 py-0 text-[10px]">
                    {assignedCount}
                  </Badge>
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => {
                    setCurrentTab("unassigned")
                    table.setPageIndex(0)
                  }}
                  className="flex cursor-pointer items-center justify-between"
                >
                  <span>{t("FILTER_UNASSIGNED")}</span>
                  <Badge variant="secondary" className="px-1 py-0 text-[10px]">
                    {unassignedCount}
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
                {users.length}
              </Badge>
            </button>

            <button
              type="button"
              onClick={() => {
                setCurrentTab("assigned")
                table.setPageIndex(0)
              }}
              className={`inline-flex h-full items-center justify-center rounded-sm px-2.5 text-xs font-medium transition-colors ${
                currentTab === "assigned"
                  ? "bg-muted font-semibold text-foreground shadow-xs"
                  : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
              }`}
            >
              {t("FILTER_ASSIGNED")}
              <Badge
                variant="secondary"
                className="ms-1.5 px-1.5 py-0 text-[10px]"
              >
                {assignedCount}
              </Badge>
            </button>

            <button
              type="button"
              onClick={() => {
                setCurrentTab("unassigned")
                table.setPageIndex(0)
              }}
              className={`inline-flex h-full items-center justify-center rounded-sm px-2.5 text-xs font-medium transition-colors ${
                currentTab === "unassigned"
                  ? "bg-muted font-semibold text-foreground shadow-xs"
                  : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
              }`}
            >
              {t("FILTER_UNASSIGNED")}
              <Badge
                variant="secondary"
                className="ms-1.5 px-1.5 py-0 text-[10px]"
              >
                {unassignedCount}
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

export default StaffAccessTable
