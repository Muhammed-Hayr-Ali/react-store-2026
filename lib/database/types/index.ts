// =====================================================
// 📦 Database Types — Central Export (Single-Merchant)
// =====================================================
// ⚠️ تصدير مركزي لجميع الأنواع
// =====================================================

// 🔹 Enums
export * from "./enums";

// 🔹 Tables
export * from "./tables";

// 🔹 Utilities
export * from "./utils";

// =====================================================
// 🗄️ Supabase Database Type
// =====================================================

import type {
  CoreProfile,
  AuthPasswordReset,
  CoreRole,
  CoreProfileRole,
  CoreAddress,
  ExchangeRate,
  StoreSettings,
  StoreCategory,
  StoreProduct,
  ProductImage,
  ProductVariant,
  SaaSPlan,
  SaaSSubscription,
  StoreVendor,
  TradeOrder,
  TradeOrderDelivery,
  TradeOrderItem,
  FleetDriver,
  FleetDeliveryType,
  SocialReview,
  CustomerFavorite,
  SupportTicket,
  TicketMessage,
  SysNotification,
  SystemErrorLog,
} from "./tables";

import type {
  CoreProfileInsert,
  CoreProfileUpdate,
  Insertable,
  Updatable,
} from "./utils";

export interface Database {
  public: {
    Tables: {
      core_profile: {
        Row: CoreProfile;
        Insert: CoreProfileInsert;
        Update: CoreProfileUpdate;
        Relationships: [];
      };
      auth_password_reset: {
        Row: AuthPasswordReset;
        Insert: Insertable<AuthPasswordReset>;
        Update: Updatable<AuthPasswordReset>;
        Relationships: [
          {
            foreignTable: "core_profile";
            constraintName: "auth_password_reset_profile_id_fkey";
          },
        ];
      };
      core_role: {
        Row: CoreRole;
        Insert: Insertable<CoreRole>;
        Update: Updatable<CoreRole>;
        Relationships: [];
      };
      core_profile_role: {
        Row: CoreProfileRole;
        Insert: Insertable<CoreProfileRole>;
        Update: Updatable<CoreProfileRole>;
        Relationships: [
          {
            foreignTable: "core_profile";
            constraintName: "core_profile_role_profile_id_fkey";
          },
          {
            foreignTable: "core_role";
            constraintName: "core_profile_role_role_id_fkey";
          },
        ];
      };
      core_address: {
        Row: CoreAddress;
        Insert: Insertable<CoreAddress>;
        Update: Updatable<CoreAddress>;
        Relationships: [
          {
            foreignTable: "core_profile";
            constraintName: "core_address_profile_id_fkey";
          },
        ];
      };
      store_settings: {
        Row: StoreSettings;
        Insert: Insertable<StoreSettings>;
        Update: Updatable<StoreSettings>;
        Relationships: [
          {
            foreignTable: "exchange_rates";
            constraintName: "store_settings_default_currency_fkey";
          },
        ];
      };
      exchange_rates: {
        Row: ExchangeRate;
        Insert: Insertable<ExchangeRate>;
        Update: Updatable<ExchangeRate>;
        Relationships: [];
      };
      store_category: {
        Row: StoreCategory;
        Insert: Insertable<StoreCategory>;
        Update: Updatable<StoreCategory>;
        Relationships: [
          {
            foreignTable: "store_category";
            constraintName: "store_category_parent_id_fkey";
          },
        ];
      };
      store_product: {
        Row: StoreProduct;
        Insert: Insertable<StoreProduct>;
        Update: Updatable<StoreProduct>;
        Relationships: [
          {
            foreignTable: "store_category";
            constraintName: "store_product_category_id_fkey";
          },
          {
            foreignTable: "core_profile";
            constraintName: "store_product_user_id_fkey";
          },
        ];
      };
      product_image: {
        Row: ProductImage;
        Insert: Insertable<ProductImage>;
        Update: Updatable<ProductImage>;
        Relationships: [
          {
            foreignTable: "store_product";
            constraintName: "product_image_product_id_fkey";
          },
        ];
      };
      product_variant: {
        Row: ProductVariant;
        Insert: Insertable<ProductVariant>;
        Update: Updatable<ProductVariant>;
        Relationships: [
          {
            foreignTable: "store_product";
            constraintName: "product_variant_product_id_fkey";
          },
        ];
      };
      trade_order: {
        Row: TradeOrder;
        Insert: Insertable<TradeOrder>;
        Update: Updatable<TradeOrder>;
        Relationships: [
          {
            foreignTable: "core_profile";
            constraintName: "trade_order_customer_id_fkey";
          },
          {
            foreignTable: "core_profile";
            constraintName: "trade_order_created_by_fkey";
          },
          {
            foreignTable: "core_profile";
            constraintName: "trade_order_updated_by_fkey";
          },
          {
            foreignTable: "exchange_rates";
            constraintName: "trade_order_currency_fkey";
          },
        ];
      };
      trade_order_delivery: {
        Row: TradeOrderDelivery;
        Insert: Insertable<TradeOrderDelivery>;
        Update: Updatable<TradeOrderDelivery>;
        Relationships: [
          {
            foreignTable: "trade_order";
            constraintName: "trade_order_delivery_order_id_fkey";
          },
          {
            foreignTable: "core_profile";
            constraintName: "trade_order_delivery_delivered_by_fkey";
          },
          {
            foreignTable: "fleet_driver";
            constraintName: "trade_order_delivery_driver_id_fkey";
          },
        ];
      };
      fleet_driver: {
        Row: FleetDriver;
        Insert: Insertable<FleetDriver>;
        Update: Updatable<FleetDriver>;
        Relationships: [
          {
            foreignTable: "core_profile";
            constraintName: "fleet_driver_profile_id_fkey";
          },
        ];
      };
      fleet_delivery_type: {
        Row: FleetDeliveryType;
        Insert: Insertable<FleetDeliveryType>;
        Update: Updatable<FleetDeliveryType>;
        Relationships: [];
      };
      saas_plan: {
        Row: SaaSPlan;
        Insert: Insertable<SaaSPlan>;
        Update: Updatable<SaaSPlan>;
        Relationships: [];
      };
      saas_subscription: {
        Row: SaaSSubscription;
        Insert: Insertable<SaaSSubscription>;
        Update: Updatable<SaaSSubscription>;
        Relationships: [
          {
            foreignTable: "core_profile";
            constraintName: "saas_subscription_profile_id_fkey";
          },
          {
            foreignTable: "saas_plan";
            constraintName: "saas_subscription_plan_id_fkey";
          },
        ];
      };
      store_vendor: {
        Row: StoreVendor;
        Insert: Insertable<StoreVendor>;
        Update: Updatable<StoreVendor>;
        Relationships: [
          {
            foreignTable: "core_profile";
            constraintName: "store_vendor_profile_id_fkey";
          },
        ];
      };
      trade_order_item: {
        Row: TradeOrderItem;
        Insert: Insertable<TradeOrderItem>;
        Update: Updatable<TradeOrderItem>;
        Relationships: [
          {
            foreignTable: "trade_order";
            constraintName: "trade_order_item_order_id_fkey";
          },
          {
            foreignTable: "store_product";
            constraintName: "trade_order_item_product_id_fkey";
          },
          {
            foreignTable: "product_variant";
            constraintName: "trade_order_item_variant_id_fkey";
          },
        ];
      };
      social_review: {
        Row: SocialReview;
        Insert: Insertable<SocialReview>;
        Update: Updatable<SocialReview>;
        Relationships: [
          {
            foreignTable: "store_product";
            constraintName: "social_review_product_id_fkey";
          },
          {
            foreignTable: "core_profile";
            constraintName: "social_review_author_id_fkey";
          },
        ];
      };
      customer_favorite: {
        Row: CustomerFavorite;
        Insert: Insertable<CustomerFavorite>;
        Update: Updatable<CustomerFavorite>;
        Relationships: [
          {
            foreignTable: "core_profile";
            constraintName: "customer_favorite_customer_id_fkey";
          },
          {
            foreignTable: "store_product";
            constraintName: "customer_favorite_product_id_fkey";
          },
        ];
      };
      support_ticket: {
        Row: SupportTicket;
        Insert: Insertable<SupportTicket>;
        Update: Updatable<SupportTicket>;
        Relationships: [
          {
            foreignTable: "core_profile";
            constraintName: "support_ticket_reporter_id_fkey";
          },
          {
            foreignTable: "core_profile";
            constraintName: "support_ticket_assigned_to_fkey";
          },
          {
            foreignTable: "trade_order";
            constraintName: "support_ticket_order_id_fkey";
          },
        ];
      };
      ticket_message: {
        Row: TicketMessage;
        Insert: Insertable<TicketMessage>;
        Update: Updatable<TicketMessage>;
        Relationships: [
          {
            foreignTable: "support_ticket";
            constraintName: "ticket_message_ticket_id_fkey";
          },
          {
            foreignTable: "core_profile";
            constraintName: "ticket_message_sender_id_fkey";
          },
        ];
      };
      sys_notification: {
        Row: SysNotification;
        Insert: Insertable<SysNotification>;
        Update: Updatable<SysNotification>;
        Relationships: [
          {
            foreignTable: "core_profile";
            constraintName: "sys_notification_recipient_id_fkey";
          },
        ];
      };
      system_error_log: {
        Row: SystemErrorLog;
        Insert: Insertable<SystemErrorLog>;
        Update: Updatable<SystemErrorLog>;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: {
      create_password_reset_token: {
        Args: {
          p_profile_id: string;
          p_email: string;
          p_expires_in_minutes: number;
          p_ip_address: string | null;
        };
        Returns: string;
      };
      claim_password_reset_token: {
        Args: {
          p_token: string;
        };
        Returns: {
          is_valid: boolean;
          profile_id: string | null;
          email: string | null;
          message: string;
        }[];
      };
      verify_password_reset_token: {
        Args: {
          p_token: string;
        };
        Returns: {
          is_valid: boolean;
          profile_id: string | null;
          email: string | null;
          expires_at: string | null;
          message: string;
        }[];
      };
      cleanup_expired_reset_tokens: {
        Args: {
          p_batch_size: number;
        };
        Returns: number;
      };
      get_user_full_profile: {
        Args: Record<string, never>;
        Returns: {
          profile: Record<string, unknown>;
          roles: Record<string, unknown>[];
          permissions: string[];
        } | null;
      };
    };
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}

// =====================================================
// 🗄️ Database Schema Map — خريطة الجداول
// =====================================================

export type DatabaseTables = {
  // Core
  core_profile: CoreProfile;
  auth_password_reset: AuthPasswordReset;
  core_role: CoreRole;
  core_profile_role: CoreProfileRole;
  core_address: CoreAddress;
  // Store
  store_settings: StoreSettings;
  store_vendor: StoreVendor;
  store_category: StoreCategory;
  store_product: StoreProduct;
  product_image: ProductImage;
  product_variant: ProductVariant;
  // Exchange
  exchange_rates: ExchangeRate;
  // SaaS
  saas_plan: SaaSPlan;
  saas_subscription: SaaSSubscription;
  // Trade
  trade_order: TradeOrder;
  trade_order_delivery: TradeOrderDelivery;
  trade_order_item: TradeOrderItem;
  // Fleet
  fleet_driver: FleetDriver;
  fleet_delivery_type: FleetDeliveryType;
  // Social
  social_review: SocialReview;
  customer_favorite: CustomerFavorite;
  // Support
  support_ticket: SupportTicket;
  ticket_message: TicketMessage;
  // System
  sys_notification: SysNotification;
  system_error_log: SystemErrorLog;
};

/** أسماء جميع الجداول */
export type TableNames = keyof DatabaseTables;

/** نوع الإدخال لجدول محدد */
export type InsertFor<T extends TableNames> = Insertable<DatabaseTables[T]>;

/** نوع التحديث لجدول محدد */
export type UpdateFor<T extends TableNames> = Updatable<DatabaseTables[T]>;

// =====================================================
// 🎯 Type Helpers — مساعدات الأنواع
// =====================================================

/** التحقق من UUID صالح */
export function isValidUUID(value: unknown): value is import("./enums").UUID {
  return (
    typeof value === "string" &&
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
      value,
    )
  );
}

/** التحقق من حالة طلب صالحة */
export function isValidOrderStatus(
  value: unknown,
): value is import("./enums").OrderStatus {
  const statuses: import("./enums").OrderStatus[] = [
    "pending",
    "confirmed",
    "processing",
    "out_for_delivery",
    "delivered",
    "cancelled",
  ];
  return statuses.includes(value as import("./enums").OrderStatus);
}

/** التحقق من قيمة عشرية صالحة */
export function isValidDecimal(
  value: unknown,
): value is import("./enums").Decimal {
  return typeof value === "number" && !isNaN(value) && isFinite(value);
}
