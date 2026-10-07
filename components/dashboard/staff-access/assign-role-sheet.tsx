"use client"

import * as React from "react"
import { toast } from "sonner"
import { ShieldPlusIcon } from "lucide-react"

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
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { UserWithRoles } from "@/lib/actions/role/queries/get-users-with-roles"
import { RoleRecord } from "@/lib/actions/role/mutations/create-role"
import { assignRoleToUser } from "@/lib/actions/role/mutations/assign-user-role"

interface AssignRoleSheetProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  user: UserWithRoles | null
  availableRoles: RoleRecord[]
  onSuccess: (userId: string, assignedRole: RoleRecord) => void
}

export default function AssignRoleSheet({
  isOpen,
  onOpenChange,
  user,
  availableRoles,
  onSuccess,
}: AssignRoleSheetProps) {
  const [selectedRoleId, setSelectedRoleId] = React.useState<string>("")
  const [isSubmitting, setIsSubmitting] = React.useState(false)

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      setSelectedRoleId("")
    }
    onOpenChange(open)
  }

  const assignableRoles = React.useMemo(() => {
    if (!user) return availableRoles
    const userRoleIds = new Set(user.roles.map((r) => r.id))
    return availableRoles.filter((r) => !userRoleIds.has(r.id))
  }, [user, availableRoles])

  const handleAssign = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user || !selectedRoleId) {
      toast.error("Please select a role to assign")
      return
    }

    const roleToAssign = availableRoles.find((r) => r.id === selectedRoleId)
    if (!roleToAssign) return

    setIsSubmitting(true)
    try {
      const res = await assignRoleToUser({
        userId: user.id,
        roleId: selectedRoleId,
      })

      if (res.success) {
        toast.success(`Role "${roleToAssign.name}" assigned successfully.`)
        onSuccess(user.id, roleToAssign)
        handleOpenChange(false)
      } else {
        toast.error(res.error || "Failed to assign role.")
      }
    } catch {
      toast.error("An unexpected error occurred while assigning the role.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const userDisplayName = user
    ? [user.first_name, user.last_name].filter(Boolean).join(" ") ||
      user.email ||
      "User"
    : ""

  return (
    <Sheet open={isOpen} onOpenChange={handleOpenChange}>
      <SheetContent
        side="right"
        className="flex w-full flex-col p-0 sm:max-w-md"
      >
        <SheetHeader className="shrink-0 border-b bg-card px-5 py-4 sm:px-6">
          <SheetTitle className="text-base font-bold tracking-tight text-foreground sm:text-lg">
            Assign Access Role
          </SheetTitle>
          <SheetDescription className="text-xs text-muted-foreground">
            Grant a new security role to &quot;{userDisplayName}&quot;.
          </SheetDescription>
        </SheetHeader>

        <div className="min-h-0 flex-1 overflow-y-auto px-4 py-5 sm:px-6 sm:py-6">
          <form
            id="assign-role-form"
            onSubmit={handleAssign}
            className="space-y-4"
          >
            <div className="rounded-xl border bg-card p-4 shadow-xs sm:p-5">
              <div className="mb-4 flex items-center gap-2 border-b pb-3">
                <ShieldPlusIcon className="size-4 text-primary" />
                <h2 className="text-sm font-semibold text-card-foreground">
                  Role Assignment
                </h2>
              </div>

              <Field>
                <FieldLabel className="text-xs">
                  Select Role <span className="text-destructive">*</span>
                </FieldLabel>
                {assignableRoles.length > 0 ? (
                  <Select
                    value={selectedRoleId}
                    onValueChange={setSelectedRoleId}
                  >
                    <SelectTrigger className="h-9 text-xs">
                      <SelectValue placeholder="Choose a role to grant..." />
                    </SelectTrigger>
                    <SelectContent>
                      {assignableRoles.map((role) => (
                        <SelectItem
                          key={role.id}
                          value={role.id}
                          className="text-xs"
                        >
                          <span className="font-semibold uppercase">
                            {role.name}
                          </span>
                          {role.description && (
                            <span className="max-w-3xs truncate text-[11px] text-muted-foreground">
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
          </form>
        </div>

        <SheetFooter className="shrink-0 border-t bg-card px-5 py-3 sm:px-6 sm:py-4">
          <div className="flex w-full flex-col-reverse items-stretch justify-end gap-2.5 sm:flex-row sm:items-center">
            <SheetClose asChild>
              <Button
                type="button"
                variant="outline"
                disabled={isSubmitting}
                className="w-full cursor-pointer text-xs sm:w-auto"
              >
                Discard
              </Button>
            </SheetClose>
            <Button
              type="submit"
              form="assign-role-form"
              disabled={
                isSubmitting || !selectedRoleId || assignableRoles.length === 0
              }
              className="w-full cursor-pointer text-xs shadow-xs sm:w-auto sm:min-w-28"
            >
              {isSubmitting ? (
                <>
                  <Spinner className="mr-2 size-3.5" />
                  Assigning...
                </>
              ) : (
                "Assign Role"
              )}
            </Button>
          </div>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
