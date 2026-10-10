"use client"

/**
 * @file components/dashboard/staff-access/assign-role-sheet.tsx
 * @description Uncontrolled slide-over sheet for assigning access roles to staff users.
 * Fully compliant with React 19 useTransition, lifecycle locking during mutations,
 * idiomatic children triggers, RTL-first styling, and next-intl.
 */

import * as React from "react"
import { useTranslations } from "next-intl"
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
  SheetTrigger,
} from "@/components/ui/sheet"

import type { UserWithRoles } from "@/lib/actions/role/queries/get-users-with-roles"
import type { RoleRecord } from "@/lib/actions/role/mutations/create-role"
import { assignRoleToUser } from "@/lib/actions/role/mutations/assign-user-role"

export interface AssignRoleSheetProps {
  user: UserWithRoles
  availableRoles: RoleRecord[]
  children?: React.ReactNode
  onSuccess?: (userId: string, assignedRole: RoleRecord) => void
}

export function AssignRoleSheet({
  user,
  availableRoles,
  children,
  onSuccess,
}: AssignRoleSheetProps) {
  const t = useTranslations("StaffAccessManagement")
  const [selectedRoleId, setSelectedRoleId] = React.useState<string>("")
  const [isPending, startTransition] = React.useTransition()
  const closeRef = React.useRef<HTMLButtonElement>(null)

  const assignableRoles = React.useMemo(() => {
    const userRoleIds = new Set(user.roles.map((r) => r.id))
    return availableRoles.filter((r) => !userRoleIds.has(r.id))
  }, [user, availableRoles])

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
          closeRef.current?.click() // Programmatic uncontrolled dismissal
        } else {
          toast.error(res.error || t("FAILED_TO_ASSIGN_ROLE"))
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

  return (
    <Sheet>
      <SheetTrigger asChild>
        {children ?? (
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="h-8 gap-1.5 px-3 text-xs"
          >
            <ShieldPlusIcon className="size-3.5 text-primary" />
            <span>{t("ASSIGN_ROLE_BUTTON")}</span>
          </Button>
        )}
      </SheetTrigger>

      <SheetContent
        side="right"
        className="flex w-full flex-col p-0 sm:max-w-md"
        onInteractOutside={(e) => {
          if (isPending) e.preventDefault()
        }}
        onEscapeKeyDown={(e) => {
          if (isPending) e.preventDefault()
        }}
      >
        <SheetHeader className="shrink-0 border-b bg-card px-5 py-4 text-start sm:px-6">
          <SheetTitle className="text-base font-bold tracking-tight text-foreground sm:text-lg">
            {t("SHEET_TITLE")}
          </SheetTitle>
          <SheetDescription className="text-xs text-muted-foreground">
            {t("SHEET_DESCRIPTION", { name: userDisplayName })}
          </SheetDescription>
        </SheetHeader>

        <div className="min-h-0 flex-1 overflow-y-auto px-4 py-5 sm:px-6 sm:py-6">
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
                    <SelectTrigger className="h-9 text-xs">
                      <SelectValue placeholder={t("CHOOSE_ROLE_PLACEHOLDER")} />
                    </SelectTrigger>
                    <SelectContent className="text-xs">
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
                  <p className="rounded-lg border border-dashed border-border p-3 text-center text-xs text-muted-foreground">
                    {t("ALL_ROLES_ASSIGNED_MESSAGE")}
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
                disabled={isPending}
                className="w-full cursor-pointer text-xs sm:w-auto"
              >
                {t("DISCARD_BUTTON")}
              </Button>
            </SheetClose>
            <Button
              type="submit"
              form="assign-role-form"
              disabled={
                isPending || !selectedRoleId || assignableRoles.length === 0
              }
              className="w-full cursor-pointer text-xs shadow-xs sm:w-auto sm:min-w-28"
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
            {/* Programmatic close trigger */}
            <SheetClose ref={closeRef} className="hidden" />
          </div>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}

export default AssignRoleSheet
