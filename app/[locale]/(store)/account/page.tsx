/**
 * @file app/[locale]/(store)/account/page.tsx
 * @description Store account profile page displaying user information or empty/guest state using clean structure.
 */

import { APP_CONFIG } from "@/lib/config/app_config"
import { createMetadata } from "@/lib/config/metadata_generator"
import { getTranslations } from "next-intl/server"
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"
import { UserIcon } from "lucide-react"
import { getCurrentUser } from "@/lib/actions/users/queries/get-current-user"
import { redirect } from "next/navigation"
import { APP_ROUTES } from "@/lib/config/app-routes"

interface AccountPageProps {
  params: Promise<{ locale: string }>
}

// دالة لتوليد الميتا داتا الخاصة بصفحة الحساب
export async function generateMetadata() {
  const t = await getTranslations("Account")

  return createMetadata({
    siteName: APP_CONFIG.NAME,
    title: t("title"),
    description: t("description"),
    noindex: true, // صفحات الحساب الشخصي لا تحتاج لأرشفة محركات البحث
  })
}

export default async function AccountPage() {
  const t = await getTranslations("Account")

  const currentUserResult = await getCurrentUser()
  const currentUser = currentUserResult.success ? currentUserResult.data : null

  if (!currentUser) {
    redirect(APP_ROUTES.AUTH.LOGIN)
  }

  return (
    <div className="flex h-full w-full flex-col items-center justify-center px-4 md:px-6 lg:px-8">
      <Empty className="w-full max-w-md rounded-2xl border border-dashed p-8 text-center">
        <EmptyHeader className="flex flex-col items-center">
          <EmptyMedia
            variant="icon"
            className="mb-4 flex size-16 items-center justify-center rounded-full bg-muted/60 text-muted-foreground"
          >
            <UserIcon className="size-8 stroke-[1.5]" />
          </EmptyMedia>
          <EmptyTitle className="text-lg font-semibold tracking-tight text-foreground">
            {t("emptyTitle")}
          </EmptyTitle>
          <EmptyDescription className="mt-1.5 max-w-xs text-sm text-muted-foreground">
            {t("emptyDescription")}
          </EmptyDescription>
        </EmptyHeader>
      </Empty>
    </div>
  )
}
