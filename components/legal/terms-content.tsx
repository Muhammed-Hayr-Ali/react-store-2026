"use client"

import { useTranslations } from "next-intl"
import { LegalLayout } from "@/components/shared/legal-layout"

export function TermsPageContent() {
  const t = useTranslations("Legal")

  return (
    <LegalLayout title={t("termsTitle")}>
      <section className="space-y-4">
        <h2 className="text-2xl font-bold text-foreground">{t("introduction")}</h2>
        <p className="text-lg leading-relaxed text-muted-foreground font-light">
          {t("termsIntro")}
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-bold text-foreground">{t("useOfService")}</h2>
        <p className="text-lg leading-relaxed text-muted-foreground font-light">
          {t("useOfServiceContent")}
        </p>
        <p className="text-lg leading-relaxed text-muted-foreground font-light italic border-l-2 border-sky-500 pl-4 py-1">
          {t("agreementPre")}
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-bold text-foreground">{t("community")}</h2>
        <p className="text-lg leading-relaxed text-muted-foreground font-light">
          {t("communityContent")}
        </p>
      </section>
    </LegalLayout>
  )
}
