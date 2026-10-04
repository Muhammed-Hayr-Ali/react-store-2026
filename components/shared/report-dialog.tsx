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
import { Button } from "@/components/ui/button"
import { submitReport } from "@/lib/actions/reports/mutations/create"

export interface ReportDialogProps {
  targetType: "product" | "review" | "technical_issue" | "general"
  targetId?: string
  title?: string
  description?: string
  children?: React.ReactNode
  open?: boolean
  onOpenChange?: (open: boolean) => void
  onSuccess?: () => void
}

const REPORT_REASONS: Record<ReportDialogProps["targetType"], string[]> = {
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
  description = "Help us maintain a safe community. Tell us what went wrong.",
  children,
  open: externalOpen,
  onOpenChange: setExternalOpen,
  onSuccess,
}: ReportDialogProps) {
  const [internalOpen, setInternalOpen] = React.useState(false)
  const isControlled = externalOpen !== undefined
  const isOpen = isControlled ? externalOpen : internalOpen

  const handleOpenChange = (newOpen: boolean) => {
    if (!isControlled) {
      setInternalOpen(newOpen)
    }
    setExternalOpen?.(newOpen)

    if (!newOpen) {
      setTimeout(() => {
        setReason("")
        setDetails("")
        setContactEmail("")
        setErrorMsg(null)
        setSuccess(false)
      }, 200)
    }
  }

  const [reason, setReason] = React.useState("")
  const [details, setDetails] = React.useState("")
  const [contactEmail, setContactEmail] = React.useState("")
  const [loading, setLoading] = React.useState(false)
  const [success, setSuccess] = React.useState(false)
  const [errorMsg, setErrorMsg] = React.useState<string | null>(null)

  const isGuestReport =
    targetType === "technical_issue" || targetType === "general"
  const reasonsList = REPORT_REASONS[targetType] || REPORT_REASONS.general

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
      contactEmail: isGuestReport ? contactEmail : undefined,
    })

    setLoading(false)

    if (res.success) {
      setSuccess(true)
      onSuccess?.()
      setTimeout(() => {
        handleOpenChange(false)
      }, 1500)
    } else {
      const errorText =
        typeof res.details === "object" && res.details?.form?.[0]
          ? res.details.form[0]
          : res.error || "Failed to submit report"
      setErrorMsg(errorText)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      {children && <DialogTrigger asChild>{children}</DialogTrigger>}

      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-base">
            <AlertTriangleIcon className="size-4 text-destructive" />
            {title}
          </DialogTitle>
          <DialogDescription className="text-xs">
            {description}
          </DialogDescription>
        </DialogHeader>

        {success ? (
          <div className="py-6 text-center text-sm font-medium text-emerald-600">
            Thank you! Your report has been submitted.
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 py-2">
            <div className="space-y-1.5">
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

            {isGuestReport && (
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">
                  Contact Email (Optional)
                </label>
                <input
                  type="email"
                  value={contactEmail}
                  onChange={(e) => setContactEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-xs focus:ring-1 focus:ring-primary focus:outline-hidden"
                />
              </div>
            )}

            <div className="space-y-1.5">
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
              <Button
                type="button"
                variant="outline"
                onClick={() => handleOpenChange(false)}
              >
                Cancel
              </Button>
              <Button type="submit" variant="destructive" disabled={loading}>
                {loading && (
                  <Loader2Icon className="me-2 size-3 animate-spin" />
                )}
                Submit Report
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  )
}
