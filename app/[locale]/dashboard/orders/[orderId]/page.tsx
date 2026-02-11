import OrderDetailsPage from "@/components/dashboard/orders/order-details";
import { createMetadata } from "@/lib/metadata";


type Props = {
  params: Promise<{ orderId: string }>;
};

export async function generateMetadata({ params }: Props) {
  const { orderId } = await params;
  return createMetadata({
    title: `Details for Order #${orderId ? orderId.substring(0, 8) : ""}`,
    description: `View the full details for your order.`,
  });
}

export default async function Page({ params }: Props) {
  const { orderId } = await params;

  return <OrderDetailsPage orderId={orderId} />;
}
