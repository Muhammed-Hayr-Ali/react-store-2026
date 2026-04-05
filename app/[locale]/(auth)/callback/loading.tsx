import { Spinner } from "@/components/ui/spinner"
import { getTranslations } from "next-intl/server"


export default async function Loading() {
  const t = await getTranslations("callback")
  // Or a custom loading skeleton component
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4">
      <Spinner className="size-6" />
      <div className="text-center">
        <h1 className="text-2xl font-bold">{t("loading")}</h1>
        <p className="mt-2 text-muted-foreground">{t("processingSignIn")}</p>
      </div>
    </div>
  )
}
