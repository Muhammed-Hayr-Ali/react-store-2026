"use client"

import { useTranslations } from "next-intl"
import { LegalLayout } from "@/components/shared/legal-layout"

export function PrivacyPageContent() {
  const t = useTranslations("Legal")

  return (
    <LegalLayout title={t("privacyTitle")}>
      <section className="space-y-4">
        <h2 className="text-2xl font-bold text-foreground">{t("introduction")}</h2>
        <p className="text-lg leading-relaxed text-muted-foreground font-light">
          {t("privacyIntro")}
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-bold text-foreground">{t("dataCollection")}</h2>
        <p className="text-lg leading-relaxed text-muted-foreground font-light">
          {t("dataCollectionContent")}
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-bold text-foreground">{t("infoUsage")}</h2>
        <p className="text-lg leading-relaxed text-muted-foreground font-light">
          {t("infoUsageContent")}
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-bold text-foreground">{t("cookies")}</h2>
        <p className="text-lg leading-relaxed text-muted-foreground font-light">
          {t("cookiesContent")}
        </p>
      </section>
    </LegalLayout>
  )
}
