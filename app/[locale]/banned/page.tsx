import { redirect } from "next/navigation"
import {
  ShieldAlertIcon,
  LogOutIcon,
  MessageSquareWarningIcon,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { getCurrentUserStatus } from "@/lib/actions/users/queries/get-current-user-status"
import { ReportDialog } from "@/components/shared/report-dialog"
import { signOut } from "@/lib/actions/authentication"
import { appRoutes } from "@/lib/config/app-routes"

export default async function BannedPage() {
  const { isAuthenticated, status, banReason } = await getCurrentUserStatus()

  if (!isAuthenticated || status !== "banned") {
    redirect(appRoutes.home)
  }


  async function handleSignOut() {
    "use server"
    const result = await signOut()
    if (result.success) {
      redirect(appRoutes.auth.login)
    }
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
          <ReportDialog
            targetType="general"
            title="Appeal Account Suspension"
            description="Explain why you believe this suspension was made in error or submit a request for review."
          >
            <Button variant="outline" className="w-full cursor-pointer text-xs">
              <MessageSquareWarningIcon className="me-1.5 size-3.5 text-muted-foreground" />
              Appeal Suspension / Contact Support
            </Button>
          </ReportDialog>

          <form action={handleSignOut}>
            <Button
              type="submit"
              variant="ghost"
              className="w-full cursor-pointer text-xs text-muted-foreground hover:text-foreground"
            >
              <LogOutIcon className="me-1.5 size-3.5" />
              Sign Out
            </Button>
          </form>
        </div>
      </div>
    </div>
  )
}
