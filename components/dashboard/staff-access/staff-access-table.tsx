"use client"

import * as React from "react"
import { toast } from "sonner"
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
  UserCheckIcon,
  ShieldPlusIcon,
  XIcon,
  ShieldIcon,
  SearchIcon,
  Columns3Icon,
  EllipsisVerticalIcon,
  ChevronsLeftIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronsRightIcon,
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

import AssignRoleDialog from "./assign-role-dialog"
import { UserWithRoles } from "@/lib/actions/role/queries/get-users-with-roles"
import { RoleRecord } from "@/lib/actions/role/mutations/create-role"
import { removeRoleFromUser } from "@/lib/actions/role/mutations/remove-user-role"

// -----------------------------------------------------------------------------
// 1. TanStack Table Setup
// -----------------------------------------------------------------------------
const features = tableFeatures({
  columnFilteringFeature,
  columnVisibilityFeature,
  rowPaginationFeature,
  rowSortingFeature,
  filteredRowModel: createFilteredRowModel(),
  paginatedRowModel: createPaginatedRowModel(),
  sortedRowModel: createSortedRowModel(),
})

const columnHelper = createColumnHelper<typeof features, UserWithRoles>()

// الأعمدة المخفية تلقائياً على شاشات الجوال
const HIDEABLE_COLUMNS = ["email", "roles"]

const columnLabelsMap: Record<string, string> = {
  user: "User",
  email: "Email",
  roles: "Assigned Roles",
}

interface StaffAccessTableProps {
  initialUsers: UserWithRoles[]
  availableRoles: RoleRecord[]
  initialIsMobile?: boolean
}

// -----------------------------------------------------------------------------
// 2. Main Component (StaffAccessTable)
// -----------------------------------------------------------------------------
export function StaffAccessTable({
  initialUsers,
  availableRoles,
  initialIsMobile = false,
}: StaffAccessTableProps) {
  const [users, setUsers] = React.useState<UserWithRoles[]>(initialUsers)
  const [prevInitialUsers, setPrevInitialUsers] = React.useState(initialUsers)
  const [currentTab, setCurrentTab] = React.useState<
    "all" | "assigned" | "unassigned"
  >("all")
  const [searchQuery, setSearchQuery] = React.useState("")
  const [selectedUser, setSelectedUser] = React.useState<UserWithRoles | null>(
    null
  )
  const [isAssignOpen, setIsAssignOpen] = React.useState(false)
  const [revokingMap, setRevokingMap] = React.useState<Record<string, boolean>>(
    {}
  )

  if (initialUsers !== prevInitialUsers) {
    setPrevInitialUsers(initialUsers)
    setUsers(initialUsers)
  }

  const handleRevokeRole = async (
    userId: string,
    roleId: number,
    roleName: string
  ) => {
    const key = `${userId}-${roleId}`
    setRevokingMap((prev) => ({ ...prev, [key]: true }))

    try {
      const res = await removeRoleFromUser({ userId, roleId })
      if (res.success) {
        toast.success(`Role "${roleName}" removed successfully.`)
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
        toast.error(res.error || "Failed to remove role.")
      }
    } catch {
      toast.error("An unexpected error occurred.")
    } finally {
      setRevokingMap((prev) => {
        const next = { ...prev }
        delete next[key]
        return next
      })
    }
  }

  // فلترة مدمجة تجمع بين التبويبات والبحث النصي
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
    React.useState<ColumnVisibilityState>(() => {
      const isMobile =
        typeof window !== "undefined"
          ? window.innerWidth < 768
          : initialIsMobile
      const initial: ColumnVisibilityState = {}
      HIDEABLE_COLUMNS.forEach((colId) => {
        initial[colId] = !isMobile
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
        columnHelper.accessor(
          (row) =>
            [row.first_name, row.last_name].filter(Boolean).join(" ") ||
            "Anonymous User",
          {
            id: "user",
            header: "User",
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
                  <span className="text-xs font-semibold text-foreground">
                    {fullName || "Anonymous User"}
                  </span>
                </div>
              )
            },
            enableHiding: false,
          }
        ),

        columnHelper.accessor("email", {
          id: "email",
          header: "Email",
          cell: ({ row }) => (
            <span className="font-mono text-xs text-muted-foreground">
              {row.original.email || "—"}
            </span>
          ),
        }),

        columnHelper.accessor("roles", {
          id: "roles",
          header: "Assigned Roles",
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
                          title={`Remove ${role.name}`}
                        >
                          <XIcon className="size-3" />
                        </button>
                      </Badge>
                    )
                  })
                ) : (
                  <span className="text-[11px] text-muted-foreground italic">
                    No roles assigned
                  </span>
                )}
              </div>
            )
          },
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
                    <EllipsisVerticalIcon className="size-4" />
                    <span className="sr-only">Actions</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-40 text-xs">
                  <DropdownMenuItem
                    className="cursor-pointer gap-2"
                    onClick={() => {
                      setSelectedUser(row.original)
                      setIsAssignOpen(true)
                    }}
                  >
                    <ShieldPlusIcon className="size-3.5 text-primary" />
                    Assign Role
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          ),
          enableHiding: false,
        }),
      ]),
    [revokingMap]
  )

  const table = useTable({
    features,
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
  })

  const getColumnResponsiveClasses = (columnId: string) => {
    if (HIDEABLE_COLUMNS.includes(columnId)) {
      return "hidden md:table-cell"
    }
    return ""
  }

  return (
    <div className="flex w-full flex-col justify-start gap-4">
      {/* Controls Bar: شريط علوي موحد متطابق بارتفاع h-8 ومحاذاة تامة */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:w-64">
          <SearchIcon className="absolute inset-s-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search users..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value)
              table.setPageIndex(0)
            }}
            className="h-8 ps-8 pe-8 text-xs"
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

        <div className="flex flex-wrap items-center gap-2">
          {/* شريط الفلترة المتصل بدون شادو */}
          <div className="inline-flex h-8 items-center overflow-hidden rounded-md border border-input bg-background p-0.5">
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
                  ? "bg-muted font-semibold text-foreground"
                  : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
              }`}
            >
              Assigned
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
                  ? "bg-muted font-semibold text-foreground"
                  : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
              }`}
            >
              Unassigned
              <Badge
                variant="secondary"
                className="ms-1.5 px-1.5 py-0 text-[10px]"
              >
                {unassignedCount}
              </Badge>
            </button>
          </div>

          {/* زر اختيار الأعمدة كأيقونة مربعة size-8 */}
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
        </div>
      </div>

      {/* Main Table */}
      <div className="w-full overflow-hidden rounded-xl border border-border bg-card shadow-xs">
        <div className="overflow-x-auto">
          <Table className="w-full">
            <TableHeader className="bg-muted/40">
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => {
                    const responsiveClass = getColumnResponsiveClasses(
                      header.id
                    )
                    return (
                      <TableHead
                        key={header.id}
                        colSpan={header.colSpan}
                        className={`text-xs font-medium text-muted-foreground ${responsiveClass}`}
                      >
                        {header.isPlaceholder ? null : (
                          <FlexRender header={header} />
                        )}
                      </TableHead>
                    )
                  })}
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
                    {row.getVisibleCells().map((cell) => {
                      const responsiveClass = getColumnResponsiveClasses(
                        cell.column.id
                      )
                      return (
                        <TableCell key={cell.id} className={responsiveClass}>
                          <FlexRender cell={cell} />
                        </TableCell>
                      )
                    })}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={columns.length}
                    className="h-24 text-center text-xs text-muted-foreground"
                  >
                    No users found matching your search.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Pagination Footer */}
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

      <AssignRoleDialog
        isOpen={isAssignOpen}
        onOpenChange={(open) => {
          setIsAssignOpen(open)
          if (!open) setSelectedUser(null)
        }}
        user={selectedUser}
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
      />
    </div>
  )
}

export default StaffAccessTable
