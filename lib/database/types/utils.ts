// =====================================================
// 🛠️ UTILITY TYPES — أنواع مساعدة
// =====================================================
// ⚠️ تُستخدم لإنشاء أنواع Insert/Update/Filter/Pagination
// =====================================================

import type { UUID, Timestamp, Decimal } from "./enums"

// =====================================================
// 🔧 Insert Types — أنواع الإدخال
// =====================================================

/**
 * نوع الإدخال: جميع الحقول اختيارية ما عدا المطلوبة
 * يُستخدم عند إنشاء سجل جديد
 */
export type Insertable<T> = Omit<
  T,
  "id" | "created_at" | "updated_at" | "full_name"
> & {
  id?: UUID
  created_at?: Timestamp
  updated_at?: Timestamp
}

/**
 * إدخال ملف شخصي جديد
 * مطلوب: email فقط (full_name مولَّد تلقائياً)
 */
export type CoreProfileInsert = {
  email: string
  first_name?: string | null
  last_name?: string | null
  avatar_url?: string | null
  phone_number?: string | null
  preferred_language?: string
  timezone?: string
}

/**
 * إدخال منتج جديد
 * مطلوب: vendor_id, category_id, name_ar, price_base
 */
export type StoreProductInsert = {
  vendor_id: UUID
  category_id?: UUID | null
  name_ar: string
  name_en?: string | null
  slug: string
  description_ar?: string | null
  description_en?: string | null
  price_base: Decimal
  price_discount?: Decimal | null
  stock_qty?: number
  is_active?: boolean
}

/**
 * إدخال طلب جديد
 * مطلوب: order_number, customer_id, vendor_id, shipping_address
 */
export type TradeOrderInsert = {
  order_number: string
  customer_id: UUID
  vendor_id: UUID
  shipping_address: Record<string, unknown>
  items_total?: Decimal
  delivery_fee?: Decimal
  discount_amount?: Decimal
  grand_total?: Decimal
  payment_method?: "cod" | "card" | "wallet"
  payment_status?: "pending" | "paid" | "failed" | "refunded"
  currency?: string
  currency_rate?: Decimal
  is_confirmed?: boolean
}

// =====================================================
// ✏️ Update Types — أنواع التحديث
// =====================================================

/**
 * نوع التحديث: جميع الحقول اختيارية
 * يُستخدم عند تعديل سجل موجود
 */
export type Updatable<T> = Partial<
  Omit<T, "id" | "created_at" | "updated_at" | "full_name">
>

/**
 * تحديث ملف شخصي
 */
export type CoreProfileUpdate = {
  first_name?: string | null
  last_name?: string | null
  avatar_url?: string | null
  phone_number?: string | null
  is_phone_verified?: boolean
  preferred_language?: string
  timezone?: string
  deleted_at?: Timestamp | null
}

// =====================================================
// 📊 Pagination — الترقيم
// =====================================================

/** معلومات الترقيم */
export type PaginationMeta = {
  page: number
  limit: number
  total: number
  totalPages: number
  hasNext: boolean
  hasPrev: boolean
}

/** استجابة مرقمة */
export type PaginatedResponse<T> = {
  data: T[]
  meta: PaginationMeta
}

// =====================================================
// 🔍 Filter Types — أنواع الفلترة
// =====================================================

/** خيارات الفلترة العامة */
export type FilterOptions = {
  search?: string
  sortBy?: string
  sortOrder?: "asc" | "desc"
  page?: number
  limit?: number
}

/** فلترة المنتجات */
export type ProductFilter = FilterOptions & {
  vendorId?: UUID
  categoryId?: UUID | null
  isActive?: boolean
  inStock?: boolean
  minPrice?: number
  maxPrice?: number
}

/** فلترة الطلبات */
export type OrderFilter = FilterOptions & {
  customerId?: UUID
  vendorId?: UUID
  status?:
    | "pending"
    | "confirmed"
    | "processing"
    | "shipping"
    | "delivered"
    | "cancelled"
  paymentStatus?: "pending" | "paid" | "failed" | "refunded"
  dateFrom?: Timestamp
  dateTo?: Timestamp
}

/** فلترة البائعين */
export type VendorFilter = FilterOptions & {
  status?: "pending" | "active" | "suspended" | "rejected" | "archived"
  city?: string
  minRating?: number
}

// =====================================================
// 📡 API Response — استجابات API
// =====================================================

/** نتيجة عملية API */
export type ApiResult<T = undefined> = T extends undefined
  ? { success: boolean; data?: undefined; error?: string }
  :
      | { success: boolean; data: T; error?: string }
      | { success: false; data?: undefined; error: string }

/** حالة التحميل */
export type LoadingState = "idle" | "loading" | "success" | "error"

/** حالة الواجهة العامة */
export type UIState<T = unknown> = {
  loading: LoadingState
  data: T | null
  error: string | null
}

// =====================================================
// 📌 Summary Types — أنواع موجزة للعرض
// =====================================================

import type {
  CoreProfile,
  StoreProduct,
  StoreVendor,
  TradeOrder,
} from "./tables"

/** المستخدم موجز */
export type UserSummary = Pick<
  CoreProfile,
  "id" | "email" | "full_name" | "avatar_url"
>

/** المنتج في القائمة موجز */
export type ProductSummary = Pick<
  StoreProduct,
  "id" | "name_ar" | "name_en" | "slug" | "price_base" | "price_discount"
> & {
  vendor_name?: string
  finalPrice: number
  inStock: boolean
}

/** البائع موجز */
export type VendorSummary = Pick<
  StoreVendor,
  "id" | "name_ar" | "name_en" | "slug" | "rating_avg" | "review_count"
> & {
  city: string | null
}

/** الطلب في القائمة موجز */
export type OrderSummary = Pick<
  TradeOrder,
  "id" | "order_number" | "status" | "grand_total" | "created_at"
> & {
  vendorName: string
  itemsCount: number
}
