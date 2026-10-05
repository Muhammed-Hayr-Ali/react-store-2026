import { PERMISSIONS, AppPermission } from "@/lib/actions/role"

export interface PermissionGroup {
  id: string
  label: string
  permissions: {
    key: AppPermission
    label: string
    description: string
  }[]
}

export const PERMISSION_GROUPS: PermissionGroup[] = [
  {
    id: "products_catalog",
    label: "Catalog & Inventory",
    permissions: [
      {
        key: PERMISSIONS.CREATE_PRODUCT,
        label: "Create Product",
        description: "Add new products, variants, and gallery images",
      },
      {
        key: PERMISSIONS.UPDATE_PRODUCT,
        label: "Update Product",
        description: "Edit pricing, specifications, and descriptions",
      },
      {
        key: PERMISSIONS.DELETE_PRODUCT,
        label: "Delete Product",
        description: "Archive or permanently remove products",
      },
      {
        key: PERMISSIONS.MANAGE_INVENTORY,
        label: "Manage Inventory",
        description: "Adjust stock levels, restock alerts, and SKU tracking",
      },
    ],
  },
  {
    id: "categories_brands",
    label: "Categories & Brands",
    permissions: [
      {
        key: PERMISSIONS.CREATE_CATEGORY,
        label: "Create Category",
        description:
          "Define new categories and hierarchical parent-child links",
      },
      {
        key: PERMISSIONS.UPDATE_CATEGORY,
        label: "Update Category",
        description: "Modify category names, icons, and slug configurations",
      },
      {
        key: PERMISSIONS.DELETE_CATEGORY,
        label: "Delete Category",
        description: "Remove obsolete categories from the storefront",
      },
      {
        key: PERMISSIONS.CREATE_BRAND,
        label: "Create Brand",
        description: "Register new brands and manufacturers",
      },
      {
        key: PERMISSIONS.UPDATE_BRAND,
        label: "Update Brand",
        description: "Update brand logos, websites, and details",
      },
      {
        key: PERMISSIONS.DELETE_BRAND,
        label: "Delete Brand",
        description: "Remove brands permanently",
      },
    ],
  },
  {
    id: "orders_fulfillment",
    label: "Orders & Fulfillment",
    permissions: [
      {
        key: PERMISSIONS.VIEW_ORDERS,
        label: "View Orders",
        description: "Inspect customer orders, items, and invoices",
      },
      {
        key: PERMISSIONS.UPDATE_ORDER_STATUS,
        label: "Update Order Status",
        description: "Change status between processing, shipped, and delivered",
      },
      {
        key: PERMISSIONS.CANCEL_ORDER,
        label: "Cancel Order",
        description: "Cancel pending or invalid customer orders",
      },
      {
        key: PERMISSIONS.PROCESS_REFUND,
        label: "Process Refunds",
        description: "Issue payments or wallet refunds to customers",
      },
    ],
  },
  {
    id: "promotions_coupons",
    label: "Marketing & Discounts",
    permissions: [
      {
        key: PERMISSIONS.CREATE_FLASH_SALE,
        label: "Create Flash Sale",
        description: "Schedule timed promotional flash discount campaigns",
      },
      {
        key: PERMISSIONS.UPDATE_FLASH_SALE,
        label: "Update Flash Sale",
        description: "Modify discounts, timers, and participating products",
      },
      {
        key: PERMISSIONS.DELETE_FLASH_SALE,
        label: "Delete Flash Sale",
        description: "Cancel active or upcoming flash sale campaigns",
      },
      {
        key: PERMISSIONS.CREATE_COUPON,
        label: "Create Coupon",
        description: "Generate promo codes and percentage/fixed discount rules",
      },
      {
        key: PERMISSIONS.UPDATE_COUPON,
        label: "Update Coupon",
        description: "Adjust coupon usage limits, dates, and terms",
      },
      {
        key: PERMISSIONS.DELETE_COUPON,
        label: "Delete Coupon",
        description: "Revoke and delete promo codes",
      },
    ],
  },
  {
    id: "finance_shipping",
    label: "Finance, Wallet & Shipping",
    permissions: [
      {
        key: PERMISSIONS.VIEW_TRANSACTIONS,
        label: "View Transactions",
        description: "Review financial payment logs and gateway receipts",
      },
      {
        key: PERMISSIONS.MANAGE_WALLET,
        label: "Manage Wallets",
        description: "Deposit or withdraw store credits for customer wallets",
      },
      {
        key: PERMISSIONS.MANAGE_PAYMENT_GATEWAYS,
        label: "Payment Gateways",
        description: "Configure online payment providers and credentials",
      },
      {
        key: PERMISSIONS.MANAGE_SHIPPING_ZONES,
        label: "Shipping Zones",
        description: "Manage delivery cities, countries, and coverage zones",
      },
      {
        key: PERMISSIONS.MANAGE_SHIPPING_RATES,
        label: "Shipping Rates",
        description:
          "Set flat rates, weight fees, and free shipping thresholds",
      },
    ],
  },
  {
    id: "community_moderation",
    label: "Reviews & Moderation",
    permissions: [
      {
        key: PERMISSIONS.CREATE_REVIEW,
        label: "Create Review",
        description: "Post product reviews and ratings",
      },
      {
        key: PERMISSIONS.UPDATE_REVIEW,
        label: "Update Review",
        description: "Edit submitted reviews and stars",
      },
      {
        key: PERMISSIONS.DELETE_REVIEW,
        label: "Delete Review",
        description: "Remove personal reviews",
      },
      {
        key: PERMISSIONS.MODERATE_REVIEWS,
        label: "Moderate Reviews",
        description: "Approve, hide, or delete abusive public feedback",
      },
      {
        key: PERMISSIONS.CREATE_REPORT,
        label: "Create Report",
        description: "Submit violation and problem tickets",
      },
      {
        key: PERMISSIONS.MANAGE_REPORTS,
        label: "Manage Reports",
        description: "Investigate and resolve submitted user reports",
      },
      {
        key: PERMISSIONS.DELETE_REPORT,
        label: "Delete Report",
        description: "Purge resolved moderation logs",
      },
    ],
  },
  {
    id: "store_analytics",
    label: "Settings & Analytics",
    permissions: [
      {
        key: PERMISSIONS.VIEW_ANALYTICS,
        label: "View Analytics",
        description: "View revenue dashboards, sales statistics, and metrics",
      },
      {
        key: PERMISSIONS.EXPORT_REPORTS,
        label: "Export Reports",
        description: "Export customer, order, and sales data to CSV/Excel",
      },
      {
        key: PERMISSIONS.MANAGE_STORE_SETTINGS,
        label: "Store Settings",
        description: "Configure site name, SEO, currencies, and contact info",
      },
      {
        key: PERMISSIONS.MANAGE_BANNERS,
        label: "Manage Banners",
        description: "Update homepage hero sliders and advertising banners",
      },
      {
        key: PERMISSIONS.MANAGE_NOTIFICATIONS,
        label: "Broadcast Notifications",
        description: "Send push alerts and platform-wide announcement messages",
      },
    ],
  },
  {
    id: "roles_security",
    label: "Security & Roles Control",
    permissions: [
      {
        key: PERMISSIONS.CREATE_ROLE,
        label: "Create Role",
        description: "Define new custom administrative or staff roles",
      },
      {
        key: PERMISSIONS.UPDATE_ROLE,
        label: "Update Role",
        description: "Modify role titles and assigned permission sets",
      },
      {
        key: PERMISSIONS.ASSIGN_ROLE,
        label: "Assign Role",
        description: "Bind permissions and roles to specific staff users",
      },
      {
        key: PERMISSIONS.REMOVE_ROLE,
        label: "Remove Role",
        description: "Revoke system roles from existing users",
      },
    ],
  },

  {
    id: "users_security",
    label: "Security & Users Control",
    permissions: [
      {
        key: PERMISSIONS.CREATE_USER,
        label: "Create User",
        description: "Create new staff or customer accounts",
      },
      {
        key: PERMISSIONS.UPDATE_USER,
        label: "Update User",
        description: "Modify user details, roles, and permissions",
      },
      {
        key: PERMISSIONS.ASSIGN_USER,
        label: "Assign User",
        description: "Bind permissions and roles to specific staff users",
      },
      {
        key: PERMISSIONS.DELETE_USER,
        label: "Remove User",
        description: "Revoke system roles from existing users",
      },
    ],
  },
]
