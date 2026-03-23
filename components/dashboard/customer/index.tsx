import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Package,
  Heart,
  Ticket,
  Truck,
  ShoppingBag,
  Star,
  CreditCard,
  MapPin,
} from "lucide-react"

export default function CustomerDashboard() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          Customer Dashboard
        </h1>
        <p className="text-muted-foreground">
          View your orders, wishlist, reviews, and account settings
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
            <ShoppingBag className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">15</div>
            <p className="text-xs text-muted-foreground">3 pending delivery</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Wishlist</CardTitle>
            <Heart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">8</div>
            <p className="text-xs text-muted-foreground">2 items on sale</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Coupons</CardTitle>
            <Ticket className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">3</div>
            <p className="text-xs text-muted-foreground">1 expires soon</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Reviews</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12</div>
            <p className="text-xs text-muted-foreground">4.8 average rating</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Sections */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        {/* Recent Orders */}
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Recent Orders</CardTitle>
            <CardDescription>
              Your latest purchases and their status
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
                      <ShoppingBag className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">Order #{2000 + i}</p>
                      <p className="text-xs text-muted-foreground">
                        {i === 1
                          ? "Out for delivery"
                          : i === 2
                            ? "Processing"
                            : i === 3
                              ? "Shipped"
                              : "Delivered"}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium">
                      ${(Math.random() * 100 + 30).toFixed(2)}
                    </div>
                    <button className="text-xs text-primary hover:underline">
                      {i === 1 ? "Track" : i === 4 ? "Reorder" : "View"}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Wishlist Items */}
        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>My Wishlist</CardTitle>
            <CardDescription>Saved items for later</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded bg-muted">
                    <ShoppingBag className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Product {i}</p>
                    <p className="text-xs text-muted-foreground">
                      {i === 2
                        ? "On Sale! -20%"
                        : `$${(Math.random() * 50 + 20).toFixed(2)}`}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button className="text-xs text-primary hover:underline">
                    Add to Cart
                  </button>
                  <Heart className="h-4 w-4 fill-red-500 text-red-500" />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Available Coupons & Addresses */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Ticket className="h-5 w-5" />
              Available Coupons
            </CardTitle>
            <CardDescription>Your active discount codes</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              {[
                { code: "SAVE20", discount: "20% OFF", expires: "7 days" },
                {
                  code: "FREESHIP",
                  discount: "Free Shipping",
                  expires: "3 days",
                },
                { code: "NEW10", discount: "$10 OFF", expires: "14 days" },
              ].map((coupon, i) => (
                <div key={i} className="space-y-2 rounded-lg border p-4">
                  <p className="text-sm font-bold text-primary">
                    {coupon.code}
                  </p>
                  <p className="text-lg font-semibold">{coupon.discount}</p>
                  <p className="text-xs text-muted-foreground">
                    Expires in {coupon.expires}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Saved Addresses
            </CardTitle>
            <CardDescription>Your delivery addresses</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[1, 2].map((i) => (
                <div
                  key={i}
                  className="flex items-start justify-between rounded-lg border p-4"
                >
                  <div className="flex items-start gap-3">
                    <MapPin className="mt-0.5 h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">
                        {i === 1 ? "Home" : "Work"}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {i === 1
                          ? "123 Main St, Riyadh"
                          : "456 Business Ave, Jeddah"}
                      </p>
                    </div>
                  </div>
                  <button className="text-xs text-primary hover:underline">
                    Edit
                  </button>
                </div>
              ))}
              <button className="w-full text-center text-sm text-primary hover:underline">
                + Add New Address
              </button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* My Reviews */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Star className="h-5 w-5" />
            My Reviews
          </CardTitle>
          <CardDescription>Products you have reviewed</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="flex items-center justify-between border-b pb-4 last:border-0"
              >
                <div className="flex items-center gap-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded bg-muted">
                    <Package className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Product {i}</p>
                    <div className="flex items-center gap-1">
                      {[...Array(5)].map((_, j) => (
                        <Star
                          key={j}
                          className={`h-3 w-3 ${j < 5 - i + 1 ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground"}`}
                        />
                      ))}
                    </div>
                  </div>
                </div>
                <button className="text-xs text-primary hover:underline">
                  Edit Review
                </button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
