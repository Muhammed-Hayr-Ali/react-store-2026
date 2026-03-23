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

export default function DeliveryDashboard() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          Delivery Partner Dashboard
        </h1>
        <p className="text-muted-foreground">
          Manage deliveries, track earnings, and view your performance
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Available Deliveries
            </CardTitle>
            <Truck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">7</div>
            <p className="text-xs text-muted-foreground">3 urgent</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Completed Today
            </CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12</div>
            <p className="text-xs text-muted-foreground">Goal: 15</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Earnings</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$234</div>
            <p className="text-xs text-muted-foreground">+12% from yesterday</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Rating</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">4.8</div>
            <p className="text-xs text-muted-foreground">
              Based on 156 reviews
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Sections */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        {/* Active Deliveries */}
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Available Deliveries</CardTitle>
            <CardDescription>Delivery tasks you can accept</CardDescription>
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
                          away
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <div className="text-sm font-medium">
                        ${(Math.random() * 15 + 5).toFixed(2)}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {i === 1 ? "Urgent" : "Standard"}
                      </div>
                    </div>
                    <button className="rounded bg-primary px-3 py-1.5 text-xs text-primary-foreground hover:bg-primary/90">
                      Accept
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Today's Route */}
        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Today's Route</CardTitle>
            <CardDescription>Active delivery stops</CardDescription>
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
                    Stop {i}: Customer {i}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {i === 1
                      ? "Completed"
                      : i === 2
                        ? "In progress - ETA 15 min"
                        : "Pending"}
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
              Earnings Overview
            </CardTitle>
            <CardDescription>Your income breakdown</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <div className="rounded-lg bg-muted/50 p-3 text-center">
                <p className="text-xs text-muted-foreground">Today</p>
                <p className="text-lg font-bold">$234</p>
              </div>
              <div className="rounded-lg bg-muted/50 p-3 text-center">
                <p className="text-xs text-muted-foreground">This Week</p>
                <p className="text-lg font-bold">$1,456</p>
              </div>
              <div className="rounded-lg bg-muted/50 p-3 text-center">
                <p className="text-xs text-muted-foreground">This Month</p>
                <p className="text-lg font-bold">$5,234</p>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Deliveries Completed</span>
                <span>45/50</span>
              </div>
              <div className="h-2 rounded-full bg-muted">
                <div className="h-2 w-[90%] rounded-full bg-primary" />
              </div>
            </div>
            <button className="w-full text-sm text-primary hover:underline">
              Withdraw Earnings
            </button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Star className="h-5 w-5" />
              Performance Stats
            </CardTitle>
            <CardDescription>Your delivery metrics</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>On-Time Rate</span>
                <span>94%</span>
              </div>
              <div className="h-2 rounded-full bg-muted">
                <div className="h-2 w-[94%] rounded-full bg-primary" />
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Customer Satisfaction</span>
                <span>4.8/5</span>
              </div>
              <div className="h-2 rounded-full bg-muted">
                <div className="h-2 w-[96%] rounded-full bg-primary" />
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Completion Rate</span>
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
                  <span className="text-sm font-medium">Level 2 Partner</span>
                </div>
                <span className="text-xs text-muted-foreground">
                  12 more deliveries to Level 3
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
            My Subscription Plan
          </CardTitle>
          <CardDescription>Current plan and benefits</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between rounded-lg bg-primary/10 p-4">
            <div>
              <p className="text-lg font-bold text-primary">
                Free Delivery Partner
              </p>
              <p className="text-xs text-muted-foreground">Basic features</p>
            </div>
            <button className="text-sm text-primary hover:underline">
              Upgrade Plan
            </button>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-4 md:grid-cols-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">∞</div>
              <p className="text-xs text-muted-foreground">Accept Deliveries</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">✓</div>
              <p className="text-xs text-muted-foreground">Track Earnings</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-muted-foreground">✗</div>
              <p className="text-xs text-muted-foreground">Schedule</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-muted-foreground">✗</div>
              <p className="text-xs text-muted-foreground">Export Data</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
