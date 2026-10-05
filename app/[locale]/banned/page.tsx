import { redirect } from "next/navigation"
import { ShieldAlertIcon, LogOutIcon, MailIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { getCurrentUserStatus } from "@/lib/actions/users/queries/get-current-user-status"
import { createServerClient } from "@/lib/supabase/server"

interface BannedPageProps {
  params: Promise<{ locale: string }>
}

export default async function BannedPage({ params }: BannedPageProps) {
  const { locale } = await params
  const { isAuthenticated, status, banReason } = await getCurrentUserStatus()

  // إذا لم يكن المستخدم مسجلاً أو لم يكن محظوراً، يعاد توجيهه إلى الصفحة الرئيسية
  if (!isAuthenticated || status !== "banned") {
    redirect(`/${locale}`)
  }

  // إجراء سيرفر فوري لتسجيل الخروج
  const handleSignOut = async () => {
    "use server"
    const supabase = await createServerClient()
    await supabase.auth.signOut()
    redirect(`/${locale}/auth/login`)
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/30 px-4 py-12">
      <div className="w-full max-w-md space-y-6 rounded-xl border bg-card p-6 text-center shadow-xs">
        <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-destructive/10 text-destructive">
          <ShieldAlertIcon className="size-6" />
        </div>

        <div className="space-y-2">
          <h1 className="text-xl font-bold tracking-tight text-foreground">
            Account Suspended
          </h1>
          <p className="text-xs leading-relaxed text-muted-foreground">
            Your access has been disabled due to administrative action or terms
            violation.
          </p>
        </div>

        {banReason && (
          <div className="rounded-lg border border-destructive/20 bg-destructive/5 p-3 text-start">
            <span className="text-[11px] font-semibold tracking-wider text-destructive uppercase">
              Reason Provided:
            </span>
            <p className="mt-1 text-xs leading-relaxed text-foreground/80">
              {banReason}
            </p>
          </div>
        )}

        <div className="flex flex-col gap-2 pt-2">
          <form action={handleSignOut}>
            <Button
              type="submit"
              variant="outline"
              className="w-full cursor-pointer text-xs"
            >
              <LogOutIcon className="mr-1.5 size-3.5" />
              Sign Out
            </Button>
          </form>

          <Button
            asChild
            variant="ghost"
            className="w-full text-xs text-muted-foreground"
          >
            <a href="mailto:support@marketna.com">
              <MailIcon className="mr-1.5 size-3.5" />
              Contact Support
            </a>
          </Button>
        </div>
      </div>
    </div>
  )
}
