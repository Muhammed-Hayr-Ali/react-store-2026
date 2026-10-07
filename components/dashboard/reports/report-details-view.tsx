/**
 * @file components/dashboard/reports/report-details-view.tsx
 * @description View component for inspecting and managing individual report details and actions.
 */

"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { ExternalLinkIcon, FileTextIcon, TagIcon, UserIcon } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { ReportStatus, ReportWithDetails } from "@/lib/actions/reports/types"
import { resolveReportAction } from "@/lib/actions/reports/mutations/resolve-action"
import { updateReportStatus } from "@/lib/actions/reports/mutations/update-status"
import { appRoutes } from "@/lib/config/app-routes"
import DeleteReportDialog from "./delete-report-dialog"

interface ReportDetailsViewProps {
  report: ReportWithDetails
}

export function ReportDetailsView({ report }: ReportDetailsViewProps) {
  const router = useRouter()
  const [selectedStatus, setSelectedStatus] = React.useState<ReportStatus>(
    report.status
  )
  const [adminNotes, setAdminNotes] = React.useState(report.admin_notes || "")
  const [isLoading, setIsLoading] = React.useState(false)
  const [deleteModalOpen, setDeleteModalOpen] = React.useState(false)

  const handleUpdateStatusAndNotes = async () => {
    setIsLoading(true)
    const res = await updateReportStatus({
      reportId: report.id,
      status: selectedStatus,
      adminNotes,
    })
    setIsLoading(false)

    if (res.success) {
      toast.success("Report updated successfully")
      router.refresh()
    } else {
      toast.error(res.error || "Failed to update report")
    }
  }

  const handleDeleteTargetContent = async () => {
    if (
      !confirm(
        "Are you sure you want to permanently delete this content and resolve the report?"
      )
    ) {
      return
    }

    setIsLoading(true)
    const res = await resolveReportAction({
      reportId: report.id,
      action: "delete_target",
      adminNotes,
    })
    setIsLoading(false)

    if (res.success) {
      toast.success("Offending content removed and report marked as resolved")
      router.refresh()
    } else {
      toast.error(res.error || "Action failed")
    }
  }

  const reporterName =
    [report.reporter?.first_name, report.reporter?.last_name]
      .filter(Boolean)
      .join(" ") ||
    report.reporter?.email ||
    report.contact_email ||
    "Guest User"

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* العمود الرئيسي: تفاصيل البلاغ، المحتوى، وبيانات المبلغ */}
        <div className="min-w-0 space-y-6 lg:col-span-2">
          {/* بطاقة معلومات البلاغ الأساسية */}
          <div className="min-w-0 space-y-4 rounded-xl border border-border bg-card p-4 shadow-xs sm:p-5">
            <div className="flex items-center justify-between border-b border-border/40 pb-3">
              <div className="flex items-center gap-2">
                <TagIcon className="size-4 text-primary" />
                <h2 className="text-sm font-semibold text-foreground">
                  Issue Information
                </h2>
              </div>
              <Badge variant="outline" className="text-xs capitalize">
                {report.target_type.replace("_", " ")}
              </Badge>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <span className="font-semibold text-muted-foreground">
                  Reason:
                </span>
                <p className="mt-0.5 text-sm font-bold wrap-break-word text-destructive">
                  {report.reason}
                </p>
              </div>

              {report.details && (
                <div className="min-w-0 space-y-1">
                  <span className="font-semibold text-muted-foreground">
                    Detailed Description:
                  </span>
                  <div className="overflow-hidden rounded-lg border border-border/60 bg-muted/20 p-3 font-mono text-xs leading-relaxed wrap-break-word break-all whitespace-pre-wrap text-foreground">
                    {report.details}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* بطاقة معاينة العنصر المستهدف (إن وجد) */}
          {report.target_preview && (
            <div className="min-w-0 space-y-4 rounded-xl border border-border bg-card p-4 shadow-xs sm:p-5">
              <div className="flex items-center justify-between border-b border-border/40 pb-3">
                <div className="flex items-center gap-2">
                  <FileTextIcon className="size-4 text-primary" />
                  <h2 className="text-sm font-semibold text-foreground">
                    Reported Content Preview
                  </h2>
                </div>
              </div>

              {report.target_preview.type === "review" && (
                <div className="min-w-0 space-y-3 rounded-lg border border-border/60 bg-muted/15 p-3.5 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-muted-foreground">
                      Given Rating:
                    </span>
                    <span className="font-bold text-amber-500">
                      {report.target_preview.data.rating} / 5 Stars
                    </span>
                  </div>
                  <div className="space-y-1">
                    <span className="font-semibold text-muted-foreground">
                      Review Text:
                    </span>
                    <p className="rounded-md bg-background p-3 wrap-break-word break-all whitespace-pre-wrap text-foreground italic shadow-2xs">
                      &quot;
                      {report.target_preview.data.comment ||
                        "No comment provided."}
                      &quot;
                    </p>
                  </div>

                  <div className="pt-2">
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      disabled={isLoading}
                      onClick={handleDeleteTargetContent}
                      className="text-xs"
                    >
                      Delete Review & Resolve Report
                    </Button>
                  </div>
                </div>
              )}

              {report.target_preview.type === "product" && (
                <div className="flex flex-col gap-3 rounded-lg border border-border/60 bg-muted/15 p-3.5 text-xs sm:flex-row sm:items-center sm:justify-between">
                  <div className="min-w-0">
                    <span className="block truncate text-sm font-semibold text-foreground">
                      {report.target_preview.data.name}
                    </span>
                    <span className="font-mono text-[11px] break-all text-muted-foreground">
                      ID: {report.target_preview.data.id}
                    </span>
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    asChild
                    className="shrink-0 text-xs"
                  >
                    <a
                      href={`/product/${report.target_preview.data.slug}`}
                      target="_blank"
                      rel="noreferrer"
                    >
                      View Storefront Product
                      <ExternalLinkIcon className="size-3.5" />
                    </a>
                  </Button>
                </div>
              )}
            </div>
          )}

          {/* بيانات المستخدم صاحب البلاغ في أسفل التفاصيل */}
          <div className="min-w-0 space-y-3 rounded-xl border border-border bg-card p-4 text-xs shadow-xs sm:p-5">
            <div className="flex items-center gap-2 border-b border-border/40 pb-2.5 font-semibold text-foreground">
              <UserIcon className="size-4 text-primary" />
              Reporter Info
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="min-w-0 space-y-1">
                <span className="font-semibold text-muted-foreground">
                  User:
                </span>
                <p className="truncate font-medium text-foreground">
                  {reporterName}
                </p>
              </div>

              {report.contact_email && (
                <div className="min-w-0 space-y-1">
                  <span className="font-semibold text-muted-foreground">
                    Contact Email:
                  </span>
                  <p className="font-mono break-all text-foreground">
                    {report.contact_email}
                  </p>
                </div>
              )}

              {report.reporter_id && (
                <div className="min-w-0 space-y-1 sm:col-span-2">
                  <span className="font-semibold text-muted-foreground">
                    User ID:
                  </span>
                  <p className="truncate font-mono text-[11px] text-muted-foreground">
                    {report.reporter_id}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* العمود الجانبي: مخصص حصراً لإجراءات الإشراف */}
        <div className="min-w-0 space-y-6">
          <div className="space-y-4 rounded-xl border border-border bg-card p-4 shadow-xs sm:p-5">
            <h2 className="border-b border-border/40 pb-2 text-sm font-semibold text-foreground">
              Moderation Action
            </h2>

            <div className="space-y-3 text-xs">
              <div className="space-y-1.5">
                <label className="font-semibold text-foreground">
                  Current Status
                </label>
                <Select
                  value={selectedStatus}
                  onValueChange={(val: ReportStatus) => setSelectedStatus(val)}
                >
                  <SelectTrigger className="h-9 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="under_review">Under Review</SelectItem>
                    <SelectItem value="resolved">Resolved</SelectItem>
                    <SelectItem value="dismissed">Dismissed</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <label className="font-semibold text-foreground">
                  Internal Admin Notes
                </label>
                <Textarea
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  placeholder="Log internal resolution steps, investigation details..."
                  rows={4}
                  className="resize-none text-xs"
                />
              </div>

              {/* أزرار الإجراءات بنفس ترتيب نموذج المنتجات (Save ثم Discard ثم Delete) */}
              <div className="mt-3 space-y-2 border-t border-border/40 pt-2">
                <Button
                  type="button"
                  variant="destructive"
                  disabled={isLoading}
                  onClick={() => setDeleteModalOpen(true)}
                  className="w-full text-xs"
                >
                  Delete Report
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  disabled={isLoading}
                  onClick={() => router.push(appRoutes.dashboard.admin.reports)}
                  className="w-full text-xs"
                >
                  Discard Changes
                </Button>

                <Button
                  type="button"
                  disabled={isLoading}
                  onClick={handleUpdateStatusAndNotes}
                  className="w-full text-xs"
                >
                  {isLoading ? "Saving..." : "Save Changes"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* دايلوج حذف البلاغ */}
      <DeleteReportDialog
        isOpen={deleteModalOpen ? "delete" : null}
        onOpenChange={(open) => setDeleteModalOpen(open)}
        item={report}
        onSuccess={() => {
          router.push(appRoutes.dashboard.admin.reports)
          router.refresh()
        }}
      />
    </div>
  )
}
