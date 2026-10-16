"use client"

/**
 * @file components/dashboard/roles/roles-table.tsx
 * @description Standard TanStack Table v8 data table for RBAC roles management.
 * Fully compliant with React 19, strict VisibilityState, mobile column isolation,
 * RTL-first layout, and permission gating via <Can />.
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
  ShieldIcon,
  PencilIcon,
  LayersIcon,
  SearchIcon,
  XIcon,
  Columns3Icon,
  MoreHorizontalIcon,
  Trash2Icon,
  ChevronsLeftIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronsRightIcon,
  FilterIcon,
  PlusIcon,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { AlertDialogTrigger } from "@/components/ui/alert-dialog"
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
import type { RoleRecord } from "@/lib/actions/role/types"
import { appRoutes } from "@/lib/config/app-routes"
import { DeleteRoleDialog } from "./delete-role-dialog"

const HIDEABLE_COLUMNS = ["permissions"]

interface RoleRowActionsProps {
  role: RoleRecord
  onDeleted: (deletedId: string) => void
}

// Keep the role deletion dialog mounted independently from the closing menu.
function RoleRowActions({ role, onDeleted }: RoleRowActionsProps) {
  const t = useTranslations("RolesManagement")

  return (
    <DeleteRoleDialog
      roleId={role.id}
      roleName={role.name}
      onDeleted={onDeleted}
    >
      <Can permission={[PERMISSIONS.UPDATE_ROLE, PERMISSIONS.DELETE_ROLE]}>
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
              <Can permission={PERMISSIONS.UPDATE_ROLE}>
                <DropdownMenuItem asChild>
                  <Link
                    href={`${appRoutes.dashboard.team.roles}/${role.id}/edit`}
                    className="flex cursor-pointer items-center"
                  >
                    <PencilIcon className="me-2 size-3.5" />
                    {t("EDIT_ROLE")}
                  </Link>
                </DropdownMenuItem>
              </Can>
              <Can permission={PERMISSIONS.DELETE_ROLE}>
                <AlertDialogTrigger
                  render={
                    <DropdownMenuItem className="cursor-pointer text-destructive focus:text-destructive">
                      <Trash2Icon className="me-2 size-3.5" />
                      {t("DELETE_ROLE")}
                    </DropdownMenuItem>
                  }
                />
              </Can>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </Can>
    </DeleteRoleDialog>
  )
}

// Provide the initial role data and responsive visibility settings.
interface RolesTableProps {
  initialRoles: RoleRecord[]
  initialIsMobile?: boolean
}

export function RolesTable({
  initialRoles,
  initialIsMobile = false,
}: RolesTableProps) {
  // Resolve translations and the current responsive layout.
  const t = useTranslations("RolesManagement")
  const isMobile = useIsMobile()

  // Track role data, search, and the selected role filter.
  const [data, setData] = React.useState<RoleRecord[]>(() => initialRoles)
  const [currentTab, setCurrentTab] = React.useState<
    "all" | "active" | "empty"
  >("all")
  const [searchQuery, setSearchQuery] = React.useState("")

  // Refresh local rows when the parent supplies updated role data.
  React.useEffect(() => {
    setData(initialRoles)
  }, [initialRoles])

  // Filter roles by permission coverage and search text.
  const filteredData = React.useMemo(() => {
    return data.filter((role) => {
      const permCount = role.permissions?.length || 0
      if (currentTab === "active" && permCount === 0) return false
      if (currentTab === "empty" && permCount > 0) return false

      if (!searchQuery.trim()) return true
      const q = searchQuery.toLowerCase().trim()
      return (
        role.name.toLowerCase().includes(q) ||
        (role.description || "").toLowerCase().includes(q)
      )
    })
  }, [data, currentTab, searchQuery])

  // Count roles with and without assigned permissions.
  const activeCount = React.useMemo(
    () => data.filter((r) => (r.permissions?.length || 0) > 0).length,
    [data]
  )
  const emptyCount = React.useMemo(
    () => data.filter((r) => (r.permissions?.length || 0) === 0).length,
    [data]
  )

  // Track table visibility, filtering, sorting, and pagination state.
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

  // Adjust hidden columns and page size when the viewport changes.
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

  // Define role details, permission counts, and available row actions.
  const columns = React.useMemo<ColumnDef<RoleRecord>[]>(
    () => [
      // 1. First Column: Role Identifier (Pinned Visible)
      {
        id: "name",
        accessorKey: "name",
        enableHiding: false,
        header: t("COLUMN_ROLE"),
        cell: ({ row }) => (
          <div className="flex items-center gap-2.5">
            <div className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-secondary text-foreground">
              <ShieldIcon className="size-3.5 text-primary" />
            </div>
            <div className="flex max-w-xs min-w-0 flex-col sm:max-w-md">
              <span className="truncate text-xs font-semibold text-foreground uppercase">
                {row.original.name}
              </span>
              <span className="max-w-3xs truncate font-mono text-[11px] text-muted-foreground">
                {row.original.description || t("NO_DESCRIPTION")}
              </span>
            </div>
          </div>
        ),
      },
      // 2. Permissions Count Badge (Hideable)
      {
        id: "permissions",
        enableHiding: true,
        header: () => (
          <div className="text-center">{t("COLUMN_PERMISSIONS")}</div>
        ),
        cell: ({ row }) => {
          // Calculate the total number of permissions from the permission map.
          const totalPermissions = Object.keys(PERMISSIONS).length

          return (
            <div className="flex justify-center">
              <Badge
                variant="secondary"
                className="truncate px-1.5 py-0.5 font-mono text-[11px] leading-tight text-muted-foreground uppercase"
              >
                <LayersIcon className="size-3 opacity-70" />
                <span dir="ltr">
                  {row.original.permissions?.length || 0} / {totalPermissions}
                </span>
              </Badge>
            </div>
          )
        },
      },
      // 3. Last Column: Actions Dropdown (Pinned Visible)
      {
        id: "actions",
        enableHiding: false,
        cell: ({ row }) => (
          <RoleRowActions
            role={row.original}
            onDeleted={(deletedId) => {
              if (
                pagination.pageIndex > 0 &&
                filteredData.length -
                  pagination.pageIndex * pagination.pageSize ===
                  1
              ) {
                setPagination((current) => ({
                  ...current,
                  pageIndex: current.pageIndex - 1,
                }))
              }
              setData((current) =>
                current.filter((role) => role.id !== deletedId)
              )
            }}
          />
        ),
      },
    ],
    [filteredData.length, pagination.pageIndex, pagination.pageSize, t]
  )

  // Create the table instance and connect its controlled state.
  const table = useReactTable({
    data: filteredData,
    columns,
    state: {
      sorting,
      columnVisibility,
      columnFilters,
      pagination,
    },
    getRowId: (row) => String(row.id),
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  })

  // Map table column IDs to their translated labels.
  const columnLabelsMap: Record<string, string> = {
    name: t("COLUMN_ROLE"),
    permissions: t("COLUMN_PERMISSIONS"),
  }

  // Render search, filters, role actions, the role table, and pagination.
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
                    setCurrentTab("empty")
                    table.setPageIndex(0)
                  }}
                  className="flex cursor-pointer items-center justify-between"
                >
                  <span>{t("FILTER_EMPTY")}</span>
                  <Badge variant="secondary" className="px-1 py-0 text-[10px]">
                    {emptyCount}
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
                setCurrentTab("empty")
                table.setPageIndex(0)
              }}
              className={`inline-flex h-full items-center justify-center rounded-sm px-2.5 text-xs font-medium transition-colors ${
                currentTab === "empty"
                  ? "bg-muted font-semibold text-foreground shadow-xs"
                  : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
              }`}
            >
              {t("FILTER_EMPTY")}
              <Badge
                variant="secondary"
                className="ms-1.5 px-1.5 py-0 text-[10px]"
              >
                {emptyCount}
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
                /* Include only columns that support hiding. */
                .filter((col) => col.getCanHide())
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

          {/* Dual Responsive CTA Button */}
          <Can permission={PERMISSIONS.CREATE_ROLE}>
            <Link href={appRoutes.dashboard.team.create_roles}>
              <Button
                variant="default"
                size="icon"
                className="size-8 sm:hidden"
                title={t("CREATE_ROLE")}
              >
                <PlusIcon className="size-3.5" />
                <span className="sr-only">{t("CREATE_ROLE")}</span>
              </Button>
              <Button
                variant="default"
                size="sm"
                className="hidden h-8 gap-1.5 px-3 text-xs sm:inline-flex"
              >
                <PlusIcon className="size-3.5" />
                <span>{t("CREATE_ROLE")}</span>
              </Button>
            </Link>
          </Can>
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
                    {t("NO_ROLES_FOUND")}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Standard pagination footer */}
      <div className="flex w-full flex-nowrap items-center justify-between gap-2 px-1">
        <div className="flex min-w-0 shrink items-center gap-1.5 text-[11px] text-muted-foreground sm:gap-2 sm:text-xs">
          <Label
            htmlFor="rows-per-page"
            className="text-[11px] font-medium whitespace-nowrap max-sm:sr-only sm:text-xs"
          >
            {t("ROWS_PER_PAGE")}
          </Label>
          <Select
            value={`${table.getState().pagination.pageSize}`}
            onValueChange={(value) => table.setPageSize(Number(value))}
          >
            <SelectTrigger
              size="sm"
              className="h-7 w-[60px] shrink-0 px-2 text-xs sm:h-8 sm:w-18"
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
          <span className="ms-1.5 shrink-0 whitespace-nowrap">
            {t("PAGE_COUNTER", {
              page: table.getState().pagination.pageIndex + 1,
              total: table.getPageCount() || 1,
            })}
          </span>
        </div>

        <div className="flex shrink-0 items-center gap-1 sm:gap-1.5">
          <Button
            variant="outline"
            className="hidden size-7 p-0 sm:flex sm:size-8"
            onClick={() => table.setPageIndex(0)}
            disabled={!table.getCanPreviousPage()}
            title={t("FIRST_PAGE")}
          >
            <ChevronsLeftIcon className="size-3.5 sm:size-4 rtl:rotate-180" />
            <span className="sr-only">{t("FIRST_PAGE")}</span>
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="size-7 sm:size-8"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
            title={t("PREVIOUS_PAGE")}
          >
            <ChevronLeftIcon className="size-3.5 sm:size-4 rtl:rotate-180" />
            <span className="sr-only">{t("PREVIOUS_PAGE")}</span>
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="size-7 sm:size-8"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
            title={t("NEXT_PAGE")}
          >
            <ChevronRightIcon className="size-3.5 sm:size-4 rtl:rotate-180" />
            <span className="sr-only">{t("NEXT_PAGE")}</span>
          </Button>
          <Button
            variant="outline"
            className="hidden size-7 p-0 sm:flex sm:size-8"
            onClick={() => table.setPageIndex(table.getPageCount() - 1)}
            disabled={!table.getCanNextPage()}
            title={t("LAST_PAGE")}
          >
            <ChevronsRightIcon className="size-3.5 sm:size-4 rtl:rotate-180" />
            <span className="sr-only">{t("LAST_PAGE")}</span>
          </Button>
        </div>
      </div>
    </div>
  )
}

export default RolesTable
