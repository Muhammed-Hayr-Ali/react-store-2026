import { ShieldCheckIcon } from "lucide-react"

import { appConfig } from "@/lib/config/app_config"
import { createMetadata } from "@/lib/config/metadata_generator"
import CreateRoleForm from "@/components/dashboard/roles/create-role-form"

export async function generateMetadata() {
  return createMetadata({
    siteName: appConfig.name,
    title: "Create New Role",
    description:
      "Define platform access role and configure fine-grained permissions.",
  })
}

export default async function Page() {
  return (
    <div className="mx-auto w-full max-w-7xl space-y-6 px-2 py-4 md:px-4 md:py-6">
      {/* Header الترويسة الموحدة مع الشارة المربعة مثل صفحة المنتجات */}
      <div className="flex items-center gap-3 border-b border-border/40 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex size-7 items-center justify-center rounded-lg bg-secondary shadow-xs">
              <ShieldCheckIcon className="size-4 text-foreground" />
            </span>
            <h1 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl">
              Create Role
            </h1>
          </div>
          <p className="mt-1 text-xs text-muted-foreground sm:text-sm">
            Define role identifier, description, and assign system permissions.
          </p>
        </div>
      </div>

      {/* نموذج إنشاء الدور بنظام العمودين */}
      <CreateRoleForm />
    </div>
  )
}
