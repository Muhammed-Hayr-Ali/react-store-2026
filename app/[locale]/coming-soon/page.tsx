"use client";

import { Button } from "@/components/ui/button";
import {
  Mail,
  Clock,
  ExternalLink,
  Calendar,
  Truck,
  Shield,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useTranslations } from "next-intl";
import { NewsletterSignup } from "@/components/features/landing/newsletter-signup";

export default function ComingSoonPage() {
  const t = useTranslations("ComingSoon");

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-primary/5 via-background to-secondary/5 p-4">
      <div className="max-w-4xl mx-auto text-center space-y-8">
        {/* Logo/Brand */}
        <div className="space-y-4">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary/10 animate-pulse">
            <Clock className="w-10 h-10 text-primary" />
          </div>
        </div>

        {/* Main Content */}
        <div className="space-y-6">
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight">
            {t("title")}
          </h1>

          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
            {t("description")}
          </p>

          {/* Arabic Translation */}
          <p
            className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto font-arabic"
            dir="rtl"
          >
            {t("descriptionAr")}
          </p>
        </div>

        {/* Features Preview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-3xl mx-auto py-8">
          <div className="space-y-2 p-4 rounded-lg bg-card border shadow-sm hover:shadow-md transition-shadow">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/10">
              <Calendar className="w-6 h-6 text-primary" />
            </div>
            <h3 className="font-semibold">{t("features.marketplace.title")}</h3>
            <p className="text-sm text-muted-foreground">
              {t("features.marketplace.description")}
            </p>
          </div>

          <div className="space-y-2 p-4 rounded-lg bg-card border shadow-sm hover:shadow-md transition-shadow">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/10">
              <Truck className="w-6 h-6 text-primary" />
            </div>
            <h3 className="font-semibold">{t("features.shipping.title")}</h3>
            <p className="text-sm text-muted-foreground">
              {t("features.shipping.description")}
            </p>
          </div>

          <div className="space-y-2 p-4 rounded-lg bg-card border shadow-sm hover:shadow-md transition-shadow">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/10">
              <Shield className="w-6 h-6 text-primary" />
            </div>
            <h3 className="font-semibold">{t("features.payments.title")}</h3>
            <p className="text-sm text-muted-foreground">
              {t("features.payments.description")}
            </p>
          </div>
        </div>

        {/* Email Signup Form */}
        <div className="max-w-md mx-auto space-y-4 py-8">
          <div className="space-y-2">
            <h3 className="text-lg font-semibold">{t("notify.title")}</h3>
            <p className="text-sm text-muted-foreground">
              {t("notify.description")}
            </p>
          </div>

          <NewsletterSignup />
        </div>

        {/* Contact Button */}
        <div className="pt-8">
          <Button variant="outline" asChild>
            <a href="mailto:info@marketna.com">
              <Mail className="w-4 h-4 mr-2" />
              {t("contact")}
              <ExternalLink className="w-3 h-3 ml-2" />
            </a>
          </Button>
        </div>

        {/* Footer */}
        <div className="pt-12 border-t">
          <p className="text-sm text-muted-foreground">
            {t.rich("footer", { year: new Date().getFullYear() })}
          </p>
        </div>
      </div>
    </div>
  );
}
