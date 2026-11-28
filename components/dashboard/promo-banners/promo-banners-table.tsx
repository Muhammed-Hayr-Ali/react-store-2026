"use client"

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
  CalendarClockIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronsLeftIcon,
  ChevronsRightIcon,
  CircleAlertIcon,
  CircleCheckIcon,
  Columns3Icon,
  FilterIcon,
  MegaphoneIcon,
  MoreHorizontalIcon,
  PencilIcon,
  PlusIcon,
  SearchIcon,
  ToggleLeftIcon,
  ToggleRightIcon,
  Trash2Icon,
  XIcon,
} from "lucide-react"
import { toast } from "sonner"

import { Can } from "@/components/shared/can"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
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
import { getActionErrorKey } from "@/lib/actions/error-keys"
import {
  togglePromoBannerStatus,
  type AdminPromoBannerSummary,
  type PromoBanner,
} from "@/lib/actions/promo-banners"
import { PERMISSIONS } from "@/lib/actions/role"
import { getSiteAssetUrl } from "@/lib/database/supabase/storage"

import { DeletePromoBannerDialog } from "./delete-promo-banner-dialog"
import { PromoBannerFormSheet } from "./promo-banner-form-sheet"

type PromoBannerFilter = "all" | "active" | "scheduled" | "expired" | "inactive"
type PromoBannerStatus = Exclude<PromoBannerFilter, "all">

const HIDEABLE_COLUMNS = ["priority", "schedule", "status", "cta"]

interface PromoBannersTableProps {
  initialBanners: AdminPromoBannerSummary[]
  initialIsMobile?: boolean
}

interface PromoBannerRowActionsProps {
  banner: AdminPromoBannerSummary
  onEdit: (banner: AdminPromoBannerSummary) => void
  onDelete: (banner: AdminPromoBannerSummary) => void
  onToggle: (banner: AdminPromoBannerSummary) => void
}

function getPromoBannerStatus(
  banner: AdminPromoBannerSummary,
  now: number
): PromoBannerStatus {
  if (!banner.is_active) return "inactive"
  if (banner.starts_at && new Date(banner.starts_at).getTime() > now) {
    return "scheduled"
  }
  if (banner.ends_at && new Date(banner.ends_at).getTime() <= now) {
    return "expired"
  }
  return "active"
}

function PromoBannerRowActions({
  banner,
  onEdit,
  onDelete,
  onToggle,
}: PromoBannerRowActionsProps) {
  const t = useTranslations("PromoBannersManagement")

  return (
    <Can permission={PERMISSIONS.MANAGE_PROMO_BANNERS}>
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
          <DropdownMenuContent align="end" className="w-44 text-xs">
            <DropdownMenuItem
              onClick={() => onEdit(banner)}
              className="cursor-pointer"
            >
              <PencilIcon className="me-2 size-3.5" />
              {t("EDIT_ACTION")}
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => onToggle(banner)}
              className="cursor-pointer"
            >
              {banner.is_active ? (
                <ToggleLeftIcon className="me-2 size-3.5" />
              ) : (
                <ToggleRightIcon className="me-2 size-3.5" />
              )}
              {banner.is_active
                ? t("DEACTIVATE_ACTION")
                : t("ACTIVATE_ACTION")}
            </DropdownMenuItem>
            <DropdownMenuItem
              onSelect={() => onDelete(banner)}
              className="cursor-pointer text-destructive focus:text-destructive"
            >
              <Trash2Icon className="me-2 size-3.5" />
              {t("DELETE_ACTION")}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </Can>
  )
}

function formatSchedule(
  banner: AdminPromoBannerSummary,
  locale: string,
  t: ReturnType<typeof useTranslations<"PromoBannersManagement">>
): string {
  if (!banner.starts_at && !banner.ends_at) return t("ALWAYS_ACTIVE")
  const formatDate = (date: string): string =>
    new Intl.DateTimeFormat(locale, {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(new Date(date))
  const startsAt = banner.starts_at
    ? formatDate(banner.starts_at)
    : t("NO_START_DATE")
  const endsAt = banner.ends_at ? formatDate(banner.ends_at) : t("NO_END_DATE")
  return `${startsAt} → ${endsAt}`
}

export function PromoBannersTable({
  initialBanners,
  initialIsMobile = false,
}: PromoBannersTableProps) {
  const locale = useLocale()
  const t = useTranslations("PromoBannersManagement")
  const errorT = useTranslations("ActionErrors")
  const isMobile = useIsMobile()
  const [banners, setBanners] =
    React.useState<AdminPromoBannerSummary[]>(initialBanners)
  const [now, setNow] = React.useState<number>(0)
  const [search, setSearch] = React.useState("")
  const [filter, setFilter] = React.useState<PromoBannerFilter>("all")
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>(() => {
      const initial: VisibilityState = {}
      HIDEABLE_COLUMNS.forEach((column: string) => {
        initial[column] = !initialIsMobile
      })
      return initial
    })
  const [pagination, setPagination] = React.useState({
    pageIndex: 0,
    pageSize: initialIsMobile ? 20 : 10,
  })
  const [formOpen, setFormOpen] = React.useState(false)
  const [editingBanner, setEditingBanner] = React.useState<PromoBanner | null>(
    null
  )
  const [deletingBanner, setDeletingBanner] =
    React.useState<PromoBanner | null>(null)
  const [isPending, startTransition] = React.useTransition()

  React.useEffect(() => {
    setBanners(initialBanners)
  }, [initialBanners])

  React.useEffect(() => {
    setNow(Date.now())
    const intervalId = window.setInterval(() => setNow(Date.now()), 60_000)
    return () => window.clearInterval(intervalId)
  }, [])

  React.useEffect(() => {
    setColumnVisibility((current: VisibilityState) => {
      const next: VisibilityState = { ...current }
      HIDEABLE_COLUMNS.forEach((column: string) => {
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

  const counts = {
    all: banners.length,
    active: banners.filter(
      (banner: AdminPromoBannerSummary) =>
        getPromoBannerStatus(banner, now) === "active"
    ).length,
    scheduled: banners.filter(
      (banner: AdminPromoBannerSummary) =>
        getPromoBannerStatus(banner, now) === "scheduled"
    ).length,
    expired: banners.filter(
      (banner: AdminPromoBannerSummary) =>
        getPromoBannerStatus(banner, now) === "expired"
    ).length,
    inactive: banners.filter(
      (banner: AdminPromoBannerSummary) =>
        getPromoBannerStatus(banner, now) === "inactive"
    ).length,
  }

  const tableData = React.useMemo(() => {
    const query = search.trim().toLocaleLowerCase()
    return banners.filter((banner: AdminPromoBannerSummary) => {
      const status = getPromoBannerStatus(banner, now)
      if (filter !== "all" && status !== filter) return false
      if (!query) return true
      return [
        banner.title,
        banner.title_ar,
        banner.badge_text,
        banner.badge_text_ar,
        banner.cta_label,
        banner.cta_label_ar,
        banner.cta_href,
      ]
        .filter((value: string | null) => Boolean(value))
        .some((value: string | null) =>
          value!.toLocaleLowerCase().includes(query)
        )
    })
  }, [banners, filter, now, search])

  const handleSaved = (savedBanner: PromoBanner): void => {
    setBanners((current: AdminPromoBannerSummary[]) => {
      const exists = current.some(
        (banner: AdminPromoBannerSummary) => banner.id === savedBanner.id
      )
      const next = exists
        ? current.map((banner: AdminPromoBannerSummary) =>
            banner.id === savedBanner.id ? savedBanner : banner
          )
        : [...current, savedBanner]
      return next.sort(
        (left: AdminPromoBannerSummary, right: AdminPromoBannerSummary) =>
          right.priority - left.priority ||
          right.created_at.localeCompare(left.created_at)
      )
    })
  }

  const handleToggle = React.useCallback(
    (banner: AdminPromoBannerSummary): void => {
      startTransition(async () => {
        const result = await togglePromoBannerStatus({
          id: banner.id,
          is_active: !banner.is_active,
        })
        if (!result.success) {
          toast.error(errorT(getActionErrorKey(result.error)))
          return
        }

        setBanners((current: AdminPromoBannerSummary[]) => {
          const next = current.map((item: AdminPromoBannerSummary) =>
            item.id === result.data.id ? result.data : item
          )
          return next.sort(
            (left: AdminPromoBannerSummary, right: AdminPromoBannerSummary) =>
              right.priority - left.priority ||
              right.created_at.localeCompare(left.created_at)
          )
        })
        toast.success(
          result.data.is_active
            ? t("ACTIVATE_SUCCESS")
            : t("DEACTIVATE_SUCCESS")
        )
      })
    },
    [errorT, t]
  )

  const handleDeleted = (deletedBanner: PromoBanner): void => {
    setBanners((current: AdminPromoBannerSummary[]) =>
      current.filter(
        (banner: AdminPromoBannerSummary) => banner.id !== deletedBanner.id
      )
    )
  }

  const columns = React.useMemo<ColumnDef<AdminPromoBannerSummary>[]>(
    () => [
      {
        id: "banner",
        accessorFn: (banner: AdminPromoBannerSummary) => banner.title,
        header: t("COLUMN_BANNER"),
        enableHiding: false,
        cell: ({ row }) => {
          const banner = row.original
          const imageUrl = getSiteAssetUrl(banner.image_url)
          return (
            <div className="flex min-w-0 items-center gap-2.5">
              <Avatar className="size-9 shrink-0 rounded-lg after:rounded-lg">
                {imageUrl && (
                  <AvatarImage
                    src={imageUrl}
                    alt={banner.image_alt || banner.title}
                    className="rounded-lg"
                  />
                )}
                <AvatarFallback className="rounded-lg bg-secondary">
                  <MegaphoneIcon className="size-4 text-primary" />
                </AvatarFallback>
              </Avatar>
              <div className="flex min-w-0 flex-col items-start">
                <span
                  dir={locale === "ar" ? "rtl" : "ltr"}
                  className="truncate text-sm font-normal text-foreground"
                >
                  {locale === "ar"
                    ? banner.title_ar || banner.title
                    : banner.title}
                </span>
                <span className="flex min-w-0 items-center gap-1">
                  {(locale === "ar" ? banner.title : banner.title_ar) && (
                    <span
                      dir={locale === "ar" ? "ltr" : "rtl"}
                      className="truncate text-[11px] text-muted-foreground"
                    >
                      {locale === "ar" ? banner.title : banner.title_ar}
                    </span>
                  )}
                  {banner.badge_text && (
                    <Badge
                      variant="secondary"
                      className="max-w-32 truncate px-1.5 py-0 text-[10px] font-normal"
                    >
                      {locale === "ar"
                        ? banner.badge_text_ar || banner.badge_text
                        : banner.badge_text}
                    </Badge>
                  )}
                </span>
              </div>
            </div>
          )
        },
      },
      {
        id: "priority",
        accessorFn: (banner: AdminPromoBannerSummary) => banner.priority,
        header: t("COLUMN_PRIORITY"),
        cell: ({ row }) => (
          <Badge
            variant="secondary"
            className="font-mono text-xs font-normal tabular-nums"
          >
            {row.original.priority}
          </Badge>
        ),
      },
      {
        id: "schedule",
        header: t("COLUMN_SCHEDULE"),
        cell: ({ row }) => (
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <CalendarClockIcon className="size-3.5 shrink-0" />
            <span className="max-w-56 truncate">
              {formatSchedule(row.original, locale, t)}
            </span>
          </div>
        ),
      },
      {
        id: "status",
        accessorFn: (banner: AdminPromoBannerSummary) =>
          getPromoBannerStatus(banner, now),
        header: t("COLUMN_STATUS"),
        cell: ({ row }) => {
          const status = getPromoBannerStatus(row.original, now)
          const isActive = status === "active"
          const isInactive = status === "inactive"
          return (
            <Badge
              variant="outline"
              className={`gap-1 truncate px-1.5 py-0.5 text-xs leading-tight font-normal ${
                isActive
                  ? "border-emerald-500/30 text-emerald-600 dark:text-emerald-400"
                  : isInactive
                    ? "border-destructive/30 text-destructive"
                    : "border-amber-500/30 text-amber-600 dark:text-amber-400"
              }`}
            >
              {isActive ? (
                <CircleCheckIcon className="size-3 fill-emerald-500 text-background" />
              ) : (
                <CircleAlertIcon
                  className={`size-3 ${
                    isInactive
                      ? "fill-destructive text-background"
                      : "fill-amber-500 text-background"
                  }`}
                />
              )}
              <span>{t(`STATUS_${status.toUpperCase()}`)}</span>
            </Badge>
          )
        },
      },
      {
        id: "cta",
        header: t("COLUMN_CTA_LINK"),
        cell: ({ row }) => {
          const banner = row.original
          const ctaLabel =
            locale === "ar"
              ? banner.cta_label_ar || banner.cta_label
              : banner.cta_label
          return (
            <div className="flex min-w-0 flex-col">
              <span className="truncate text-xs font-normal text-foreground">
                {ctaLabel || t("NO_CTA_LABEL")}
              </span>
              <span
                dir="ltr"
                className="max-w-48 truncate font-mono text-[11px] text-muted-foreground"
              >
                {banner.cta_href || t("NO_CTA_LINK")}
              </span>
            </div>
          )
        },
      },
      {
        id: "actions",
        header: () => null,
        enableSorting: false,
        enableHiding: false,
        cell: ({ row }) => (
          <PromoBannerRowActions
            banner={row.original}
            onEdit={(item: AdminPromoBannerSummary) => {
              setEditingBanner(item)
              setFormOpen(true)
            }}
            onDelete={(item: AdminPromoBannerSummary) =>
              setDeletingBanner(item)
            }
            onToggle={handleToggle}
          />
        ),
      },
    ],
    [handleToggle, locale, now, t]
  )

  const table = useReactTable({
    data: tableData,
    columns,
    state: { columnVisibility, pagination },
    onColumnVisibilityChange: setColumnVisibility,
    onPaginationChange: setPagination,
    getRowId: (banner: AdminPromoBannerSummary) => banner.id,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  })

  const selectFilter = (nextFilter: PromoBannerFilter): void => {
    setFilter(nextFilter)
    setPagination((current) => ({ ...current, pageIndex: 0 }))
  }

  const filters: PromoBannerFilter[] = [
    "all",
    "active",
    "scheduled",
    "expired",
    "inactive",
  ]
  const columnLabels: Record<string, string> = {
    priority: t("COLUMN_PRIORITY"),
    schedule: t("COLUMN_SCHEDULE"),
    status: t("COLUMN_STATUS"),
    cta: t("COLUMN_CTA_LINK"),
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-nowrap items-center gap-2">
        <div className="relative min-w-0 flex-1">
          <SearchIcon className="absolute inset-s-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
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
            <DropdownMenuContent align="end" className="w-40 text-xs">
              {filters.map((value: PromoBannerFilter) => (
                <DropdownMenuItem
                  key={value}
                  onClick={() => selectFilter(value)}
                  className="flex cursor-pointer items-center justify-between"
                >
                  <span>{t(`FILTER_${value.toUpperCase()}`)}</span>
                  <Badge variant="secondary" className="px-1 py-0 text-[10px]">
                    {counts[value]}
                  </Badge>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="hidden h-8 shrink-0 items-center overflow-hidden rounded-md border border-input bg-background p-0.5 sm:flex">
          {filters.map((value: PromoBannerFilter) => (
            <button
              key={value}
              type="button"
              onClick={() => selectFilter(value)}
              aria-pressed={filter === value}
              className={`inline-flex h-full items-center rounded-sm px-2 text-xs font-medium transition-colors ${
                filter === value
                  ? "bg-muted font-semibold text-foreground shadow-xs"
                  : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
              }`}
            >
              {t(`FILTER_${value.toUpperCase()}`)}
              <Badge
                variant="secondary"
                className="ms-1 px-1 py-0 text-[10px]"
              >
                {counts[value]}
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
          <DropdownMenuContent align="end" className="w-44 text-xs">
            {table
              .getAllColumns()
              .filter((column) => column.getCanHide())
              .map((column) => (
                <DropdownMenuCheckboxItem
                  key={column.id}
                  checked={column.getIsVisible()}
                  onCheckedChange={(visible: boolean) =>
                    column.toggleVisibility(Boolean(visible))
                  }
                >
                  {columnLabels[column.id] ?? column.id}
                </DropdownMenuCheckboxItem>
              ))}
          </DropdownMenuContent>
        </DropdownMenu>

        <Can permission={PERMISSIONS.MANAGE_PROMO_BANNERS}>
          <PromoBannerFormSheet
            open={formOpen}
            banner={editingBanner}
            onOpenChange={setFormOpen}
            onSaved={handleSaved}
            trigger={
              <Button
                type="button"
                onClick={() => setEditingBanner(null)}
                size="sm"
                className="size-8 shrink-0 gap-1.5 p-0 text-xs sm:h-8 sm:w-auto sm:px-3"
                title={t("CREATE_BANNER")}
              >
                <PlusIcon className="size-3.5" />
                <span className="sr-only sm:not-sr-only">
                  {t("CREATE_BANNER")}
                </span>
              </Button>
            }
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
                    {banners.length === 0
                      ? t("NO_BANNERS_FOUND")
                      : t("NO_BANNERS_MATCH")}
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
            htmlFor="promo-banner-rows-per-page"
            className="text-xs font-medium whitespace-nowrap max-sm:sr-only"
          >
            {t("ROWS_PER_PAGE")}
          </Label>
          <Select
            value={`${table.getState().pagination.pageSize}`}
            onValueChange={(value: string | null) => {
              if (value) table.setPageSize(Number(value))
            }}
          >
            <SelectTrigger
              size="sm"
              className="h-8 w-18 shrink-0 text-xs"
              id="promo-banner-rows-per-page"
            >
              <SelectValue
                placeholder={table.getState().pagination.pageSize}
              />
            </SelectTrigger>
            <SelectContent side="top" className="text-xs">
              <SelectGroup>
                {[10, 20, 30, 40, 50].map((pageSize: number) => (
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
            disabled={!table.getCanPreviousPage() || isPending}
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
            disabled={!table.getCanPreviousPage() || isPending}
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
            disabled={!table.getCanNextPage() || isPending}
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
            disabled={!table.getCanNextPage() || isPending}
            title={t("LAST_PAGE")}
          >
            <ChevronsRightIcon className="size-4 rtl:rotate-180" />
            <span className="sr-only">{t("LAST_PAGE")}</span>
          </Button>
        </div>
      </div>

      <DeletePromoBannerDialog
        banner={deletingBanner}
        open={Boolean(deletingBanner)}
        onOpenChange={(open: boolean) => {
          if (!open) setDeletingBanner(null)
        }}
        onDeleted={handleDeleted}
      />
    </div>
  )
}
