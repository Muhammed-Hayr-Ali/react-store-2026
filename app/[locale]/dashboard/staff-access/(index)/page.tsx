import { UsersIcon } from "lucide-react"

import { appConfig } from "@/lib/config/app_config"
import { createMetadata } from "@/lib/config/metadata_generator"
import { getAllRoles } from "@/lib/actions/role/queries/get-all-roles"
import { getUsersWithRoles } from "@/lib/actions/role/queries/get-users-with-roles"
import StaffAccessTable from "@/components/dashboard/staff-access/staff-access-table"

export async function generateMetadata() {
  return createMetadata({
    siteName: appConfig.name,
    title: "User Access & Roles",
    description: "Manage system user roles and security privilege assignments.",
  })
}

export default async function Page() {
  const [usersResult, rolesResult] = await Promise.all([
    getUsersWithRoles(),
    getAllRoles(),
  ])

  const users = usersResult.success && usersResult.data ? usersResult.data : []
  const roles = rolesResult.success && rolesResult.data ? rolesResult.data : []

  return (
    <div className="mx-auto w-full max-w-7xl space-y-6 px-2 py-4 md:px-4 md:py-6">
      {/* الترويسة الموحدة */}
      <div className="flex items-center gap-3 border-b border-border/40 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex size-7 items-center justify-center rounded-lg bg-secondary shadow-xs">
              <UsersIcon className="size-4 text-foreground" />
            </span>
            <h1 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl">
              User Access Management
            </h1>
          </div>
          <p className="mt-1 text-xs text-muted-foreground sm:text-sm">
            Assign security roles and monitor authorization privileges granted
            to platform users.
          </p>
        </div>
      </div>

      {/* المكون العميل الذي يدير عرض الجدول وتعيين الأدوار */}
      <StaffAccessTable initialUsers={users} availableRoles={roles} />
    </div>
  )
}
