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
    id: "brands",
    label: "Brands Management",
    permissions: [
      {
        key: PERMISSIONS.CREATE_BRAND,
        label: "Create Brand",
        description: "Allow adding new brands",
      },
      {
        key: PERMISSIONS.UPDATE_BRAND,
        label: "Update Brand",
        description: "Allow editing brand information",
      },
      {
        key: PERMISSIONS.DELETE_BRAND,
        label: "Delete Brand",
        description: "Allow removing brands permanently",
      },
    ],
  },
  {
    id: "categories",
    label: "Categories Management",
    permissions: [
      {
        key: PERMISSIONS.CREATE_CATEGORY,
        label: "Create Category",
        description: "Allow creating product categories",
      },
      {
        key: PERMISSIONS.UPDATE_CATEGORY,
        label: "Update Category",
        description: "Allow editing existing categories",
      },
      {
        key: PERMISSIONS.DELETE_CATEGORY,
        label: "Delete Category",
        description: "Allow removing categories",
      },
    ],
  },
  {
    id: "products",
    label: "Products Management",
    permissions: [
      {
        key: PERMISSIONS.CREATE_PRODUCT,
        label: "Create Product",
        description: "Allow adding products, variants and images",
      },
      {
        key: PERMISSIONS.UPDATE_PRODUCT,
        label: "Update Product",
        description: "Allow updating products and inventories",
      },
      {
        key: PERMISSIONS.DELETE_PRODUCT,
        label: "Delete Product",
        description: "Allow deleting products",
      },
    ],
  },
  {
    id: "flash_sales",
    label: "Flash Sales",
    permissions: [
      {
        key: PERMISSIONS.CREATE_FLASH_SALE,
        label: "Create Flash Sale",
        description: "Allow launching new sales campaigns",
      },
      {
        key: PERMISSIONS.UPDATE_FLASH_SALE,
        label: "Update Flash Sale",
        description: "Allow updating discounts and timers",
      },
      {
        key: PERMISSIONS.DELETE_FLASH_SALE,
        label: "Delete Flash Sale",
        description: "Allow canceling and deleting campaigns",
      },
    ],
  },
  {
    id: "reports",
    label: "Moderation & Reports",
    permissions: [
      {
        key: PERMISSIONS.CREATE_REPORT,
        label: "Create Report",
        description: "Allow submitting issue reports",
      },
      {
        key: PERMISSIONS.MANAGE_REPORTS,
        label: "Manage Reports",
        description: "Allow resolving or dismissing reports",
      },
      {
        key: PERMISSIONS.DELETE_REPORT,
        label: "Delete Report",
        description: "Allow purging report logs",
      },
    ],
  },
  {
    id: "roles_admin",
    label: "Roles & Access Control",
    permissions: [
      {
        key: PERMISSIONS.CREATE_ROLE,
        label: "Create Role",
        description: "Allow creating new system roles",
      },
      {
        key: PERMISSIONS.UPDATE_ROLE,
        label: "Update Role",
        description: "Allow modifying role permissions",
      },
      {
        key: PERMISSIONS.ASSIGN_ROLE,
        label: "Assign Role",
        description: "Allow binding roles to users",
      },
      {
        key: PERMISSIONS.REMOVE_ROLE,
        label: "Remove Role",
        description: "Allow unassigning roles from users",
      },
    ],
  },

  {
    id: "orders",
    label: "Orders Management",
    permissions: [
      {
        key: PERMISSIONS.VIEW_ORDERS,
        label: "View Orders",
        description: "Allow browsing customer orders and details",
      },
      {
        key: PERMISSIONS.UPDATE_ORDER_STATUS,
        label: "Update Order Status",
        description: "Allow changing order shipping or payment status",
      },
      {
        key: PERMISSIONS.CANCEL_ORDER,
        label: "Cancel Order",
        description: "Allow refunding and cancelling active orders",
      },
    ],
  },
]
