"use client"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Truck,
  Package,
  DollarSign,
  MapPin,
  Star,
  Calendar,
  Clock,
  CheckCircle,
  Navigation,
  CreditCard,
} from "lucide-react"
import { useTranslations } from "next-intl"

export default function DeliveryDashboard() {
  const t = useTranslations("deliveryDashboard")

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">{t("title")}</h1>
        <p className="text-muted-foreground">{t("description")}</p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t("stats.availableDeliveries")}
            </CardTitle>
            <Truck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">7</div>
            <p className="text-xs text-muted-foreground">
              3 {t("stats.urgent")}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t("stats.completedToday")}
            </CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12</div>
            <p className="text-xs text-muted-foreground">
              {t("stats.goal")}: 15
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t("stats.earnings")}
            </CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$234</div>
            <p className="text-xs text-muted-foreground">
              +12% {t("stats.fromYesterday")}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t("stats.rating")}
            </CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">4.8</div>
            <p className="text-xs text-muted-foreground">
              {t("stats.basedOnReviews")} 156
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Sections */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        {/* Active Deliveries */}
        <Card className="lg:col-span-4">
          <CardHeader>
            <CardTitle>{t("availableDeliveries.title")}</CardTitle>
            <CardDescription>
              {t("availableDeliveries.description")}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <div
                  key={i}
                  className="flex items-center justify-between border-b pb-4 last:border-0"
                >
                  <div className="flex items-center gap-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
                      <Truck className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">
                        Delivery #{3000 + i}
                      </p>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <MapPin className="h-3 w-3" />
                        <span>
                          {i === 1 ? "2.5 km" : i === 2 ? "5.1 km" : "8.3 km"}{" "}
                          {t("availableDeliveries.away")}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <div className="text-sm font-medium">
                        ${[12.5, 8.75, 15.25, 10.0, 18.99][i - 1]}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {i === 1
                          ? t("availableDeliveries.urgent")
                          : t("availableDeliveries.standard")}
                      </div>
                    </div>
                    <button className="rounded bg-primary px-3 py-1.5 text-xs text-primary-foreground hover:bg-primary/90">
                      {t("availableDeliveries.accept")}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Today's Route */}
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>{t("route.title")}</CardTitle>
            <CardDescription>{t("route.description")}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex items-center gap-4">
                <div className="flex flex-col items-center">
                  <div
                    className={`h-3 w-3 rounded-full ${
                      i === 1
                        ? "bg-green-500"
                        : i === 2
                          ? "animate-pulse bg-primary"
                          : "bg-muted"
                    }`}
                  />
                  {i < 5 && <div className="h-8 w-0.5 bg-muted" />}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium">
                    {t("route.stop")} {i}: Customer {i}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {i === 1
                      ? t("route.completed")
                      : i === 2
                        ? `${t("route.inProgress")} - ${t("route.eta")} 15 min`
                        : t("route.pending")}
                  </p>
                </div>
                {i === 2 && <Navigation className="h-4 w-4 text-primary" />}
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Earnings & Performance */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              {t("earnings.title")}
            </CardTitle>
            <CardDescription>{t("earnings.description")}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <div className="rounded-lg bg-muted/50 p-3 text-center">
                <p className="text-xs text-muted-foreground">
                  {t("earnings.today")}
                </p>
                <p className="text-lg font-bold">$234</p>
              </div>
              <div className="rounded-lg bg-muted/50 p-3 text-center">
                <p className="text-xs text-muted-foreground">
                  {t("earnings.thisWeek")}
                </p>
                <p className="text-lg font-bold">$1,456</p>
              </div>
              <div className="rounded-lg bg-muted/50 p-3 text-center">
                <p className="text-xs text-muted-foreground">
                  {t("earnings.thisMonth")}
                </p>
                <p className="text-lg font-bold">$5,234</p>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>{t("earnings.deliveriesCompleted")}</span>
                <span>45/50</span>
              </div>
              <div className="h-2 rounded-full bg-muted">
                <div className="h-2 w-[90%] rounded-full bg-primary" />
              </div>
            </div>
            <button className="w-full text-sm text-primary hover:underline">
              {t("earnings.withdrawEarnings")}
            </button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Star className="h-5 w-5" />
              {t("performance.title")}
            </CardTitle>
            <CardDescription>{t("performance.description")}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>{t("performance.onTimeRate")}</span>
                <span>94%</span>
              </div>
              <div className="h-2 rounded-full bg-muted">
                <div className="h-2 w-[94%] rounded-full bg-primary" />
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>{t("performance.customerSatisfaction")}</span>
                <span>4.8/5</span>
              </div>
              <div className="h-2 rounded-full bg-muted">
                <div className="h-2 w-[96%] rounded-full bg-primary" />
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>{t("performance.completionRate")}</span>
                <span>98%</span>
              </div>
              <div className="h-2 rounded-full bg-muted">
                <div className="h-2 w-[98%] rounded-full bg-primary" />
              </div>
            </div>
            <div className="border-t pt-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  <span className="text-sm font-medium">
                    {t("performance.level")} 2 {t("performance.partner")}
                  </span>
                </div>
                <span className="text-xs text-muted-foreground">
                  12 {t("performance.moreDeliveriesTo")}{" "}
                  {t("performance.level")} 3
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Subscription Plan */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            {t("subscription.title")}
          </CardTitle>
          <CardDescription>{t("subscription.description")}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between rounded-lg bg-primary/10 p-4">
            <div>
              <p className="text-lg font-bold text-primary">
                {t("subscription.freeDeliveryPartner")}
              </p>
              <p className="text-xs text-muted-foreground">
                {t("subscription.basicFeatures")}
              </p>
            </div>
            <button className="text-sm text-primary hover:underline">
              {t("subscription.upgradePlan")}
            </button>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-4 md:grid-cols-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">∞</div>
              <p className="text-xs text-muted-foreground">
                {t("subscription.acceptDeliveries")}
              </p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">✓</div>
              <p className="text-xs text-muted-foreground">
                {t("subscription.trackEarnings")}
              </p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-muted-foreground">✗</div>
              <p className="text-xs text-muted-foreground">
                {t("subscription.schedule")}
              </p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-muted-foreground">✗</div>
              <p className="text-xs text-muted-foreground">
                {t("subscription.exportData")}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
