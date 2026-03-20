'use client'
import { Spinner } from "@/components/ui/spinner"
import { useTranslations } from "next-intl"

export default function Page() {
      const t = useTranslations("callback")
    
  // Or a custom loading skeleton component
  return (
    <div className="flex flex-col gap-4 min-h-screen items-center justify-center">
        <Spinner className="size-6" />
      <div className="text-center">
        <h1 className="text-2xl font-bold">{t("loading")}</h1>
        <p className="mt-2 text-muted-foreground">{t("processingSignIn")}</p>
      </div>
    </div>
  )
}
