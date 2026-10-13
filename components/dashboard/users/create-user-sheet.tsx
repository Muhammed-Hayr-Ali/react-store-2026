"use client"

import * as React from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { Controller, useForm } from "react-hook-form"
import { z } from "zod"
import { useRouter } from "next/navigation"
import { useTranslations } from "next-intl"
import { toast } from "sonner"
import {
  AlertCircleIcon,
  ShieldIcon,
  UserPlusIcon,
  Wand2Icon,
  XIcon,
} from "lucide-react"

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { ActionFieldError } from "@/components/shared/action-field-error"
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Spinner } from "@/components/ui/spinner"
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
import { createUserSchema } from "@/lib/actions/users/schemas"
import { getActionErrorKey } from "@/lib/actions/error-keys"

type CreateUserFormValues = z.infer<typeof createUserSchema>

interface CreateUserSheetProps {
  children?: React.ReactElement
  onSuccess?: (user: AdminUserSummary) => void
}

export function CreateUserSheet({ children, onSuccess }: CreateUserSheetProps) {
  // Resolve translations and navigation for the account creation flow.
  const t = useTranslations("UsersManagement")
  const tErrors = useTranslations("ActionErrors")
  const router = useRouter()
  const [isOpen, setIsOpen] = React.useState(false)
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null)

  // Configure validation and initial values for the new account.
  const form = useForm<CreateUserFormValues>({
    resolver: zodResolver(createUserSchema),
    mode: "onChange",
    defaultValues: {
      email: "",
      password: "",
      firstName: "",
      lastName: "",
      phoneNumber: "",
    },
  })

  const {
    control,
    setValue,
    reset,
    formState: { isSubmitting },
  } = form

  // Generate a temporary password for the new account.
  const handleGeneratePassword = () => {
    const chars =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*"
    let password = ""
    for (let i = 0; i < 10; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    setValue("password", password, {
      shouldValidate: true,
      shouldDirty: true,
    })
    toast.success(t("PASSWORD_GENERATED_SUCCESS"))
  }

  // Create the account and notify the parent with its summary.
  async function onSubmit(data: CreateUserFormValues) {
    setErrorMessage(null)
    const result = await createUser(data)

    if (result.success) {
      toast.success(t("USER_CREATED_SUCCESS"))
      const createdUser = result.data ?? {
        id: "",
        email: data.email,
        first_name: data.firstName || null,
        last_name: data.lastName || null,
        phone_number: data.phoneNumber || null,
        profile_image: null,
        status: "active" as const,
        ban_reason: null,
        banned_at: null,
        created_at: new Date().toISOString(),
        roles: [],
      }
      onSuccess?.(createdUser)
      reset()
      setIsOpen(false)
      router.refresh()
      return
    }

    if (result.error === "VALIDATION_ERROR" && result.details) {
      Object.entries(result.details).forEach(([field, messages]) => {
        form.setError(field as keyof CreateUserFormValues, {
          message: messages[0],
        })
      })
      return
    }

    setErrorMessage(
      result.error === "PERMISSION_DENIED"
        ? t("PERMISSION_DENIED_ERROR")
        : result.error
          ? tErrors(getActionErrorKey(result.error))
          : t("FAILED_TO_CREATE_USER")
    )
  }

  // Submit through the form resolver before invoking the server action.
  const handleFormSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    void form.handleSubmit(onSubmit)(event)
  }

  // Render the create trigger and account creation sheet.
  return (
    <Sheet
      open={isOpen}
      onOpenChange={(open) => {
        if (open || !isSubmitting) {
          setIsOpen(open)
        }
      }}
    >
      <SheetTrigger
        render={
          children ?? (
            <Button
              type="button"
              variant="default"
              size="sm"
              className="h-8 gap-1.5 px-3 text-xs"
            >
              <UserPlusIcon className="size-3.5" />
              <span>{t("CREATE_USER_BUTTON")}</span>
            </Button>
          )
        }
      />

      <SheetContent
        side="right"
        className="flex w-full flex-col p-0 sm:max-w-xl"
        onInteractOutside={(event) => {
          if (isSubmitting) event.preventDefault()
        }}
        onEscapeKeyDown={(event) => {
          if (isSubmitting) event.preventDefault()
        }}
      >
        <SheetHeader className="shrink-0 border-b bg-card px-5 py-4 text-start sm:px-6">
          <SheetTitle className="text-base font-bold tracking-tight text-foreground sm:text-lg">
            {t("CREATE_USER_TITLE")}
          </SheetTitle>
          <SheetDescription className="text-xs text-muted-foreground">
            {t("CREATE_USER_DESCRIPTION")}
          </SheetDescription>
        </SheetHeader>

        <div className="min-h-0 flex-1 overflow-y-auto px-4 py-5 sm:px-6 sm:py-6">
          <form
            id="create-user-form"
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
                <Controller
                  name="email"
                  control={control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel
                        htmlFor="create-user-email"
                        className="text-xs"
                      >
                        {t("EMAIL_LABEL")}{" "}
                        <span className="text-destructive">*</span>
                      </FieldLabel>
                      <Input
                        {...field}
                        id="create-user-email"
                        type="email"
                        placeholder="user@example.com"
                        className="h-8 text-xs"
                      />
                      {fieldState.invalid && (
                        <ActionFieldError errors={[fieldState.error]} />
                      )}
                    </Field>
                  )}
                />

                <Controller
                  name="password"
                  control={control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel
                        htmlFor="create-user-password"
                        className="text-xs"
                      >
                        {t("PASSWORD_LABEL")}
                      </FieldLabel>
                      <div className="relative flex items-center">
                        <Input
                          {...field}
                          id="create-user-password"
                          type="text"
                          placeholder={t("PASSWORD_PLACEHOLDER")}
                          className="h-8 pe-8 font-mono text-xs"
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
                        <ActionFieldError errors={[fieldState.error]} />
                      )}
                    </Field>
                  )}
                />
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
                          htmlFor="create-user-firstname"
                          className="text-xs"
                        >
                          {t("FIRST_NAME_LABEL")}
                        </FieldLabel>
                        <Input
                          {...field}
                          id="create-user-firstname"
                          placeholder="John"
                          className="h-8 text-xs"
                        />
                        {fieldState.invalid && (
                          <ActionFieldError errors={[fieldState.error]} />
                        )}
                      </Field>
                    )}
                  />

                  <Controller
                    name="lastName"
                    control={control}
                    render={({ field, fieldState }) => (
                      <Field data-invalid={fieldState.invalid}>
                        <FieldLabel
                          htmlFor="create-user-lastname"
                          className="text-xs"
                        >
                          {t("LAST_NAME_LABEL")}
                        </FieldLabel>
                        <Input
                          {...field}
                          id="create-user-lastname"
                          placeholder="Doe"
                          className="h-8 text-xs"
                        />
                        {fieldState.invalid && (
                          <ActionFieldError errors={[fieldState.error]} />
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
                      <FieldLabel
                        htmlFor="create-user-phone"
                        className="text-xs"
                      >
                        {t("PHONE_NUMBER_LABEL")}
                      </FieldLabel>
                      <Input
                        {...field}
                        id="create-user-phone"
                        placeholder="+123456789"
                        className="h-8 text-xs"
                      />
                      {fieldState.invalid && (
                        <ActionFieldError errors={[fieldState.error]} />
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
              form="create-user-form"
              disabled={isSubmitting}
              className="w-full cursor-pointer text-xs shadow-xs sm:w-auto sm:min-w-32"
            >
              {isSubmitting ? (
                <>
                  <Spinner className="me-2 size-3.5" />
                  {t("SAVING_BUTTON")}
                </>
              ) : (
                t("SAVE_USER_BUTTON")
              )}
            </Button>
          </div>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}

export default CreateUserSheet
