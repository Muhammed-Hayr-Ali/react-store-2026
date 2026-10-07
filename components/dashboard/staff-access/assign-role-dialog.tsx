"use client"

import * as React from "react"
import { toast } from "sonner"
import { ShieldPlusIcon, CheckCircle2Icon } from "lucide-react"

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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { UserWithRoles } from "@/lib/actions/role/queries/get-users-with-roles"
import { RoleRecord } from "@/lib/actions/role/mutations/create-role"
import { assignRoleToUser } from "@/lib/actions/role/mutations/assign-user-role"

interface AssignRoleDialogProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  user: UserWithRoles | null
  availableRoles: RoleRecord[]
  onSuccess: (userId: string, assignedRole: RoleRecord) => void
}

interface AssignRoleContentProps {
  user: UserWithRoles
  availableRoles: RoleRecord[]
  onOpenChange: (open: boolean) => void
  onSuccess: (userId: string, assignedRole: RoleRecord) => void
}

function AssignRoleContent({
  user,
  availableRoles,
  onOpenChange,
  onSuccess,
}: AssignRoleContentProps) {
  const [selectedRoleId, setSelectedRoleId] = React.useState<string>("")
  const [isSubmitting, setIsSubmitting] = React.useState(false)

  const assignableRoles = React.useMemo(() => {
    const userRoleIds = new Set(user.roles.map((r) => r.id))
    return availableRoles.filter((r) => !userRoleIds.has(r.id))
  }, [user.roles, availableRoles])

  const handleAssign = async () => {
    if (!selectedRoleId) {
      toast.error("Please select a role to assign")
      return
    }

    // تصحيح: البحث بالـ UUID النصي مباشرة بدون استخدام Number()[cite: 26]
    const roleToAssign = availableRoles.find((r) => r.id === selectedRoleId)
    if (!roleToAssign) return

    setIsSubmitting(true)
    try {
      const res = await assignRoleToUser({
        userId: user.id,
        roleId: selectedRoleId, // إرسال الـ UUID مباشرة
      })

      if (res.success) {
        toast.success(`Role "${roleToAssign.name}" assigned successfully.`)
        onSuccess(user.id, roleToAssign)
        onOpenChange(false)
      } else {
        toast.error(res.error || "Failed to assign role.")
      }
    } catch {
      toast.error("An unexpected error occurred while assigning the role.")
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
          <ShieldPlusIcon className="size-5 text-primary" />
        </AlertDialogMedia>
        <AlertDialogTitle className="text-base font-bold text-foreground">
          Assign Access Role
        </AlertDialogTitle>
        <AlertDialogDescription className="text-xs leading-relaxed text-muted-foreground">
          Grant a new security role to{" "}
          <span className="font-semibold text-foreground">
            &quot;{userDisplayName}&quot;
          </span>
          .
        </AlertDialogDescription>
      </AlertDialogHeader>

      <div className="py-2">
        <Field>
          <FieldLabel className="text-xs">
            Select Role <span className="text-destructive">*</span>
          </FieldLabel>
          {assignableRoles.length > 0 ? (
            <Select value={selectedRoleId} onValueChange={setSelectedRoleId}>
              <SelectTrigger className="h-9 text-xs">
                <SelectValue placeholder="Choose a role to grant..." />
              </SelectTrigger>
              <SelectContent>
                {assignableRoles.map((role) => (
                  <SelectItem
                    key={role.id}
                    value={role.id} // تمرير الـ UUID كقيمة مباشرة
                    className="text-xs"
                  >
                    <span className="font-semibold uppercase">{role.name}</span>
                    {role.description && (
                      <span className="ms-2 text-[11px] text-muted-foreground">
                        ({role.description})
                      </span>
                    )}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          ) : (
            <p className="rounded-lg border border-dashed p-3 text-center text-xs text-muted-foreground">
              All defined roles are already assigned to this user.
            </p>
          )}
        </Field>
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
          onClick={handleAssign}
          disabled={
            isSubmitting || !selectedRoleId || assignableRoles.length === 0
          }
          className="w-full cursor-pointer text-xs shadow-xs sm:w-auto sm:min-w-28"
        >
          {isSubmitting ? (
            <>
              <Spinner className="mr-1.5 size-3.5" />
              Assigning...
            </>
          ) : (
            <>
              <CheckCircle2Icon className="mr-1.5 size-3.5" />
              Confirm Role
            </>
          )}
        </Button>
      </AlertDialogFooter>
    </>
  )
}

export default function AssignRoleDialog({
  isOpen,
  onOpenChange,
  user,
  availableRoles,
  onSuccess,
}: AssignRoleDialogProps) {
  return (
    <AlertDialog open={isOpen} onOpenChange={onOpenChange}>
      <AlertDialogContent className="max-w-md">
        {isOpen && user && (
          <AssignRoleContent
            key={user.id}
            user={user}
            availableRoles={availableRoles}
            onOpenChange={onOpenChange}
            onSuccess={onSuccess}
          />
        )}
      </AlertDialogContent>
    </AlertDialog>
  )
}
