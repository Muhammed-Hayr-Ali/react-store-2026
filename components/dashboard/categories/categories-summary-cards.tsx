import { useTranslations } from "next-intl"
import {
  FolderTreeIcon,
  CheckCircle2Icon,
  XCircleIcon,
  LayersIcon,
} from "lucide-react"
import { CategoriesSummary } from "@/lib/actions/categories/types"

interface CategoriesSummaryCardsProps {
  summary: CategoriesSummary
}

export function CategoriesSummaryCards({
  summary,
}: CategoriesSummaryCardsProps) {
  const t = useTranslations("CategoriesManagement")

  const cards = [
    {
      title: t("SUMMARY_TOTAL"),
      value: summary.total,
      icon: FolderTreeIcon,
      color: "text-primary",
      bg: "bg-primary/10",
    },
    {
      title: t("SUMMARY_ACTIVE"),
      value: summary.active,
      icon: CheckCircle2Icon,
      color: "text-emerald-600 dark:text-emerald-400",
      bg: "bg-emerald-500/10",
    },
    {
      title: t("SUMMARY_INACTIVE"),
      value: summary.inactive,
      icon: XCircleIcon,
      color: "text-muted-foreground",
      bg: "bg-muted",
    },
    {
      title: t("SUMMARY_ROOT"),
      value: `${summary.root} / ${summary.subcategories}`,
      icon: LayersIcon,
      color: "text-blue-600 dark:text-blue-400",
      bg: "bg-blue-500/10",
    },
  ]

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
      {cards.map((card) => {
        const Icon = card.icon
        return (
          <div
            key={card.title}
            className="flex items-center justify-between rounded-xl border border-border bg-card p-4 shadow-xs transition-colors hover:border-border/80"
          >
            <div>
              <p className="text-[11px] font-medium text-muted-foreground">
                {card.title}
              </p>
              <p className="mt-1 text-lg font-bold tracking-tight text-foreground sm:text-2xl">
                {card.value}
              </p>
            </div>
            <div
              className={`flex size-9 items-center justify-center rounded-lg ${card.bg}`}
            >
              <Icon className={`size-4.5 ${card.color}`} />
            </div>
          </div>
        )
      })}
    </div>
  )
}
