"use client"

/**
 * @file components/dashboard/brands/brands-table.tsx
 * @description Displays and manages searchable, filterable brand records.
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
import { useLocale, useTranslations } from "next-intl"
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronsLeftIcon,
  ChevronsRightIcon,
  CircleAlertIcon,
  CircleCheckIcon,
  Columns3Icon,
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
import { Label } from "@/components/ui/label"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
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
import { PERMISSIONS } from "@/lib/actions/role"
import { getSiteAssetUrl } from "@/lib/database/supabase/storage"
import type { BrandRecord } from "@/lib/actions/brands/types"
import { BrandFormSheet } from "./brand-form-sheet"
import { DeleteBrandDialog } from "./delete-brand-dialog"

type BrandFilter = "all" | "active" | "inactive"
const HIDEABLE_COLUMNS = ["slug", "sort_order", "status"]

interface BrandsTableProps {
  initialBrands: BrandRecord[]
  brandImages: string[]
  initialIsMobile?: boolean
}

interface BrandRowActionsProps {
  brand: BrandRecord
  onEdit: (brand: BrandRecord) => void
  onDelete: (brand: BrandRecord) => void
}

function BrandRowActions({ brand, onEdit, onDelete }: BrandRowActionsProps) {
  const t = useTranslations("BrandsManagement")

  return (
    <Can permission={[PERMISSIONS.UPDATE_BRAND, PERMISSIONS.DELETE_BRAND]}>
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
            <Can permission={PERMISSIONS.UPDATE_BRAND}>
              <DropdownMenuItem
                onClick={() => onEdit(brand)}
                className="cursor-pointer"
              >
                <PencilIcon className="me-2 size-3.5" />
                {t("EDIT_ACTION")}
              </DropdownMenuItem>
            </Can>
            <Can permission={PERMISSIONS.DELETE_BRAND}>
              <DropdownMenuItem
                onSelect={() => onDelete(brand)}
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

export function BrandsTable({
  initialBrands,
  brandImages,
  initialIsMobile = false,
}: BrandsTableProps) {
  const locale = useLocale()
  const t = useTranslations("BrandsManagement")
  const isMobile = useIsMobile()
  const [brands, setBrands] = React.useState<BrandRecord[]>(initialBrands)
  const [search, setSearch] = React.useState("")
  const [filter, setFilter] = React.useState<BrandFilter>("all")
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
  const [editingBrand, setEditingBrand] = React.useState<BrandRecord | null>(null)
  const [deletingBrand, setDeletingBrand] = React.useState<BrandRecord | null>(null)

  React.useEffect(() => {
    setBrands(initialBrands)
  }, [initialBrands])

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

  const activeCount = brands.filter((brand) => brand.is_active === true).length
  const inactiveCount = brands.length - activeCount

  const tableData = React.useMemo(() => {
    const query = search.trim().toLocaleLowerCase()

    const filtered = brands.filter((brand) => {
      const isActive = brand.is_active === true
      if (filter === "active" && !isActive) return false
      if (filter === "inactive" && isActive) return false
      if (!query) return true

      return [brand.name, brand.name_ar, brand.slug]
        .filter(Boolean)
        .some((value) => value!.toLocaleLowerCase().includes(query))
    })

    // ترتيب العلامات التجارية حسب sort_order ثم أبجدياً
    return filtered.sort(
      (left, right) =>
        (left.sort_order ?? 0) - (right.sort_order ?? 0) ||
        left.name.localeCompare(right.name)
    )
  }, [brands, filter, search])

  const handleSaved = (savedBrand: BrandRecord) => {
    setBrands((current) => {
      const exists = current.some((brand) => brand.id === savedBrand.id)
      return exists
        ? current.map((brand) =>
            brand.id === savedBrand.id ? savedBrand : brand
          )
        : [...current, savedBrand]
    })
  }

  const handleDeleted = (deletedBrand: BrandRecord) => {
    setBrands((current) => current.filter((item) => item.id !== deletedBrand.id))
  }

  const columns = React.useMemo<ColumnDef<BrandRecord>[]>(
    () => [
      {
        id: "name",
        accessorFn: (brand) => brand.name,
        header: t("COLUMN_BRAND"),
        enableHiding: false,
        cell: ({ row }) => {
          const brand = row.original
          const imageUrl = getSiteAssetUrl(brand.image_url)

          return (
            <div className="flex min-w-0 items-center gap-2.5">
              <Avatar className="size-7 shrink-0 rounded-lg after:rounded-lg">
                {imageUrl && (
                  <AvatarImage
                    src={imageUrl}
                    alt={brand.image_alt || brand.name}
                    className="rounded-lg"
                  />
                )}
                <AvatarFallback className="rounded-lg bg-secondary">
                  <TagsIcon className="size-3.5 text-primary" />
                </AvatarFallback>
              </Avatar>
              <div className="flex min-w-0 flex-col">
                <span
                  dir={locale === "ar" ? "rtl" : "ltr"}
                  className="truncate text-xs font-semibold text-foreground"
                >
                  {locale === "ar" ? brand.name_ar || brand.name : brand.name}
                </span>
                <span
                  dir="ltr"
                  className="truncate font-mono text-[11px] text-muted-foreground"
                >
                  {brand.slug}
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
        accessorFn: (brand) => brand.sort_order ?? 0,
        header: t("COLUMN_SORT_ORDER"),
        cell: ({ row }) => (
          <span className="text-xs text-muted-foreground tabular-nums">
            {row.original.sort_order ?? 0}
          </span>
        ),
      },
      {
        id: "status",
        accessorFn: (brand) => brand.is_active === true,
        header: t("COLUMN_STATUS"),
        cell: ({ row }) => {
          const isActive = row.original.is_active === true
          return (
            <Badge
              variant="outline"
              className={`gap-1 truncate px-1.5 py-0.5 font-mono text-[11px] leading-tight uppercase ${
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
          <BrandRowActions
            brand={row.original}
            onEdit={(item) => {
              setEditingBrand(item)
              setFormOpen(true)
            }}
            onDelete={setDeletingBrand}
          />
        ),
      },
    ],
    [locale, t]
  )

  const table = useReactTable({
    data: tableData,
    columns,
    state: { columnVisibility, pagination },
    onColumnVisibilityChange: setColumnVisibility,
    onPaginationChange: setPagination,
    getRowId: (brand) => brand.id,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  })

  const selectFilter = (nextFilter: BrandFilter) => {
    setFilter(nextFilter)
    setPagination((current) => ({ ...current, pageIndex: 0 }))
  }

  const prepareCreateForm = () => {
    setEditingBrand(null)
  }

  const noBrands = brands.length === 0
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
                      ? brands.length
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
                  ? brands.length
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

        <Can permission={PERMISSIONS.CREATE_BRAND}>
          <BrandFormSheet
            open={formOpen}
            brand={editingBrand}
            brandImages={brandImages}
            trigger={
              <Button
                type="button"
                onClick={prepareCreateForm}
                size="sm"
                className="size-8 shrink-0 gap-1.5 p-0 text-xs sm:h-8 sm:w-auto sm:px-3"
                title={t("CREATE_BRAND")}
              >
                <PlusIcon className="size-3.5" />
                <span className="sr-only sm:not-sr-only">
                  {t("CREATE_BRAND")}
                </span>
              </Button>
            }
            onOpenChange={setFormOpen}
            onSaved={handleSaved}
          />

          <DeleteBrandDialog
            brand={deletingBrand}
            open={Boolean(deletingBrand)}
            onOpenChange={(open) => {
              if (!open) setDeletingBrand(null)
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
                    {noBrands ? t("NO_BRANDS_FOUND") : t("NO_BRANDS_MATCH")}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      <div className="flex w-full flex-nowrap items-center justify-between gap-2 px-1">
        <div className="flex min-w-0 shrink items-center gap-1.5 text-[11px] text-muted-foreground sm:gap-2 sm:text-xs">
          <Label
            htmlFor="brand-rows-per-page"
            className="text-xs font-medium whitespace-nowrap max-sm:sr-only"
          >
            {t("ROWS_PER_PAGE")}
          </Label>
          <Select
            value={`${table.getState().pagination.pageSize}`}
            onValueChange={(value) => table.setPageSize(Number(value))}
          >
            <SelectTrigger
              size="sm"
              className="h-8 w-18 shrink-0 text-xs"
              id="brand-rows-per-page"
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
          <span className="ms-1.5 shrink-0 whitespace-nowrap sm:ms-2">
            {t("PAGE_COUNTER", {
              page: table.getState().pagination.pageIndex + 1,
              total: table.getPageCount() || 1,
            })}
          </span>
        </div>

        <div className="flex shrink-0 items-center gap-1 sm:gap-1.5">
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