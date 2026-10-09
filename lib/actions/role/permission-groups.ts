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
    id: "dashboard_views",
    label: "Dashboard & Page Views",
    permissions: [
      {
        key: PERMISSIONS.VIEW_USER_OVERVIEW,
        label: "View User Dashboard",
        description:
          "Access personal account overview, recent orders, and activity",
      },
      {
        key: PERMISSIONS.VIEW_ADMIN_OVERVIEW,
        label: "View Admin Panel",
        description:
          "Access store analytics, revenue reports, and management overview",
      },
      {
        key: PERMISSIONS.VIEW_PRODUCTS,
        label: "View Products",
        description: "Access and browse the product inventory catalog page",
      },
      {
        key: PERMISSIONS.VIEW_FLASH_SALES,
        label: "View Flash Sales",
        description: "View active and scheduled discount campaigns page",
      },
      {
        key: PERMISSIONS.VIEW_USERS_MANAGEMENT,
        label: "View Users Management",
        description: "Access and view system users list page",
      },
      {
        key: PERMISSIONS.VIEW_REPORTS_MANAGEMENT,
        label: "View Reports & Issues",
        description: "Inspect customer reports, tickets, and issues page",
      },
      {
        key: PERMISSIONS.VIEW_ROLES_MANAGEMENT,
        label: "View Roles & Permissions",
        description: "Inspect roles and permission mappings page",
      },
      {
        key: PERMISSIONS.VIEW_STAFF_ACCESS,
        label: "View Staff Access",
        description: "Access staff access management page",
      },
      {
        key: PERMISSIONS.VIEW_NOTIFICATIONS_MANAGEMENT,
        label: "View Notifications Management",
        description: "View platform notification logs and mass broadcast page",
      },
      {
        key: PERMISSIONS.VIEW_NOTIFICATION_CHANNELS_MANAGEMENT,
        label: "View Channels Management",
        description:
          "Access and view the audience notification channels setup page",
      },
      {
        key: PERMISSIONS.VIEW_USER_ORDERS,
        label: "View Orders",
        description: "Access and track customer purchase orders and shipments",
      },
      {
        key: PERMISSIONS.VIEW_USER_WISHLIST,
        label: "View Wishlist",
        description: "Access and manage personal saved and favorite products",
      },
      {
        key: PERMISSIONS.VIEW_USER_COUPONS,
        label: "View Coupons",
        description:
          "Access available discount vouchers and claimed promotional coupons",
      },
    ],
  },

  {
    id: "notifications_control",
    label: "Notifications & Broadcasts (Actions)",
    permissions: [
      {
        key: PERMISSIONS.SEND_NOTIFICATION,
        label: "Send Notification",
        description:
          "Send targeted direct alerts to individual customer accounts",
      },
      {
        key: PERMISSIONS.BROADCAST_NOTIFICATION,
        label: "Broadcast Notification",
        description:
          "Publish mass announcement alerts to all users or specific channels",
      },
      {
        key: PERMISSIONS.DELETE_NOTIFICATION,
        label: "Delete Notification",
        description: "Delete obsolete system alerts or sent broadcasts",
      },
    ],
  },

  {
    id: "notification_channels_control",
    label: "Notification Channels (Actions)",
    permissions: [
      {
        key: PERMISSIONS.CREATE_NOTIFICATION_CHANNEL,
        label: "Create Channel",
        description:
          "Define new notification topics and mandatory audience channels",
      },
      {
        key: PERMISSIONS.UPDATE_NOTIFICATION_CHANNEL,
        label: "Update Channel",
        description:
          "Modify channel names, slugs, policies, and activation status",
      },
      {
        key: PERMISSIONS.DELETE_NOTIFICATION_CHANNEL,
        label: "Delete Channel",
        description: "Permanently delete non-mandatory notification channels",
      },
    ],
  },

  {
    id: "brands_management",
    label: "Brands Management (Actions)",
    permissions: [
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
    id: "categories_management",
    label: "Categories Management (Actions)",
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
    ],
  },
  {
    id: "promotions_coupons",
    label: "Marketing & Discounts (Actions)",
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
    ],
  },
  {
    id: "products_catalog",
    label: "Products & Images Management (Actions)",
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
    ],
  },
  {
    id: "community_moderation",
    label: "Reviews Management (Actions)",
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
        description: "Remove public feedback or reviews",
      },
      {
        key: PERMISSIONS.MODERATE_REVIEWS,
        label: "Moderate Reviews",
        description: "Approve, hide, or manage product reviews",
      },
    ],
  },
  {
    id: "reports_moderation",
    label: "Reports & Moderation Management (Actions)",
    permissions: [
      {
        key: PERMISSIONS.CREATE_REPORT,
        label: "Create Report",
        description: "Submit violation and problem tickets",
      },
      {
        key: PERMISSIONS.UPDATE_REPORT,
        label: "Update Report",
        description: "Modify and update report status",
      },
      {
        key: PERMISSIONS.DELETE_REPORT,
        label: "Delete Report",
        description: "Purge resolved moderation logs and reports",
      },
      {
        key: PERMISSIONS.MANAGE_REPORTS,
        label: "Manage Reports",
        description:
          "Full administrative control over user reports and complaints",
      },
    ],
  },
  {
    id: "users_security",
    label: "Users & Profiles Management (Actions)",
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
        key: PERMISSIONS.DELETE_USER,
        label: "Remove User",
        description: "Revoke or delete user accounts",
      },
    ],
  },
  {
    id: "roles_security",
    label: "Roles & Permissions Management (Actions)",
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
        key: PERMISSIONS.DELETE_ROLE,
        label: "Delete Role",
        description: "Delete obsolete system roles",
      },
      {
        key: PERMISSIONS.MANAGE_ROLES,
        label: "Manage Roles",
        description: "Full administrative control over roles and permissions",
      },
      {
        key: PERMISSIONS.ASSIGN_ROLE,
        label: "Assign Role",
        description: "Bind roles to specific staff users",
      },
    ],
  },
]
