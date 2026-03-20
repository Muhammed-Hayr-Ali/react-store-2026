"use client"

import { motion } from "framer-motion"
import { useTranslations } from "next-intl"
import Link from "next/link"
import { ArrowLeftIcon, ArrowRightIcon } from "@/components/shared/icons"
import { useLocale } from "next-intl"
import { Button } from "@/components/ui/button"

interface LegalLayoutProps {
  title: string
  children: React.ReactNode
}

export function LegalLayout({ title, children }: LegalLayoutProps) {
  const t = useTranslations("Legal")
  const locale = useLocale()
  const isRtl = locale === "ar"

  return (
    <main className="font-urbanist relative min-h-screen w-full overflow-x-hidden bg-background px-4 py-12 text-foreground selection:bg-emerald-500/30 md:py-20">
      {/* Background with Vibrant Blobs */}
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.15, 0.25, 0.15],
            x: [0, 40, 0],
            y: [0, 20, 0],
          }}
          transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-[-10%] left-[-10%] h-[60%] w-[60%] rounded-full bg-sky-500/20 blur-[120px]"
        />
        <motion.div
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.1, 0.2, 0.1],
            x: [0, -40, 0],
            y: [0, -20, 0],
          }}
          transition={{
            duration: 18,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1,
          }}
          className="absolute right-[-10%] bottom-[-10%] h-[60%] w-[60%] rounded-full bg-orange-500/15 blur-[140px]"
        />
        <div className="blend-overlay absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03]" />
      </div>

      <div className="relative z-10 mx-auto max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="mb-8"
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
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="rounded-[2.5rem] border border-border bg-background/40 p-8 backdrop-blur-3xl md:p-12"
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
        </motion.div>
      </div>
    </main>
  )
}
