import { ShieldCheckIcon } from "lucide-react"
import { notFound } from "next/navigation"
import { createServerClient } from "@/lib/database/supabase/server"

import { appConfig } from "@/lib/config/app_config"
import { createMetadata } from "@/lib/config/metadata_generator"
import CreateRoleForm from "@/components/dashboard/roles/role-form"
import { RoleRecord } from "@/lib/actions/role/mutations/create-role"

export async function generateMetadata() {
  return createMetadata({
    siteName: appConfig.name,
    title: "Edit Role",
    description:
      "Modify role details and update associated access permissions.",
  })
}

interface EditRolePageProps {
  params: Promise<{
    id: string
    locale: string
  }>
}

export default async function EditRolePage({ params }: EditRolePageProps) {
  const { id } = await params
  const supabase = await createServerClient()

  // جلب بيانات الدور الحالي من قاعدة البيانات
  const { data: role, error } = await supabase
    .from("roles")
    .select("*")
    .eq("id", id)
    .single()

  if (error || !role) {
    notFound()
  }

  return (
    <div className="mx-auto w-full max-w-7xl space-y-6 px-2 py-4 md:px-4 md:py-6">
      {/* الترويسة الموحدة مطابقة لصفحة الإنشاء */}
      <div className="flex items-center gap-3 border-b border-border/40 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex size-7 items-center justify-center rounded-lg bg-secondary shadow-xs">
              <ShieldCheckIcon className="size-4 text-foreground" />
            </span>
            <h1 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl">
              Edit Role: <span className="uppercase">{role.name}</span>
            </h1>
          </div>
          <p className="mt-1 text-xs text-muted-foreground sm:text-sm">
            Modify role description and update system permission assignments.
          </p>
        </div>
      </div>

      {/* نموذج التعديل (نفس مكون النموذج مع تمرير البيانات الأولية ومعرف الدور) */}
      <CreateRoleForm initialData={role as RoleRecord} roleId={role.id} />
    </div>
  )
}
