"use client"

/**
 * @file components/dashboard/reviews/reviews-table.tsx
 * @description Displays and manages searchable, filterable product review records.
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
  ClockIcon,
  CircleCheckIcon,
  Columns3Icon,
  FilterIcon,
  MoreHorizontalIcon,
  PencilIcon,
  SearchIcon,
  StarIcon,
  Trash2Icon,
  UserIcon,
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
import type { ReviewWithUser } from "@/lib/actions/reviews/types"
import { PERMISSIONS } from "@/lib/actions/role"
import { DeleteReviewDialog } from "./delete-review-dialog"
import { ReviewStatusSheet } from "./review-status-sheet"

type ReviewFilter = "all" | "approved" | "pending"
const HIDEABLE_COLUMNS = ["rating", "created_at"]

interface ReviewsTableProps {
  initialReviews: ReviewWithUser[]
  initialIsMobile?: boolean
}

interface ReviewRowActionsProps {
  review: ReviewWithUser
  onEdit: (review: ReviewWithUser) => void
  onDelete: (review: ReviewWithUser) => void
}

function ReviewRowActions({ review, onEdit, onDelete }: ReviewRowActionsProps) {
  const t = useTranslations("ReviewsManagement")

  return (
    <Can permission={[PERMISSIONS.UPDATE_REVIEW, PERMISSIONS.DELETE_REVIEW]}>
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
            <Can permission={PERMISSIONS.UPDATE_REVIEW}>
              <DropdownMenuItem
                onClick={() => onEdit(review)}
                className="cursor-pointer"
              >
                <PencilIcon className="me-2 size-3.5" />
                {t("CHANGE_STATUS_ACTION")}
              </DropdownMenuItem>
            </Can>
            <Can permission={PERMISSIONS.DELETE_REVIEW}>
              <DropdownMenuItem
                onSelect={() => onDelete(review)}
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

export function ReviewsTable({
  initialReviews,
  initialIsMobile = false,
}: ReviewsTableProps) {
  const locale = useLocale()
  const t = useTranslations("ReviewsManagement")
  const isMobile = useIsMobile()
  const [reviews, setReviews] = React.useState<ReviewWithUser[]>(initialReviews)
  const [search, setSearch] = React.useState("")
  const [filter, setFilter] = React.useState<ReviewFilter>("all")

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

  const [statusDialogOpen, setStatusDialogOpen] = React.useState(false)
  const [editingReview, setEditingReview] =
    React.useState<ReviewWithUser | null>(null)
  const [deletingReview, setDeletingReview] =
    React.useState<ReviewWithUser | null>(null)

  React.useEffect(() => {
    setReviews(initialReviews)
  }, [initialReviews])

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

  const approvedCount = reviews.filter(
    (review) => review.is_approved === true
  ).length
  const pendingCount = reviews.length - approvedCount

  const filteredReviews = React.useMemo(() => {
    const query = search.trim().toLocaleLowerCase()

    return reviews.filter((review) => {
      const isApproved = review.is_approved === true
      if (filter === "approved" && !isApproved) return false
      if (filter === "pending" && isApproved) return false
      if (!query) return true

      // دمج الاسم الأول والأخير للبحث بشكل صحيح
      const fullName = review.user?.first_name
        ? `${review.user.first_name} ${review.user.last_name || ""}`.trim()
        : ""

      return [review.content, fullName]
        .filter(Boolean)
        .some((value) => value!.toLocaleLowerCase().includes(query))
    })
  }, [reviews, filter, search])

  const handleSaved = (savedReview: ReviewWithUser) => {
    setReviews((current) =>
      current.map((review) =>
        review.id === savedReview.id
          ? { ...review, is_approved: savedReview.is_approved }
          : review
      )
    )
  }

  const handleDeleted = (review: ReviewWithUser) => {
    setReviews((current) => current.filter((item) => item.id !== review.id))
  }

  const columns = React.useMemo<ColumnDef<ReviewWithUser>[]>(
    () => [
      {
        id: "user",
        accessorFn: (review) =>
          review.user?.first_name
            ? `${review.user.first_name} ${review.user.last_name || ""}`.trim()
            : null,
        header: t("COLUMN_USER"),
        enableHiding: false,
        cell: ({ row }) => {
          const review = row.original
          const imageUrl = review.user?.profile_image
          const fullName = review.user?.first_name
            ? `${review.user.first_name} ${review.user.last_name || ""}`.trim()
            : t("ANONYMOUS")

          return (
            <div className="flex min-w-0 items-center gap-2.5">
              <Avatar className="size-7 shrink-0 rounded-full after:rounded-full">
                {imageUrl && (
                  <AvatarImage
                    src={imageUrl}
                    alt={fullName}
                    className="rounded-full"
                  />
                )}
                <AvatarFallback className="rounded-full bg-secondary">
                  <UserIcon className="size-3.5 text-primary" />
                </AvatarFallback>
              </Avatar>
              <div className="flex min-w-0 flex-col items-start">
                <span
                  dir={locale === "ar" ? "rtl" : "ltr"}
                  className="truncate text-sm font-normal text-foreground"
                >
                  {fullName}
                </span>
              </div>
            </div>
          )
        },
      },
      {
        id: "rating",
        accessorFn: (review) => review.rating,
        header: t("COLUMN_RATING"),
        cell: ({ row }) => (
          <div className="flex items-center gap-1 text-amber-500">
            <StarIcon className="size-3.5 fill-current" />
            <span className="text-xs font-semibold text-foreground tabular-nums">
              {row.original.rating}
            </span>
          </div>
        ),
      },
      {
        id: "content",
        accessorFn: (review) => review.content,
        header: t("COLUMN_CONTENT"),
        cell: ({ row }) => (
          <div className="max-w-50 sm:max-w-75">
            <p
              className="truncate text-xs text-muted-foreground"
              title={row.original.content}
            >
              {row.original.content}
            </p>
          </div>
        ),
      },
      {
        id: "status",
        accessorFn: (review) => review.is_approved === true,
        header: t("COLUMN_STATUS"),
        cell: ({ row }) => {
          const isApproved = row.original.is_approved === true
          return (
            <Badge
              variant="outline"
              className={`gap-1 truncate px-1.5 py-0.5 text-xs leading-tight font-normal ${
                isApproved
                  ? "border-emerald-500/30 text-emerald-600 dark:text-emerald-400"
                  : "border-amber-500/30 text-amber-600 dark:text-amber-400"
              }`}
            >
              {isApproved ? (
                <CircleCheckIcon className="size-3 fill-emerald-500 text-background" />
              ) : (
                <ClockIcon className="size-3 fill-amber-500 text-background" />
              )}
              <span className="capitalize">
                {t(isApproved ? "APPROVED" : "PENDING")}
              </span>
            </Badge>
          )
        },
      },
      {
        id: "created_at",
        accessorFn: (review) => review.created_at,
        header: t("COLUMN_DATE"),
        cell: ({ row }) => {
          const date = new Date(row.original.created_at)
          return (
            <span className="text-[11px] whitespace-nowrap text-muted-foreground">
              {new Intl.DateTimeFormat(locale, {
                year: "numeric",
                month: "short",
                day: "numeric",
              }).format(date)}
            </span>
          )
        },
      },
      {
        id: "actions",
        header: () => null,
        enableSorting: false,
        enableHiding: false,
        cell: ({ row }) => (
          <ReviewRowActions
            review={row.original}
            onEdit={(item) => {
              setEditingReview(item)
              setStatusDialogOpen(true)
            }}
            onDelete={setDeletingReview}
          />
        ),
      },
    ],
    [locale, t]
  )

  const table = useReactTable({
    data: filteredReviews,
    columns,
    state: { columnVisibility, pagination },
    onColumnVisibilityChange: setColumnVisibility,
    onPaginationChange: setPagination,
    getRowId: (review) => review.id,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  })

  const selectFilter = (nextFilter: ReviewFilter) => {
    setFilter(nextFilter)
    setPagination((current) => ({ ...current, pageIndex: 0 }))
  }

  const noReviews = reviews.length === 0
  const columnLabels: Record<string, string> = {
    rating: t("COLUMN_RATING"),
    created_at: t("COLUMN_DATE"),
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
              {(["all", "approved", "pending"] as const).map((value) => (
                <DropdownMenuItem
                  key={value}
                  onClick={() => selectFilter(value)}
                  className="flex cursor-pointer items-center justify-between"
                >
                  <span>
                    {t(
                      value === "all"
                        ? "FILTER_ALL"
                        : value === "approved"
                          ? "FILTER_APPROVED"
                          : "FILTER_PENDING"
                    )}
                  </span>
                  <Badge variant="secondary" className="px-1 py-0 text-[10px]">
                    {value === "all"
                      ? reviews.length
                      : value === "approved"
                        ? approvedCount
                        : pendingCount}
                  </Badge>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="hidden h-8 shrink-0 items-center overflow-hidden rounded-md border border-input bg-background p-0.5 sm:flex">
          {(["all", "approved", "pending"] as const).map((value) => (
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
                  : value === "approved"
                    ? "FILTER_APPROVED"
                    : "FILTER_PENDING"
              )}
              <Badge
                variant="secondary"
                className="ms-1.5 px-1.5 py-0 text-[10px]"
              >
                {value === "all"
                  ? reviews.length
                  : value === "approved"
                    ? approvedCount
                    : pendingCount}
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
                    {noReviews ? t("NO_REVIEWS_FOUND") : t("NO_REVIEWS_MATCH")}
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
            htmlFor="reviews-rows-per-page"
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
              id="reviews-rows-per-page"
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
            size="icon"
            className="hidden size-8 sm:flex"
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
            size="icon"
            className="hidden size-8 sm:flex"
            onClick={() => table.setPageIndex(table.getPageCount() - 1)}
            disabled={!table.getCanNextPage()}
            title={t("LAST_PAGE")}
          >
            <ChevronsRightIcon className="size-4 rtl:rotate-180" />
            <span className="sr-only">{t("LAST_PAGE")}</span>
          </Button>
        </div>
      </div>

      <ReviewStatusSheet
        review={editingReview}
        open={statusDialogOpen}
        onOpenChange={(open) => {
          setStatusDialogOpen(open)
          if (!open) setEditingReview(null)
        }}
        onSaved={handleSaved}
      />

      <DeleteReviewDialog
        review={deletingReview}
        open={Boolean(deletingReview)}
        onOpenChange={(open) => {
          if (!open) setDeletingReview(null)
        }}
        onDeleted={handleDeleted}
      />
    </div>
  )
}