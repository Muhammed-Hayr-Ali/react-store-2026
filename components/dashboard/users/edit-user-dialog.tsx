"use client"

import * as React from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { Controller, useForm } from "react-hook-form"
import { z } from "zod"
import { useRouter } from "next/navigation"
import { useTranslations } from "next-intl"

import { Button } from "@/components/ui/button"
import { ActionFieldError } from "@/components/shared/action-field-error"
import { Input } from "@/components/ui/input"
import { Spinner } from "@/components/ui/spinner"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field"
import { PencilIcon, ShieldIcon, XIcon } from "lucide-react"
import { toast } from "sonner"

import type { AdminUserSummary } from "@/lib/actions/users/types"
import { updateUser } from "@/lib/actions/users/mutations/update-user"
import { updateUserSchema } from "@/lib/actions/users/schemas"
import { getActionErrorKey } from "@/lib/actions/error-keys"

type EditUserFormValues = z.infer<typeof updateUserSchema>

interface EditUserDialogProps {
  user: AdminUserSummary
  children?: React.ReactElement
  onSuccess?: (user: AdminUserSummary) => void
}

export function EditUserDialog({
  user,
  children,
  onSuccess,
}: EditUserDialogProps) {
  // Resolve translations and navigation for the edit flow.
  const t = useTranslations("UsersManagement")
  const router = useRouter()
  const [isOpen, setIsOpen] = React.useState(false)
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null)

  // Keep the edit fields synchronized with the selected user.
  const form = useForm<EditUserFormValues>({
    resolver: zodResolver(updateUserSchema),
    mode: "onChange",
    values: {
      userId: user.id,
      firstName: user.first_name || "",
      lastName: user.last_name || "",
      phoneNumber: user.phone_number || "",
    },
  })

  const {
    control,
    formState: { isSubmitting },
  } = form

  // Save profile changes and report the updated user to the parent.
  async function onSubmit(data: EditUserFormValues) {
    setErrorMessage(null)
    const result = await updateUser(data)

    if (result.success) {
      const updatedUser = {
        ...user,
        first_name: data.firstName || null,
        last_name: data.lastName || null,
        phone_number: data.phoneNumber || null,
      }
      toast.success(t("USER_UPDATED_SUCCESS"))
      onSuccess?.(updatedUser)
      setIsOpen(false)
      router.refresh()
      return
    }

    if (result.error === "VALIDATION_ERROR" && result.details) {
      Object.entries(result.details).forEach(([field, messages]) => {
        form.setError(field as keyof EditUserFormValues, {
          message: messages[0],
        })
      })
      return
    }

    setErrorMessage(
      result.error === "PERMISSION_DENIED"
        ? t("PERMISSION_DENIED_ERROR")
        : result.error
          ? t(getActionErrorKey(result.error))
          : t("FAILED_TO_UPDATE_USER")
    )
  }

  // Prevent form submission from bypassing the form validation resolver.
  const handleFormSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    void form.handleSubmit(onSubmit)(event)
  }

  // Render the edit trigger and the profile editing dialog.
  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (open || !isSubmitting) {
          setIsOpen(open)
        }
      }}
    >
      <DialogTrigger
        render={
          children ?? (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-8 gap-1.5 px-3 text-xs"
            >
              <PencilIcon className="size-3.5" />
              <span>{t("EDIT_USER_ACTION")}</span>
            </Button>
          )
        }
      />

      <DialogContent
        className="max-h-[calc(100dvh-2rem)] max-w-xl grid-rows-[auto_minmax(0,1fr)_auto] overflow-hidden sm:max-w-xl"
        onInteractOutside={(event) => {
          if (isSubmitting) event.preventDefault()
        }}
        onEscapeKeyDown={(event) => {
          if (isSubmitting) event.preventDefault()
        }}
      >
        <DialogHeader className="text-start">
          <DialogTitle className="text-base font-bold tracking-tight text-foreground sm:text-lg">
            {t("EDIT_USER_TITLE")}
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            {t("EDIT_USER_DESCRIPTION")}
          </DialogDescription>
        </DialogHeader>

        <div className="min-h-0 overflow-y-auto">
          <form
            id="edit-user-form"
            onSubmit={handleFormSubmit}
            className="space-y-5 py-2"
          >
            {errorMessage && (
              <Alert variant="destructive" className="relative pe-9">
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
                          htmlFor="edit-user-firstname"
                          className="text-xs"
                        >
                          {t("FIRST_NAME_LABEL")}
                        </FieldLabel>
                        <Input
                          {...field}
                          id="edit-user-firstname"
                          placeholder="John"
                          className="h-9 text-xs"
                          value={field.value || ""}
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
                          htmlFor="edit-user-lastname"
                          className="text-xs"
                        >
                          {t("LAST_NAME_LABEL")}
                        </FieldLabel>
                        <Input
                          {...field}
                          id="edit-user-lastname"
                          placeholder="Doe"
                          className="h-9 text-xs"
                          value={field.value || ""}
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
                      <FieldLabel htmlFor="edit-user-phone" className="text-xs">
                        {t("PHONE_NUMBER_LABEL")}
                      </FieldLabel>
                      <Input
                        {...field}
                        id="edit-user-phone"
                        placeholder="+123456789"
                        className="h-9 text-xs"
                        value={field.value || ""}
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

        <DialogFooter>
          <DialogClose asChild>
            <Button
              type="button"
              variant="outline"
              disabled={isSubmitting}
              className="text-xs"
            >
              {t("DISCARD_BUTTON")}
            </Button>
          </DialogClose>
          <Button
            type="submit"
            form="edit-user-form"
            disabled={isSubmitting}
            className="text-xs shadow-xs"
          >
            {isSubmitting ? (
              <>
                <Spinner className="me-2 size-3.5" />
                {t("SAVING_BUTTON")}
              </>
            ) : (
              t("SAVE_CHANGES_BUTTON")
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default EditUserDialog
