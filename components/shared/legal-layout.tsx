"use client";

import { useTranslations } from "next-intl";
import Link from "next/link";
import { useLocale } from "next-intl";
import { Button } from "@/components/ui/button";
import { ArrowLeftIcon, ArrowRightIcon } from "lucide-react";

interface LegalLayoutProps {
  title: string;
  children: React.ReactNode;
}

export function LegalLayout({ title, children }: LegalLayoutProps) {
  const t = useTranslations("Legal");
  const locale = useLocale();
  const isRtl = locale === "ar";

  return (
    <main className="font-urbanist relative min-h-screen w-full overflow-x-hidden bg-background px-4 py-12 text-foreground selection:bg-emerald-500/30 md:py-20">
      {/* Background with Vibrant Blobs */}
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        <div
          className="absolute top-[-10%] left-[-10%] h-[60%] w-[60%] animate-pulse rounded-full bg-sky-500/20 blur-[120px]"
          style={{
            animation: "blob 15s ease-in-out infinite",
          }}
        />
        <div
          className="absolute right-[-10%] bottom-[-10%] h-[60%] w-[60%] animate-pulse rounded-full bg-orange-500/15 blur-[140px]"
          style={{
            animation: "blob2 18s ease-in-out infinite 1s",
          }}
        />
        <div className="blend-overlay absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03]" />
      </div>

      <div className="relative z-10 mx-auto max-w-4xl">
        <div
          className="mb-8"
          style={{
            animation: "fadeInUp 0.8s ease-out forwards",
          }}
        >
          <Button
            variant="ghost"
            asChild
            className="gap-2 text-muted-foreground hover:text-foreground"
          >
            <Link href="/">
              {isRtl ? (
                <ArrowRightIcon className="h-4 w-4" />
              ) : (
                <ArrowLeftIcon className="h-4 w-4" />
              )}
              {t("backToHome")}
            </Link>
          </Button>
        </div>

        <div
          className="rounded-[2.5rem] border border-border bg-background/40 p-8 backdrop-blur-3xl md:p-12"
          style={{
            animation: "fadeInUp 0.8s ease-out 0.2s both",
          }}
        >
          <header className="mb-12 border-b border-border pb-8">
            <h1 className="mb-4 text-4xl font-black tracking-tight text-foreground md:text-6xl">
              {title}
            </h1>
            <p className="text-sm font-medium tracking-widest text-muted-foreground uppercase">
              {t("lastUpdated")}
            </p>
          </header>

          <div className="prose prose-invert max-w-none space-y-8">
            {children}
          </div>
        </div>
      </div>

      {/* Inline CSS Animations */}
      <style
        dangerouslySetInnerHTML={{
          __html: `
          @keyframes blob {
            0%, 100% { transform: translate(0, 0) scale(1); opacity: 0.15; }
            50% { transform: translate(40px, 20px) scale(1.2); opacity: 0.25; }
          }
          @keyframes blob2 {
            0%, 100% { transform: translate(0, 0) scale(1); opacity: 0.1; }
            50% { transform: translate(-40px, -20px) scale(1.3); opacity: 0.2; }
          }
          @keyframes fadeInUp {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
          }
        `,
        }}
      />
    </main>
  );
}
