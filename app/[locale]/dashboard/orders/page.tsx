import OrdersPage from "@/components/dashboard/orders/orders-page";
import { createMetadata } from "@/lib/metadata";

// إضافة بيانات وصفية (Metadata) للصفحة
export const metadata = createMetadata({
  title: "My Orders",
  description: "View your order history.",
});

export default function Page() {
  return <OrdersPage />;
}
