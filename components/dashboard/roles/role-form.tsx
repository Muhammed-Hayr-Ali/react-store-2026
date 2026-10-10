"use client"

/**
 * @file components/dashboard/roles/role-form.tsx
 * @description Form component for creating and updating access control roles.
 * Compliant with React 19 useTransition, RTL-first layout, and next-intl.
 */

import * as React from "react"
import { useRouter } from "next/navigation"
import { useTranslations } from "next-intl"
import { toast } from "sonner"
import {
  ShieldIcon,
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

import { createRole } from "@/lib/actions/role/mutations/create-role"
import { updateRole } from "@/lib/actions/role/mutations/update-role"
import type { AppPermission } from "@/lib/actions/role/types"
import type { RoleRecord } from "@/lib/actions/role/mutations/create-role"
import { appRoutes } from "@/lib/config/app-routes"
import { PERMISSION_GROUPS } from "@/lib/actions/role/permission-groups"

interface CreateRoleFormProps {
  initialData?: RoleRecord | null
  roleId?: string | number
}

export default function CreateRoleForm({
  initialData,
  roleId,
}: CreateRoleFormProps) {
  const t = useTranslations("RolesManagement")
  const router = useRouter()

  const isEditing = Boolean(roleId || initialData)

  const [isPending, startTransition] = React.useTransition()
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

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setErrorMessage(null)

    if (!name.trim()) {
      setErrorMessage(t("ROLE_IDENTIFIER_REQUIRED"))
      window.scrollTo({ top: 0, behavior: "smooth" })
      return
    }

    if (selectedPermissions.length === 0) {
      setErrorMessage(t("SELECT_AT_LEAST_ONE_PERMISSION"))
      window.scrollTo({ top: 0, behavior: "smooth" })
      return
    }

    startTransition(async () => {
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
              ? t("ROLE_UPDATED_SUCCESS")
              : t("ROLE_CREATED_SUCCESS", { name: res.data?.name ?? name })
          )
          router.push(appRoutes.dashboard.admin.roles)
          router.refresh()
        } else {
          setErrorMessage(
            res.error ||
              (isEditing
                ? t("FAILED_TO_UPDATE_ROLE")
                : t("FAILED_TO_CREATE_ROLE"))
          )
          window.scrollTo({ top: 0, behavior: "smooth" })
        }
      } catch {
        setErrorMessage(t("UNEXPECTED_ERROR"))
        window.scrollTo({ top: 0, behavior: "smooth" })
      }
    })
  }

  return (
    <form noValidate onSubmit={handleSubmit} className="space-y-6">
      {errorMessage && (
        <Alert variant="destructive" className="relative pe-9">
          <AlertCircleIcon className="size-4 shrink-0" />
          <AlertTitle className="text-xs font-semibold">
            {t("ALERT_TITLE")}
          </AlertTitle>
          <AlertDescription className="text-destructive-foreground/90 text-xs">
            {errorMessage}
          </AlertDescription>
          <button
            type="button"
            onClick={() => setErrorMessage(null)}
            className="absolute inset-e-3 top-3 cursor-pointer text-muted-foreground hover:text-foreground"
            aria-label={t("DISMISS_ALERT_SR")}
          >
            <XIcon className="size-4" />
            <span className="sr-only">{t("DISMISS_ALERT_SR")}</span>
          </button>
        </Alert>
      )}

      {/* Split Grid: 2 Columns Main (Matrix) + 1 Column Sidebar */}
      <div className="flex flex-col gap-6 lg:grid lg:grid-cols-3 lg:items-start">
        {/* Permissions Matrix */}
        <div className="order-2 min-w-0 lg:order-1 lg:col-span-2">
          <div className="rounded-xl border border-border bg-card p-5 shadow-xs">
            <div className="mb-4 flex items-center justify-between border-b border-border/60 pb-3">
              <div className="flex items-center gap-2">
                <LayersIcon className="size-4 text-primary" />
                <div>
                  <h2 className="text-sm font-semibold text-card-foreground">
                    {t("MATRIX_TITLE")}
                  </h2>
                  <p className="text-xs text-muted-foreground">
                    {t("MATRIX_DESCRIPTION")}
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
                  {t("SELECT_ALL")}
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={clearAllPermissions}
                  className="h-8 cursor-pointer px-2.5 text-xs text-muted-foreground hover:text-foreground"
                >
                  {t("CLEAR_ALL")}
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
                        {isGroupChecked
                          ? t("UNSELECT_GROUP")
                          : t("SELECT_GROUP")}
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
        </div>

        {/* Sidebar Cards */}
        <div className="contents lg:order-2 lg:col-span-1 lg:flex lg:min-w-0 lg:flex-col lg:space-y-6">
          {/* Role Information Card */}
          <div className="order-1 rounded-xl border border-border bg-card p-5 shadow-xs lg:order-0">
            <div className="mb-4 flex items-center gap-2 border-b border-border/60 pb-3">
              <ShieldIcon className="size-4 text-primary" />
              <div>
                <h2 className="text-sm font-semibold text-card-foreground">
                  {t("ROLE_INFO_TITLE")}
                </h2>
                <p className="text-xs text-muted-foreground">
                  {t("ROLE_INFO_DESCRIPTION")}
                </p>
              </div>
            </div>

            <FieldGroup className="space-y-4">
              <Field>
                <FieldLabel htmlFor="role-name" className="text-xs">
                  {t("ROLE_IDENTIFIER_LABEL")}{" "}
                  <span className="text-destructive">*</span>
                </FieldLabel>
                <Input
                  id="role-name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder={t("ROLE_IDENTIFIER_PLACEHOLDER")}
                  disabled={isPending || isEditing}
                  className="h-9 font-mono text-xs uppercase"
                />
              </Field>

              <Field>
                <div className="flex items-center justify-between">
                  <FieldLabel htmlFor="role-description" className="text-xs">
                    {t("ROLE_DESCRIPTION_LABEL")}
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
                    placeholder={t("ROLE_DESCRIPTION_PLACEHOLDER")}
                    rows={4}
                    disabled={isPending}
                    className="resize-y text-xs"
                  />
                </InputGroup>
              </Field>
            </FieldGroup>
          </div>

          {/* Coverage Summary Card */}
          <div className="order-3 rounded-xl border border-border bg-card p-5 shadow-xs lg:order-0">
            <div className="mb-4 flex items-center justify-between border-b border-border/60 pb-3">
              <div className="flex items-center gap-2">
                <SparklesIcon className="size-4 text-primary" />
                <div>
                  <h2 className="text-sm font-semibold text-card-foreground">
                    {t("COVERAGE_SUMMARY_TITLE")}
                  </h2>
                  <p className="text-xs text-muted-foreground">
                    {t("COVERAGE_SUMMARY_DESCRIPTION")}
                  </p>
                </div>
              </div>
              <span className="font-mono text-xs font-medium text-muted-foreground">
                {selectedPermissions.length} / {totalPossiblePermissions}
              </span>
            </div>

            <Progress
              value={
                (selectedPermissions.length / (totalPossiblePermissions || 1)) *
                100
              }
              className="h-1.5"
            />
          </div>

          {/* Actions Card */}
          <div className="order-4 rounded-xl border border-border bg-card p-5 shadow-xs lg:order-0">
            <div className="mb-4 border-b border-border/60 pb-3">
              <h2 className="text-sm font-semibold text-card-foreground">
                {t("ACTIONS_TITLE")}
              </h2>
              <p className="text-xs text-muted-foreground">
                {t("ACTIONS_DESCRIPTION")}
              </p>
            </div>
            <div className="flex flex-col gap-2">
              <Button
                type="submit"
                disabled={isPending}
                className="h-9 w-full cursor-pointer text-xs shadow-xs"
              >
                {isPending ? (
                  <>
                    <Spinner className="me-2 size-4" />
                    {t("SAVING_BUTTON")}
                  </>
                ) : (
                  <>
                    {isEditing
                      ? t("UPDATE_ROLE_BUTTON")
                      : t("SAVE_ROLE_BUTTON")}
                  </>
                )}
              </Button>

              <Button
                type="button"
                variant="outline"
                disabled={isPending}
                onClick={() => router.back()}
                className="h-9 w-full text-xs"
              >
                {t("DISCARD_CHANGES_BUTTON")}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </form>
  )
}
