import { ShieldCheckIcon } from "lucide-react"

import { appConfig } from "@/lib/config/app_config"
import { createMetadata } from "@/lib/config/metadata_generator"
import { getAllRoles } from "@/lib/actions/role/queries/get-all-roles"
import RolesClient from "@/components/dashboard/roles/roles-client"

export async function generateMetadata() {
  return createMetadata({
    siteName: appConfig.name,
    title: "Roles & Permissions",
    description: "Manage system access roles and granular permissions.",
  })
}

export default async function Page() {
  const result = await getAllRoles()
  const roles = result.success && result.data ? result.data : []

  return (
    <div className="mx-auto w-full max-w-7xl space-y-6 px-2 py-4 md:px-4 md:py-6">
      {/* Header الترويسة الموحدة مع الشارة */}
      <div className="flex items-center gap-3 border-b border-border/40 pb-4">
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

      {/* العميل الرئيسي الذي يدير الجدول والـ Sheets */}
      <RolesClient initialRoles={roles} />
    </div>
  )
}
