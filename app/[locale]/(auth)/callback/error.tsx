import { Spinner } from "@/components/ui/spinner"
import { getTranslations } from "next-intl/server"

interface Props {
  error: string,
  error_description: string
  reset: () => void

}

export default async function Error({ error, error_description, reset }: Props) {
  const t = await getTranslations("callback")
  // Or a custom loading skeleton component
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4">
      <Spinner className="size-6" />
      <div className="text-center">
        <h1 className="text-2xl font-bold">{t(error)}</h1>
        <p className="mt-2 text-muted-foreground">{t(error_description)}</p>
      </div>
    </div>
  )
}
