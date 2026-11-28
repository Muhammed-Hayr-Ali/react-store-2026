/**
 * @file components/store/promo-modal/promo-modal.tsx
 * @description Server Component يجلب الإعلان الترويجي النشط ويعرضه في منتصف الشاشة عند توفره.
 */

import { getActivePromoBanner } from "@/lib/actions/store/queries/get-active-promo-banner"
import { PromoModalClient } from "./promo-modal-client"

export default async function PromoModal() {
  const result = await getActivePromoBanner()

  if (!result.success || !result.data) {
    return null
  }

  return <PromoModalClient banner={result.data} />
}