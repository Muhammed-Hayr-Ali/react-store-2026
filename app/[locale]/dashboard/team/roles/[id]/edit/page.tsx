import { ShieldCheckIcon } from "lucide-react"
import { notFound } from "next/navigation"
import { getTranslations } from "next-intl/server"
import { appConfig } from "@/lib/config/app_config"
import { createMetadata } from "@/lib/config/metadata_generator"
import { RoleForm } from "@/components/dashboard/roles/role-form"
import type { RoleRecord } from "@/lib/actions/role"
 import { getRoleById } from "@/lib/actions/role"


export const dynamic = 'force-dynamic'


export async function generateMetadata({ params }: EditRolePageProps) {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: "RolesManagement" })

  return createMetadata({
    siteName: appConfig.name,
    title: t("EDIT_PAGE_META_TITLE"),
    description: t("EDIT_PAGE_META_DESCRIPTION"),
  })
}

interface EditRolePageProps {
  params: Promise<{
    id: string
    locale: string
  }>
}

export default async function EditRolePage({ params }: EditRolePageProps) {
  const { id, locale } = await params
  const t = await getTranslations({ locale, namespace: "RolesManagement" })

  

  const res = await getRoleById({ roleId: id })

  if (!res.success || !res.data) {
    console.error("Failed to fetch role by id:", res)
    notFound()
  }
  const role = res.data

  return (
    <div className="mx-auto w-full max-w-7xl space-y-6 px-2 py-4 md:px-4 md:py-6">
      {/* Keep the edit page header consistent with the create page. */}
      <div className="flex items-center gap-3 border-b border-border/40 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex size-7 items-center justify-center rounded-lg bg-secondary shadow-xs">
              <ShieldCheckIcon className="size-4 text-foreground" />
            </span>
            <h1 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl">
              {t("EDIT_PAGE_TITLE")}{" "}
              <span className="uppercase">{role.name}</span>
            </h1>
          </div>
          <p className="mt-1 text-xs text-muted-foreground sm:text-sm">
            {t("EDIT_PAGE_DESCRIPTION")}
          </p>
        </div>
      </div>

      <RoleForm initialData={role as RoleRecord} roleId={role.id} />
    </div>
  )
}
