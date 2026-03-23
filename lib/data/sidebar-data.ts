// بيانات القوائم لكل دور بناءً على الصلاحيات في Supabase
// Reference: supabase/03_roles/1_create_table.sql

export const roleNavData = {
  admin: [
    {
      title: "Dashboard",
      url: "/dashboard",
      icon: "dashboard",
      isActive: true,
    },
    {
      title: "User Management",
      url: "/dashboard/users",
      icon: "users",
      items: [
        { title: "All Users", url: "/dashboard/users" },
        { title: "Add User", url: "/dashboard/users/add" },
        { title: "Roles & Permissions", url: "/dashboard/users/roles" },
        { title: "Profile Roles", url: "/dashboard/users/profile-roles" },
      ],
    },
    {
      title: "Roles",
      url: "/dashboard/roles",
      icon: "roles",
      items: [
        { title: "All Roles", url: "/dashboard/roles" },
        { title: "Create Role", url: "/dashboard/roles/create" },
        { title: "Permissions", url: "/dashboard/roles/permissions" },
      ],
    },
    {
      title: "Subscription Plans",
      url: "/dashboard/plans",
      icon: "plans",
      items: [
        { title: "All Plans", url: "/dashboard/plans" },
        { title: "Seller Plans", url: "/dashboard/plans/seller" },
        { title: "Delivery Plans", url: "/dashboard/plans/delivery" },
        { title: "Customer Plans", url: "/dashboard/plans/customer" },
        { title: "Subscriptions", url: "/dashboard/subscriptions" },
      ],
    },
    {
      title: "System",
      url: "/dashboard/system",
      icon: "system",
      items: [
        { title: "Settings", url: "/dashboard/system/settings" },
        { title: "Configuration", url: "/dashboard/system/config" },
        { title: "Logs", url: "/dashboard/system/logs" },
        { title: "Security", url: "/dashboard/system/security" },
      ],
    },
    {
      title: "Reports & Analytics",
      url: "/dashboard/reports",
      icon: "reports",
      items: [
        { title: "Analytics Dashboard", url: "/dashboard/reports/analytics" },
        { title: "Revenue Reports", url: "/dashboard/reports/revenue" },
        { title: "User Activity", url: "/dashboard/reports/activity" },
        { title: "System Reports", url: "/dashboard/reports/system" },
      ],
    },
  ],
  vendor: [
    {
      title: "Dashboard",
      url: "/dashboard",
      icon: "dashboard",
      isActive: true,
    },
    {
      title: "Products",
      url: "/dashboard/products",
      icon: "products",
      items: [
        { title: "All Products", url: "/dashboard/products" },
        { title: "Add Product", url: "/dashboard/products/add" },
        { title: "Categories", url: "/dashboard/products/categories" },
        { title: "Inventory", url: "/dashboard/products/inventory" },
      ],
    },
    {
      title: "Orders",
      url: "/dashboard/orders",
      icon: "orders",
      items: [
        { title: "All Orders", url: "/dashboard/orders" },
        { title: "Pending Orders", url: "/dashboard/orders/pending" },
        { title: "Processing", url: "/dashboard/orders/processing" },
        { title: "Completed", url: "/dashboard/orders/completed" },
        { title: "Cancelled", url: "/dashboard/orders/cancelled" },
        { title: "Update Status", url: "/dashboard/orders/status" },
      ],
    },
    {
      title: "Analytics",
      url: "/dashboard/analytics",
      icon: "analytics",
      items: [
        { title: "Sales Analytics", url: "/dashboard/analytics/sales" },
        { title: "Product Performance", url: "/dashboard/analytics/products" },
        { title: "Revenue", url: "/dashboard/analytics/revenue" },
        { title: "My Stats", url: "/dashboard/analytics/own" },
      ],
    },
    {
      title: "Subscription",
      url: "/dashboard/subscription",
      icon: "subscription",
      items: [
        { title: "My Plan", url: "/dashboard/subscription/my-plan" },
        { title: "Upgrade Plan", url: "/dashboard/subscription/upgrade" },
        { title: "Billing History", url: "/dashboard/subscription/billing" },
      ],
    },
  ],
  customer: [
    {
      title: "Dashboard",
      url: "/dashboard",
      icon: "dashboard",
      isActive: true,
    },
    {
      title: "Orders",
      url: "/dashboard/orders",
      icon: "orders",
      items: [
        { title: "All Orders", url: "/dashboard/orders" },
        { title: "Pending", url: "/dashboard/orders/pending" },
        { title: "Processing", url: "/dashboard/orders/processing" },
        { title: "Shipped", url: "/dashboard/orders/shipped" },
        { title: "Completed", url: "/dashboard/orders/completed" },
        { title: "Track Order", url: "/dashboard/orders/track" },
      ],
    },
    {
      title: "Shopping",
      url: "/dashboard/shopping",
      icon: "shopping",
      items: [
        { title: "Browse Products", url: "/dashboard/shopping/products" },
        { title: "Wishlist", url: "/dashboard/shopping/wishlist" },
        { title: "Cart", url: "/dashboard/shopping/cart" },
      ],
    },
    {
      title: "Reviews",
      url: "/dashboard/reviews",
      icon: "reviews",
      items: [
        { title: "My Reviews", url: "/dashboard/reviews/my-reviews" },
        { title: "Write Review", url: "/dashboard/reviews/write" },
      ],
    },
    {
      title: "Account",
      url: "/dashboard/account",
      icon: "account",
      items: [
        { title: "Profile", url: "/dashboard/account/profile" },
        { title: "Addresses", url: "/dashboard/account/addresses" },
        { title: "Payment Methods", url: "/dashboard/account/payment" },
        { title: "Settings", url: "/dashboard/account/settings" },
      ],
    },
  ],
  delivery: [
    {
      title: "Dashboard",
      url: "/dashboard",
      icon: "dashboard",
      isActive: true,
    },
    {
      title: "Deliveries",
      url: "/dashboard/deliveries",
      icon: "deliveries",
      items: [
        {
          title: "Available Deliveries",
          url: "/dashboard/deliveries/available",
        },
        { title: "My Deliveries", url: "/dashboard/deliveries/my-deliveries" },
        { title: "Active", url: "/dashboard/deliveries/active" },
        { title: "Completed", url: "/dashboard/deliveries/completed" },
        { title: "Schedule", url: "/dashboard/deliveries/schedule" },
        { title: "Accept Delivery", url: "/dashboard/deliveries/accept" },
      ],
    },
    {
      title: "Orders",
      url: "/dashboard/orders",
      icon: "orders_delivery",
      items: [
        { title: "Assigned Orders", url: "/dashboard/orders/assigned" },
        { title: "Update Delivery", url: "/dashboard/orders/update-delivery" },
        { title: "Delivery History", url: "/dashboard/orders/history" },
      ],
    },
    {
      title: "Earnings",
      url: "/dashboard/earnings",
      icon: "earnings",
      items: [
        { title: "Today's Earnings", url: "/dashboard/earnings/today" },
        { title: "This Week", url: "/dashboard/earnings/week" },
        { title: "This Month", url: "/dashboard/earnings/month" },
        { title: "Payment History", url: "/dashboard/earnings/history" },
        { title: "Withdraw", url: "/dashboard/earnings/withdraw" },
      ],
    },
    {
      title: "Performance",
      url: "/dashboard/performance",
      icon: "performance",
      items: [
        { title: "Statistics", url: "/dashboard/performance/stats" },
        { title: "My Rating", url: "/dashboard/performance/rating" },
        { title: "Completion Rate", url: "/dashboard/performance/completion" },
        { title: "Reports", url: "/dashboard/performance/reports" },
      ],
    },
    {
      title: "Subscription",
      url: "/dashboard/subscription",
      icon: "subscription",
      items: [
        { title: "My Plan", url: "/dashboard/subscription/my-plan" },
        { title: "Upgrade Plan", url: "/dashboard/subscription/upgrade" },
        { title: "Benefits", url: "/dashboard/subscription/benefits" },
      ],
    },
    {
      title: "Map",
      url: "/dashboard/map",
      icon: "map",
    },
  ],
}

// بيانات المستخدم (مشتركة)
export const userData = {
  name: "User",
  email: "user@example.com",
  avatar: "/avatars/default.jpg",
}
