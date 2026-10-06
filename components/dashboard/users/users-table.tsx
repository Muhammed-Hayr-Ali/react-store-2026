"use client"

import * as React from "react"
import { useParams } from "next/navigation"
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
  CircleCheckIcon,
  CircleAlertIcon,
  CircleXIcon,
  EllipsisVerticalIcon,
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
import { AdminUserSummary, UserStatus } from "@/lib/actions/users/types"
import { UserStatusDialog } from "./user-status-dialog"
import { DeleteUserDialog } from "./delete-user-dialog"
import { UserFormSheet } from "./user-form-sheet"

const features = tableFeatures({
  columnFilteringFeature,
  columnVisibilityFeature,
  rowPaginationFeature,
  rowSortingFeature,
  filteredRowModel: createFilteredRowModel(),
  paginatedRowModel: createPaginatedRowModel(),
  sortedRowModel: createSortedRowModel(),
})

const columnHelper = createColumnHelper<typeof features, AdminUserSummary>()

const HIDEABLE_COLUMNS = ["phone_number", "roles", "status", "created_at"]

const columnLabelsMap: Record<string, string> = {
  user: "User",
  phone_number: "Phone",
  roles: "Roles",
  status: "Status",
  created_at: "Joined",
}

interface DataTableProps {
  data: AdminUserSummary[]
  initialIsMobile?: boolean
}

export function DataTable({
  data: initialData,
  initialIsMobile = false,
}: DataTableProps) {
  const [data, setData] = React.useState(() => initialData)
  const [prevInitialData, setPrevInitialData] = React.useState(initialData)
  const [currentTab, setCurrentTab] = React.useState<"all" | UserStatus>("all")
  const [searchQuery, setSearchQuery] = React.useState("")
  const params = useParams()

  const [selectedUser, setSelectedUser] =
    React.useState<AdminUserSummary | null>(null)
  const [isStatusOpen, setIsStatusOpen] = React.useState(false)
  const [isDeleteOpen, setIsDeleteOpen] = React.useState(false)
  const [formMode, setFormMode] = React.useState<"create" | "update" | null>(
    null
  )

  if (initialData !== prevInitialData) {
    setPrevInitialData(initialData)
    setData(initialData)
  }

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
    React.useState<ColumnVisibilityState>(() => {
      const initial: ColumnVisibilityState = {}
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
    pageSize: initialIsMobile ? 14 : 10,
  })

  React.useEffect(() => {
    const handleResize = () => {
      const isMobile = window.innerWidth < 768
      setPagination((prev) => {
        const nextSize = isMobile ? 14 : 10
        if (prev.pageSize === nextSize) return prev
        return { ...prev, pageSize: nextSize, pageIndex: 0 }
      })
      setColumnVisibility((prev) => {
        const nextVisibility: ColumnVisibilityState = { ...prev }
        HIDEABLE_COLUMNS.forEach((col) => {
          nextVisibility[col] = !isMobile
        })
        return nextVisibility
      })
    }
    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  const columns = React.useMemo(
    () =>
      columnHelper.columns([
        columnHelper.accessor("first_name", {
          id: "user",
          header: "User",
          cell: ({ row }) => {
            const fullName = [row.original.first_name, row.original.last_name]
              .filter(Boolean)
              .join(" ")
            return (
              <div className="flex items-center gap-2.5">
                <div className="flex size-7 shrink-0 items-center justify-center rounded-full bg-secondary text-xs font-bold text-foreground uppercase">
                  {fullName ? (
                    fullName[0]
                  ) : (
                    <UserCheckIcon className="size-3.5" />
                  )}
                </div>
                <div className="flex flex-col">
                  <span className="text-xs font-semibold text-foreground">
                    {fullName || "Anonymous User"}
                  </span>
                  <span className="text-[11px] text-muted-foreground">
                    {row.original.email}
                  </span>
                </div>
              </div>
            )
          },
          enableHiding: false,
        }),

        columnHelper.accessor("phone_number", {
          id: "phone_number",
          header: "Phone",
          cell: ({ row }) => (
            <span className="text-xs text-muted-foreground">
              {row.original.phone_number || "—"}
            </span>
          ),
        }),

        columnHelper.accessor("roles", {
          id: "roles",
          header: "Roles",
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
                <span className="text-xs text-muted-foreground">Customer</span>
              )}
            </div>
          ),
        }),

        columnHelper.accessor("status", {
          id: "status",
          header: () => <div className="text-center">Status</div>,
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
        }),

        columnHelper.accessor("created_at", {
          id: "created_at",
          header: "Joined",
          cell: ({ row }) => {
            const date = new Date(row.original.created_at)
            return (
              <span className="text-xs text-muted-foreground tabular-nums">
                {date.toLocaleDateString()}
              </span>
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
                <DropdownMenuContent align="end" className="w-44 text-xs">
                  <DropdownMenuItem
                    className="cursor-pointer"
                    onClick={() => {
                      if (row.original.email) {
                        navigator.clipboard.writeText(row.original.email)
                        toast.success("Email copied to clipboard")
                      }
                    }}
                  >
                    <CopyIcon className="me-2 size-3.5" />
                    Copy Email
                  </DropdownMenuItem>

                  <DropdownMenuItem
                    className="cursor-pointer"
                    onClick={() => {
                      setSelectedUser(row.original)
                      setFormMode("update")
                    }}
                  >
                    <PencilIcon className="me-2 size-3.5" />
                    Edit User
                  </DropdownMenuItem>

                  <DropdownMenuItem
                    className="cursor-pointer"
                    onClick={() => {
                      setSelectedUser(row.original)
                      setIsStatusOpen(true)
                    }}
                  >
                    <ShieldAlertIcon className="me-2 size-3.5" />
                    Change Status
                  </DropdownMenuItem>

                  <DropdownMenuSeparator />

                  <DropdownMenuItem
                    className="cursor-pointer text-destructive focus:bg-destructive/10 focus:text-destructive"
                    onClick={() => {
                      setSelectedUser(row.original)
                      setIsDeleteOpen(true)
                    }}
                  >
                    <Trash2Icon className="me-2 size-3.5" />
                    Delete Account
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          ),
        }),
      ]),
    []
  )

  const table = useTable({
    features,
    data: filteredData,
    columns,
    state: { sorting, columnVisibility, columnFilters, pagination },
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
            placeholder="Search users..."
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
                    setCurrentTab("banned")
                    table.setPageIndex(0)
                  }}
                  className="flex cursor-pointer items-center justify-between"
                >
                  <span>Banned</span>
                  <Badge variant="secondary" className="px-1 py-0 text-[10px]">
                    {bannedCount}
                  </Badge>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

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
                setCurrentTab("banned")
                table.setPageIndex(0)
              }}
              className={`inline-flex h-full items-center justify-center rounded-sm px-2.5 text-xs font-medium transition-colors ${
                currentTab === "banned"
                  ? "bg-muted font-semibold text-foreground"
                  : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
              }`}
            >
              Banned
              <Badge
                variant="secondary"
                className="ms-1.5 px-1.5 py-0 text-[10px]"
              >
                {bannedCount}
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

          <Button
            variant="default"
            size="icon"
            className="size-8 sm:hidden"
            title="Create User"
            onClick={() => {
              setSelectedUser(null)
              setFormMode("create")
            }}
          >
            <PlusIcon className="size-3.5" />
            <span className="sr-only">Create User</span>
          </Button>
          <Button
            variant="default"
            size="sm"
            className="hidden h-8 gap-1.5 px-3 text-xs sm:inline-flex"
            onClick={() => {
              setSelectedUser(null)
              setFormMode("create")
            }}
          >
            <PlusIcon className="size-3.5" />
            <span>Create User</span>
          </Button>
        </div>
      </div>

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
                    No users found matching your search.
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
              onValueChange={(val) => table.setPageSize(Number(val))}
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
                  {[10, 20, 30, 50].map((size) => (
                    <SelectItem
                      key={size}
                      value={`${size}`}
                      className="text-xs"
                    >
                      {size}
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
              size="icon"
              className="size-8"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
            >
              <ChevronLeftIcon className="size-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="size-8"
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

      <UserStatusDialog
        isOpen={isStatusOpen}
        onOpenChange={setIsStatusOpen}
        user={selectedUser}
        onSuccess={(userId, newStatus, banReason) => {
          setData((prev) =>
            prev.map((u) =>
              u.id === userId
                ? { ...u, status: newStatus, ban_reason: banReason || null }
                : u
            )
          )
        }}
      />

      <DeleteUserDialog
        isOpen={isDeleteOpen}
        onOpenChange={setIsDeleteOpen}
        user={selectedUser}
        onSuccess={(deletedId) => {
          setData((prev) => prev.filter((u) => u.id !== deletedId))
        }}
      />

      <UserFormSheet
        isOpen={formMode}
        onOpenChange={(open) => {
          if (!open) setFormMode(null)
        }}
        user={selectedUser}
        onSuccess={(updatedUser, isEditing) => {
          if (isEditing) {
            setData((prev) =>
              prev.map((u) => (u.id === updatedUser.id ? updatedUser : u))
            )
          } else {
            setData((prev) => [updatedUser, ...prev])
          }
        }}
      />
    </div>
  )
}
