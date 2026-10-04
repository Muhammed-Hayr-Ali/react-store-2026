"use client"

import * as React from "react"
import { useParams, useRouter, useSearchParams } from "next/navigation"
import { useTransition } from "react"
import {
  AlertCircleIcon,
  CheckCircle2Icon,
  ClockIcon,
  EyeIcon,
  FileTextIcon,
  MoreVerticalIcon,
  ShieldAlertIcon,
  Trash2Icon,
  XCircleIcon,
} from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  ReportStatus,
  ReportTargetType,
  ReportWithDetails,
} from "@/lib/actions/reports/types"
import { deleteReport } from "@/lib/actions/reports/mutations/delete"
import { ReportDetailsDialog } from "./report-details-dialog"

interface ReportsTableProps {
  reports: ReportWithDetails[]
  total: number
}

// دالة تنسيق تاريخ موحدة خادم/عميل لتفادي Hydration Mismatch
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

  const [selectedReport, setSelectedReport] =
    React.useState<ReportWithDetails | null>(null)
  const [detailsOpen, setDetailsOpen] = React.useState(false)

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

  const getStatusBadge = (status: ReportStatus) => {
    switch (status) {
      case "pending":
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-destructive/10 px-2 py-0.5 text-xs font-semibold text-destructive">
            <span className="size-1.5 animate-pulse rounded-full bg-destructive" />
            Pending
          </span>
        )
      case "in_review":
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/10 px-2 py-0.5 text-xs font-semibold text-amber-600 dark:text-amber-400">
            <ClockIcon className="size-3" />
            In Review
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

  if (reports.length === 0) {
    return (
      <div className="space-y-4">
        {/* شريط الفلاتر */}
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border bg-card p-3 shadow-xs">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="me-1 text-xs font-semibold text-muted-foreground">
              Status:
            </span>
            {["all", "pending", "in_review", "resolved", "dismissed"].map(
              (s) => (
                <Button
                  key={s}
                  variant={currentStatus === s ? "secondary" : "ghost"}
                  size="sm"
                  className="h-7 text-xs capitalize"
                  onClick={() => handleFilterChange("status", s)}
                >
                  {s.replace("_", " ")}
                </Button>
              )
            )}
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-muted-foreground">
              Type:
            </span>
            <select
              value={currentTargetType}
              onChange={(e) => handleFilterChange("targetType", e.target.value)}
              className="h-8 rounded-lg border border-border bg-background px-2.5 text-xs focus:ring-1 focus:ring-primary focus:outline-hidden"
            >
              <option value="all">All Types</option>
              <option value="product">Product</option>
              <option value="review">Review</option>
              <option value="technical_issue">Technical Issue</option>
              <option value="general">General</option>
            </select>
          </div>
        </div>

        {/* شاشة عند عدم وجود بيانات */}
        <div className="flex min-h-[300px] flex-col items-center justify-center rounded-xl border border-dashed border-border p-8 text-center">
          <div className="flex size-12 items-center justify-center rounded-full bg-muted">
            <ShieldAlertIcon className="size-6 text-muted-foreground" />
          </div>
          <h3 className="mt-3 text-sm font-semibold text-foreground">
            No reports found
          </h3>
          <p className="mt-1 text-xs text-muted-foreground">
            There are currently no moderation flags or platform issue reports
            matching this filter.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* شريط الفلاتر */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border bg-card p-3 shadow-xs">
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="me-1 text-xs font-semibold text-muted-foreground">
            Status:
          </span>
          {["all", "pending", "in_review", "resolved", "dismissed"].map((s) => (
            <Button
              key={s}
              variant={currentStatus === s ? "secondary" : "ghost"}
              size="sm"
              className="h-7 text-xs capitalize"
              onClick={() => handleFilterChange("status", s)}
            >
              {s.replace("_", " ")}
            </Button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-muted-foreground">
            Type:
          </span>
          <select
            value={currentTargetType}
            onChange={(e) => handleFilterChange("targetType", e.target.value)}
            className="h-8 rounded-lg border border-border bg-background px-2.5 text-xs focus:ring-1 focus:ring-primary focus:outline-hidden"
          >
            <option value="all">All Types</option>
            <option value="product">Product</option>
            <option value="review">Review</option>
            <option value="technical_issue">Technical Issue</option>
            <option value="general">General</option>
          </select>
        </div>
      </div>

      {/* الجدول الرئيسي المتوافق مع أسلوب الجداول لديك */}
      <div className="overflow-hidden rounded-xl border border-border bg-card shadow-xs">
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
              {reports.map((report) => {
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
                      <div className="font-semibold text-foreground">
                        {report.reason}
                      </div>
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
                          <DropdownMenuItem
                            onClick={() => {
                              setSelectedReport(report)
                              setDetailsOpen(true)
                            }}
                            className="flex items-center gap-2"
                          >
                            <EyeIcon className="size-3.5" />
                            View & Moderate
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

      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>Showing reports data</span>
        <span>
          Total Reports:{" "}
          <strong className="font-semibold text-foreground">{total}</strong>
        </span>
      </div>

      {/* نافذة التفاصيل والمعاينة */}
      <ReportDetailsDialog
        report={selectedReport}
        open={detailsOpen}
        onOpenChange={setDetailsOpen}
        onSuccess={() => router.refresh()}
      />
    </div>
  )
}
