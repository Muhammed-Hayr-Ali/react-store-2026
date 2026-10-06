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
        key: PERMISSIONS.VIEW_DASHBOARD,
        label: "View Dashboard",
        description: "Access the dashboard overview and main home page",
      },
      {
        key: PERMISSIONS.VIEW_OVERVIEW,
        label: "View Overview",
        description: "Access the dashboard overview and main home page",
      },
      {
        key: PERMISSIONS.VIEW_PRODUCTS,
        label: "View Products",
        description: "View and manage products",
      },
      {
        key: PERMISSIONS.VIEW_FLASH_SALES,
        label: "View Flash Sales",
        description: "View and manage flash sales",
      },
      {
        key: PERMISSIONS.VIEW_USERS_MANAGEMENT,
        label: "View Users Management",
        description: "View and manage users",
      },
      {
        key: PERMISSIONS.VIEW_REPORTS_AND_ISSUES,
        label: "View Reports & Issues",
        description: "View and manage reports and issues",
      },
      {
        key: PERMISSIONS.VIEW_ROLES_AND_PERMISSIONS,
        label: "View Roles & Permissions",
        description: "View and manage roles and permissions",
      },
      {
        key: PERMISSIONS.VIEW_STAFF_ACCESS,
        label: "View Staff Access",
        description: "View and manage staff access",
      },
      {
        key: PERMISSIONS.VIEW_NOTIFICATIONS_MANAGEMENT,
        label: "View Notifications Management",
        description: "View and manage notifications",
      },
    ],
  },

  // --- 2. مجموعات أذونات التحرير والإدارة (Mutations & Actions) ---
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
    id: "notifications_control",
    label: "Notifications Control (Actions)",
    permissions: [
      {
        key: PERMISSIONS.CREATE_NOTIFICATION,
        label: "Create Notification",
        description: "Create new platform notifications",
      },
      {
        key: PERMISSIONS.UPDATE_NOTIFICATION,
        label: "Update Notification",
        description: "Modify notification details and content",
      },
      {
        key: PERMISSIONS.ASSIGN_NOTIFICATION,
        label: "Assign Notification",
        description: "Bind notifications to specific users",
      },
      {
        key: PERMISSIONS.DELETE_NOTIFICATION,
        label: "Remove Notification",
        description: "Delete obsolete system notifications",
      },
      {
        key: PERMISSIONS.SEND_NOTIFICATION,
        label: "Send Notification",
        description: "Send push alerts and platform-wide announcement messages",
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
