"use client"

import * as React from "react"
import Link from "next/link"
import { useParams } from "next/navigation"
import { useTransition } from "react"
import {
  CalendarIcon,
  ClockIcon,
  ExternalLinkIcon,
  MoreVerticalIcon,
  PackageIcon,
  PencilIcon,
  SearchIcon,
  Trash2Icon,
  XCircleIcon,
  XIcon,
  ZapIcon,
} from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { toggleFlashSaleStatus } from "@/lib/actions/flash-sales/mutations/toggle-status"
import { deleteFlashSale } from "@/lib/actions/flash-sales/mutations/delete"
import { AdminFlashSaleItem } from "@/lib/actions/flash-sales"

interface FlashSalesTableProps {
  sales: AdminFlashSaleItem[]
}

function formatDate(isoString: string): string {
  const d = new Date(isoString)
  if (isNaN(d.getTime())) return ""
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, "0")
  const day = String(d.getDate()).padStart(2, "0")
  return `${year}-${month}-${day}`
}

function formatTime(isoString: string): string {
  const d = new Date(isoString)
  if (isNaN(d.getTime())) return ""
  const hours = String(d.getHours()).padStart(2, "0")
  const minutes = String(d.getMinutes()).padStart(2, "0")
  return `${hours}:${minutes}`
}

export function FlashSalesTable({ sales }: FlashSalesTableProps) {
  const [isPending, startTransition] = useTransition()
  const params = useParams()
  const locale = (params?.locale as string) || "en"

  const [searchQuery, setSearchQuery] = React.useState("")
  const [currentTab, setCurrentTab] = React.useState<string>("all")

  const handleToggle = (id: string, currentActive: boolean) => {
    startTransition(async () => {
      await toggleFlashSaleStatus(id, !currentActive)
    })
  }

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this flash sale?")) {
      startTransition(async () => {
        await deleteFlashSale(id)
      })
    }
  }

  const filteredSales = React.useMemo(() => {
    return sales.filter((sale) => {
      const matchesTab = currentTab === "all" || sale.status === currentTab
      if (!matchesTab) return false

      if (!searchQuery.trim()) return true
      const q = searchQuery.toLowerCase().trim()
      const title = (sale.title || "").toLowerCase()
      const titleAr = (sale.title_ar || "").toLowerCase()
      const slug = (sale.slug || "").toLowerCase()

      return title.includes(q) || titleAr.includes(q) || slug.includes(q)
    })
  }, [sales, currentTab, searchQuery])

  const activeCount = React.useMemo(
    () => sales.filter((s) => s.status === "active").length,
    [sales]
  )
  const scheduledCount = React.useMemo(
    () => sales.filter((s) => s.status === "scheduled").length,
    [sales]
  )

  const getStatusBadge = (status: AdminFlashSaleItem["status"]) => {
    switch (status) {
      case "active":
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
            <span className="size-1.5 animate-pulse rounded-full bg-emerald-500" />
            Active
          </span>
        )
      case "scheduled":
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-blue-500/10 px-2 py-0.5 text-xs font-semibold text-blue-600 dark:text-blue-400">
            <ClockIcon className="size-3" />
            Scheduled
          </span>
        )
      case "expired":
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2 py-0.5 text-xs font-semibold text-muted-foreground">
            <XCircleIcon className="size-3" />
            Expired
          </span>
        )
      case "disabled":
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/10 px-2 py-0.5 text-xs font-semibold text-amber-600 dark:text-amber-400">
            Disabled
          </span>
        )
    }
  }

  return (
    <div className="flex w-full flex-col justify-start gap-4">
      {/* Controls Bar الموحد */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:max-w-xs">
          <SearchIcon className="absolute inset-s-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search campaigns by title or slug..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-9 ps-8 pe-8 text-xs"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery("")}
              className="absolute inset-e-2 top-1/2 -translate-y-1/2 cursor-pointer text-muted-foreground hover:text-foreground"
            >
              <XIcon className="size-3.5" />
            </button>
          )}
        </div>

        <Tabs value={currentTab} onValueChange={setCurrentTab}>
          <TabsList className="h-9">
            <TabsTrigger value="all" className="text-xs">
              All{" "}
              <Badge variant="secondary" className="ms-1.5 px-1.5 py-0">
                {sales.length}
              </Badge>
            </TabsTrigger>
            <TabsTrigger value="active" className="text-xs">
              Active{" "}
              <Badge variant="secondary" className="ms-1.5 px-1.5 py-0">
                {activeCount}
              </Badge>
            </TabsTrigger>
            <TabsTrigger value="scheduled" className="text-xs">
              Scheduled{" "}
              <Badge variant="secondary" className="ms-1.5 px-1.5 py-0">
                {scheduledCount}
              </Badge>
            </TabsTrigger>
            <TabsTrigger value="expired" className="text-xs">
              Expired
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Main Table */}
      {filteredSales.length === 0 ? (
        <div className="flex min-h-[300px] flex-col items-center justify-center rounded-xl border border-dashed border-border p-8 text-center">
          <div className="flex size-12 items-center justify-center rounded-full bg-muted">
            <ZapIcon className="size-6 text-muted-foreground" />
          </div>
          <h3 className="mt-3 text-sm font-semibold text-foreground">
            No flash sales found
          </h3>
          <p className="mt-1 text-xs text-muted-foreground">
            No promotional campaigns match your current filters.
          </p>
        </div>
      ) : (
        <div className="w-full overflow-hidden rounded-xl border border-border bg-card shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-border bg-muted/40 text-xs font-medium text-muted-foreground">
                <tr>
                  <th className="px-4 py-3">Campaign</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Duration</th>
                  <th className="px-4 py-3 text-center">Products</th>
                  <th className="px-4 py-3 text-center">Active</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredSales.map((sale) => (
                  <tr
                    key={sale.id}
                    className="transition-colors hover:bg-muted/20"
                  >
                    <td className="px-4 py-3">
                      <div className="font-semibold text-foreground">
                        {sale.title}
                      </div>
                      {sale.title_ar && (
                        <div className="text-xs text-muted-foreground">
                          {sale.title_ar}
                        </div>
                      )}
                      <div className="font-mono text-[11px] text-muted-foreground/80">
                        /{sale.slug}
                      </div>
                    </td>

                    <td className="px-4 py-3">{getStatusBadge(sale.status)}</td>

                    <td
                      className="px-4 py-3 text-xs text-muted-foreground"
                      suppressHydrationWarning
                    >
                      <div className="flex items-center gap-1 font-mono text-[11px]">
                        <CalendarIcon className="size-3 shrink-0 text-muted-foreground" />
                        <span>{formatDate(sale.starts_at)}</span>
                        <span>→</span>
                        <span>{formatDate(sale.ends_at)}</span>
                      </div>
                      <div className="mt-0.5 font-mono text-[10px] text-muted-foreground/70">
                        {formatTime(sale.starts_at)} -{" "}
                        {formatTime(sale.ends_at)}
                      </div>
                    </td>

                    <td className="px-4 py-3 text-center">
                      <span className="inline-flex items-center gap-1 rounded-md bg-muted/60 px-2 py-0.5 text-xs font-medium text-foreground">
                        <PackageIcon className="size-3 text-muted-foreground" />
                        {sale.item_count}
                      </span>
                    </td>

                    <td className="px-4 py-3 text-center">
                      <Switch
                        checked={sale.is_active}
                        disabled={isPending}
                        onCheckedChange={() =>
                          handleToggle(sale.id, sale.is_active)
                        }
                        aria-label="Toggle flash sale status"
                      />
                    </td>

                    <td className="px-4 py-3 text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="size-8"
                          >
                            <MoreVerticalIcon className="size-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem asChild>
                            <Link
                              href={`/${locale}/dashboard/flash-sales/${sale.id}/edit`}
                              className="flex items-center gap-2"
                            >
                              <PencilIcon className="size-3.5" />
                              Edit
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild>
                            <Link
                              href={`/${locale}/deals/${sale.slug}`}
                              target="_blank"
                              className="flex items-center gap-2"
                            >
                              <ExternalLinkIcon className="size-3.5" />
                              View Page
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleDelete(sale.id)}
                            className="flex items-center gap-2 text-destructive focus:text-destructive"
                          >
                            <Trash2Icon className="size-3.5" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between px-1 text-xs text-muted-foreground">
        <span>Showing flash sale campaigns</span>
        <span>
          Total Campaigns:{" "}
          <strong className="font-semibold text-foreground">
            {sales.length}
          </strong>
        </span>
      </div>
    </div>
  )
}
