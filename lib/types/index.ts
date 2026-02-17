// lib/types/database.ts

// =================================================================
// القسم 0: الأنواع الأساسية والمساعدة
// =================================================================

/**
 * نوع موحد لجميع استجابات API.
 * مرن ويسمح بإضافة أي حقول إضافية.
 */
export type ApiResponse<T = unknown> = {
  /** البيانات المرجعة من الطلب */
  data?: T;
  /** رسالة الخطأ إن وجدت */
  error?: string | null;
  /** أي حقول إضافية يمكن إضافتها حسب الحاجة */
  [key: string]: unknown;
};

/**
 * نوع UUID
 */
export type UUID = string;

/**
 * نوع الـ timestamp
 */
export type Timestamp = string;

/**
 * نوع الـ JSONB
 */
export type Jsonb = Record<string, unknown>;

// =================================================================
// القسم 1: أنواع الكيانات الأساسية (Base Entity Types)
// =================================================================

export interface Role {
  id: UUID;
  name: string;
  description: string | null;
}

export interface UserRole {
  user_id: UUID;
  role_id: UUID;
}

export interface Brand {
  id: UUID;
  name: string;
  slug: string;
  description: string | null;
  logo_url: string | null;
  created_at: Timestamp;
}

export interface Category {
  id: UUID;
  name: string;
  slug: string;
  description: string | null;
  image_url: string | null;
  parent_id: UUID | null;
  created_at: Timestamp;
}






export interface ProductOption {
  id: UUID;
  name: string;
}

// ✅ تصحيح: هذا النوع يمثل الكائن الوسيط
export interface ProductOptionValue {
  id: UUID;
  option_id: UUID;
  value: string;
  product_options: ProductOption; // يمثل العلاقة المتداخلة
}

// ✅ تصحيح: هذا النوع يمثل العنصر الموجود في مصفوفة variant_option_values
export interface VariantOptionValue {
  product_option_values: ProductOptionValue;
}

// ✅ تصحيح: ProductVariant الآن يستخدم النوع الصحيح
export interface ProductVariant {
  id: UUID;
  sku: string;
  price: number;
  image_url: string | null;
  is_default: boolean;
  product_id: UUID;
  discount_price: number | null;
  stock_quantity: number;
  discount_expires_at: Timestamp | null;
  created_at: Timestamp;
  variant_option_values: VariantOptionValue[]; // يستخدم النوع الصحيح للمصفوفة
}


export interface Product {
  id: UUID;
  name: string;
  slug: string;
  description: string;
  short_description: string | null;
  main_image_url: string | null;
  image_urls: string[] | null;
  category_id: UUID | null;
  brand_id: UUID | null;
  tags: string[] | null;
  is_available: boolean;
  is_featured: boolean;
  created_at: Timestamp;
  updated_at: Timestamp;
}

export interface FullProduct extends Product {
  brand: Brand | null;
  category: Category | null;
  variants: ProductVariant[];
}

// =================================================================
// القسم 4: أنواع التقييمات (Reviews)
// =================================================================

/** @description يمثل جدول `reviews` */
export interface Review {
  id: number; // bigint
  created_at: Timestamp;
  product_id: UUID;
  user_id: UUID;
  rating: number; // smallint (1-5)
  title: string | null;
  comment: string | null;
  is_verified_purchase: boolean;
  author: AuthorReview;
}

export interface AuthorReview {
  id: number; // bigint
  first_name: string | null;
  last_name: string | null;
  avatar_url: string | null;
}

/** @description يمثل التقييم مع معلومات المؤلف */

/** @description يمثل جدول `review_reports` */
export interface ReviewReport {
  id: number; // bigint
  created_at: Timestamp;
  review_id: number; // bigint
  reporter_user_id: UUID | null;
  reporter_email: string | null;
  reason: string;
  details: string | null;
  status: string; // 'new', 'investigating', 'resolved', 'rejected'
  resolved_at: Timestamp | null;
}

/** @description ملخص التقييمات */
export interface ReviewSummary {
  averageRating: number;
  totalReviews: number;
  ratingDistribution: Record<number, number>;
}

// =================================================================
// القسم 5: أنواع السلة (Cart Types)
// =================================================================

/** @description يمثل جدول `cart_items` */
export interface CartItem {
  id: UUID;
  cart_id: UUID;
  variant_id: UUID;
  quantity: number;
  created_at: Timestamp;
  updated_at: Timestamp;
}

/** @description يمثل عنصر السلة مع البيانات الكاملة للمتغير */
export interface CartItemWithVariant extends CartItem {
  product_variants: ProductVariant & {
    products: Product & {
      main_image_url: string | null;
      brand: Brand | null;
      category: Category | null;
    };
  };
}

/** @description يمثل جدول `carts` */
export interface Cart {
  id: UUID;
  user_id: UUID | null;
  created_at: Timestamp;
  updated_at: Timestamp;
}

/** @description السلة الكاملة مع العناصر */
export interface FullCart extends Cart {
  cart_items: CartItemWithVariant[];
}

/** @description معلومات مساعدة للسلة */
export interface CartSummary {
  itemCount: number;
  totalAmount: number;
  items: {
    variantId: UUID;
    quantity: number;
    price: number;
    name: string;
  }[];
}

// =================================================================
// القسم 6: أنواع الطلبات (Order Types)
// =================================================================

/** @description يمثل جدول `order_items` */
export interface OrderItem {
  id: UUID;
  order_id: UUID;
  product_variant_id: UUID | null;
  product_name: string;
  variant_options: string | null; // JSON text
  quantity: number;
  price_at_purchase: number;
}

/** @description يمثل جدول `orders` */
export interface Order {
  id: UUID;
  user_id: UUID | null;
  created_at: Timestamp;
  status: OrderStatus;
  customer_email: string;
  shipping_address: ShippingAddress;
  subtotal: number;
  shipping_cost: number;
  taxes: number;
  total_amount: number;
}

/** @description الطلب الكامل مع العناصر */
export interface FullOrder extends Order {
  order_items: OrderItem[];
}

/** @description عنوان الشحن */
export interface ShippingAddress {
  first_name: string;
  last_name: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  country: string;
  phone?: string;
}

/** @description حالات الطلب */
export enum OrderStatus {
  PROCESSING = "Processing",
  CONFIRMED = "Confirmed",
  SHIPPED = "Shipped",
  DELIVERED = "Delivered",
  CANCELLED = "Cancelled",
  REFUNDED = "Refunded",
}

// =================================================================
// القسم 7: أنواع المستخدم والملف الشخصي (User & Profile Types)
// =================================================================

/** @description يمثل جدول `profiles` */
export interface Profile {
  id: UUID;
  first_name: string | null;
  last_name: string | null;
  avatar_url: string | null;
  updated_at: Timestamp | null;
  email: string | null;
}

/** @description يمثل جدول `user_addresses` */
export interface UserAddress {
  id: UUID;
  user_id: UUID;
  created_at: Timestamp;
  address_nickname: string | null;
  first_name: string;
  last_name: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  country: string;
}

/** @description يمثل جدول `password_reset_tokens` */
export interface PasswordResetToken {
  id: UUID;
  user_id: UUID;
  token: string;
  expires_at: Timestamp;
  used: boolean;
  used_at: Timestamp | null;
  created_at: Timestamp | null;
  updated_at: Timestamp | null;
}

// =================================================================
// القسم 8: أنواع المفضلة (Wishlist Types)
// =================================================================

/** @description يمثل جدول `wishlist_items` */
export interface WishlistItem {
  id: UUID;
  user_id: UUID;
  product_id: UUID;
  created_at: Timestamp;
}

/** @description عنصر المفضلة مع بيانات المنتج */
export interface WishlistItemWithProduct extends WishlistItem {
  products: Product & {
    main_image_url: string | null;
    brand: Brand | null;
    category: Category | null;
    variants: ProductVariant[];
  };
}

/** @description المفضلة الكاملة */
export type FullWishlist = WishlistItemWithProduct[];

// =================================================================
// القسم 9: أنواع الأكواد الترويجية (Discount Codes)
// =================================================================

/** @description يمثل جدول `discount_codes` */
export interface DiscountCode {
  id: UUID;
  code: string;
  discount_type: DiscountType;
  discount_value: number;
  expires_at: Timestamp | null;
  usage_limit: number | null;
  times_used: number;
  is_active: boolean;
  created_at: Timestamp;
}

/** @description أنواع الخصم */
export enum DiscountType {
  PERCENTAGE = "percentage",
  FIXED = "fixed",
  FREE_SHIPPING = "free_shipping",
}

// =================================================================
// القسم 10: أنواع النشرة الإخبارية والدعم (Newsletter & Support)
// =================================================================

/** @description يمثل جدول `newsletter_subscriptions` */
export interface NewsletterSubscription {
  id: number; // bigint
  email: string;
  created_at: Timestamp;
  status: NewsletterStatus;
  unsubscribe_reason: string | null;
  unsubscribed_at: Timestamp | null;
}

/** @description حالات النشرة الإخبارية */
export enum NewsletterStatus {
  SUBSCRIBED = "subscribed",
  UNSUBSCRIBED = "unsubscribed",
  BOUNCED = "bounced",
}

/** @description يمثل جدول `support_requests` */
export interface SupportRequest {
  id: number; // bigint
  user_id: UUID | null;
  auth_email: string | null;
  contact_email: string | null;
  subject: string;
  details: string | null;
  status: SupportRequestStatus;
  created_at: Timestamp | null;
}

/** @description حالات طلب الدعم */
export enum SupportRequestStatus {
  NEW = "new",
  IN_PROGRESS = "in_progress",
  RESOLVED = "resolved",
  CLOSED = "closed",
}

// =================================================================
// القسم 11: أنواع نماذج الإدخال (Form Data Types)
// =================================================================

/** @description بيانات نموذج إضافة/تحديث منتج */
export interface ProductFormData {
  name: string;
  slug: string;
  description: string;
  short_description?: string;
  main_image_url?: string;
  image_urls?: string[];
  category_id: UUID | null;
  brand_id: UUID | null;
  tags?: string[];
  is_available: boolean;
  is_featured: boolean;
  variants: ProductVariantFormData[];
}

/** @description بيانات نموذج المتغير */
export interface ProductVariantFormData {
  sku: string;
  price: number;
  discount_price?: number;
  discount_expires_at?: string;
  stock_quantity: number;
  image_url?: string;
  is_default: boolean;
  variant_options: {
    option_value: {
      id: UUID;
      value: string;
      product_options: {
        id: UUID;
        name: string;
      };
    };
  }[];
}

/** @description بيانات نموذج العنوان */
export interface AddressFormData {
  address_nickname?: string;
  first_name: string;
  last_name: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  country: string;
}

/** @description بيانات نموذج التقييم */
export interface ReviewFormData {
  product_id: UUID;
  rating: number;
  title?: string;
  comment?: string;
}

/** @description بيانات نموذج تقرير التقييم */
export interface ReviewReportFormData {
  review_id: number;
  reporter_user_id?: UUID;
  reporter_email?: string;
  reason: string;
  details?: string;
}

// =================================================================
// القسم 12: أنواع مساعدة للواجهة (UI Helper Types)
// =================================================================

/** @description اختيار خيار معين */
export type OptionSelection = Record<string, string>;

/** @description حالة المخزون */
export interface StockStatus {
  inStock: boolean;
  quantity: number;
  message: string;
}

/** @description معلومات السعر */
export interface PriceInfo {
  current: number;
  original?: number;
  discountPercentage?: number;
  isOnSale: boolean;
}

/** @description معايير تصفية المنتجات */
export interface ProductFilters {
  categoryId?: UUID;
  brandId?: UUID;
  tags?: string[];
  minPrice?: number;
  maxPrice?: number;
  isAvailable?: boolean;
  isFeatured?: boolean;
  search?: string;
}

/** @description خيارات ترتيب المنتجات */
export type ProductSortOptions =
  | "newest"
  | "oldest"
  | "price_asc"
  | "price_desc"
  | "name_asc"
  | "name_desc"
  | "rating";

/** @description استجابة مصفحة (Pagination) */
export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

// =================================================================
// القسم 13: أنواع الحالة (State Types) - للـ Context/Redux
// =================================================================

/** @description حالة المنتج في الواجهة */
export interface ProductState {
  product: FullProduct | null;
  selectedOptions: OptionSelection;
  selectedVariant: ProductVariant | null;
  quantity: number;
  isLoading: boolean;
  error: string | null;
}

/** @description حالة سلة المشتريات في الواجهة */
export interface CartState {
  cart: FullCart | null;
  itemCount: number;
  totalAmount: number;
  isLoading: boolean;
  error: string | null;
}

/** @description حالة قائمة الرغبات في الواجهة */
export interface WishlistState {
  wishlist: FullWishlist;
  isLoading: boolean;
  error: string | null;
}

// =================================================================
// القسم 14: أنواع الصلاحيات (Permissions)
// =================================================================

/** @description صلاحيات المستخدم */
export interface UserPermissions {
  isAdmin: boolean;
  canCreateProducts: boolean;
  canUpdateProducts: boolean;
  canDeleteProducts: boolean;
  canManageOrders: boolean;
  canManageUsers: boolean;
  canViewAnalytics: boolean;
}

/** @description دور المستخدم مع الصلاحيات */
export interface UserRoleWithPermissions extends Role {
  permissions: UserPermissions;
}

// =================================================================
// القسم 15: أنواع اخرى (MfaFactor)
// =================================================================

/** @description يمثل جدول `countries` */
export interface Country {
  id: number; // smallint
  name: string;
  name_ar: string | null;
  emoji: string | null;
  emojiU: string | null;
  code: string | null;
  isoCode: string;
  flag: string | null;
  province: Jsonb | null;
  created_at: Timestamp | null;
}

// ===============================================================================
// MFA Factor Type
// ===============================================================================
export type MfaFactor = {
  id: string;
  friendly_name?: string | undefined;
  factor_type: "totp" | "phone" | "webauthn";
  status: "verified" | "unverified";
  created_at: string;
  updated_at: string;
  last_challenged_at?: string | undefined;
};
