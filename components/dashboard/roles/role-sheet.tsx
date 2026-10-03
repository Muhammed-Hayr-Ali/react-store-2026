"use client"

import * as React from "react"
import { toast } from "sonner"
import { useLocale } from "next-intl"
import { useIsMobile } from "@/hooks/use-mobile"
import {
  ShieldIcon,
  CheckCircle2Icon,
  XIcon,
  CheckSquare2Icon,
  SquareIcon,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Spinner } from "@/components/ui/spinner"
import { Field, FieldLabel } from "@/components/ui/field"
import {
  CustomSheet,
  CustomSheetClose,
  CustomSheetContent,
  CustomSheetDescription,
  CustomSheetFooter,
  CustomSheetHeader,
  CustomSheetTitle,
} from "@/components/ui/custom-sheet"
import { PERMISSION_GROUPS } from "./permission-groups"
import {
  createRole,
  RoleRecord,
} from "@/lib/actions/role/mutations/create-role"
import { AppPermission } from "@/lib/actions/role/types"
import { updateRolePermissions } from "@/lib/actions/role/mutations/update-role"

interface RoleSheetProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  item: RoleRecord | null
  onSuccess: (role: RoleRecord) => void
}

interface RoleFormContentProps {
  item: RoleRecord | null
  onOpenChange: (open: boolean) => void
  onSuccess: (role: RoleRecord) => void
}

function RoleFormContent({
  item,
  onOpenChange,
  onSuccess,
}: RoleFormContentProps) {
  const isEditing = Boolean(item)
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const [name, setName] = React.useState(item?.name || "")
  const [description, setDescription] = React.useState(item?.description || "")
  const [selectedPermissions, setSelectedPermissions] = React.useState<
    AppPermission[]
  >((item?.permissions || []) as AppPermission[])

  const togglePermission = (perm: AppPermission) => {
    setSelectedPermissions((prev) =>
      prev.includes(perm) ? prev.filter((p) => p !== perm) : [...prev, perm]
    )
  }

  const toggleGroupAll = (groupPermissions: AppPermission[]) => {
    const isAllSelected = groupPermissions.every((p) =>
      selectedPermissions.includes(p)
    )
    if (isAllSelected) {
      setSelectedPermissions((prev) =>
        prev.filter((p) => !groupPermissions.includes(p))
      )
    } else {
      setSelectedPermissions((prev) =>
        Array.from(new Set([...prev, ...groupPermissions]))
      )
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) {
      toast.error("Role name is required")
      return
    }
    if (selectedPermissions.length === 0) {
      toast.error("Please select at least one permission")
      return
    }

    setIsSubmitting(true)
    try {
      if (isEditing && item) {
        const res = await updateRolePermissions({
          roleId: item.id,
          description: description.trim() || null,
          permissions: selectedPermissions,
        })
        if (res.success) {
          if (res.data) {
            toast.success(`Role "${res.data.name}" updated successfully`)
            onSuccess(res.data)
            onOpenChange(false)
          }
        } else {
          toast.error(res.error || "Failed to update role")
        }
      } else {
        const res = await createRole({
          name: name.trim().toLowerCase(),
          description: description.trim() || null,
          permissions: selectedPermissions,
        })
        if (res.success) {
          if (res.data) {
            toast.success(`Role "${res.data.name}" created successfully`)
            onSuccess(res.data)
            onOpenChange(false)
          }
        } else {
          toast.error(res.error || "Failed to create role")
        }
      }
    } catch {
      toast.error("An unexpected error occurred")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <>
      <form
        onSubmit={handleSubmit}
        id="role-form"
        className="min-h-0 flex-1 space-y-5 overflow-y-auto px-4 py-5 sm:px-6"
      >
        {/* تفاصيل الدور */}
        <div className="space-y-4 rounded-xl border bg-card p-4 shadow-xs">
          <div className="flex items-center gap-2 border-b pb-3">
            <ShieldIcon className="size-4 text-primary" />
            <h2 className="text-sm font-semibold text-card-foreground">
              Role Information
            </h2>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field>
              <FieldLabel className="text-xs">
                Role Identifier <span className="text-destructive">*</span>
              </FieldLabel>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. editor, moderator"
                disabled={isEditing || isSubmitting}
                className="h-8 font-mono text-xs uppercase"
              />
            </Field>

            <Field>
              <FieldLabel className="text-xs">
                Description (Optional)
              </FieldLabel>
              <Input
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Role responsibilities and scope"
                disabled={isSubmitting}
                className="h-8 text-xs"
              />
            </Field>
          </div>
        </div>

        {/* مصفوفة الصلاحيات */}
        <div className="space-y-4">
          <div className="flex items-center justify-between px-1">
            <h2 className="text-xs font-bold tracking-wider text-muted-foreground uppercase">
              Permissions Matrix
            </h2>
            <span className="text-xs font-semibold text-primary tabular-nums">
              {selectedPermissions.length} permissions assigned
            </span>
          </div>

          {PERMISSION_GROUPS.map((group) => {
            const groupPermKeys = group.permissions.map((p) => p.key)
            const isGroupChecked = groupPermKeys.every((p) =>
              selectedPermissions.includes(p)
            )

            return (
              <div
                key={group.id}
                className="space-y-3 rounded-xl border bg-card p-4 shadow-xs"
              >
                <div className="flex items-center justify-between border-b pb-2">
                  <span className="text-xs font-bold text-card-foreground">
                    {group.label}
                  </span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => toggleGroupAll(groupPermKeys)}
                    className="h-6 gap-1 px-2 text-[11px] text-muted-foreground hover:text-foreground"
                  >
                    {isGroupChecked ? (
                      <CheckSquare2Icon className="size-3 text-primary" />
                    ) : (
                      <SquareIcon className="size-3" />
                    )}
                    {isGroupChecked ? "Unselect Group" : "Select Group"}
                  </Button>
                </div>

                <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                  {group.permissions.map((perm) => {
                    const isChecked = selectedPermissions.includes(perm.key)
                    return (
                      <div
                        key={perm.key}
                        onClick={() => togglePermission(perm.key)}
                        className={`flex cursor-pointer items-start gap-2.5 rounded-lg border p-2.5 transition-colors ${
                          isChecked
                            ? "border-primary/40 bg-primary/5"
                            : "border-border/60 hover:bg-muted/20"
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => {}}
                          className="mt-0.5 rounded border-muted-foreground/30 accent-primary"
                        />
                        <div className="space-y-0.5">
                          <p className="text-xs leading-none font-semibold text-foreground">
                            {perm.label}
                          </p>
                          <p className="text-[11px] leading-tight text-muted-foreground">
                            {perm.description}
                          </p>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )
          })}
        </div>
      </form>

      <CustomSheetFooter className="shrink-0 border-t bg-card px-5 py-3 sm:px-6">
        <div className="flex w-full flex-col-reverse items-stretch justify-end gap-2.5 sm:flex-row sm:items-center">
          <CustomSheetClose asChild>
            <Button
              type="button"
              variant="outline"
              disabled={isSubmitting}
              className="w-full sm:w-auto"
            >
              Discard
            </Button>
          </CustomSheetClose>
          <Button
            type="submit"
            form="role-form"
            disabled={isSubmitting}
            className="w-full cursor-pointer shadow-xs sm:w-auto sm:min-w-32"
          >
            {isSubmitting ? (
              <>
                <Spinner className="mr-2 size-4" />
                Saving...
              </>
            ) : (
              <>
                <CheckCircle2Icon className="mr-1.5 size-4" />
                {isEditing ? "Save Changes" : "Create Role"}
              </>
            )}
          </Button>
        </div>
      </CustomSheetFooter>
    </>
  )
}

export default function RoleSheet({
  isOpen,
  onOpenChange,
  item,
  onSuccess,
}: RoleSheetProps) {
  const isMobile = useIsMobile()
  const locale = useLocale()
  const side = isMobile ? "bottom" : locale === "ar" ? "left" : "right"
  const isEditing = Boolean(item)

  return (
    <CustomSheet open={isOpen} onOpenChange={onOpenChange}>
      <CustomSheetContent
        showCloseButton={false}
        side={side}
        className="flex h-full max-h-screen w-full flex-col p-0 sm:max-w-2xl"
      >
        <CustomSheetHeader className="shrink-0 border-b bg-card px-5 py-4 sm:px-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <CustomSheetTitle className="text-base font-bold tracking-tight text-foreground sm:text-lg">
                {isEditing ? `Edit Role: ${item?.name}` : "Create New Role"}
              </CustomSheetTitle>
              <CustomSheetDescription className="text-xs text-muted-foreground">
                Configure role credentials and fine-tune permission matrix.
              </CustomSheetDescription>
            </div>
            <CustomSheetClose asChild>
              <Button
                variant="ghost"
                size="icon"
                className="size-8 text-muted-foreground hover:bg-muted"
              >
                <XIcon className="size-4" />
              </Button>
            </CustomSheetClose>
          </div>
        </CustomSheetHeader>

        {isOpen && (
          <RoleFormContent
            key={item?.id ?? "create"}
            item={item}
            onOpenChange={onOpenChange}
            onSuccess={onSuccess}
          />
        )}
      </CustomSheetContent>
    </CustomSheet>
  )
}
