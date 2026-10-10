/**
 * @file components/dashboard/reports/report-details-view.tsx
 * @description View component for inspecting and managing individual report details and actions.
 * Compliant with React 19 useTransition, uncontrolled dialogs, RTL-first styling, and next-intl.
 */

"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { useTranslations } from "next-intl"
import { ExternalLinkIcon, FileTextIcon, TagIcon, UserIcon } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Spinner } from "@/components/ui/spinner"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Can } from "@/components/shared/can"
import { PERMISSIONS } from "@/lib/actions/role"
import type {
  ReportStatus,
  ReportWithDetails,
} from "@/lib/actions/reports/types"
import { resolveReportAction } from "@/lib/actions/reports/mutations/resolve-action"
import { updateReportStatus } from "@/lib/actions/reports/mutations/update-status"
import { appRoutes } from "@/lib/config/app-routes"
import DeleteReportDialog from "./delete-report-dialog"

interface ReportDetailsViewProps {
  report: ReportWithDetails
}

export function ReportDetailsView({ report }: ReportDetailsViewProps) {
  const t = useTranslations("ReportsManagement")
  const router = useRouter()

  const [selectedStatus, setSelectedStatus] = React.useState<ReportStatus>(
    report.status
  )
  const [adminNotes, setAdminNotes] = React.useState(report.admin_notes || "")
  const [isPending, startTransition] = React.useTransition()

  const handleUpdateStatusAndNotes = () => {
    startTransition(async () => {
      const res = await updateReportStatus({
        reportId: report.id,
        status: selectedStatus,
        adminNotes,
      })

      if (res.success) {
        toast.success(t("REPORT_UPDATED_SUCCESS"))
        router.refresh()
      } else {
        toast.error(res.error || t("REPORT_UPDATE_FAILED"))
      }
    })
  }

  const handleDeleteTargetContent = () => {
    if (!confirm(t("CONFIRM_DELETE_TARGET_CONTENT"))) {
      return
    }

    startTransition(async () => {
      const res = await resolveReportAction({
        reportId: report.id,
        action: "delete_target",
        adminNotes,
      })

      if (res.success) {
        toast.success(t("OFFENDING_CONTENT_REMOVED_SUCCESS"))
        router.refresh()
      } else {
        toast.error(res.error || t("ACTION_FAILED"))
      }
    })
  }

  const reporterName =
    [report.reporter?.first_name, report.reporter?.last_name]
      .filter(Boolean)
      .join(" ") ||
    report.reporter?.email ||
    report.contact_email ||
    t("GUEST_USER")

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Main Content Area: Issue details, Preview, and Reporter Info */}
        <div className="min-w-0 space-y-6 lg:col-span-2">
          {/* Issue Information Card */}
          <div className="min-w-0 space-y-4 rounded-xl border border-border bg-card p-4 shadow-xs sm:p-5">
            <div className="flex items-center justify-between border-b border-border/40 pb-3">
              <div className="flex items-center gap-2">
                <TagIcon className="size-4 text-primary" />
                <h2 className="text-sm font-semibold text-foreground">
                  {t("ISSUE_INFO_TITLE")}
                </h2>
              </div>
              <Badge variant="outline" className="text-xs capitalize">
                {report.target_type.replace("_", " ")}
              </Badge>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <span className="font-semibold text-muted-foreground">
                  {t("REASON_LABEL")}
                </span>
                <p className="mt-0.5 text-sm font-bold wrap-break-word text-destructive">
                  {report.reason}
                </p>
              </div>

              {report.details && (
                <div className="min-w-0 space-y-1">
                  <span className="font-semibold text-muted-foreground">
                    {t("DESCRIPTION_LABEL")}
                  </span>
                  <div className="overflow-hidden rounded-lg border border-border/60 bg-muted/20 p-3 font-mono text-xs leading-relaxed wrap-break-word break-all whitespace-pre-wrap text-foreground">
                    {report.details}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Reported Content Preview Card */}
          {report.target_preview && (
            <div className="min-w-0 space-y-4 rounded-xl border border-border bg-card p-4 shadow-xs sm:p-5">
              <div className="flex items-center justify-between border-b border-border/40 pb-3">
                <div className="flex items-center gap-2">
                  <FileTextIcon className="size-4 text-primary" />
                  <h2 className="text-sm font-semibold text-foreground">
                    {t("REPORTED_CONTENT_PREVIEW_TITLE")}
                  </h2>
                </div>
              </div>

              {report.target_preview.type === "review" && (
                <div className="min-w-0 space-y-3 rounded-lg border border-border/60 bg-muted/15 p-3.5 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-muted-foreground">
                      {t("GIVEN_RATING_LABEL")}
                    </span>
                    <span className="font-bold text-amber-500">
                      {report.target_preview.data.rating} / 5
                    </span>
                  </div>
                  <div className="space-y-1">
                    <span className="font-semibold text-muted-foreground">
                      {t("REVIEW_TEXT_LABEL")}
                    </span>
                    <p className="rounded-md bg-background p-3 wrap-break-word break-all whitespace-pre-wrap text-foreground italic shadow-2xs">
                      &quot;
                      {report.target_preview.data.comment ||
                        t("NO_COMMENT_PROVIDED")}
                      &quot;
                    </p>
                  </div>

                  <div className="pt-2">
                    <Can permission={PERMISSIONS.UPDATE_REPORT}>
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        disabled={isPending}
                        onClick={handleDeleteTargetContent}
                        className="text-xs"
                      >
                        {isPending && <Spinner className="me-1.5 size-3.5" />}
                        {t("DELETE_REVIEW_RESOLVE_BUTTON")}
                      </Button>
                    </Can>
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
                      <span>{t("VIEW_STOREFRONT_PRODUCT")}</span>
                      <ExternalLinkIcon className="ms-1.5 size-3.5" />
                    </a>
                  </Button>
                </div>
              )}
            </div>
          )}

          {/* Reporter Information Card */}
          <div className="min-w-0 space-y-3 rounded-xl border border-border bg-card p-4 text-xs shadow-xs sm:p-5">
            <div className="flex items-center gap-2 border-b border-border/40 pb-2.5 font-semibold text-foreground">
              <UserIcon className="size-4 text-primary" />
              {t("REPORTER_INFO_TITLE")}
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="min-w-0 space-y-1">
                <span className="font-semibold text-muted-foreground">
                  {t("USER_LABEL")}
                </span>
                <p className="truncate font-medium text-foreground">
                  {reporterName}
                </p>
              </div>

              {report.contact_email && (
                <div className="min-w-0 space-y-1">
                  <span className="font-semibold text-muted-foreground">
                    {t("CONTACT_EMAIL_LABEL")}
                  </span>
                  <p className="font-mono break-all text-foreground">
                    {report.contact_email}
                  </p>
                </div>
              )}

              {report.reporter_id && (
                <div className="min-w-0 space-y-1 sm:col-span-2">
                  <span className="font-semibold text-muted-foreground">
                    {t("USER_ID_LABEL")}
                  </span>
                  <p className="truncate font-mono text-[11px] text-muted-foreground">
                    {report.reporter_id}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Sidebar: Moderation Actions */}
        <div className="min-w-0 space-y-6">
          <div className="space-y-4 rounded-xl border border-border bg-card p-4 shadow-xs sm:p-5">
            <h2 className="border-b border-border/40 pb-2 text-sm font-semibold text-foreground">
              {t("MODERATION_ACTION_TITLE")}
            </h2>

            <div className="space-y-3 text-xs">
              <div className="space-y-1.5">
                <label className="font-semibold text-foreground">
                  {t("CURRENT_STATUS_LABEL")}
                </label>
                <Select
                  value={selectedStatus}
                  onValueChange={(val: ReportStatus) => setSelectedStatus(val)}
                >
                  <SelectTrigger className="h-9 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="text-xs">
                    <SelectItem value="pending">
                      {t("STATUS_PENDING")}
                    </SelectItem>
                    <SelectItem value="under_review">
                      {t("STATUS_UNDER_REVIEW")}
                    </SelectItem>
                    <SelectItem value="resolved">
                      {t("STATUS_RESOLVED")}
                    </SelectItem>
                    <SelectItem value="dismissed">
                      {t("STATUS_DISMISSED")}
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <label className="font-semibold text-foreground">
                  {t("ADMIN_NOTES_LABEL")}
                </label>
                <Textarea
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  placeholder={t("ADMIN_NOTES_PLACEHOLDER")}
                  rows={4}
                  className="resize-none text-xs"
                />
              </div>

              {/* Action Buttons: Save, Discard, and Uncontrolled Delete */}
              <div className="mt-3 space-y-2 border-t border-border/40 pt-2">
                <Can permission={PERMISSIONS.UPDATE_REPORT}>
                  <Button
                    type="button"
                    disabled={isPending}
                    onClick={handleUpdateStatusAndNotes}
                    className="w-full text-xs"
                  >
                    {isPending && <Spinner className="me-1.5 size-3.5" />}
                    {isPending ? t("SAVING_BUTTON") : t("SAVE_CHANGES_BUTTON")}
                  </Button>
                </Can>

                <Can permission={PERMISSIONS.DELETE_REPORT}>
                  <DeleteReportDialog
                    reportId={report.id}
                    reportReason={report.reason}
                    onDeleted={() => {
                      router.push(appRoutes.dashboard.admin.reports)
                      router.refresh()
                    }}
                  >
                    <Button
                      type="button"
                      variant="destructive"
                      disabled={isPending}
                      className="w-full text-xs"
                    >
                      {t("DELETE_REPORT")}
                    </Button>
                  </DeleteReportDialog>
                </Can>

                <Button
                  type="button"
                  variant="outline"
                  disabled={isPending}
                  onClick={() => router.push(appRoutes.dashboard.admin.reports)}
                  className="w-full text-xs"
                >
                  {t("DISCARD_CHANGES_BUTTON")}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
