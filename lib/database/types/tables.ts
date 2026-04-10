// =====================================================
// 📊 TABLE TYPES — واجهات الجداول
// =====================================================
// ⚠️ يجب أن تطابق أعمدة الجداول في قاعدة البيانات تماماً
// المصدر: 001_Schema/000_dbml.dbml
// =====================================================

import type {
  DeliveryStatus,
  RoleName,
  NotifyType,
  OrderStatus,
  TicketStatus,
  TicketPriority,
  ErrorSeverity,
  PaymentMethod,
  PaymentStatus,
  VendorStatus,
  PlanCategory,
  SubStatus,
  CurrencyCode,
  UUID,
  Timestamp,
  Decimal,
  BillingCycle,
} from "./enums";

// =====================================================
// 1️⃣ CORE MODULE — المستخدمين والصلاحيات
// =====================================================

/**
 * الملف الشخصي للمستخدم
 * المصدر: CREATE TABLE "core_profile"
 */
export type CoreProfile = {
  id: UUID;
  email: string;
  first_name: string | null;
  last_name: string | null;
  full_name: string; // GENERATED ALWAYS AS (trim(...)) STORED
  avatar_url: string | null;
  phone_number: string | null;
  is_phone_verified: boolean;
  preferred_language: string;
  timezone: string;
  deleted_at: Timestamp | null;
  created_at: Timestamp;
  updated_at: Timestamp;
};

/**
 * إعادة تعيين كلمة المرور
 * المصدر: CREATE TABLE "auth_password_reset"
 */
export type AuthPasswordReset = {
  id: UUID;
  profile_id: UUID;
  email: string;
  token: string; // CHECK: length(token) = 64
  expires_at: Timestamp;
  used_at: Timestamp | null;
  is_revoked: boolean;
  ip_address: string | null;
  created_at: Timestamp;
  updated_at: Timestamp;
};

/**
 * الدور والصلاحيات
 * المصدر: CREATE TABLE "core_role"
 */
export type CoreRole = {
  id: UUID;
  code: RoleName;
  description: string | null;
  permissions: string[]; // jsonb
  created_at: Timestamp;
  updated_at: Timestamp;
};

/**
 * ربط المستخدم بالأدوار (جدول وسيط)
 * المصدر: CREATE TABLE "core_profile_role"
 */
export type CoreProfileRole = {
  profile_id: UUID;
  role_id: UUID;
  assigned_at: Timestamp;
  updated_at: Timestamp;
};

/**
 * عنوان المستخدم
 * المصدر: CREATE TABLE "core_address"
 */
export type CoreAddress = {
  id: UUID;
  profile_id: UUID;
  title_ar: string;
  address_details: string;
  latitude: Decimal | null;
  longitude: Decimal | null;
  is_default: boolean;
  created_at: Timestamp;
  updated_at: Timestamp;
};

// =====================================================
// 2️⃣ EXCHANGE RATES MODULE — أسعار الصرف
// =====================================================

/**
 * سعر صرف العملة
 * المصدر: CREATE TABLE "exchange_rates"
 */
export type ExchangeRate = {
  id: UUID;
  currency_code: CurrencyCode; // CHECK: ^[A-Z]{3}$
  rate_from_usd: Decimal; // CHECK: > 0
  last_updated_at: Timestamp;
  created_at: Timestamp;
};

/**
 * إعدادات المتجر
 * المصدر: CREATE TABLE "store_settings"
 */
export type StoreSettings = {
  id: UUID;
  store_name_ar: string;
  store_name_en: string | null;
  default_currency: CurrencyCode;
  language: string;
  timezone: string;
  created_at: Timestamp;
  updated_at: Timestamp;
};

// =====================================================
// 3️⃣ SAAS MODULE — الاشتراكات والخطط
// =====================================================

/**
 * خطة الاشتراك
 * المصدر: CREATE TABLE "saas_plan"
 */
export type SaaSPlan = {
  id: UUID;
  category: PlanCategory;
  name_ar: string;
  name_en: string | null;
  price: Decimal; // CHECK: >= 0
  price_usd: Decimal | null;
  currency: CurrencyCode; // CHECK: ^[A-Z]{3}$
  billing_cycle: BillingCycle;
  features: string[]; // jsonb
  permissions: string[]; // jsonb
  is_digital: boolean;
  is_shippable: boolean;
  requires_prescription: boolean;
  is_active: boolean;
  sort_order: number;
  created_at: Timestamp;
  updated_at: Timestamp;
};

/**
 * اشتراك المستخدم في خطة
 * المصدر: CREATE TABLE "saas_subscription"
 */
export type SaaSSubscription = {
  id: UUID;
  profile_id: UUID;
  plan_id: UUID;
  status: SubStatus;
  starts_at: Timestamp;
  ends_at: Timestamp | null;
  auto_renew: boolean;
  created_at: Timestamp;
  updated_at: Timestamp;
};

// =====================================================
// 4️⃣ STORE MODULE — المتاجر والمنتجات
// =====================================================

/**
 * البائع/المتجر
 * المصدر: CREATE TABLE "store_vendor"
 */
export type StoreVendor = {
  id: UUID;
  profile_id: UUID;
  name_ar: string;
  name_en: string | null;
  slug: string;
  status: VendorStatus;
  city: string | null;
  address: string | null;
  latitude: Decimal | null;
  longitude: Decimal | null;
  default_currency: CurrencyCode;
  rating_avg: Decimal; // CHECK: 0-5
  review_count: number; // CHECK: >= 0
  sales_count: number; // CHECK: >= 0
  deleted_at: Timestamp | null;
  created_at: Timestamp;
  updated_at: Timestamp;
};

/**
 * تصنيف المنتجات
 * المصدر: CREATE TABLE "store_category"
 */
export type StoreCategory = {
  id: UUID;
  parent_id: UUID | null;
  name_ar: string;
  name_en: string | null;
  slug: string;
  is_active: boolean;
  sort_order: number;
  created_at: Timestamp;
  updated_at: Timestamp;
};

/**
 * المنتج
 * المصدر: CREATE TABLE "store_product"
 */
export type StoreProduct = {
  id: UUID;
  category_id: UUID | null; // FK → SET NULL on category delete
  user_id: UUID | null; // Owner of the product (for future multi-vendor)
  name_ar: string;
  name_en: string | null;
  slug: string;
  description_ar: string | null;
  description_en: string | null;
  price_base: Decimal; // CHECK: >= 0
  price_discount: Decimal | null; // CHECK: < price_base
  stock_qty: number; // CHECK: >= 0
  rating_avg: Decimal; // CHECK: 0-5
  review_count: number; // CHECK: >= 0
  is_active: boolean;
  deleted_at: Timestamp | null;
  created_at: Timestamp;
  updated_at: Timestamp;
};

/**
 * صورة المنتج
 * المصدر: CREATE TABLE "product_image"
 */
export type ProductImage = {
  id: UUID;
  product_id: UUID;
  url: string;
  alt_text: string | null;
  is_primary: boolean;
  sort_order: number;
  created_at: Timestamp;
  updated_at: Timestamp;
};

/**
 * صنف المنتج (متغير)
 * المصدر: CREATE TABLE "product_variant"
 */
export type ProductVariant = {
  id: UUID;
  product_id: UUID;
  name_ar: string;
  value_ar: string;
  price_adjustment: Decimal;
  stock_qty: number;
  created_at: Timestamp;
  updated_at: Timestamp;
};

// =====================================================
// 5️⃣ TRADE MODULE — الطلبات والمبيعات
// =====================================================

/**
 * الطلب
 * المصدر: CREATE TABLE "trade_order"
 */
export type TradeOrder = {
  id: UUID;
  order_number: string;
  customer_id: UUID;
  status: OrderStatus;
  items_total: Decimal; // CHECK: >= 0
  delivery_fee: Decimal; // CHECK: >= 0
  discount_amount: Decimal; // CHECK: >= 0
  grand_total: Decimal; // CHECK: >= 0
  payment_method: PaymentMethod;
  payment_status: PaymentStatus;
  currency: CurrencyCode;
  currency_rate: Decimal; // CHECK: > 0
  shipping_address: Record<string, unknown>; // jsonb
  delivery_latitude: Decimal | null;
  delivery_longitude: Decimal | null;
  is_confirmed: boolean;
  created_by: UUID | null;
  updated_by: UUID | null;
  created_at: Timestamp;
  updated_at: Timestamp;
};

/**
 * عنصر في الطلب
 * المصدر: CREATE TABLE "trade_order_item"
 */
export type TradeOrderItem = {
  id: UUID;
  order_id: UUID;
  product_id: UUID;
  variant_id: UUID | null; // FK to product_variant (optional)
  quantity: number; // CHECK: > 0
  unit_price: Decimal; // CHECK: >= 0
  subtotal: Decimal; // CHECK: >= 0
};

// =====================================================
// 6️⃣ FLEET MODULE — التوصيل والسائقين
// =====================================================

/**
 * سائق التوصيل
 * المصدر: CREATE TABLE "fleet_driver"
 */
export type FleetDriver = {
  id: UUID;
  profile_id: UUID;
  license_number: string | null;
  vehicle_type: string | null;
  vehicle_plate: string | null;
  is_available: boolean;
  rating_avg: Decimal; // CHECK: 0-5
  rating_count: number; // CHECK: >= 0
  created_at: Timestamp;
  updated_at: Timestamp;
};

/**
 * نوع التوصيل
 * المصدر: CREATE TABLE "fleet_delivery_type"
 */
export type FleetDeliveryType = {
  id: UUID;
  name_ar: string;
  name_en: string | null;
  base_price: Decimal; // CHECK: >= 0
  estimated_minutes: number; // CHECK: > 0
  is_active: boolean;
  created_at: Timestamp;
  updated_at: Timestamp;
};

/**
 * تسليم الطلب (QR Code Verification)
 * المصدر: CREATE TABLE "trade_order_delivery"
 */
export type TradeOrderDelivery = {
  id: UUID;
  order_id: UUID;
  delivery_status: DeliveryStatus;
  verification_code: string; // QR code unique identifier
  delivered_at: Timestamp | null;
  delivered_by: UUID | null; // staff member who delivered
  customer_verified: boolean;
  delivery_notes: string | null;
  failed_reason: string | null;
  created_at: Timestamp;
  updated_at: Timestamp;
};

// =====================================================
// 7️⃣ SOCIAL MODULE — التقييمات والمفضلة
// =====================================================

/**
 * التقييم والمراجعة
 * المصدر: CREATE TABLE "social_review"
 */
export type SocialReview = {
  id: UUID;
  product_id: UUID | null;
  author_id: UUID;
  rating: number; // CHECK: 1-5
  comment: string | null;
  created_at: Timestamp;
  updated_at: Timestamp;
};

/**
 * المفضلة لدى العميل
 * المصدر: CREATE TABLE "customer_favorite"
 */
export type CustomerFavorite = {
  id: UUID;
  customer_id: UUID;
  product_id: UUID;
  created_at: Timestamp;
};

// =====================================================
// 8️⃣ SUPPORT MODULE — الدعم الفني
// =====================================================

/**
 * تذكرة الدعم الفني
 * المصدر: CREATE TABLE "support_ticket"
 */
export type SupportTicket = {
  id: UUID;
  ticket_number: string;
  reporter_id: UUID;
  assigned_to: UUID | null;
  order_id: UUID | null;
  subject: string;
  description: string;
  status: TicketStatus;
  priority: TicketPriority;
  created_at: Timestamp;
  updated_at: Timestamp;
};

/**
 * رسالة في التذكرة
 * المصدر: CREATE TABLE "ticket_message"
 */
export type TicketMessage = {
  id: UUID;
  ticket_id: UUID;
  sender_id: UUID;
  content: string;
  attachment_url: string | null;
  is_internal: boolean;
  created_at: Timestamp;
  updated_at: Timestamp;
};

// =====================================================
// 9️⃣ SYSTEM MODULE — الإشعارات والسجلات
// =====================================================

/**
 * إشعار النظام
 * المصدر: CREATE TABLE "sys_notification"
 */
export type SysNotification = {
  id: UUID;
  recipient_id: UUID;
  type: NotifyType;
  title_ar: string;
  title_en: string | null;
  content_ar: string;
  content_en: string | null;
  action_url: string | null;
  data: Record<string, unknown>; // jsonb
  is_read: boolean;
  created_at: Timestamp;
  updated_at: Timestamp;
};

/**
 * سجل أخطاء النظام
 * المصدر: CREATE TABLE "system_error_log"
 */
export type SystemErrorLog = {
  id: UUID;
  error_message: string;
  error_context: string | null;
  error_details: Record<string, unknown>; // jsonb
  severity: ErrorSeverity;
  created_at: Timestamp;
  updated_at: Timestamp;
};
