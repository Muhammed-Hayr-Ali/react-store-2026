"use client"

import * as React from "react"
import { useRouter, useParams } from "next/navigation"
import { toast } from "sonner"
import {
  ShieldIcon,
  CheckCircle2Icon,
  CheckSquare2Icon,
  SquareIcon,
  LayersIcon,
  SparklesIcon,
  AlertCircleIcon,
  XIcon,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Spinner } from "@/components/ui/spinner"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field"
import { InputGroup, InputGroupTextarea } from "@/components/ui/input-group"
import { Progress } from "@/components/ui/progress"

import { PERMISSION_GROUPS } from "@/components/dashboard/roles/permission-groups"
import { createRole } from "@/lib/actions/role/mutations/create-role"
import { updateRole } from "@/lib/actions/role/mutations/update-role"
import { AppPermission } from "@/lib/actions/role/types"
import { RoleRecord } from "@/lib/actions/role/mutations/create-role"
import { appRoutes } from "@/lib/config/app-routes"

interface CreateRoleFormProps {
  initialData?: RoleRecord | null
  roleId?: string | number
}

export default function CreateRoleForm({
  initialData,
  roleId,
}: CreateRoleFormProps) {
  const router = useRouter()

  const isEditing = Boolean(roleId || initialData)

  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null)

  const [name, setName] = React.useState(initialData?.name || "")
  const [description, setDescription] = React.useState(
    initialData?.description || ""
  )
  const [selectedPermissions, setSelectedPermissions] = React.useState<
    AppPermission[]
  >((initialData?.permissions as AppPermission[]) || [])

  const totalPossiblePermissions = React.useMemo(() => {
    return PERMISSION_GROUPS.reduce((acc, g) => acc + g.permissions.length, 0)
  }, [])

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

  const selectAllPermissions = () => {
    const all = PERMISSION_GROUPS.flatMap((g) =>
      g.permissions.map((p) => p.key)
    )
    setSelectedPermissions(all)
  }

  const clearAllPermissions = () => {
    setSelectedPermissions([])
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMessage(null)

    if (!name.trim()) {
      setErrorMessage("Role identifier is required.")
      window.scrollTo({ top: 0, behavior: "smooth" })
      return
    }

    if (selectedPermissions.length === 0) {
      setErrorMessage(
        "Please select at least one permission from the matrix below."
      )
      window.scrollTo({ top: 0, behavior: "smooth" })
      return
    }

    setIsSubmitting(true)
    try {
      let res
      if (isEditing && roleId) {
        res = await updateRole({
          roleId: String(roleId),
          description: description.trim() || null,
          permissions: selectedPermissions,
        })
      } else {
        res = await createRole({
          name: name.trim().toLowerCase(),
          description: description.trim() || null,
          permissions: selectedPermissions,
        })
      }

      if (res.success) {
        toast.success(
          isEditing
            ? `Role updated successfully!`
            : `Role "${res.data?.name}" created successfully!`
        )
        router.push(appRoutes.dashboard.admin.roles)
        router.refresh()
      } else {
        setErrorMessage(
          res.error ||
            (isEditing ? "Failed to update role." : "Failed to create role.")
        )
        window.scrollTo({ top: 0, behavior: "smooth" })
      }
    } catch {
      setErrorMessage("An unexpected error occurred while saving the role.")
      window.scrollTo({ top: 0, behavior: "smooth" })
    } finally {
      setIsSubmitting(false)
    }
  }

  // دالة مصفوفة الصلاحيات المشتركة
  const renderPermissionsMatrix = () => (
    <div className="rounded-xl border border-border bg-card p-5 shadow-xs">
      <div className="mb-4 flex items-center justify-between border-b border-border/60 pb-3">
        <div className="flex items-center gap-2">
          <LayersIcon className="size-4 text-primary" />
          <div>
            <h2 className="text-sm font-semibold text-card-foreground">
              Permissions Matrix
            </h2>
            <p className="text-xs text-muted-foreground">
              Assign granular feature and module capabilities
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={selectAllPermissions}
            className="h-8 cursor-pointer px-2.5 text-xs text-muted-foreground hover:text-foreground"
          >
            Select All
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={clearAllPermissions}
            className="h-8 cursor-pointer px-2.5 text-xs text-muted-foreground hover:text-foreground"
          >
            Clear
          </Button>
        </div>
      </div>

      <div className="space-y-4">
        {PERMISSION_GROUPS.map((group) => {
          const groupPermKeys = group.permissions.map((p) => p.key)
          const isGroupChecked = groupPermKeys.every((p) =>
            selectedPermissions.includes(p)
          )

          return (
            <div
              key={group.id}
              className="space-y-3 rounded-lg border border-border bg-muted/10 p-4 transition-all hover:border-muted-foreground/30"
            >
              <div className="flex items-center justify-between border-b border-border/60 pb-2">
                <span className="text-xs font-bold text-card-foreground">
                  {group.label}
                </span>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => toggleGroupAll(groupPermKeys)}
                  className="h-7 gap-1 px-2 text-[11px] text-muted-foreground hover:text-foreground"
                >
                  {isGroupChecked ? (
                    <CheckSquare2Icon className="size-3.5 text-primary" />
                  ) : (
                    <SquareIcon className="size-3.5" />
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
    </div>
  )

  // دالة ملخص التغطية المشتركة
  const renderCoverageSummary = () => (
    <div className="space-y-3 rounded-xl border border-border bg-card p-4 shadow-xs">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <SparklesIcon className="size-4 text-primary" />
          <h2 className="text-xs font-semibold text-card-foreground">
            Coverage Summary
          </h2>
        </div>
        <span className="font-mono text-xs font-medium text-muted-foreground">
          {selectedPermissions.length} / {totalPossiblePermissions}
        </span>
      </div>

      <Progress
        value={
          (selectedPermissions.length / (totalPossiblePermissions || 1)) * 100
        }
        className="h-1.5"
      />
    </div>
  )

  return (
    <form noValidate onSubmit={handleSubmit} className="space-y-6">
      {errorMessage && (
        <Alert variant="destructive" className="relative pr-9">
          <AlertCircleIcon className="size-4" />
          <AlertTitle>Action Required</AlertTitle>
          <AlertDescription className="text-xs">
            {errorMessage}
          </AlertDescription>
          <button
            type="button"
            onClick={() => setErrorMessage(null)}
            className="absolute top-3 right-3 cursor-pointer text-muted-foreground hover:text-foreground"
            aria-label="Close error alert"
          >
            <XIcon className="size-4" />
          </button>
        </Alert>
      )}

      <div className="flex flex-col space-y-6 lg:grid lg:grid-cols-3 lg:items-start lg:gap-6 lg:space-y-0">
        {/* Role Information (تظهر أولاً على الجوال، وفي العمود الجانبي على الشاشات الكبيرة) */}
        <div className="order-1 min-w-0 space-y-6 lg:order-2">
          <div className="rounded-xl border border-border bg-card p-5 shadow-xs">
            <div className="mb-4 flex items-center gap-2 border-b border-border/60 pb-3">
              <ShieldIcon className="size-4 text-primary" />
              <h2 className="text-sm font-semibold text-card-foreground">
                Role Information
              </h2>
            </div>

            <FieldGroup className="space-y-4">
              <Field>
                <FieldLabel htmlFor="role-name" className="text-xs">
                  Role Identifier <span className="text-destructive">*</span>
                </FieldLabel>
                <Input
                  id="role-name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. editor, moderator"
                  disabled={isSubmitting || isEditing}
                  className="h-9 font-mono text-xs uppercase"
                />
              </Field>

              <Field>
                <div className="flex items-center justify-between">
                  <FieldLabel htmlFor="role-description" className="text-xs">
                    Description
                  </FieldLabel>
                  <span className="text-[10px] text-muted-foreground tabular-nums">
                    {description.length}/300
                  </span>
                </div>
                <InputGroup className="bg-background">
                  <InputGroupTextarea
                    id="role-description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Briefly describe the role scope and duties..."
                    rows={4}
                    disabled={isSubmitting}
                    className="resize-y text-xs"
                  />
                </InputGroup>
              </Field>
            </FieldGroup>
          </div>

          {/* Coverage Summary - يظهر هنا فقط على الشاشات الكبيرة (Desktop) */}
          <div className="hidden lg:block">{renderCoverageSummary()}</div>
        </div>

        {/* Permissions Matrix (تظهر ثانياً على الجوال عبر order-2، وتشغل عمودين على الشاشات الكبيرة) */}
        <div className="order-2 min-w-0 space-y-6 lg:order-1 lg:col-span-2">
          {/* Permissions Matrix - يظهر هنا فقط على الشاشات الكبيرة (Desktop) */}
          <div className="hidden lg:block">{renderPermissionsMatrix()}</div>

          {/* Permissions Matrix - يظهر هنا فقط على الجوال (Mobile) */}
          <div className="block lg:hidden">{renderPermissionsMatrix()}</div>

          {/* Coverage Summary - يظهر هنا فقط على الشاشات الصغيرة (Mobile) */}
          <div className="block lg:hidden">{renderCoverageSummary()}</div>
        </div>
      </div>

      <div className="flex flex-col-reverse items-stretch justify-end gap-3 border-t border-border pt-6 sm:flex-row sm:items-center">
        <Button
          type="button"
          variant="outline"
          disabled={isSubmitting}
          onClick={() => router.back()}
          className="h-9 w-full text-xs sm:w-auto"
        >
          Discard Changes
        </Button>
        <Button
          type="submit"
          disabled={isSubmitting}
          className="h-9 w-full cursor-pointer text-xs shadow-xs sm:w-auto sm:min-w-32"
        >
          {isSubmitting ? (
            <>
              <Spinner className="mr-2 size-4" />
              Saving...
            </>
          ) : (
            <>
              <CheckCircle2Icon className="mr-1.5 size-4" />
              {isEditing ? "Update Role" : "Save Role"}
            </>
          )}
        </Button>
      </div>
    </form>
  )
}
