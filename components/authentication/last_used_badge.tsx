import { useTranslations } from "next-intl"
import { Badge } from "../ui/badge"
import { cn } from "@/lib/utils"

export default function LastUsedBadge({
  className,
  ...props
}: {
  className?: string
}) {
  const t = useTranslations("GoogleSignInButton")

  return (
    <div className={cn(className)} {...props}>
      <Badge
        variant="secondary"
        className="h-3.5 bg-green-50 px-1 text-[8px] font-normal tracking-wide text-green-700 uppercase dark:bg-green-950 dark:text-green-300"
      >
        {t("LAST_USED_BADGE")}
      </Badge>
    </div>
  )
}
