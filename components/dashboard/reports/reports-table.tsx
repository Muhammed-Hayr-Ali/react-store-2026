"use client"

import * as React from "react"
import Link from "next/link"
import { useParams, useRouter, useSearchParams } from "next/navigation"
import { useTransition } from "react"
import {
  CheckCircle2Icon,
  ClockIcon,
  EyeIcon,
  FilterIcon,
  MoreVerticalIcon,
  SearchIcon,
  ShieldAlertIcon,
  Trash2Icon,
  XCircleIcon,
  XIcon,
} from "lucide-react"
import { toast } from "sonner"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  DropdownMenu,
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
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  ReportStatus,
  ReportTargetType,
  ReportWithDetails,
} from "@/lib/actions/reports/types"
import { deleteReport } from "@/lib/actions/reports/mutations/delete"

interface ReportsTableProps {
  reports: ReportWithDetails[]
  total: number
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

export function ReportsTable({ reports, total }: ReportsTableProps) {
  const [isPending, startTransition] = useTransition()
  const router = useRouter()
  const searchParams = useSearchParams()
  const params = useParams()
  const locale = (params?.locale as string) || "en"

  const [searchQuery, setSearchQuery] = React.useState("")
  const currentStatus = searchParams.get("status") || "all"
  const currentTargetType = searchParams.get("targetType") || "all"

  const handleFilterChange = (key: string, value: string) => {
    const nextParams = new URLSearchParams(searchParams.toString())
    if (value === "all") {
      nextParams.delete(key)
    } else {
      nextParams.set(key, value)
    }
    nextParams.set("offset", "0")
    router.push(`/${locale}/dashboard/reports?${nextParams.toString()}`)
  }

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to permanently delete this report?")) {
      startTransition(async () => {
        const res = await deleteReport(id)
        if (res.success) {
          toast.success("Report deleted successfully")
          router.refresh()
        } else {
          toast.error(res.error || "Failed to delete report")
        }
      })
    }
  }

  // فلترة محلية سريعة بالبحث
  const filteredReports = React.useMemo(() => {
    if (!searchQuery.trim()) return reports
    const q = searchQuery.toLowerCase().trim()
    return reports.filter((r) => {
      const reporterName = [r.reporter?.first_name, r.reporter?.last_name]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
      const email = (r.reporter?.email || r.contact_email || "").toLowerCase()
      const reason = (r.reason || "").toLowerCase()
      const details = (r.details || "").toLowerCase()

      return (
        reporterName.includes(q) ||
        email.includes(q) ||
        reason.includes(q) ||
        details.includes(q)
      )
    })
  }, [reports, searchQuery])

  const getStatusBadge = (status: ReportStatus) => {
    switch (status) {
      case "pending":
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-destructive/10 px-2 py-0.5 text-xs font-semibold text-destructive">
            <span className="size-1.5 animate-pulse rounded-full bg-destructive" />
            Pending
          </span>
        )
      case "under_review":
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/10 px-2 py-0.5 text-xs font-semibold text-amber-600 dark:text-amber-400">
            <ClockIcon className="size-3" />
            Under Review
          </span>
        )
      case "resolved":
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
            <CheckCircle2Icon className="size-3" />
            Resolved
          </span>
        )
      case "dismissed":
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2 py-0.5 text-xs font-semibold text-muted-foreground">
            <XCircleIcon className="size-3" />
            Dismissed
          </span>
        )
    }
  }

  const getTargetBadge = (type: ReportTargetType) => {
    return (
      <span className="inline-flex items-center rounded-md bg-muted/60 px-2 py-0.5 text-xs font-medium text-foreground capitalize">
        {type.replace("_", " ")}
      </span>
    )
  }

  return (
    <div className="flex w-full flex-col justify-start gap-4">
      {/* Controls Bar المماثل لجدول Users */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        {/* حقل البحث */}
        <div className="relative w-full sm:max-w-xs">
          <SearchIcon className="absolute inset-s-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search reports by reason, user or email..."
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

        {/* التبويبات والفلاتر */}
        <div className="flex flex-wrap items-center gap-2">
          <Tabs
            value={currentStatus}
            onValueChange={(val) => handleFilterChange("status", val)}
          >
            <TabsList className="h-9">
              <TabsTrigger value="all" className="text-xs">
                All{" "}
                <Badge variant="secondary" className="ms-1.5 px-1.5 py-0">
                  {total}
                </Badge>
              </TabsTrigger>
              <TabsTrigger value="pending" className="text-xs">
                Pending
              </TabsTrigger>
              <TabsTrigger value="under_review" className="text-xs">
                Review
              </TabsTrigger>
              <TabsTrigger value="resolved" className="text-xs">
                Resolved
              </TabsTrigger>
              <TabsTrigger value="dismissed" className="text-xs">
                Dismissed
              </TabsTrigger>
            </TabsList>
          </Tabs>

          <Select
            value={currentTargetType}
            onValueChange={(val) => handleFilterChange("targetType", val)}
          >
            <SelectTrigger className="h-9 w-32 text-xs">
              <FilterIcon className="me-1.5 size-3.5 text-muted-foreground" />
              <SelectValue placeholder="All Types" />
            </SelectTrigger>
            <SelectContent align="end">
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="product">Product</SelectItem>
              <SelectItem value="review">Review</SelectItem>
              <SelectItem value="technical_issue">Issue</SelectItem>
              <SelectItem value="general">General</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Main Table */}
      {filteredReports.length === 0 ? (
        <div className="flex min-h-[300px] flex-col items-center justify-center rounded-xl border border-dashed border-border p-8 text-center">
          <div className="flex size-12 items-center justify-center rounded-full bg-muted">
            <ShieldAlertIcon className="size-6 text-muted-foreground" />
          </div>
          <h3 className="mt-3 text-sm font-semibold text-foreground">
            No reports found
          </h3>
          <p className="mt-1 text-xs text-muted-foreground">
            No moderation flags or issues match your search criteria.
          </p>
        </div>
      ) : (
        <div className="w-full overflow-hidden rounded-xl border border-border bg-card shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-border bg-muted/40 text-xs font-medium text-muted-foreground">
                <tr>
                  <th className="px-4 py-3">Reported Item</th>
                  <th className="px-4 py-3">Type</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Reporter</th>
                  <th className="px-4 py-3">Submitted</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredReports.map((report) => {
                  const reporterName =
                    [report.reporter?.first_name, report.reporter?.last_name]
                      .filter(Boolean)
                      .join(" ") ||
                    report.reporter?.email ||
                    report.contact_email ||
                    "Guest User"

                  return (
                    <tr
                      key={report.id}
                      className="transition-colors hover:bg-muted/20"
                    >
                      <td className="px-4 py-3">
                        <Link
                          href={`/${locale}/dashboard/reports/${report.id}`}
                          className="block font-semibold text-foreground transition-colors hover:text-primary"
                        >
                          {report.reason}
                        </Link>
                        {report.details ? (
                          <div className="line-clamp-1 max-w-sm text-xs text-muted-foreground">
                            {report.details}
                          </div>
                        ) : (
                          <div className="font-mono text-[11px] text-muted-foreground/80">
                            #{report.id.slice(0, 8)}
                          </div>
                        )}
                      </td>

                      <td className="px-4 py-3">
                        {getTargetBadge(report.target_type)}
                      </td>

                      <td className="px-4 py-3">
                        {getStatusBadge(report.status)}
                      </td>

                      <td className="px-4 py-3 text-xs text-muted-foreground">
                        <span className="font-medium text-foreground">
                          {reporterName}
                        </span>
                      </td>

                      <td
                        className="px-4 py-3 text-xs text-muted-foreground"
                        suppressHydrationWarning
                      >
                        <div className="font-mono text-[11px]">
                          {formatDate(report.created_at)}
                        </div>
                        <div className="font-mono text-[10px] text-muted-foreground/70">
                          {formatTime(report.created_at)}
                        </div>
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
                                href={`/${locale}/dashboard/reports/${report.id}`}
                                className="flex items-center gap-2"
                              >
                                <EyeIcon className="size-3.5" />
                                Inspect Details
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              disabled={isPending}
                              onClick={() => handleDelete(report.id)}
                              className="flex items-center gap-2 text-destructive focus:text-destructive"
                            >
                              <Trash2Icon className="size-3.5" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between px-1 text-xs text-muted-foreground">
        <span>Showing reports data</span>
        <span>
          Total Reports:{" "}
          <strong className="font-semibold text-foreground">{total}</strong>
        </span>
      </div>
    </div>
  )
}
