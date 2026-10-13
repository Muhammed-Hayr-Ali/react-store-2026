"use client"

import { useTranslations } from "next-intl"

import { FieldError } from "@/components/ui/field"
import { getActionErrorKey } from "@/lib/actions/error-keys"

interface ActionFieldErrorProps {
  errors?: Array<{ message?: string } | undefined>
}

export function ActionFieldError({ errors }: ActionFieldErrorProps) {
  const t = useTranslations("ActionErrors")

  return (
    <FieldError
      errors={errors?.map((error) =>
        error?.message
          ? { message: t(getActionErrorKey(error.message)) }
          : error
      )}
    />
  )
}
