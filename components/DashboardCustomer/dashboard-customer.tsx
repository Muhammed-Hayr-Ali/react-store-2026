import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  ShoppingBagIcon,
  TrendingUpIcon,
  HeartIcon,
  StarIcon,
} from "lucide-react";
import {
  getCustomerStats,
  getRecentOrders,
} from "@/lib/actions/dashboard/customer";
import { getTranslations } from "next-intl/server";

// =====================================================
// 🛒 Customer Dashboard (Server Component)
// =====================================================

function getStatusBadge(
  status: string,
  t: Awaited<ReturnType<typeof getTranslations>>,
) {
  const statusMap: Record<
    string,
    {
      label: string;
      variant: "default" | "secondary" | "destructive" | "outline";
    }
  > = {
    pending: { label: t("dashboard.status.pending"), variant: "outline" },
    confirmed: { label: t("dashboard.status.confirmed"), variant: "secondary" },
    processing: { label: t("dashboard.status.processing"), variant: "default" },
    shipping: { label: t("dashboard.status.shipping"), variant: "default" },
    delivered: { label: t("dashboard.status.delivered"), variant: "outline" },
    cancelled: {
      label: t("dashboard.status.cancelled"),
      variant: "destructive",
    },
  };

  const config = statusMap[status] ?? {
    label: status,
    variant: "outline" as const,
  };

  return <Badge variant={config.variant}>{config.label}</Badge>;
}

export default async function DashboardCustomer() {
  const t = await getTranslations();
  const statsResult = await getCustomerStats();
  const ordersResult = await getRecentOrders(5);

  const stats = statsResult.success
    ? statsResult.data
    : { totalOrders: 0, activeOrders: 0, favorites: 0, points: 0 };
  const orders = ordersResult.success ? ordersResult.data : [];

  const statCards = [
    {
      title: t("dashboard.customer.totalOrders"),
      value: stats.totalOrders,
      icon: ShoppingBagIcon,
      color: "text-blue-600",
    },
    {
      title: t("dashboard.customer.activeOrders"),
      value: stats.activeOrders,
      icon: TrendingUpIcon,
      color: "text-green-600",
    },
    {
      title: t("dashboard.customer.favorites"),
      value: stats.favorites,
      icon: HeartIcon,
      color: "text-red-500",
    },
    {
      title: t("dashboard.customer.points"),
      value: stats.points,
      icon: StarIcon,
      color: "text-yellow-500",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Welcome */}
      <div>
        <h2 className="text-2xl font-bold tracking-tight">
          {t("dashboard.customer.welcome")}
        </h2>
        <p className="text-muted-foreground">
          {t("dashboard.customer.welcomeDesc")}
        </p>
      </div>

      <Separator />

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.title}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {stat.title}
                </CardTitle>
                <Icon className={`h-4 w-4 ${stat.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Recent Orders */}
      <Card>
        <CardHeader>
          <CardTitle>{t("dashboard.customer.recentOrders")}</CardTitle>
        </CardHeader>
        <CardContent>
          {orders.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              {t("dashboard.customer.noOrders")}
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">
                      {t("dashboard.customer.orderNumber")}
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">
                      {t("dashboard.customer.store")}
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">
                      {t("dashboard.customer.status")}
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">
                      {t("dashboard.customer.amount")}
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">
                      {t("dashboard.customer.date")}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((order) => (
                    <tr key={order.id} className="border-b last:border-0">
                      <td className="py-3 px-4 text-sm font-medium">
                        {order.order_number}
                      </td>
                      <td className="py-3 px-4 text-sm">{order.store_name}</td>
                      <td className="py-3 px-4">
                        {getStatusBadge(order.status, t)}
                      </td>
                      <td className="py-3 px-4 text-sm font-medium">
                        {order.total_amount.toFixed(2)} SAR
                      </td>
                      <td className="py-3 px-4 text-sm text-muted-foreground">
                        {new Date(order.created_at).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
