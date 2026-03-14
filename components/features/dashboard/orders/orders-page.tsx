import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { ArrowRight } from "lucide-react";
import { createServerClient } from "@/lib/supabase/createServerClient";

// تعريف نوع ملخص الطلب
type OrderSummary = {
  id: string;
  created_at: string;
  total_amount: number;
  status: string;
};

// دالة لجلب ملخص طلبات المستخدم
async function getUserOrders(): Promise<OrderSummary[]> {
  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return [];
  }

  const { data: orders, error } = await supabase
    .from("orders")
    .select("id, created_at, total_amount, status")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching user orders:", error);
    return [];
  }

  return orders;
}

// مكون الصفحة الرئيسي
export default async function OrdersPage() {
  const orders = await getUserOrders();


  

  if (orders.length === 0)
    return (
      <div className="flex flex-1 h-full items-center justify-center rounded-lg border border-dashed">
        <div className="flex flex-col items-center gap-2 text-center">
          <h2 className="text-xl font-semibold">No Orders Found</h2>
          <p className="text-muted-foreground mt-2">
            You haven&#39;t placed any orders yet.
          </p>
          <Link
            href="/"
            className="mt-4 inline-block bg-primary text-primary-foreground px-6 py-2 rounded-md"
          >
            Start Shopping
          </Link>
        </div>
      </div>
    );

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">My Orders</h1>

      <div className="space-y-4">
        {orders.map((order) => (
          <OrderCard key={order.id} order={order} />
        ))}
      </div>
    </div>
  );
}

// مكون فرعي لعرض بطاقة طلب واحدة
function OrderCard({ order }: { order: OrderSummary }) {
  return (
    <Link
      href={`/dashboard/orders/${order.id}`}
      className="block border rounded-lg p-4 hover:bg-muted/50 transition-colors"
    >
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div className="grow">
          <div className="flex items-center gap-4 mb-2">
            <p className="font-bold text-lg">
              Order #{order.id.substring(0, 8)}
            </p>
            <Badge
              variant={order.status === "Processing" ? "default" : "secondary"}
            >
              <p className="text-[10px]">{order.status}</p>
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground">
            Placed on:{" "}
            {new Date(order.created_at).toLocaleDateString("en-US", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </p>
        </div>
        <div className="flex items-center justify-between sm:justify-end gap-6">
          <p className="text-xl font-semibold">
            ${order.total_amount.toFixed(2)}
          </p>
          <div className="text-primary hidden sm:block">
            <ArrowRight className="h-6 w-6" />
          </div>
        </div>
      </div>
    </Link>
  );
}
