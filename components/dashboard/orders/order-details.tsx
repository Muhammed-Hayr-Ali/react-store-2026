import { notFound } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { getOrderDetails } from "@/lib/actions/order";

// مكون الصفحة الرئيسي
export default async function OrderDetailsPage({
  orderId,
}: {
  orderId: string;
}) {
  const response = await getOrderDetails(orderId);

  if (!response.data) {
    notFound();
  }

  const order = response.data;
  const shipping = response.data.shipping_address;

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold">Order Details</h1>
          <p className="text-muted-foreground">Order #{order.id}</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-muted-foreground">Status:</span>
          <Badge
            variant={order.status === "Processing" ? "default" : "secondary"}
          >
            <p className="text-[10px]">{order.status}vbn</p>
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* العمود الرئيسي: تفاصيل المنتجات والأسعار */}
        <div className="lg:col-span-2 space-y-8">
          {/* ملخص المنتجات */}
          <div className="border rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Items Ordered</h2>
            <div className="space-y-4">
              {order.order_items.map((item) => (
                <div key={item.id} className="flex justify-between items-start">
                  <div>
                    <p className="font-medium">{item.product_name}</p>
                    <p className="text-sm text-muted-foreground">
                      Qty: {item.quantity}
                    </p>
                  </div>
                  <p className="font-medium">
                    ${(item.price_at_purchase * item.quantity).toFixed(2)}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* ملخص الأسعار */}
          <div className="border rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Price Summary</h2>
            <div className="space-y-2">
              <div className="flex justify-between">
                <p>Subtotal</p>
                <p>${order.subtotal.toFixed(2)}</p>
              </div>
              <div className="flex justify-between">
                <p>Shipping</p>
                <p>${order.shipping_cost.toFixed(2)}</p>
              </div>
              <div className="flex justify-between">
                <p>Taxes</p>
                <p>${order.taxes.toFixed(2)}</p>
              </div>
              <hr className="my-2" />
              <div className="flex justify-between text-lg font-bold">
                <p>Total</p>
                <p>${order.total_amount.toFixed(2)}</p>
              </div>
            </div>
          </div>
        </div>

        {/* العمود الجانبي: عنوان الشحن */}
        <div className="lg:col-span-1">
          <div className="border rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Shipping Address</h2>
            <div className="text-muted-foreground space-y-1">
              <p className="font-medium text-foreground">
                {shipping.first_name} {shipping.last_name}
              </p>
              <p>{shipping.address}</p>
              <p>
                {shipping.city}, {shipping.state} {shipping.zip}
              </p>
              <p>{shipping.country}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
