// =====================================================
// 🔗 RELATION TYPES — أنواع العلاقات المركبة
// =====================================================
// ⚠️ تُستخدم للـ Joins والاستعلامات المركبة
// المصدر: 001_Schema/001_schema.sql (Foreign Keys)
// =====================================================

import type {
  CoreProfile,
  CoreRole,
  CoreAddress,
  StoreVendor,
  StoreProduct,
  StoreCategory,
  ProductImage,
  ProductVariant,
  TradeOrder,
  TradeOrderItem,
  SaaSPlan,
  SaaSSubscription,
  SocialReview,
  SupportTicket,
  TicketMessage,
  SysNotification,
  FleetDriver,
  FleetDeliveryType,
  CustomerFavorite,
} from './tables';

// =====================================================
// 👤 User Relations — علاقات المستخدم
// =====================================================

/** ملف المستخدم مع أدواره */
export type UserProfileWithRoles = CoreProfile & {
  roles: CoreRole[];
};

/** ملف المستخدم مع عناوينه */
export type UserProfileWithAddresses = CoreProfile & {
  addresses: CoreAddress[];
  defaultAddress: CoreAddress | null;
};

/** ملف المستخدم مع اشتراكه */
export type UserProfileWithSubscription = CoreProfile & {
  subscription: SaaSSubscriptionWithPlan | null;
};

// =====================================================
// 🏪 Vendor Relations — علاقات البائع
// =====================================================

/** البائع مع ملفه الشخصي */
export type VendorWithProfile = StoreVendor & {
  profile: CoreProfile;
};

/** البائع مع تصنيفاته */
export type VendorWithCategories = StoreVendor & {
  categories: StoreCategory[];
};

/** البائع مع منتجاته */
export type VendorWithProducts = StoreVendor & {
  products: ProductWithDetails[];
};

// =====================================================
// 📦 Product Relations — علاقات المنتج
// =====================================================

/** المنتج مع تفاصيله الكاملة */
export type ProductWithDetails = StoreProduct & {
  vendor: StoreVendor;
  category: StoreCategory | null;
  images: ProductImage[];
  primaryImage: ProductImage | null;
  variants: ProductVariant[];
  reviewSummary: {
    average: number;
    count: number;
  };
};

// =====================================================
// 🛒 Order Relations — علاقات الطلب
// =====================================================

/** الطلب مع تفاصيله الكاملة */
export type OrderWithDetails = TradeOrder & {
  customer: CoreProfile;
  vendor: StoreVendor;
  items: OrderItemWithProduct[];
  delivery: FleetDeliveryType | null;
};

/** عنصر الطلب مع تفاصيل المنتج */
export type OrderItemWithProduct = TradeOrderItem & {
  product: StoreProduct;
  variant: ProductVariant | null;
};

// =====================================================
// 📋 Subscription Relations — علاقات الاشتراك
// =====================================================

/** الاشتراك مع تفاصيل الخطة */
export type SaaSSubscriptionWithPlan = SaaSSubscription & {
  plan: SaaSPlan;
};

/** الاشتراك مع حالة المستخدم */
export type SubscriptionWithUser = SaaSSubscriptionWithPlan & {
  user: CoreProfile;
  isExpired: boolean;
  daysRemaining: number | null;
  canRenew: boolean;
};

// =====================================================
// 💬 Support Relations — علاقات الدعم
// =====================================================

/** التذكرة مع تفاصيلها */
export type TicketWithDetails = SupportTicket & {
  reporter: CoreProfile;
  assignedAgent: CoreProfile | null;
  relatedOrder: TradeOrder | null;
  messages: TicketMessage[];
};

// =====================================================
// 🔔 Notification Relations — علاقات الإشعارات
// =====================================================

/** الإشعار مع مستقبله */
export type NotificationWithRecipient = SysNotification & {
  recipient: Pick<CoreProfile, 'id' | 'full_name' | 'avatar_url'>;
};

// =====================================================
// 🚚 Delivery Relations — علاقات التوصيل
// =====================================================

/** التوصيل مع السائق والطلب */
export type DeliveryWithDetails = FleetDeliveryType & {
  order: TradeOrder;
  driver: FleetDriver | null;
};

/** السائق مع توصيلاته */
export type DriverWithDeliveries = FleetDriver & {
  deliveries: FleetDeliveryType[];
};

// =====================================================
// ⭐ Social Relations — علاقات اجتماعية
// =====================================================

/** التقييم مع المؤلف */
export type ReviewWithAuthor = SocialReview & {
  author: Pick<CoreProfile, 'id' | 'full_name' | 'avatar_url'>;
};

/** المفضلة مع المنتج/البائع */
export type FavoriteWithDetails = CustomerFavorite & {
  product: StoreProduct | null;
  vendor: StoreVendor | null;
};
