"use client"

/**
 * @file components/dashboard/categories/categories-table.tsx
 * @description Displays and manages searchable, filterable category records.
 */

import * as React from "react"
import {
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  useReactTable,
  type ColumnDef,
  type VisibilityState,
} from "@tanstack/react-table"
import { useTranslations } from "next-intl"
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronsLeftIcon,
  ChevronsRightIcon,
  CircleAlertIcon,
  CircleCheckIcon,
  Columns3Icon,
  CornerDownRightIcon,
  FilterIcon,
  MoreHorizontalIcon,
  PencilIcon,
  PlusIcon,
  SearchIcon,
  TagsIcon,
  Trash2Icon,
  XIcon,
} from "lucide-react"

import { Can } from "@/components/shared/can"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { useIsMobile } from "@/hooks/use-mobile"
import type { Category } from "@/lib/actions/categories"
import { PERMISSIONS } from "@/lib/actions/role"
import { getSiteAssetUrl } from "@/lib/database/supabase/storage"
import { CategoryFormSheet } from "./category-form-sheet"
import { DeleteCategoryDialog } from "./delete-category-dialog"

type CategoryFilter = "all" | "active" | "inactive"
const HIDEABLE_COLUMNS = ["slug", "sort_order", "status"]

interface CategoriesTableProps {
  initialCategories: Category[]
  initialIsMobile?: boolean
}

interface CategoryRowActionsProps {
  category: Category
  onEdit: (category: Category) => void
  onDelete: (category: Category) => void
}

function CategoryRowActions({
  category,
  onEdit,
  onDelete,
}: CategoryRowActionsProps) {
  const t = useTranslations("CategoriesManagement")

  return (
    <Can
      permission={[PERMISSIONS.UPDATE_CATEGORY, PERMISSIONS.DELETE_CATEGORY]}
    >
      <div className="flex justify-end">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="size-7 text-muted-foreground data-[state=open]:bg-muted"
              aria-label={t("ACTIONS_LABEL")}
            >
              <MoreHorizontalIcon className="size-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-40 text-xs">
            <Can permission={PERMISSIONS.UPDATE_CATEGORY}>
              <DropdownMenuItem
                onClick={() => onEdit(category)}
                className="cursor-pointer"
              >
                <PencilIcon className="me-2 size-3.5" />
                {t("EDIT_ACTION")}
              </DropdownMenuItem>
            </Can>
            <Can permission={PERMISSIONS.DELETE_CATEGORY}>
              <DropdownMenuItem
                onSelect={() => onDelete(category)}
                className="cursor-pointer text-destructive focus:text-destructive"
              >
                <Trash2Icon className="me-2 size-3.5" />
                {t("DELETE_ACTION")}
              </DropdownMenuItem>
            </Can>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </Can>
  )
}

export function CategoriesTable({
  initialCategories,
  initialIsMobile = false,
}: CategoriesTableProps) {
  const t = useTranslations("CategoriesManagement")
  const isMobile = useIsMobile()
  const [categories, setCategories] =
    React.useState<Category[]>(initialCategories)
  const [search, setSearch] = React.useState("")
  const [filter, setFilter] = React.useState<CategoryFilter>("all")
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>(() => {
      const initial: VisibilityState = {}
      HIDEABLE_COLUMNS.forEach((column) => {
        initial[column] = !initialIsMobile
      })
      return initial
    })
  const [pagination, setPagination] = React.useState({
    pageIndex: 0,
    pageSize: initialIsMobile ? 20 : 10,
  })
  const [formOpen, setFormOpen] = React.useState(false)
  const [editingCategory, setEditingCategory] = React.useState<Category | null>(
    null
  )
  const [deletingCategory, setDeletingCategory] =
    React.useState<Category | null>(null)

  React.useEffect(() => {
    setCategories(initialCategories)
  }, [initialCategories])

  React.useEffect(() => {
    setColumnVisibility((current) => {
      const next: VisibilityState = { ...current }
      HIDEABLE_COLUMNS.forEach((column) => {
        next[column] = !isMobile
      })
      return next
    })
    setPagination((current) => ({
      ...current,
      pageSize: isMobile ? 20 : 10,
      pageIndex: 0,
    }))
  }, [isMobile])

  const categoryById = React.useMemo(
    () => new Map(categories.map((category) => [category.id, category])),
    [categories]
  )

  const activeCount = categories.filter(
    (category) => category.is_active === true
  ).length
  const inactiveCount = categories.length - activeCount

  const filteredCategories = React.useMemo(() => {
    const query = search.trim().toLocaleLowerCase()

    return categories.filter((category) => {
      const isActive = category.is_active === true
      if (filter === "active" && !isActive) return false
      if (filter === "inactive" && isActive) return false
      if (!query) return true

      return [category.name, category.name_ar, category.slug]
        .filter(Boolean)
        .some((value) => value!.toLocaleLowerCase().includes(query))
    })
  }, [categories, filter, search])

  const categoryTree = React.useMemo(() => {
    const visibleIds = new Set(
      filteredCategories.map((category) => category.id)
    )
    const childrenByParent = new Map<string | null, Category[]>()

    for (const category of filteredCategories) {
      const parentId =
        category.parent_id && visibleIds.has(category.parent_id)
          ? category.parent_id
          : null
      const siblings = childrenByParent.get(parentId) ?? []
      siblings.push(category)
      childrenByParent.set(parentId, siblings)
    }

    const sortSiblings = (siblings: Category[]) =>
      siblings.sort(
        (left, right) =>
          (left.sort_order ?? 0) - (right.sort_order ?? 0) ||
          left.name.localeCompare(right.name)
      )
    const rows: { category: Category; depth: number }[] = []
    const visited = new Set<string>()

    const addBranch = (category: Category, depth: number) => {
      if (visited.has(category.id)) return
      visited.add(category.id)
      rows.push({ category, depth })

      for (const child of sortSiblings(
        childrenByParent.get(category.id) ?? []
      )) {
        addBranch(child, depth + 1)
      }
    }

    for (const root of sortSiblings(childrenByParent.get(null) ?? [])) {
      addBranch(root, 0)
    }

    for (const category of filteredCategories) {
      addBranch(category, 0)
    }

    return rows
  }, [filteredCategories])

  const categoryDepthById = React.useMemo(
    () =>
      new Map(categoryTree.map(({ category, depth }) => [category.id, depth])),
    [categoryTree]
  )
  const tableData = React.useMemo(
    () => categoryTree.map(({ category }) => category),
    [categoryTree]
  )

  const handleSaved = (savedCategory: Category) => {
    setCategories((current) => {
      const exists = current.some(
        (category) => category.id === savedCategory.id
      )
      return exists
        ? current.map((category) =>
            category.id === savedCategory.id ? savedCategory : category
          )
        : [...current, savedCategory]
    })
  }

  const handleDeleted = (category: Category) => {
    setCategories((current) =>
      current
        .filter((item) => item.id !== category.id)
        .map((item) =>
          item.parent_id === category.id ? { ...item, parent_id: null } : item
        )
    )
  }

  const columns = React.useMemo<ColumnDef<Category>[]>(
    () => [
      {
        id: "name",
        accessorFn: (category) => category.name,
        header: t("COLUMN_CATEGORY"),
        enableHiding: false,
        cell: ({ row }) => {
          const category = row.original
          const depth = categoryDepthById.get(category.id) ?? 0
          const parent = category.parent_id
            ? categoryById.get(category.parent_id)
            : null
          const imageUrl = getSiteAssetUrl(category.image_url)

          return (
            <div
              className="flex min-w-0 items-center gap-2.5"
              style={{ paddingInlineStart: `${depth * 16}px` }}
            >
              {depth > 0 && (
                <CornerDownRightIcon
                  aria-hidden="true"
                  className="size-3.5 shrink-0 text-muted-foreground"
                />
              )}
              <Avatar className="size-7 shrink-0 rounded-lg after:rounded-lg">
                {imageUrl && (
                  <AvatarImage
                    src={imageUrl}
                    alt={category.image_alt || category.name}
                    className="rounded-lg"
                  />
                )}
                <AvatarFallback className="rounded-lg bg-secondary">
                  <TagsIcon className="size-3.5 text-primary" />
                </AvatarFallback>
              </Avatar>
              <div className="flex min-w-0 flex-col">
                <span className="truncate text-xs font-semibold text-foreground">
                  {category.name}
                  {category.name_ar && (
                    <span
                      className="ms-1.5 font-normal text-muted-foreground"
                      dir="rtl"
                    >
                      {category.name_ar}
                    </span>
                  )}
                </span>
                <span className="truncate text-[11px] text-muted-foreground">
                  {parent?.name ?? t("NO_PARENT")}
                </span>
              </div>
            </div>
          )
        },
      },
      {
        id: "slug",
        accessorKey: "slug",
        header: t("COLUMN_SLUG"),
        cell: ({ row }) => (
          <span
            dir="ltr"
            className="font-mono text-[11px] text-muted-foreground"
          >
            {row.original.slug}
          </span>
        ),
      },
      {
        id: "sort_order",
        accessorFn: (category) => category.sort_order ?? 0,
        header: t("COLUMN_SORT_ORDER"),
        cell: ({ row }) => (
          <span className="text-xs text-muted-foreground tabular-nums">
            {row.original.sort_order ?? 0}
          </span>
        ),
      },
      {
        id: "status",
        accessorFn: (category) => category.is_active === true,
        header: t("COLUMN_STATUS"),
        cell: ({ row }) => {
          const isActive = row.original.is_active === true
          return (
            // <Badge
            //   variant={isActive ? "secondary" : "outline"}
            //   className="px-1.5 py-0.5 text-[10px] font-medium"
            // >
            //   {t(isActive ? "ACTIVE" : "INACTIVE")}
            // </Badge>
            <Badge
              variant="outline"
              className={`uppercase" gap-1 truncate px-1.5 py-0.5 font-mono text-[11px] leading-tight ${
                isActive
                  ? "border-emerald-500/30 text-emerald-600 dark:text-emerald-400"
                  : "border-amber-500/30 text-amber-600 dark:text-amber-400"
              }`}
            >
              {isActive ? (
                <CircleCheckIcon className="size-3 fill-emerald-500 text-background" />
              ) : (
                <CircleAlertIcon className="size-3 fill-amber-500 text-background" />
              )}
              <span className="capitalize">
                {t(isActive ? "ACTIVE" : "INACTIVE")}
              </span>
            </Badge>
          )
        },
      },
      {
        id: "actions",
        header: () => <div className="text-end">{t("COLUMN_ACTIONS")}</div>,
        enableSorting: false,
        enableHiding: false,
        cell: ({ row }) => (
          <CategoryRowActions
            category={row.original}
            onEdit={(item) => {
              setEditingCategory(item)
              setFormOpen(true)
            }}
            onDelete={setDeletingCategory}
          />
        ),
      },
    ],
    [categoryById, categoryDepthById, t]
  )

  const table = useReactTable({
    data: tableData,
    columns,
    state: { columnVisibility, pagination },
    onColumnVisibilityChange: setColumnVisibility,
    onPaginationChange: setPagination,
    getRowId: (category) => category.id,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  })

  const selectFilter = (nextFilter: CategoryFilter) => {
    setFilter(nextFilter)
    setPagination((current) => ({ ...current, pageIndex: 0 }))
  }

  const prepareCreateForm = () => {
    setEditingCategory(null)
  }

  const noCategories = categories.length === 0
  const columnLabels: Record<string, string> = {
    slug: t("COLUMN_SLUG"),
    sort_order: t("COLUMN_SORT_ORDER"),
    status: t("COLUMN_STATUS"),
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-nowrap items-center gap-2">
        <div className="relative min-w-0 flex-1">
          <SearchIcon className="absolute inset-s-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(event) => {
              setSearch(event.target.value)
              setPagination((current) => ({ ...current, pageIndex: 0 }))
            }}
            placeholder={t("SEARCH_PLACEHOLDER")}
            aria-label={t("SEARCH_PLACEHOLDER")}
            className="h-8 w-full ps-8 pe-8 text-xs"
          />
          {search && (
            <button
              type="button"
              onClick={() => {
                setSearch("")
                setPagination((current) => ({ ...current, pageIndex: 0 }))
              }}
              className="absolute inset-e-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              aria-label={t("CLEAR_SEARCH")}
            >
              <XIcon className="size-3.5" />
            </button>
          )}
        </div>

        <div className="shrink-0 sm:hidden">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                className="size-8"
                aria-label={t("FILTER_BUTTON")}
              >
                <FilterIcon className="size-3.5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-36 text-xs">
              {(["all", "active", "inactive"] as const).map((value) => (
                <DropdownMenuItem
                  key={value}
                  onClick={() => selectFilter(value)}
                  className="flex cursor-pointer items-center justify-between"
                >
                  <span>
                    {t(
                      value === "all"
                        ? "FILTER_ALL"
                        : value === "active"
                          ? "FILTER_ACTIVE"
                          : "FILTER_INACTIVE"
                    )}
                  </span>
                  <Badge variant="secondary" className="px-1 py-0 text-[10px]">
                    {value === "all"
                      ? categories.length
                      : value === "active"
                        ? activeCount
                        : inactiveCount}
                  </Badge>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="hidden h-8 shrink-0 items-center overflow-hidden rounded-md border border-input bg-background p-0.5 sm:flex">
          {(["all", "active", "inactive"] as const).map((value) => (
            <button
              key={value}
              type="button"
              onClick={() => selectFilter(value)}
              aria-pressed={filter === value}
              className={`inline-flex h-full items-center rounded-sm px-2.5 text-xs font-medium transition-colors ${
                filter === value
                  ? "bg-muted font-semibold text-foreground shadow-xs"
                  : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
              }`}
            >
              {t(
                value === "all"
                  ? "FILTER_ALL"
                  : value === "active"
                    ? "FILTER_ACTIVE"
                    : "FILTER_INACTIVE"
              )}
              <Badge
                variant="secondary"
                className="ms-1.5 px-1.5 py-0 text-[10px]"
              >
                {value === "all"
                  ? categories.length
                  : value === "active"
                    ? activeCount
                    : inactiveCount}
              </Badge>
            </button>
          ))}
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              size="icon"
              className="size-8 shrink-0"
              title={t("TOGGLE_COLUMNS")}
            >
              <Columns3Icon className="size-3.5" />
              <span className="sr-only">{t("TOGGLE_COLUMNS")}</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-40 text-xs">
            {table
              .getAllColumns()
              .filter((column) => column.getCanHide())
              .map((column) => (
                <DropdownMenuCheckboxItem
                  key={column.id}
                  checked={column.getIsVisible()}
                  onCheckedChange={(visible) =>
                    column.toggleVisibility(Boolean(visible))
                  }
                >
                  {columnLabels[column.id] ?? column.id}
                </DropdownMenuCheckboxItem>
              ))}
          </DropdownMenuContent>
        </DropdownMenu>

        <Can permission={PERMISSIONS.CREATE_CATEGORY}>
          <CategoryFormSheet
            open={formOpen}
            category={editingCategory}
            categories={categories}
            trigger={
              <Button
                type="button"
                onClick={prepareCreateForm}
                size="sm"
                className="size-8 shrink-0 gap-1.5 p-0 text-xs sm:h-8 sm:w-auto sm:px-3"
                title={t("CREATE_CATEGORY")}
              >
                <PlusIcon className="size-3.5" />
                <span className="sr-only sm:not-sr-only">
                  {t("CREATE_CATEGORY")}
                </span>
              </Button>
            }
            onOpenChange={setFormOpen}
            onSaved={handleSaved}
          />

          <DeleteCategoryDialog
            category={deletingCategory}
            open={Boolean(deletingCategory)}
            onOpenChange={(open) => {
              if (!open) setDeletingCategory(null)
            }}
            onDeleted={handleDeleted}
          />
        </Can>
      </div>

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
                    className="h-28 text-center text-xs text-muted-foreground"
                  >
                    {noCategories
                      ? t("NO_CATEGORIES_FOUND")
                      : t("NO_CATEGORIES_MATCH")}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {filteredCategories.length > 10 && (
        <div className="flex flex-wrap items-center justify-between gap-3 px-1 py-1">
          <p className="text-xs text-muted-foreground">
            {t("CATEGORY_COUNT", { count: filteredCategories.length })}
          </p>
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="icon"
              className="size-7"
              onClick={() => table.setPageIndex(0)}
              disabled={!table.getCanPreviousPage()}
              aria-label={t("FIRST_PAGE")}
            >
              <ChevronsLeftIcon className="size-3.5 rtl:rotate-180" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="size-7"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
              aria-label={t("PREVIOUS_PAGE")}
            >
              <ChevronLeftIcon className="size-3.5 rtl:rotate-180" />
            </Button>
            <span className="px-2 text-[11px] text-muted-foreground">
              {t("PAGE_COUNTER", {
                page: table.getState().pagination.pageIndex + 1,
                total: table.getPageCount(),
              })}
            </span>
            <Button
              variant="outline"
              size="icon"
              className="size-7"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
              aria-label={t("NEXT_PAGE")}
            >
              <ChevronRightIcon className="size-3.5 rtl:rotate-180" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="size-7"
              onClick={() => table.setPageIndex(table.getPageCount() - 1)}
              disabled={!table.getCanNextPage()}
              aria-label={t("LAST_PAGE")}
            >
              <ChevronsRightIcon className="size-3.5 rtl:rotate-180" />
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
