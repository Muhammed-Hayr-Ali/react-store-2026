import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Users,
  DollarSign,
  ShoppingCart,
  TrendingUp,
  Package,
  Tag,
  ClipboardList,
  Activity,
} from "lucide-react"

export default function AdminDashboard() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
        <p className="text-muted-foreground">
          Manage users, roles, subscription plans, and system configuration
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1,234</div>
            <p className="text-xs text-muted-foreground">+20 from last month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$45,231</div>
            <p className="text-xs text-muted-foreground">
              +20.1% from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Active Subscriptions
            </CardTitle>
            <Tag className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">573</div>
            <p className="text-xs text-muted-foreground">
              +201 since last hour
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Growth</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+12.5%</div>
            <p className="text-xs text-muted-foreground">+4% from last month</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Sections */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        {/* Recent Users Table */}
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Recent Users</CardTitle>
            <CardDescription>
              Latest registered users with their roles
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
                    <div className="h-10 w-10 rounded-full bg-muted" />
                    <div>
                      <p className="text-sm font-medium">User {i}</p>
                      <p className="text-xs text-muted-foreground">
                        user{i}@example.com
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="rounded-full bg-primary/10 px-2 py-1 text-xs text-primary">
                      {["admin", "vendor", "customer", "delivery"][i % 4]}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      Active
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Subscription Plans Overview */}
        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Subscription Plans</CardTitle>
            <CardDescription>Active plans distribution</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {[
              { name: "Free Seller", count: 234, color: "bg-blue-500" },
              {
                name: "Professional Seller",
                count: 156,
                color: "bg-green-500",
              },
              { name: "Free Delivery", count: 89, color: "bg-orange-500" },
              { name: "Free Member", count: 754, color: "bg-purple-500" },
            ].map((plan) => (
              <div
                key={plan.name}
                className="flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <div className={`h-3 w-3 rounded-full ${plan.color}`} />
                  <span className="text-sm font-medium">{plan.name}</span>
                </div>
                <span className="text-sm font-bold">{plan.count}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* System Health & Activity */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              System Activity
            </CardTitle>
            <CardDescription>Real-time system metrics</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Server Load</span>
                <span>45%</span>
              </div>
              <div className="h-2 rounded-full bg-muted">
                <div className="h-2 w-[45%] rounded-full bg-primary" />
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Database Connections</span>
                <span>72/100</span>
              </div>
              <div className="h-2 rounded-full bg-muted">
                <div className="h-2 w-[72%] rounded-full bg-primary" />
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>API Requests/min</span>
                <span>1,234</span>
              </div>
              <div className="h-2 rounded-full bg-muted">
                <div className="h-2 w-[65%] rounded-full bg-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common admin tasks</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3">
              <button className="rounded-lg border p-3 text-sm hover:bg-accent">
                Add User
              </button>
              <button className="rounded-lg border p-3 text-sm hover:bg-accent">
                Create Role
              </button>
              <button className="rounded-lg border p-3 text-sm hover:bg-accent">
                New Plan
              </button>
              <button className="rounded-lg border p-3 text-sm hover:bg-accent">
                View Logs
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
