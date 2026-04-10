// =====================================================
// 📋 ENUM TYPES — أنواع البيانات الثابتة
// =====================================================
// ⚠️ يجب أن تطابق أنواع ENUM في قاعدة البيانات تماماً
// المصدر: 001_Schema/001_schema.sql
// =====================================================

// ─── Database ENUMs (تطابق SQL حرفياً) ───────────────

/**
 * حالة عملية التوصيل
 * المصدر: CREATE TYPE "delivery_status"
 */
export type DeliveryStatus =
  | "pending"
  | "assigned"
  | "picked_up"
  | "in_transit"
  | "delivered"
  | "cancelled"
  | "returned";

/**
 * حالة البائع/المتجر
 * المصدر: CREATE TYPE "vendor_status"
 */
export type VendorStatus =
  | "pending"
  | "active"
  | "suspended"
  | "rejected"
  | "archived";

/**
 * أسماء الأدوار في النظام
 * المصدر: CREATE TYPE "role_name"
 */
export type RoleName = "admin" | "vendor" | "customer" | "delivery" | "support";

/**
 * فئة خطة الاشتراك
 * المصدر: CREATE TYPE "plan_category"
 */
export type PlanCategory = "free" | "seller" | "delivery" | "enterprise";

/**
 * حالة الاشتراك الفرعي
 * المصدر: CREATE TYPE "sub_status"
 */
export type SubStatus =
  | "active"
  | "expired"
  | "cancelled"
  | "pending_payment"
  | "trialing";

/**
 * نوع الإشعار
 * المصدر: CREATE TYPE "notify_type"
 */
export type NotifyType =
  | "order_event"
  | "system_alert"
  | "promo"
  | "review"
  | "ticket";

/**
 * حالة الطلب
 * المصدر: CREATE TYPE "order_status"
 */
export type OrderStatus =
  | "pending"
  | "confirmed"
  | "processing"
  | "out_for_delivery"
  | "delivered"
  | "cancelled";

/**
 * حالة التوصيل
 * المصدر: CREATE TYPE "delivery_status"
 */
export type DeliveryStatus =
  | "pending"
  | "out_for_delivery"
  | "delivered"
  | "failed"
  | "returned";

/**
 * حالة تذكرة الدعم
 * المصدر: CREATE TYPE "ticket_status"
 */
export type TicketStatus = "open" | "in_progress" | "resolved" | "closed";

/**
 * أولوية التذكرة
 * المصدر: CREATE TYPE "ticket_priority"
 */
export type TicketPriority = "low" | "medium" | "high" | "urgent";

/**
 * مستوى شدة الخطأ
 * المصدر: CREATE TYPE "error_severity"
 */
export type ErrorSeverity = "info" | "warning" | "error" | "critical";

/**
 * طريقة الدفع
 * المصدر: CREATE TYPE "payment_method"
 */
export type PaymentMethod = "cod";

/**
 * حالة الدفع
 * المصدر: CREATE TYPE "payment_status"
 */
export type PaymentStatus = "pending" | "paid" | "failed" | "refunded";

// ─── Helper Types (مشتقة من SQL) ─────────────────────

/**
 * دورة الفوترة
 * المصدر: CHECK (billing_cycle IN ('monthly', 'yearly', 'lifetime'))
 */
export type BillingCycle = "monthly" | "yearly" | "lifetime";

/**
 * رمز العملة (ISO 4217)
 * المصدر: CHECK (currency_code ~ '^[A-Z]{3}$')
 */
export type CurrencyCode = string;

/**
 * معرف فريد (UUID)
 * المصدر: gen_random_uuid()
 */
export type UUID = string;

/**
 * طابع زمني (ISO 8601)
 * المصدر: timestamptz
 */
export type Timestamp = string;

/**
 * قيمة عشرية
 * المصدر: numeric
 */
export type Decimal = number;
