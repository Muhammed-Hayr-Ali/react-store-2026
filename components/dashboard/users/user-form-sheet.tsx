"use client"

import * as React from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { Controller, useForm } from "react-hook-form"
import { z } from "zod"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { useIsMobile } from "@/hooks/use-mobile"
import { useLocale } from "next-intl"
import {
  UserPlusIcon,
  CheckCircle2Icon,
  XIcon,
  Wand2Icon,
  AlertCircleIcon,
  ShieldIcon,
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
  CustomSheet,
  CustomSheetClose,
  CustomSheetContent,
  CustomSheetDescription,
  CustomSheetFooter,
  CustomSheetHeader,
  CustomSheetTitle,
} from "@/components/ui/custom-sheet"

import { AdminUserSummary } from "@/lib/actions/users/types"
import { createUser } from "@/lib/actions/users/mutations/create-user"
import { updateUser } from "@/lib/actions/users/mutations/update-user"
import { createUserSchema, updateUserSchema } from "@/lib/actions/users/schemas"

type CreateFormValues = z.infer<typeof createUserSchema>
type UpdateFormValues = z.infer<typeof updateUserSchema>
type UserFormValues = CreateFormValues | UpdateFormValues

interface UserFormSheetProps {
  isOpen: string | null
  onOpenChange: (open: boolean) => void
  user?: AdminUserSummary | null
  onSuccess: (user: AdminUserSummary, isEditing: boolean) => void
}

export function getSide({
  isMobile,
  locale,
}: {
  isMobile: boolean
  locale: string
}) {
  const dir = locale === "ar" ? "left" : "right"
  return isMobile ? "bottom" : dir
}

export function UserFormSheet({
  isOpen,
  onOpenChange,
  user,
  onSuccess,
}: UserFormSheetProps) {
  const router = useRouter()
  const isMobile = useIsMobile()
  const locale = useLocale()
  const side = getSide({ isMobile, locale })
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null)

  const isEditing = Boolean(user)
  const mode = isEditing ? "update" : "create"

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

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      setErrorMessage(null)
      if (!isEditing) reset()
    }
    onOpenChange(open)
  }

  const handleGeneratePassword = () => {
    const chars =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*"
    let pass = ""
    for (let i = 0; i < 10; i++) {
      pass += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    setValue("password", pass, {
      shouldValidate: true,
      shouldDirty: true,
    })
    toast.success("Random password generated successfully")
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
        isEditing ? "User updated successfully!" : "User created successfully!"
      )
      if (isEditing && user) {
        onSuccess(
          {
            ...user,
            first_name: (data as UpdateFormValues).firstName || null,
            last_name: (data as UpdateFormValues).lastName || null,
            phone_number: (data as UpdateFormValues).phoneNumber || null,
          },
          true
        )
      } else {
        const createData = data as CreateFormValues
        onSuccess(
          {
            id: crypto.randomUUID(),
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
      handleOpenChange(false)
      router.refresh()
    } else {
      const errorMsg =
        result.error === "PERMISSION_DENIED"
          ? "Permission denied."
          : result.error ||
            (isEditing
              ? "Failed to update user. Please try again."
              : "Failed to create user. Please try again.")
      setErrorMessage(errorMsg)
    }
  }

  return (
    <CustomSheet open={isOpen === mode} onOpenChange={handleOpenChange}>
      <CustomSheetContent
        showCloseButton={false}
        side={side}
        className="flex w-full flex-col p-0 sm:max-w-xl"
      >
        <CustomSheetHeader className="pt-safe shrink-0 border-b bg-card px-5 py-4 sm:px-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <CustomSheetTitle className="text-base font-bold tracking-tight text-foreground sm:text-lg">
                {isEditing ? "Edit User Account" : "Create New User"}
              </CustomSheetTitle>
              <CustomSheetDescription className="text-xs text-muted-foreground">
                {isEditing
                  ? "Modify user profile information and details."
                  : "Fill in the details to register a new user in the system."}
              </CustomSheetDescription>
            </div>
            <CustomSheetClose asChild>
              <Button
                variant="ghost"
                size="icon"
                className="size-8 text-muted-foreground hover:bg-muted hover:text-foreground"
              >
                <XIcon className="size-4" />
              </Button>
            </CustomSheetClose>
          </div>
        </CustomSheetHeader>

        <div className="min-h-0 flex-1 overflow-y-auto px-4 py-5 sm:px-6 sm:py-6">
          <form
            id="user-form-element"
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-5 pb-8"
          >
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
                >
                  <XIcon className="size-4" />
                </button>
              </Alert>
            )}

            <div className="rounded-xl border bg-card p-4 shadow-xs sm:p-5">
              <div className="mb-4 flex items-center gap-2 border-b pb-3">
                <UserPlusIcon className="size-4 text-primary" />
                <h2 className="text-sm font-semibold text-card-foreground">
                  Account Credentials
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
                          Email Address{" "}
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
                          Password
                        </FieldLabel>
                        <div className="relative flex items-center">
                          <Input
                            {...field}
                            id="user-password"
                            type="text"
                            placeholder="Leave blank to auto-generate"
                            className="h-8 pe-8 font-mono text-xs"
                            value={(field.value as string) || ""}
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={handleGeneratePassword}
                            title="Generate Password"
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

            <div className="rounded-xl border bg-card p-4 shadow-xs sm:p-5">
              <div className="mb-4 flex items-center gap-2 border-b pb-3">
                <ShieldIcon className="size-4 text-primary" />
                <h2 className="text-sm font-semibold text-card-foreground">
                  Personal Details
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
                          First Name
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
                          Last Name
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
                        Phone Number
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

        <CustomSheetFooter className="shrink-0 border-t bg-card px-5 py-3 sm:px-6 sm:py-4">
          <div className="flex w-full flex-col-reverse items-stretch justify-end gap-2.5 sm:flex-row sm:items-center">
            <CustomSheetClose asChild>
              <Button
                type="button"
                variant="outline"
                disabled={isSubmitting}
                className="w-full cursor-pointer sm:w-auto"
              >
                Discard
              </Button>
            </CustomSheetClose>
            <Button
              type="submit"
              form="user-form-element"
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
                  {isEditing ? "Save Changes" : "Save User"}
                </>
              )}
            </Button>
          </div>
        </CustomSheetFooter>
      </CustomSheetContent>
    </CustomSheet>
  )
}
