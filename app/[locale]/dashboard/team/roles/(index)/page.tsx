import { headers } from "next/headers"
import { ShieldCheckIcon } from "lucide-react"

import { appConfig } from "@/lib/config/app_config"
import { createMetadata } from "@/lib/config/metadata_generator"
import { getAllRoles } from "@/lib/actions/role/queries/get-all-roles"
import RolesTable from "@/components/dashboard/roles/roles-table"
import { hasPermission, PERMISSIONS } from "@/lib/actions/role"
import { notFound } from "next/navigation"

export async function generateMetadata() {
  return createMetadata({
    siteName: appConfig.name,
    title: "Roles & Permissions",
    description: "Manage system access roles and granular permissions.",
  })
}

export default async function Page() {
  const canView = await hasPermission(PERMISSIONS.VIEW_ROLES_MANAGEMENT)
  if (!canView) {
    notFound()
  }

  const headersList = await headers()
  const userAgent = headersList.get("user-agent") || ""
  const isMobile =
    /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      userAgent
    )

  const result = await getAllRoles()
  const roles = result.success && result.data ? result.data : []

  return (
    <div className="mx-auto w-full max-w-7xl space-y-6 px-2 py-4 md:px-4 md:py-6">
      <div className="flex flex-col gap-3 border-b border-border/40 pb-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex size-7 items-center justify-center rounded-lg bg-secondary shadow-xs">
              <ShieldCheckIcon className="size-4 text-foreground" />
            </span>
            <h1 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl">
              Roles & Permissions
            </h1>
          </div>
          <p className="mt-1 text-xs text-muted-foreground sm:text-sm">
            Define system roles and configure granular permission access across
            the platform.
          </p>
        </div>
      </div>

      <RolesTable initialRoles={roles} initialIsMobile={isMobile} />
    </div>
  )
}
