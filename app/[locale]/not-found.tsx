import Link from "next/link"
import { routing } from "@/i18n/routing"
import { Button } from "@/components/ui/button"
import { HomeIcon, ArrowLeftIcon } from "lucide-react"
import { appRoutes } from "@/lib/config/app-routes"

export default function NotFound() {
  return (
    <div className="flex min-h-[calc(100dvh-4rem)] w-full flex-col items-center justify-center p-4">
      {/* Container Card */}
      <div className="relative flex w-full max-w-lg flex-col items-center text-center">
        {/* Subtle Background Glow Accent */}
        <div className="absolute -top-12 -z-10 size-64 rounded-full bg-primary/10 blur-3xl" />

        {/* 404 Large Numeric Header */}
        <span className="font-mono text-8xl font-black tracking-tight text-foreground select-none sm:text-9xl">
          404
        </span>

        {/* Header Text */}
        <h1 className="mt-4 text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
          Page Not Found
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you are looking for doesn&apos;t exist, has been removed, or
          is temporarily unavailable.
        </p>

        {/* Action Buttons */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Button asChild className="gap-2 shadow-xs">
            <Link href={appRoutes.home} className="flex items-center gap-2">
              <HomeIcon className="size-4" />
              Back to Home
            </Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
