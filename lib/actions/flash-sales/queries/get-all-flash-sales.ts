import { createServerClient } from "@/lib/database/supabase/server"
import { FlashSale } from "../types"

export interface AdminFlashSaleItem extends FlashSale {
  item_count: number
  status: "active" | "scheduled" | "expired" | "disabled"
}

export async function getAllFlashSales(): Promise<AdminFlashSaleItem[]> {
  const supabase = await createServerClient()

  const { data, error } = await supabase
    .from("flash_sales")
    .select(
      `
      *,
      flash_sale_items (count)
    `
    )
    .order("created_at", { ascending: false })

  if (error || !data) {
    if (error) {
      console.error("Error fetching admin flash sales:", error.message)
    }
    return []
  }

  const now = new Date().getTime()

  return data.map((sale) => {
    const start = new Date(sale.starts_at).getTime()
    const end = new Date(sale.ends_at).getTime()

    let status: AdminFlashSaleItem["status"] = "disabled"
    if (!sale.is_active) {
      status = "disabled"
    } else if (now < start) {
      status = "scheduled"
    } else if (now >= start && now <= end) {
      status = "active"
    } else {
      status = "expired"
    }

    const itemCount = Array.isArray(sale.flash_sale_items)
      ? (sale.flash_sale_items[0]?.count ?? 0)
      : 0

    return {
      id: sale.id,
      title: sale.title,
      title_ar: sale.title_ar,
      slug: sale.slug,
      description: sale.description,
      starts_at: sale.starts_at,
      ends_at: sale.ends_at,
      is_active: sale.is_active,
      created_at: sale.created_at,
      updated_at: sale.updated_at,
      item_count: Number(itemCount),
      status,
    }
  })
}
