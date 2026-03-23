// بيانات القوائم لكل دور بناءً على الصلاحيات في Supabase
// Reference: supabase/03_roles/1_create_table.sql

export const roleNavData = {
  admin: [
    {
      title: "dashboard",
      url: "/dashboard",
      icon: "dashboard",
      isActive: true,
    },
    {
      title: "userManagement",
      url: "/dashboard/users",
      icon: "users",
      items: [
        { title: "allUsers", url: "/dashboard/users" },
        { title: "addUser", url: "/dashboard/users/add" },
        { title: "rolesPermissions", url: "/dashboard/users/roles" },
        { title: "profileRoles", url: "/dashboard/users/profile-roles" },
      ],
    },
    {
      title: "roles",
      url: "/dashboard/roles",
      icon: "roles",
      items: [
        { title: "allRoles", url: "/dashboard/roles" },
        { title: "createRole", url: "/dashboard/roles/create" },
        { title: "permissions", url: "/dashboard/roles/permissions" },
      ],
    },
    {
      title: "subscriptionPlans",
      url: "/dashboard/plans",
      icon: "plans",
      items: [
        { title: "allPlans", url: "/dashboard/plans" },
        { title: "sellerPlans", url: "/dashboard/plans/seller" },
        { title: "deliveryPlans", url: "/dashboard/plans/delivery" },
        { title: "customerPlans", url: "/dashboard/plans/customer" },
        { title: "subscriptions", url: "/dashboard/subscriptions" },
      ],
    },
    {
      title: "system",
      url: "/dashboard/system",
      icon: "system",
      items: [
        { title: "settings", url: "/dashboard/system/settings" },
        { title: "configuration", url: "/dashboard/system/config" },
        { title: "logs", url: "/dashboard/system/logs" },
        { title: "security", url: "/dashboard/system/security" },
      ],
    },
    {
      title: "reportsAnalytics",
      url: "/dashboard/reports",
      icon: "reports",
      items: [
        { title: "analyticsDashboard", url: "/dashboard/reports/analytics" },
        { title: "revenueReports", url: "/dashboard/reports/revenue" },
        { title: "userActivity", url: "/dashboard/reports/activity" },
        { title: "systemReports", url: "/dashboard/reports/system" },
      ],
    },
  ],
  vendor: [
    {
      title: "dashboard",
      url: "/dashboard",
      icon: "dashboard",
      isActive: true,
    },
    {
      title: "products",
      url: "/dashboard/products",
      icon: "products",
      items: [
        { title: "allProducts", url: "/dashboard/products" },
        { title: "addProduct", url: "/dashboard/products/add" },
        { title: "categories", url: "/dashboard/products/categories" },
        { title: "inventory", url: "/dashboard/products/inventory" },
      ],
    },
    {
      title: "orders",
      url: "/dashboard/orders",
      icon: "orders",
      items: [
        { title: "allOrders", url: "/dashboard/orders" },
        { title: "pendingOrders", url: "/dashboard/orders/pending" },
        { title: "processing", url: "/dashboard/orders/processing" },
        { title: "completed", url: "/dashboard/orders/completed" },
        { title: "cancelled", url: "/dashboard/orders/cancelled" },
        { title: "updateStatus", url: "/dashboard/orders/status" },
      ],
    },
    {
      title: "analytics",
      url: "/dashboard/analytics",
      icon: "analytics",
      items: [
        { title: "salesAnalytics", url: "/dashboard/analytics/sales" },
        { title: "productPerformance", url: "/dashboard/analytics/products" },
        { title: "revenue", url: "/dashboard/analytics/revenue" },
        { title: "myStats", url: "/dashboard/analytics/own" },
      ],
    },
    {
      title: "subscription",
      url: "/dashboard/subscription",
      icon: "subscription",
      items: [
        { title: "myPlan", url: "/dashboard/subscription/my-plan" },
        { title: "upgradePlan", url: "/dashboard/subscription/upgrade" },
        { title: "billingHistory", url: "/dashboard/subscription/billing" },
      ],
    },
  ],
  customer: [
    {
      title: "dashboard",
      url: "/dashboard",
      icon: "dashboard",
      isActive: true,
    },
    {
      title: "orders",
      url: "/dashboard/orders",
      icon: "orders",
      items: [
        { title: "allOrders", url: "/dashboard/orders" },
        { title: "pending", url: "/dashboard/orders/pending" },
        { title: "processing", url: "/dashboard/orders/processing" },
        { title: "shipped", url: "/dashboard/orders/shipped" },
        { title: "completed", url: "/dashboard/orders/completed" },
        { title: "trackOrder", url: "/dashboard/orders/track" },
      ],
    },
    {
      title: "shopping",
      url: "/dashboard/shopping",
      icon: "shopping",
      items: [
        { title: "browseProducts", url: "/dashboard/shopping/products" },
        { title: "wishlist", url: "/dashboard/shopping/wishlist" },
        { title: "cart", url: "/dashboard/shopping/cart" },
      ],
    },
    {
      title: "reviews",
      url: "/dashboard/reviews",
      icon: "reviews",
      items: [
        { title: "myReviews", url: "/dashboard/reviews/my-reviews" },
        { title: "writeReview", url: "/dashboard/reviews/write" },
      ],
    },
    {
      title: "account",
      url: "/dashboard/account",
      icon: "account",
      items: [
        { title: "profile", url: "/dashboard/account/profile" },
        { title: "addresses", url: "/dashboard/account/addresses" },
        { title: "paymentMethods", url: "/dashboard/account/payment" },
        { title: "settings", url: "/dashboard/account/settings" },
      ],
    },
  ],
  delivery: [
    {
      title: "dashboard",
      url: "/dashboard",
      icon: "dashboard",
      isActive: true,
    },
    {
      title: "deliveries",
      url: "/dashboard/deliveries",
      icon: "deliveries",
      items: [
        {
          title: "availableDeliveries",
          url: "/dashboard/deliveries/available",
        },
        { title: "myDeliveries", url: "/dashboard/deliveries/my-deliveries" },
        { title: "active", url: "/dashboard/deliveries/active" },
        { title: "completed", url: "/dashboard/deliveries/completed" },
        { title: "schedule", url: "/dashboard/deliveries/schedule" },
        { title: "acceptDelivery", url: "/dashboard/deliveries/accept" },
      ],
    },
    {
      title: "orders",
      url: "/dashboard/orders",
      icon: "orders_delivery",
      items: [
        { title: "assignedOrders", url: "/dashboard/orders/assigned" },
        { title: "updateDelivery", url: "/dashboard/orders/update-delivery" },
        { title: "history", url: "/dashboard/orders/history" },
      ],
    },
    {
      title: "earnings",
      url: "/dashboard/earnings",
      icon: "earnings",
      items: [
        { title: "todayEarnings", url: "/dashboard/earnings/today" },
        { title: "thisWeek", url: "/dashboard/earnings/week" },
        { title: "thisMonth", url: "/dashboard/earnings/month" },
        { title: "paymentHistory", url: "/dashboard/earnings/history" },
        { title: "withdraw", url: "/dashboard/earnings/withdraw" },
      ],
    },
    {
      title: "performance",
      url: "/dashboard/performance",
      icon: "performance",
      items: [
        { title: "statistics", url: "/dashboard/performance/stats" },
        { title: "myRating", url: "/dashboard/performance/rating" },
        { title: "completionRate", url: "/dashboard/performance/completion" },
        { title: "reports", url: "/dashboard/performance/reports" },
      ],
    },
    {
      title: "subscription",
      url: "/dashboard/subscription",
      icon: "subscription",
      items: [
        { title: "myPlan", url: "/dashboard/subscription/my-plan" },
        { title: "upgradePlan", url: "/dashboard/subscription/upgrade" },
        { title: "benefits", url: "/dashboard/subscription/benefits" },
      ],
    },
    {
      title: "map",
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
