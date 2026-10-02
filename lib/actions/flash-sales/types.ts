export type FlashSaleDiscountType =
  "percentage" | "fixed_amount" | "fixed_price" | "none"

// الهيكل الخام للحملة من جدول flash_sales
export interface FlashSale {
  id: string
  title: string
  title_ar: string | null
  slug: string
  description: string | null
  starts_at: string
  ends_at: string
  is_active: boolean
  created_at: string
  updated_at: string
}

// الهيكل الخام لعنصر الحملة من جدول flash_sale_items
export interface FlashSaleItem {
  id: string
  flash_sale_id: string
  product_id: string
  discount_type: FlashSaleDiscountType
  discount_value: number | null
  quantity_limit: number | null
  sold_count: number
  created_at: string
}

// المنتج بعد حساب الخصم وسعره الجديد للعرض في الواجهة
export interface FlashSaleProductItem {
  id: string
  flash_sale_item_id: string
  name: string
  slug: string
  primary_image_url: string | null
  category_name: string | null
  category_name_ar?: string | null
  brand_name: string | null
  brand_name_ar?: string | null
  original_price: number
  flash_price: number
  discount_percentage: number | null
  discount_type: FlashSaleDiscountType
  discount_value: number | null
  quantity_limit: number | null
  sold_count: number
}

// الكائن الكامل للحملة النشطة متضمناً قائمة المنتجات المجهزة
export interface ActiveFlashSale {
  id: string
  title: string
  title_ar: string | null
  slug: string
  description: string | null
  starts_at: string
  ends_at: string
  products: FlashSaleProductItem[]
}
