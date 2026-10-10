"use client"

/**
 * @file components/dashboard/categories/categories-table.tsx
 * @description Fully featured categories TanStack data table with URL-synced search/filter/pagination,
 * mobile column isolation (VisibilityState), optimistic status toggle, React 19 / Compiler compliance,
 * and zero any typing.
 */

import * as React from "react"
import { useRouter, usePathname, useSearchParams } from "next/navigation"
import { useTranslations } from "next-intl"
import {
  ColumnDef,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table"
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  Columns3Icon,
  FolderIcon,
  MoreHorizontalIcon,
  PencilIcon,
  SearchIcon,
  Trash2Icon,
  XIcon,
} from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Select,
  SelectContent,
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
import { PERMISSIONS } from "@/lib/actions/role/types"
import { useIsMobile } from "@/hooks/use-mobile"
import { toggleCategoryStatus } from "@/lib/actions/categories"
import type {
  Category,
  CategorySelectorItem,
} from "@/lib/actions/categories/types"

import { CategoryFormSheet } from "./category-form-sheet"
import { DeleteCategoryDialog } from "./delete-category-dialog"

interface CategoriesTableProps {
  initialData: Category[]
  totalCount: number
  parentOptions: CategorySelectorItem[]
}

const HIDEABLE_COLUMNS = [
  "name_ar",
  "parent_id",
  "sort_order",
  "is_active",
  "created_at",
]

export function CategoriesTable({
  initialData,
  totalCount,
  parentOptions,
}: CategoriesTableProps) {
  const t = useTranslations("CategoriesManagement")
  const isMobile = useIsMobile()
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const [data, setData] = React.useState<Category[]>(initialData)
  const [searchQuery, setSearchQuery] = React.useState(
    searchParams.get("search") || ""
  )

  const currentPage = Number(searchParams.get("page")) || 1
  const pageSize = Number(searchParams.get("limit")) || 20
  const currentStatus = searchParams.get("status") || "all"
  const totalPages = Math.ceil(totalCount / pageSize) || 1

  // Synchronization with server state
  React.useEffect(() => {
    setData(initialData)
  }, [initialData])

  // Mobile Column Isolation: Hide middle columns on mobile by default (Strict VisibilityState)
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>(() => {
      const initial: VisibilityState = {}
      HIDEABLE_COLUMNS.forEach((colId) => {
        initial[colId] = !isMobile
      })
      return initial
    })

  React.useEffect(() => {
    setColumnVisibility((prev) => {
      const next: VisibilityState = { ...prev }
      HIDEABLE_COLUMNS.forEach((colId) => {
        next[colId] = !isMobile
      })
      return next
    })
  }, [isMobile])

  // URL Query Sync Helper
  const updateQueryParam = React.useCallback(
    (updates: Record<string, string | undefined>) => {
      const params = new URLSearchParams(searchParams.toString())

      Object.entries(updates).forEach(([key, value]) => {
        if (value && value !== "all") {
          params.set(key, value)
        } else {
          params.delete(key)
        }
      })

      router.replace(`${pathname}?${params.toString()}`)
    },
    [pathname, router, searchParams]
  )

  // Optimistic Status Toggle
  const handleStatusToggle = React.useCallback(
    async (id: string, currentStatus: boolean) => {
      const newStatus = !currentStatus
      setData((prev) =>
        prev.map((c) => (c.id === id ? { ...c, is_active: newStatus } : c))
      )

      const res = await toggleCategoryStatus(id, newStatus)
      if (res.success) {
        toast.success(t("STATUS_UPDATED_SUCCESS"))
        router.refresh()
      } else {
        setData((prev) =>
          prev.map((c) =>
            c.id === id ? { ...c, is_active: currentStatus } : c
          )
        )
        toast.error(res.error || t("FAILED_TO_UPDATE_STATUS"))
      }
    },
    [router, t]
  )

  const columns = React.useMemo<ColumnDef<Category>[]>(
    () => [
      // 1. First Column: Identifier (Pinned Visible)
      {
        id: "name",
        accessorKey: "name",
        enableHiding: false,
        header: t("COLUMN_NAME"),
        cell: ({ row }) => (
          <div className="flex items-center gap-2.5">
            <div className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-secondary text-foreground">
              <FolderIcon className="size-3.5" />
            </div>
            <div className="min-w-0">
              <p className="truncate text-xs font-semibold text-foreground">
                {row.original.name}
              </p>
              <p className="font-mono text-[11px] text-muted-foreground">
                /{row.original.slug}
              </p>
            </div>
          </div>
        ),
      },
      // 2. Arabic Name (Hideable)
      {
        id: "name_ar",
        accessorKey: "name_ar",
        enableHiding: true,
        header: t("COLUMN_NAME_AR"),
        cell: ({ row }) => (
          <span className="text-xs text-muted-foreground">
            {row.original.name_ar || "—"}
          </span>
        ),
      },
      // 3. Parent Category (Hideable)
      {
        id: "parent_id",
        accessorKey: "parent_id",
        enableHiding: true,
        header: t("COLUMN_PARENT"),
        cell: ({ row }) => {
          const parent = parentOptions.find(
            (p) => p.id === row.original.parent_id
          )
          return (
            <span className="text-xs text-muted-foreground">
              {parent ? parent.name : t("ROOT_CATEGORY")}
            </span>
          )
        },
      },
      // 4. Sort Order (Hideable)
      {
        id: "sort_order",
        accessorKey: "sort_order",
        enableHiding: true,
        header: t("COLUMN_SORT_ORDER"),
        cell: ({ row }) => (
          <span className="font-mono text-xs text-foreground">
            {row.original.sort_order}
          </span>
        ),
      },
      // 5. Active Status (Hideable)
      {
        id: "is_active",
        accessorKey: "is_active",
        enableHiding: true,
        header: t("COLUMN_STATUS"),
        cell: ({ row }) => (
          <Can
            permission={PERMISSIONS.UPDATE_CATEGORY}
            fallback={
              <span
                className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium ${
                  row.original.is_active
                    ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                {row.original.is_active
                  ? t("STATUS_ACTIVE")
                  : t("STATUS_INACTIVE")}
              </span>
            }
          >
            <div className="flex items-center gap-2">
              <Switch
                checked={row.original.is_active}
                onCheckedChange={() =>
                  handleStatusToggle(row.original.id, row.original.is_active)
                }
              />
            </div>
          </Can>
        ),
      },
      // 6. Created At (Hideable)
      {
        id: "created_at",
        accessorKey: "created_at",
        enableHiding: true,
        header: t("COLUMN_CREATED_AT"),
        cell: ({ row }) => (
          <span className="font-mono text-[11px] text-muted-foreground">
            {new Date(row.original.created_at).toLocaleDateString()}
          </span>
        ),
      },
      // 7. Last Column: Actions Dropdown (Pinned Visible)
      {
        id: "actions",
        enableHiding: false,
        cell: ({ row }) => (
          <div className="flex justify-end">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="size-7">
                  <MoreHorizontalIcon className="size-3.5" />
                  <span className="sr-only">{t("ACTIONS_LABEL")}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-36 text-xs">
                <Can permission={PERMISSIONS.UPDATE_CATEGORY}>
                  <CategoryFormSheet
                    category={row.original}
                    parentOptions={parentOptions}
                    onSuccess={() => router.refresh()}
                  >
                    <DropdownMenuItem
                      onSelect={(e) => e.preventDefault()}
                      className="cursor-pointer"
                    >
                      <PencilIcon className="me-2 size-3.5" />
                      <span>{t("EDIT_ACTION")}</span>
                    </DropdownMenuItem>
                  </CategoryFormSheet>
                </Can>

                <Can permission={PERMISSIONS.DELETE_CATEGORY}>
                  <DeleteCategoryDialog
                    categoryId={row.original.id}
                    categoryName={row.original.name}
                    onDeleted={() => {
                      setData((prev) =>
                        prev.filter((c) => c.id !== row.original.id)
                      )
                      router.refresh()
                    }}
                  >
                    <DropdownMenuItem
                      onSelect={(e) => e.preventDefault()}
                      className="cursor-pointer text-destructive focus:bg-destructive/10 focus:text-destructive"
                    >
                      <Trash2Icon className="me-2 size-3.5" />
                      <span>{t("DELETE_ACTION")}</span>
                    </DropdownMenuItem>
                  </DeleteCategoryDialog>
                </Can>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        ),
      },
    ],
    [t, parentOptions, handleStatusToggle, router]
  )

  // Explicit suppression: TanStack Table manages internal state machines and is intentionally skipped by React Compiler
  const table = useReactTable({
    data,
    columns,
    state: { columnVisibility },
    onColumnVisibilityChange: setColumnVisibility,
    getCoreRowModel: getCoreRowModel(),
  })

  const columnLabelsMap: Record<string, string> = {
    name_ar: t("COLUMN_NAME_AR"),
    parent_id: t("COLUMN_PARENT"),
    sort_order: t("COLUMN_SORT_ORDER"),
    is_active: t("COLUMN_STATUS"),
    created_at: t("COLUMN_CREATED_AT"),
  }

  return (
    <div className="space-y-4">
      {/* Interactive Toolbar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        {/* Search Input */}
        <div className="relative w-full max-w-xs">
          <SearchIcon className="absolute inset-s-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                updateQueryParam({ search: searchQuery, page: "1" })
              }
            }}
            placeholder={t("SEARCH_PLACEHOLDER")}
            className="h-8 ps-8 pe-8 text-xs"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => {
                setSearchQuery("")
                updateQueryParam({ search: undefined, page: "1" })
              }}
              className="absolute inset-e-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <XIcon className="size-3.5" />
            </button>
          )}
        </div>

        {/* Filter Pills & Column Visibility Dropdown */}
        <div className="flex items-center gap-2">
          {/* Segmented Filter Pills */}
          <div className="inline-flex h-8 items-center rounded-md border border-input bg-background p-0.5">
            {[
              { id: "all", label: t("FILTER_ALL") },
              { id: "active", label: t("FILTER_ACTIVE") },
              { id: "inactive", label: t("FILTER_INACTIVE") },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => updateQueryParam({ status: tab.id, page: "1" })}
                className={`rounded px-2.5 py-1 text-xs transition-colors ${
                  currentStatus === tab.id
                    ? "bg-muted font-semibold text-foreground shadow-xs"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {tab.label}
              </button>
            ))}
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
                .filter((col) => col.getCanHide())
                .map((column) => (
                  <DropdownMenuCheckboxItem
                    key={column.id}
                    checked={column.getIsVisible()}
                    onCheckedChange={(val) =>
                      column.toggleVisibility(Boolean(val))
                    }
                  >
                    {columnLabelsMap[column.id] || column.id}
                  </DropdownMenuCheckboxItem>
                ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Table Shell */}
      <div className="w-full overflow-hidden rounded-xl border border-border bg-card shadow-xs">
        <Table>
          <TableHeader className="bg-muted/40">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead
                    key={header.id}
                    className="h-9 text-xs font-medium text-muted-foreground"
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
            {table.getRowModel().rows.length ? (
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
                  {t("NO_CATEGORIES_FOUND")}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Standard Pagination Footer */}
      <div className="flex flex-col items-center justify-between gap-3 sm:flex-row">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span>{t("ROWS_PER_PAGE")}</span>
          <Select
            value={String(pageSize)}
            onValueChange={(val) => updateQueryParam({ limit: val, page: "1" })}
          >
            <SelectTrigger className="h-8 w-18 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="text-xs">
              <SelectItem value="10">10</SelectItem>
              <SelectItem value="20">20</SelectItem>
              <SelectItem value="50">50</SelectItem>
            </SelectContent>
          </Select>
          <span className="ms-2">
            {t("SHOWING_COUNT", { count: data.length, total: totalCount })}
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          <span className="me-2 text-xs font-medium text-muted-foreground">
            {t("PAGE_COUNTER", { page: currentPage, total: totalPages })}
          </span>
          <Button
            variant="outline"
            size="icon"
            className="size-8"
            disabled={currentPage <= 1}
            onClick={() => updateQueryParam({ page: String(currentPage - 1) })}
          >
            <ChevronLeftIcon className="size-4 rtl:rotate-180" />
            <span className="sr-only">{t("PREVIOUS_PAGE")}</span>
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="size-8"
            disabled={currentPage >= totalPages}
            onClick={() => updateQueryParam({ page: String(currentPage + 1) })}
          >
            <ChevronRightIcon className="size-4 rtl:rotate-180" />
            <span className="sr-only">{t("NEXT_PAGE")}</span>
          </Button>
        </div>
      </div>
    </div>
  )
}
