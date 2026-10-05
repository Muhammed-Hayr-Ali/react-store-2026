import { headers } from "next/headers"
import { UsersIcon } from "lucide-react"

import { appConfig } from "@/lib/config/app_config"
import { createMetadata } from "@/lib/config/metadata_generator"
import { getAdminUsersList } from "@/lib/actions/users/queries/get-admin-users"
import { DataTable } from "@/components/dashboard/users/data-table"

export const dynamic = "force-dynamic"

export async function generateMetadata() {
  return createMetadata({
    siteName: appConfig.name,
    title: "User Management",
    description:
      "Monitor registered customers, update account states, and manage ban status.",
  })
}

export default async function Page() {
  const headersList = await headers()
  const userAgent = headersList.get("user-agent") || ""
  const isMobile =
    /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      userAgent
    )

  const res = await getAdminUsersList()
  const users = res.success && res.data ? res.data : []

  return (
    <div className="mx-auto w-full max-w-7xl space-y-6 px-2 py-4 md:px-4 md:py-6">
      <div className="flex flex-col gap-3 border-b border-border/40 pb-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex size-7 items-center justify-center rounded-lg bg-secondary shadow-xs">
              <UsersIcon className="size-4 text-foreground" />
            </span>
            <h1 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl">
              Users Management
            </h1>
          </div>
          <p className="mt-1 text-xs text-muted-foreground sm:text-sm">
            Monitor registered platform accounts, customer activity, and account
            standing.
          </p>
        </div>
      </div>

      <DataTable data={users} initialIsMobile={isMobile} />
    </div>
  )
}
