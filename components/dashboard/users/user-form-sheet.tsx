"use client"

/**
 * @file components/dashboard/users/user-form-sheet.tsx
 * @description Uncontrolled slide-over sheet for creating and updating user accounts.
 * Fully compliant with React 19 Compiler ref-safety protocol (Section 13.7),
 * RHF + Zod schema resolution, RTL-first styling, and next-intl.
 */

import * as React from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { Controller, useForm } from "react-hook-form"
import { z } from "zod"
import { useRouter } from "next/navigation"
import { useTranslations } from "next-intl"
import { toast } from "sonner"
import {
  UserPlusIcon,
  XIcon,
  Wand2Icon,
  AlertCircleIcon,
  ShieldIcon,
  PencilIcon,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Spinner } from "@/components/ui/spinner"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
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

import type { AdminUserSummary } from "@/lib/actions/users/types"
import { createUser } from "@/lib/actions/users/mutations/create-user"
import { updateUser } from "@/lib/actions/users/mutations/update-user"
import { createUserSchema, updateUserSchema } from "@/lib/actions/users/schemas"

type CreateFormValues = z.infer<typeof createUserSchema>
type UpdateFormValues = z.infer<typeof updateUserSchema>
type UserFormValues = CreateFormValues | UpdateFormValues

export interface UserFormSheetProps {
  user?: AdminUserSummary | null
  children?: React.ReactNode
  onSuccess?: (user: AdminUserSummary, isEditing: boolean) => void
}

export function UserFormSheet({
  user,
  children,
  onSuccess,
}: UserFormSheetProps) {
  const t = useTranslations("UsersManagement")
  const router = useRouter()
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null)
  const closeRef = React.useRef<HTMLButtonElement>(null)

  const isEditing = Boolean(user)

  const form = useForm<UserFormValues>({
    resolver: zodResolver(isEditing ? updateUserSchema : createUserSchema),
    mode: "onChange",
    values: isEditing
      ? {
          userId: user?.id || "",
          firstName: user?.first_name || "",
          lastName: user?.last_name || "",
          phoneNumber: user?.phone_number || "",
        }
      : {
          email: "",
          password: "",
          firstName: "",
          lastName: "",
          phoneNumber: "",
        },
  })

  const {
    formState: { isSubmitting },
    control,
    setValue,
    reset,
  } = form

  const handleGeneratePassword = () => {
    const chars =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*"
    let pass = ""
    for (let i = 0; i < 10; i++) {
      pass += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    setValue("password" as keyof UserFormValues, pass, {
      shouldValidate: true,
      shouldDirty: true,
    })
    toast.success(t("PASSWORD_GENERATED_SUCCESS"))
  }

  async function onSubmit(data: UserFormValues) {
    setErrorMessage(null)

    let result
    if (isEditing && user) {
      const updateData = data as UpdateFormValues
      result = await updateUser({
        userId: user.id,
        firstName: updateData.firstName,
        lastName: updateData.lastName,
        phoneNumber: updateData.phoneNumber,
      })
    } else {
      const createData = data as CreateFormValues
      result = await createUser({
        email: createData.email,
        password: createData.password || undefined,
        firstName: createData.firstName,
        lastName: createData.lastName,
        phoneNumber: createData.phoneNumber,
      })
    }

    if (result.success) {
      toast.success(
        isEditing ? t("USER_UPDATED_SUCCESS") : t("USER_CREATED_SUCCESS")
      )
      if (isEditing && user) {
        onSuccess?.(
          {
            ...user,
            first_name: (data as UpdateFormValues).firstName || null,
            last_name: (data as UpdateFormValues).lastName || null,
            phone_number: (data as UpdateFormValues).phoneNumber || null,
          },
          true
        )
      } else {
        const resData = (result as { success: true; data?: AdminUserSummary })
          .data
        if (resData) {
          onSuccess?.(resData, false)
        } else {
          const createData = data as CreateFormValues
          onSuccess?.(
            {
              id: "",
              email: createData.email,
              first_name: createData.firstName || null,
              last_name: createData.lastName || null,
              phone_number: createData.phoneNumber || null,
              profile_image: null,
              status: "active",
              ban_reason: null,
              banned_at: null,
              created_at: new Date().toISOString(),
              roles: [],
            },
            false
          )
        }
      }
      if (!isEditing) reset()
      closeRef.current?.click() // Programmatic uncontrolled dismissal
      router.refresh()
    } else {
      const errorMsg =
        result.error === "PERMISSION_DENIED"
          ? t("PERMISSION_DENIED_ERROR")
          : result.error ||
            (isEditing
              ? t("FAILED_TO_UPDATE_USER")
              : t("FAILED_TO_CREATE_USER"))
      setErrorMessage(errorMsg)
    }
  }

  // ✅ Section 13.7 Standard: Event-time handler to prevent render-time ref capture
  const handleFormSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    void form.handleSubmit(onSubmit)(e)
  }

  return (
    <Sheet>
      <SheetTrigger asChild>
        {children ?? (
          <Button
            type="button"
            variant={isEditing ? "ghost" : "default"}
            size="sm"
            className="h-8 gap-1.5 px-3 text-xs"
          >
            {isEditing ? (
              <>
                <PencilIcon className="size-3.5" />
                <span>{t("EDIT_USER_ACTION")}</span>
              </>
            ) : (
              <>
                <UserPlusIcon className="size-3.5" />
                <span>{t("CREATE_USER_BUTTON")}</span>
              </>
            )}
          </Button>
        )}
      </SheetTrigger>

      <SheetContent
        side="right"
        className="flex w-full flex-col p-0 sm:max-w-xl"
        onInteractOutside={(e) => {
          if (isSubmitting) e.preventDefault()
        }}
        onEscapeKeyDown={(e) => {
          if (isSubmitting) e.preventDefault()
        }}
      >
        <SheetHeader className="shrink-0 border-b bg-card px-5 py-4 text-start sm:px-6">
          <SheetTitle className="text-base font-bold tracking-tight text-foreground sm:text-lg">
            {isEditing ? t("EDIT_USER_TITLE") : t("CREATE_USER_TITLE")}
          </SheetTitle>
          <SheetDescription className="text-xs text-muted-foreground">
            {isEditing
              ? t("EDIT_USER_DESCRIPTION")
              : t("CREATE_USER_DESCRIPTION")}
          </SheetDescription>
        </SheetHeader>

        <div className="min-h-0 flex-1 overflow-y-auto px-4 py-5 sm:px-6 sm:py-6">
          <form
            id="user-form-element"
            onSubmit={handleFormSubmit}
            className="space-y-5 pb-8"
          >
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
                </button>
              </Alert>
            )}

            <div className="rounded-xl border border-border bg-card p-4 shadow-xs sm:p-5">
              <div className="mb-4 flex items-center gap-2 border-b border-border/60 pb-3">
                <UserPlusIcon className="size-4 text-primary" />
                <h2 className="text-sm font-semibold text-card-foreground">
                  {t("ACCOUNT_CREDENTIALS_TITLE")}
                </h2>
              </div>

              <FieldGroup className="space-y-4">
                {!isEditing && (
                  <Controller
                    name={"email" as keyof UserFormValues}
                    control={control}
                    render={({ field, fieldState }) => (
                      <Field data-invalid={fieldState.invalid}>
                        <FieldLabel htmlFor="user-email" className="text-xs">
                          {t("EMAIL_LABEL")}{" "}
                          <span className="text-destructive">*</span>
                        </FieldLabel>
                        <Input
                          {...field}
                          id="user-email"
                          type="email"
                          placeholder="user@example.com"
                          className="h-8 text-xs"
                          value={(field.value as string) || ""}
                        />
                        {fieldState.invalid && (
                          <FieldError errors={[fieldState.error]} />
                        )}
                      </Field>
                    )}
                  />
                )}

                {!isEditing && (
                  <Controller
                    name={"password" as keyof UserFormValues}
                    control={control}
                    render={({ field, fieldState }) => (
                      <Field data-invalid={fieldState.invalid}>
                        <FieldLabel htmlFor="user-password" className="text-xs">
                          {t("PASSWORD_LABEL")}
                        </FieldLabel>
                        <div className="relative flex items-center">
                          <Input
                            {...field}
                            id="user-password"
                            type="text"
                            placeholder={t("PASSWORD_PLACEHOLDER")}
                            className="h-8 pe-8 font-mono text-xs"
                            value={(field.value as string) || ""}
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={handleGeneratePassword}
                            title={t("GENERATE_PASSWORD_TITLE")}
                            className="absolute inset-e-1 size-6 cursor-pointer text-muted-foreground hover:text-primary"
                          >
                            <Wand2Icon className="size-3.5" />
                          </Button>
                        </div>
                        {fieldState.invalid && (
                          <FieldError errors={[fieldState.error]} />
                        )}
                      </Field>
                    )}
                  />
                )}
              </FieldGroup>
            </div>

            <div className="rounded-xl border border-border bg-card p-4 shadow-xs sm:p-5">
              <div className="mb-4 flex items-center gap-2 border-b border-border/60 pb-3">
                <ShieldIcon className="size-4 text-primary" />
                <h2 className="text-sm font-semibold text-card-foreground">
                  {t("PERSONAL_DETAILS_TITLE")}
                </h2>
              </div>

              <FieldGroup className="space-y-4">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <Controller
                    name="firstName"
                    control={control}
                    render={({ field, fieldState }) => (
                      <Field data-invalid={fieldState.invalid}>
                        <FieldLabel
                          htmlFor="user-firstname"
                          className="text-xs"
                        >
                          {t("FIRST_NAME_LABEL")}
                        </FieldLabel>
                        <Input
                          {...field}
                          id="user-firstname"
                          placeholder="John"
                          className="h-8 text-xs"
                          value={field.value || ""}
                        />
                        {fieldState.invalid && (
                          <FieldError errors={[fieldState.error]} />
                        )}
                      </Field>
                    )}
                  />

                  <Controller
                    name="lastName"
                    control={control}
                    render={({ field, fieldState }) => (
                      <Field data-invalid={fieldState.invalid}>
                        <FieldLabel htmlFor="user-lastname" className="text-xs">
                          {t("LAST_NAME_LABEL")}
                        </FieldLabel>
                        <Input
                          {...field}
                          id="user-lastname"
                          placeholder="Doe"
                          className="h-8 text-xs"
                          value={field.value || ""}
                        />
                        {fieldState.invalid && (
                          <FieldError errors={[fieldState.error]} />
                        )}
                      </Field>
                    )}
                  />
                </div>

                <Controller
                  name="phoneNumber"
                  control={control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel htmlFor="user-phone" className="text-xs">
                        {t("PHONE_NUMBER_LABEL")}
                      </FieldLabel>
                      <Input
                        {...field}
                        id="user-phone"
                        placeholder="+123456789"
                        className="h-8 text-xs"
                        value={field.value || ""}
                      />
                      {fieldState.invalid && (
                        <FieldError errors={[fieldState.error]} />
                      )}
                    </Field>
                  )}
                />
              </FieldGroup>
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
                {t("DISCARD_BUTTON")}
              </Button>
            </SheetClose>
            <Button
              type="submit"
              form="user-form-element"
              disabled={isSubmitting}
              className="w-full cursor-pointer text-xs shadow-xs sm:w-auto sm:min-w-32"
            >
              {isSubmitting ? (
                <>
                  <Spinner className="me-2 size-3.5" />
                  {t("SAVING_BUTTON")}
                </>
              ) : isEditing ? (
                t("SAVE_CHANGES_BUTTON")
              ) : (
                t("SAVE_USER_BUTTON")
              )}
            </Button>
            <SheetClose ref={closeRef} className="hidden" />
          </div>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}

export default UserFormSheet
