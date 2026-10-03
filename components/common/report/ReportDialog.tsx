"use client"

import * as React from "react"
import { AlertTriangleIcon, Loader2Icon } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { CustomButton } from "@/components/ui/custom-button"
import { submitReport } from "@/lib/actions/reports/mutations/create"

interface ReportDialogProps {
  targetType: "product" | "review" | "technical_issue" | "general"
  targetId?: string
  title?: string
  children?: React.ReactNode
}

const REPORT_REASONS = {
  product: [
    "Misleading information or fake product",
    "Damaged or expired item",
    "Counterfeit or IP violation",
    "Other issue",
  ],
  review: [
    "Inappropriate or offensive language",
    "Spam or fake advertisement",
    "Irrelevant content",
    "Harassment",
  ],
  technical_issue: [
    "Checkout or payment problem",
    "Display or visual bug",
    "Cart error",
    "Other bug",
  ],
  general: [
    "Customer service issue",
    "Account problem",
    "Suggestion or feedback",
    "Other",
  ],
}

export function ReportDialog({
  targetType,
  targetId,
  title = "Report an Issue",
  children,
}: ReportDialogProps) {
  const [open, setOpen] = React.useState(false)
  const [reason, setReason] = React.useState("")
  const [details, setDetails] = React.useState("")
  const [loading, setLoading] = React.useState(false)
  const [success, setSuccess] = React.useState(false)
  const [errorMsg, setErrorMsg] = React.useState<string | null>(null)

  const reasonsList = REPORT_REASONS[targetType]

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!reason) {
      setErrorMsg("Please select a reason")
      return
    }

    setLoading(true)
    setErrorMsg(null)

    const res = await submitReport({
      targetType,
      targetId,
      reason,
      details,
    })

    setLoading(false)

    if (res.success) {
      setSuccess(true)
      setTimeout(() => {
        setOpen(false)
        setSuccess(false)
        setReason("")
        setDetails("")
      }, 1500)
    } else {
      setErrorMsg(res.error || "Failed to submit report")
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children || (
          <button
            type="button"
            className="flex items-center gap-1.5 text-xs text-muted-foreground transition-colors hover:text-destructive"
          >
            <AlertTriangleIcon className="size-3.5" />
            <span>Report</span>
          </button>
        )}
      </DialogTrigger>

      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-base">
            <AlertTriangleIcon className="size-4 text-destructive" />
            {title}
          </DialogTitle>
          <DialogDescription className="text-xs">
            Help us maintain a safe community. Tell us what went wrong.
          </DialogDescription>
        </DialogHeader>

        {success ? (
          <div className="py-6 text-center text-sm font-medium text-emerald-600">
            Thank you! Your report has been submitted.
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 py-2">
            <div className="space-y-2">
              <label className="text-xs font-semibold text-foreground">
                Reason *
              </label>
              <select
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-xs focus:ring-1 focus:ring-primary focus:outline-hidden"
              >
                <option value="">Select a reason...</option>
                {reasonsList.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-foreground">
                Additional Details (Optional)
              </label>
              <textarea
                value={details}
                onChange={(e) => setDetails(e.target.value)}
                rows={3}
                placeholder="Provide any additional context or details..."
                className="w-full resize-none rounded-lg border border-border bg-background p-2.5 text-xs focus:ring-1 focus:ring-primary focus:outline-hidden"
              />
            </div>

            {errorMsg && (
              <p className="text-xs font-medium text-destructive">{errorMsg}</p>
            )}

            <DialogFooter className="gap-2 sm:gap-0">
              <CustomButton
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
              >
                Cancel
              </CustomButton>
              <CustomButton
                type="submit"
                variant="destructive"
                disabled={loading}
              >
                {loading && (
                  <Loader2Icon className="me-2 size-3 animate-spin" />
                )}
                Submit Report
              </CustomButton>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  )
}
