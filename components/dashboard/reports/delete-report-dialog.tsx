/**
 * @file components/dashboard/reports/delete-report-dialog.tsx
 * @description Dialog component for confirming and executing report deletion.
 */

"use client"

import * as React from "react"
import { toast } from "sonner"
import { Trash2Icon } from "lucide-react"

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogMedia,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Spinner } from "@/components/ui/spinner"
import { deleteReport } from "@/lib/actions/reports/mutations/delete"
import { ReportWithDetails } from "@/lib/actions/reports/types"

interface DeleteReportDialogProps {
  isOpen: string | null
  onOpenChange: (open: boolean) => void
  item: ReportWithDetails | null
  onSuccess?: (deletedId: string) => void
}

export default function DeleteReportDialog({
  isOpen,
  onOpenChange,
  item,
  onSuccess,
}: DeleteReportDialogProps) {
  const [isDeleting, setIsDeleting] = React.useState(false)

  if (!item) return null

  const handleDelete = async () => {
    setIsDeleting(true)
    try {
      const res = await deleteReport(item.id)
      if (res.success) {
        toast.success("Report deleted successfully.")
        onSuccess?.(item.id)
        onOpenChange(false)
      } else {
        toast.error(res.error || "Failed to delete report. Please try again.")
      }
    } catch (error) {
      console.error("Delete report error:", error)
      toast.error("An unexpected error occurred while deleting.")
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <AlertDialog open={isOpen === "delete"} onOpenChange={onOpenChange}>
      <AlertDialogContent className="min-w-1/4">
        <AlertDialogHeader>
          <AlertDialogMedia>
            <Trash2Icon className="text-destructive" />
          </AlertDialogMedia>
          <AlertDialogTitle>Delete Report</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to permanently delete the report regarding{" "}
            <span className="font-semibold wrap-break-word text-foreground">
              &quot;{item.reason}&quot;
            </span>
            ? This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            variant="destructive"
            onClick={handleDelete}
            disabled={isDeleting}
          >
            {isDeleting ? <Spinner className="size-4" /> : "Yes, delete"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
