"use client"

/**
 * @file components/dashboard/staff-access/assign-role-dialog.tsx
 * @description Confirmation dialog for assigning access roles to staff users.
 */

import * as React from "react"
import { useTranslations } from "next-intl"
import { getActionErrorKey } from "@/lib/actions/error-keys"
import { toast } from "sonner"
import { MoreHorizontalIcon, ShieldPlusIcon } from "lucide-react"

import { Can } from "@/components/shared/can"
import { Button } from "@/components/ui/button"
import { Spinner } from "@/components/ui/spinner"
import { Field, FieldLabel } from "@/components/ui/field"
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

import { PERMISSIONS } from "@/lib/actions/role"
import type { UserWithRoles } from "@/lib/actions/role/queries/get-users-with-roles"
import type { RoleRecord } from "@/lib/actions/role/mutations/create-role"
import { assignRoleToUser } from "@/lib/actions/role/mutations/assign-user-role"

export interface AssignRoleDialogProps {
  user: UserWithRoles
  availableRoles: RoleRecord[]
  onSuccess?: (userId: string, assignedRole: RoleRecord) => void
}

export function AssignRoleDialog({
  user,
  availableRoles,
  onSuccess,
}: AssignRoleDialogProps) {
  // Track the selected role, dialog visibility, and pending request.
  const t = useTranslations("StaffAccessManagement")
  const tErrors = useTranslations("ActionErrors")
  const tUsers = useTranslations("UsersManagement")
  const [selectedRoleId, setSelectedRoleId] = React.useState<string>("")
  const [isPending, startTransition] = React.useTransition()
  const [isOpen, setIsOpen] = React.useState(false)

  // Exclude roles that are already assigned to this user.
  const assignableRoles = React.useMemo(() => {
    const userRoleIds = new Set(user.roles.map((r) => r.id))
    return availableRoles.filter((r) => !userRoleIds.has(r.id))
  }, [user, availableRoles])

  // Validate and assign the selected role, then report the outcome.
  const handleAssign = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!selectedRoleId) {
      toast.error(t("SELECT_ROLE_VALIDATION_ERROR"))
      return
    }

    const roleToAssign = availableRoles.find((r) => r.id === selectedRoleId)
    if (!roleToAssign) return

    startTransition(async () => {
      try {
        const res = await assignRoleToUser({
          userId: user.id,
          roleId: selectedRoleId,
        })

        if (res.success) {
          toast.success(t("ROLE_ASSIGNED_SUCCESS", { role: roleToAssign.name }))
          onSuccess?.(user.id, roleToAssign)
          setSelectedRoleId("")
          setIsOpen(false)
        } else {
          toast.error(
            res.error
              ? tErrors(getActionErrorKey(res.error))
              : t("FAILED_TO_ASSIGN_ROLE")
          )
        }
      } catch {
        toast.error(t("UNEXPECTED_ASSIGN_ERROR"))
      }
    })
  }

  const userDisplayName =
    [user.first_name, user.last_name].filter(Boolean).join(" ") ||
    user.email ||
    t("ANONYMOUS_USER")

  // Render a permission-gated menu trigger and role assignment dialog.
  return (
    <Can permission={PERMISSIONS.ASSIGN_ROLE}>
      <AlertDialog
        open={isOpen}
        onOpenChange={(open) => {
          if (open || !isPending) {
            setIsOpen(open)
            if (open) setSelectedRoleId("")
          }
        }}
      >
        <div className="flex items-center justify-end">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="flex size-7 text-muted-foreground data-[state=open]:bg-muted"
              >
                <MoreHorizontalIcon className="size-4" />
                <span className="sr-only">{tUsers("ACTIONS_LABEL")}</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40 text-xs">
              <AlertDialogTrigger
                render={
                  <DropdownMenuItem className="cursor-pointer gap-2">
                    <ShieldPlusIcon className="size-3.5 text-primary" />
                    <span>{t("ASSIGN_ROLE_BUTTON")}</span>
                  </DropdownMenuItem>
                }
              />
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <AlertDialogContent
          onEscapeKeyDown={(event) => {
            if (isPending) event.preventDefault()
          }}
        >
          <AlertDialogHeader className="text-start">
            <AlertDialogTitle className="text-base font-bold tracking-tight text-foreground sm:text-lg">
              {t("SHEET_TITLE")}
            </AlertDialogTitle>
            <AlertDialogDescription className="text-xs text-muted-foreground">
              {t("SHEET_DESCRIPTION", { name: userDisplayName })}
            </AlertDialogDescription>
          </AlertDialogHeader>

          <form
            id="assign-role-form"
            onSubmit={handleAssign}
            className="space-y-4"
          >
            <div className="rounded-xl border border-border bg-card p-4 shadow-xs sm:p-5">
              <div className="mb-4 flex items-center gap-2 border-b border-border/60 pb-3">
                <ShieldPlusIcon className="size-4 text-primary" />
                <h2 className="text-sm font-semibold text-card-foreground">
                  {t("CARD_TITLE")}
                </h2>
              </div>

              <Field>
                <FieldLabel className="text-xs">
                  {t("SELECT_ROLE_LABEL")}{" "}
                  <span className="text-destructive">*</span>
                </FieldLabel>
                {assignableRoles.length > 0 ? (
                  <Select
                    value={selectedRoleId}
                    onValueChange={setSelectedRoleId}
                    disabled={isPending}
                  >
                    <SelectTrigger className="h-9 w-full min-w-0 text-xs">
                      <SelectValue
                        className="truncate"
                        placeholder={t("CHOOSE_ROLE_PLACEHOLDER")}
                      >
                        {assignableRoles
                          .find((role) => role.id === selectedRoleId)
                          ?.name.toUpperCase()}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent
                      position="popper"
                      side="bottom"
                      align="start"
                      className="w-(--radix-select-trigger-width) max-w-[calc(100vw-2rem)] text-xs"
                    >
                      {assignableRoles.map((role) => (
                        <SelectItem
                          key={role.id}
                          value={role.id}
                          className="items-start text-xs"
                        >
                          <div className="flex w-full min-w-0 flex-col gap-0.5">
                            <span className="truncate font-semibold uppercase">
                              {role.name}
                            </span>
                            {role.description && (
                              <span className="block w-full min-w-0 text-[11px] wrap-break-word whitespace-normal text-muted-foreground">
                                ({role.description})
                              </span>
                            )}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <p className="rounded-lg border border-dashed border-border p-3 text-center text-xs text-muted-foreground">
                    {t("ALL_ROLES_ASSIGNED_MESSAGE")}
                  </p>
                )}
              </Field>
            </div>
          </form>

          <AlertDialogFooter>
            <AlertDialogCancel disabled={isPending} className="mt-0 text-xs">
              {t("DISCARD_BUTTON")}
            </AlertDialogCancel>
            <Button
              type="submit"
              form="assign-role-form"
              disabled={
                isPending || !selectedRoleId || assignableRoles.length === 0
              }
              className="text-xs shadow-xs"
            >
              {isPending ? (
                <>
                  <Spinner className="me-2 size-3.5" />
                  {t("ASSIGNING_BUTTON")}
                </>
              ) : (
                t("CONFIRM_ASSIGN_BUTTON")
              )}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Can>
  )
}

export default AssignRoleDialog
