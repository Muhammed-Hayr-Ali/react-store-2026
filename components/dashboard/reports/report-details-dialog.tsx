"use client"

import * as React from "react"
import {
  AlertTriangleIcon,
  CheckCircle2Icon,
  ExternalLinkIcon,
  Loader2Icon,
  Trash2Icon,
  XCircleIcon,
} from "lucide-react"
import { toast } from "sonner"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { ReportWithDetails } from "@/lib/actions/reports/types"
import { resolveReportAction } from "@/lib/actions/reports/mutations/resolve-action"
import { updateReportStatus } from "@/lib/actions/reports/mutations/update-status"

interface ReportDetailsDialogProps {
  report: ReportWithDetails | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}

export function ReportDetailsDialog({
  report,
  open,
  onOpenChange,
  onSuccess,
}: ReportDetailsDialogProps) {
  if (!report) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl">
        <ReportDetailsContent
          key={report.id}
          report={report}
          onClose={() => onOpenChange(false)}
          onSuccess={onSuccess}
        />
      </DialogContent>
    </Dialog>
  )
}

function ReportDetailsContent({
  report,
  onClose,
  onSuccess,
}: {
  report: ReportWithDetails
  onClose: () => void
  onSuccess: () => void
}) {
  const [adminNotes, setAdminNotes] = React.useState(report.admin_notes || "")
  const [isLoading, setIsLoading] = React.useState(false)

  const handleStatusChange = async (
    status: "in_review" | "resolved" | "dismissed"
  ) => {
    setIsLoading(true)
    const res = await updateReportStatus({
      reportId: report.id,
      status,
      adminNotes,
    })
    setIsLoading(false)

    if (res.success) {
      toast.success(`Report status updated to ${status}`)
      onSuccess()
      onClose()
    } else {
      toast.error(res.error || "Failed to update report")
    }
  }

  const handleDirectAction = async (action: "dismiss" | "delete_target") => {
    setIsLoading(true)
    const res = await resolveReportAction({
      reportId: report.id,
      action,
      adminNotes,
    })
    setIsLoading(false)

    if (res.success) {
      toast.success(
        action === "delete_target"
          ? "Offending content removed and report resolved"
          : "Report dismissed"
      )
      onSuccess()
      onClose()
    } else {
      toast.error(res.error || "Action failed")
    }
  }

  return (
    <>
      <DialogHeader>
        <div className="flex items-center justify-between gap-2">
          <DialogTitle className="flex items-center gap-2 text-base">
            <AlertTriangleIcon className="size-4 text-destructive" />
            Report #{report.id.slice(0, 8)}
          </DialogTitle>
          <Badge variant="outline" className="capitalize">
            {report.status}
          </Badge>
        </div>
        <DialogDescription className="text-xs">
          Submitted on {new Date(report.created_at).toLocaleString("en-US")}
        </DialogDescription>
      </DialogHeader>

      <div className="space-y-4 py-2 text-xs">
        <div className="space-y-2 rounded-lg border border-border/60 bg-muted/20 p-3">
          <div className="grid grid-cols-2 gap-2">
            <div>
              <span className="font-semibold text-muted-foreground">
                Target Type:
              </span>
              <p className="font-medium text-foreground capitalize">
                {report.target_type.replace("_", " ")}
              </p>
            </div>
            <div>
              <span className="font-semibold text-muted-foreground">
                Reporter:
              </span>
              <p className="font-medium text-foreground">
                {report.reporter?.first_name ||
                  report.reporter?.email ||
                  report.contact_email ||
                  "Guest User"}
              </p>
            </div>
          </div>

          <div>
            <span className="font-semibold text-muted-foreground">Reason:</span>
            <p className="font-medium text-destructive">{report.reason}</p>
          </div>

          {report.details && (
            <div>
              <span className="font-semibold text-muted-foreground">
                Details:
              </span>
              <p className="mt-0.5 rounded-md bg-background p-2 font-mono whitespace-pre-wrap text-foreground/90">
                {report.details}
              </p>
            </div>
          )}
        </div>

        {report.target_preview && (
          <div className="space-y-1.5 rounded-lg border border-border/80 bg-background p-3 shadow-xs">
            <span className="flex items-center gap-1.5 font-semibold text-foreground">
              Target Preview ({report.target_preview.type}):
            </span>

            {report.target_preview.type === "review" && (
              <div className="space-y-1 text-muted-foreground">
                <div className="flex items-center gap-1 font-semibold text-amber-500">
                  Rating: {report.target_preview.data.rating} / 5
                </div>
                <p className="text-foreground italic">
                  {report.target_preview.data.comment || "No comment text"}
                </p>
              </div>
            )}

            {report.target_preview.type === "product" && (
              <div className="flex items-center justify-between">
                <span className="font-medium text-foreground">
                  {report.target_preview.data.name}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  asChild
                  className="h-7 text-xs"
                >
                  <a
                    href={`/product/${report.target_preview.data.slug}`}
                    target="_blank"
                    rel="noreferrer"
                  >
                    View Product <ExternalLinkIcon className="ms-1 size-3" />
                  </a>
                </Button>
              </div>
            )}
          </div>
        )}

        <div className="space-y-1.5">
          <label className="font-semibold text-foreground">Admin Notes</label>
          <Textarea
            value={adminNotes}
            onChange={(e) => setAdminNotes(e.target.value)}
            placeholder="Add internal moderation resolution notes..."
            rows={2}
            className="text-xs"
          />
        </div>
      </div>

      <DialogFooter className="flex-col gap-2 sm:flex-row sm:justify-between">
        {report.target_type === "review" && report.status === "pending" && (
          <Button
            type="button"
            variant="destructive"
            size="sm"
            disabled={isLoading}
            onClick={() => handleDirectAction("delete_target")}
            className="gap-1"
          >
            <Trash2Icon className="size-3.5" />
            Delete Review & Resolve
          </Button>
        )}

        <div className="ms-auto flex items-center gap-1.5">
          {report.status === "pending" && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={isLoading}
              onClick={() => handleStatusChange("in_review")}
            >
              Mark In Review
            </Button>
          )}

          <Button
            type="button"
            variant="secondary"
            size="sm"
            disabled={isLoading}
            onClick={() => handleDirectAction("dismiss")}
            className="gap-1"
          >
            <XCircleIcon className="size-3.5" />
            Dismiss
          </Button>

          <Button
            type="button"
            variant="default"
            size="sm"
            disabled={isLoading}
            onClick={() => handleStatusChange("resolved")}
            className="gap-1"
          >
            {isLoading ? (
              <Loader2Icon className="size-3.5 animate-spin" />
            ) : (
              <CheckCircle2Icon className="size-3.5" />
            )}
            Resolve
          </Button>
        </div>
      </DialogFooter>
    </>
  )
}
