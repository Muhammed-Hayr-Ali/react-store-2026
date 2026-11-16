/**
 * @file app/[locale]/(store)/cart/page.tsx
 * @description Store cart page displaying empty state or cart contents using clean structure.
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
import { ShoppingCartIcon } from "lucide-react"

interface CartPageProps {
  params: Promise<{ locale: string }>
}

// دالة لتوليد الميتا داتا الخاصة بصفحة العربة
export async function generateMetadata() {
  const t = await getTranslations("Cart")

  return createMetadata({
    siteName: APP_CONFIG.NAME,
    title: t("title", { default: "Shopping Cart" }),
    description: t("description", {
      default: "View and manage items in your shopping cart at Marketna.",
    }),
    noindex: true, // صفحة عربة التسوق لا تحتاج لأرشفة محركات البحث
  })
}

export default async function CartPage() {
  const t = await getTranslations("Cart")

  return (
    <div className="flex h-full w-full flex-col items-center justify-center px-4 md:px-6 lg:px-8">
      <Empty className="w-full max-w-md rounded-2xl border border-dashed p-8 text-center">
        <EmptyHeader className="flex flex-col items-center">
          <EmptyMedia
            variant="icon"
            className="mb-4 flex size-16 items-center justify-center rounded-full bg-muted/60 text-muted-foreground"
          >
            <ShoppingCartIcon className="size-8 stroke-[1.5]" />
          </EmptyMedia>
          <EmptyTitle className="text-lg font-semibold tracking-tight text-foreground">
            {t("emptyTitle", { default: "Your cart is empty" })}
          </EmptyTitle>
          <EmptyDescription className="mt-1.5 max-w-xs text-sm text-muted-foreground">
            {t("emptyDescription", {
              default: "Looks like you haven't added anything to your cart yet.",
            })}
          </EmptyDescription>
        </EmptyHeader>
      </Empty>
    </div>
  )
}