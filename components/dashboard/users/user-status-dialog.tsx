"use client"

import * as React from "react"
import { toast } from "sonner"
import { ShieldAlertIcon, CheckCircle2Icon } from "lucide-react"

import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogMedia,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import { Spinner } from "@/components/ui/spinner"
import { Field, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { AdminUserSummary, UserStatus } from "@/lib/actions/users/types"
import { updateUserStatus } from "@/lib/actions/users/mutations/update-user-status"

interface UserStatusDialogProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  user: AdminUserSummary | null
  onSuccess: (userId: string, newStatus: UserStatus, banReason?: string) => void
}

interface UserStatusContentProps {
  user: AdminUserSummary
  onOpenChange: (open: boolean) => void
  onSuccess: (userId: string, newStatus: UserStatus, banReason?: string) => void
}

function UserStatusContent({
  user,
  onOpenChange,
  onSuccess,
}: UserStatusContentProps) {
  // تهيئة الحالة الابتدائية مباشرة من user دون الحاجة إلى useEffect
  const [status, setStatus] = React.useState<UserStatus>(user.status)
  const [banReason, setBanReason] = React.useState(user.ban_reason || "")
  const [isSubmitting, setIsSubmitting] = React.useState(false)

  const handleUpdate = async () => {
    setIsSubmitting(true)
    try {
      const res = await updateUserStatus({
        userId: user.id,
        status,
        banReason: status === "banned" ? banReason : undefined,
      })

      if (res.success) {
        toast.success(`User status updated to "${status}"`)
        onSuccess(user.id, status, banReason)
        onOpenChange(false)
      } else {
        toast.error(res.error || "Failed to update status")
      }
    } catch {
      toast.error("An unexpected error occurred.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const userDisplayName =
    [user.first_name, user.last_name].filter(Boolean).join(" ") ||
    user.email ||
    "User"

  return (
    <>
      <AlertDialogHeader>
        <AlertDialogMedia>
          <ShieldAlertIcon className="size-5 text-amber-500" />
        </AlertDialogMedia>
        <AlertDialogTitle className="text-base font-bold text-foreground">
          Update Account Status
        </AlertDialogTitle>
        <AlertDialogDescription className="text-xs leading-relaxed text-muted-foreground">
          Manage account accessibility and status for{" "}
          <span className="font-semibold text-foreground">
            &quot;{userDisplayName}&quot;
          </span>
          .
        </AlertDialogDescription>
      </AlertDialogHeader>

      <div className="space-y-3 py-2">
        <Field>
          <FieldLabel className="text-xs">Account Status</FieldLabel>
          <Select
            value={status}
            onValueChange={(val) => setStatus(val as UserStatus)}
          >
            <SelectTrigger className="h-9 text-xs">
              <SelectValue placeholder="Select status..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="active" className="text-xs">
                Active (Normal Access)
              </SelectItem>
              <SelectItem value="suspended" className="text-xs">
                Suspended (Temporary Freeze)
              </SelectItem>
              <SelectItem value="banned" className="text-xs text-destructive">
                Banned (Account Blocked)
              </SelectItem>
            </SelectContent>
          </Select>
        </Field>

        {status === "banned" && (
          <Field>
            <FieldLabel className="text-xs">Ban Reason (Optional)</FieldLabel>
            <Input
              placeholder="e.g. Fraudulent behavior, terms violation..."
              value={banReason}
              onChange={(e) => setBanReason(e.target.value)}
              className="h-9 text-xs"
            />
          </Field>
        )}
      </div>

      <AlertDialogFooter className="flex flex-col-reverse items-stretch gap-2 sm:flex-row sm:items-center sm:justify-end">
        <AlertDialogCancel
          disabled={isSubmitting}
          className="w-full text-xs sm:w-auto"
        >
          Cancel
        </AlertDialogCancel>
        <Button
          type="button"
          onClick={handleUpdate}
          disabled={isSubmitting}
          className="w-full cursor-pointer text-xs shadow-xs sm:w-auto sm:min-w-28"
        >
          {isSubmitting ? (
            <>
              <Spinner className="mr-1.5 size-3.5" />
              Updating...
            </>
          ) : (
            <>
              <CheckCircle2Icon className="mr-1.5 size-3.5" />
              Save Changes
            </>
          )}
        </Button>
      </AlertDialogFooter>
    </>
  )
}

export function UserStatusDialog({
  isOpen,
  onOpenChange,
  user,
  onSuccess,
}: UserStatusDialogProps) {
  return (
    <AlertDialog open={isOpen} onOpenChange={onOpenChange}>
      <AlertDialogContent className="max-w-md">
        {isOpen && user && (
          <UserStatusContent
            key={user.id}
            user={user}
            onOpenChange={onOpenChange}
            onSuccess={onSuccess}
          />
        )}
      </AlertDialogContent>
    </AlertDialog>
  )
}
