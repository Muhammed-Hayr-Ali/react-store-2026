// src/emails/order-confirmation-email.tsx

import {
  Heading,
  Text,
  Section,
  Hr,
  Row,
  Column,
  Link,
} from "@react-email/components";
import { MasterTemplate } from "./templates/master-template";
import { OrderWithDetails } from "@/lib/actions/order";

interface OrderConfirmationEmailProps {
  order: OrderWithDetails;
  userName?: string;
}

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";

export const OrderConfirmationEmail = ({
  order,
  userName,
}: OrderConfirmationEmailProps) => {
  const previewText = `Thanks for your order! Order ID: ${order.id.substring(0, 8)}`;
  const shipping = order.shipping_address;
  const customerName = userName || shipping.first_name || "Valued Customer";

  return (
    <MasterTemplate
      previewText={previewText}
      pageTitle="Your Order Confirmation"
      locale="en"
    >
      <Heading as="h1" className="text-3xl font-bold text-center mb-6">
        Thanks for your order!
      </Heading>

      <Section>
        <Text className="text-base leading-relaxed">Hi {customerName},</Text>
        <Text className="text-base leading-relaxed">
          We&#39;ve received your order and are getting it ready. We&#39;ll
          notify you once it has shipped.
        </Text>
      </Section>

      <Hr className="border-gray-200 my-6" />

      <Section>
        <Row className="mb-4">
          <Column>
            <Text className="text-base font-semibold m-0">Order ID</Text>
            <Text className="text-base text-gray-600 m-0">{order.id}</Text>
          </Column>
          <Column className="text-right">
            <Text className="text-base font-semibold m-0">Order Date</Text>
            <Text className="text-base text-gray-600 m-0">
              {new Date(order.created_at).toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </Text>
          </Column>
        </Row>
      </Section>

      <Hr className="border-gray-200 my-6" />

      <Section>
        <Heading as="h2" className="text-xl font-semibold mb-4">
          Order Summary
        </Heading>
        {order.order_items.map((item) => (
          <Row key={item.id} className="mb-2">
            <Column>
              <Text className="text-base m-0">
                {item.product_name} (x{item.quantity})
              </Text>
            </Column>
            <Column className="text-right">
              <Text className="text-base font-medium m-0">
                ${(item.price_at_purchase * item.quantity).toFixed(2)}
              </Text>
            </Column>
          </Row>
        ))}
        <Hr className="border-gray-200 my-4" />
        <Row>
          <Column>
            <Text className="text-lg font-bold m-0">Total</Text>
          </Column>
          <Column className="text-right">
            <Text className="text-lg font-bold m-0">
              ${order.total_amount.toFixed(2)}
            </Text>
          </Column>
        </Row>
      </Section>

      <Hr className="border-gray-200 my-6" />

      <Section>
        <Heading as="h2" className="text-xl font-semibold mb-4">
          Shipping to
        </Heading>
        <div className="bg-gray-100 rounded-lg p-4 text-base">
          <Text className="m-0 font-semibold">
            {shipping.first_name} {shipping.last_name}
          </Text>
          <Text className="m-0">{shipping.address}</Text>
          <Text className="m-0">
            {shipping.city}, {shipping.state} {shipping.zip}
          </Text>
          <Text className="m-0">{shipping.country}</Text>
        </div>
      </Section>

      <Section className="mt-8 text-center">
        <Link
          href={`${baseUrl}/dashboard/orders`}
          className="text-blue-600 underline"
        >
          View My Orders
        </Link>
      </Section>
    </MasterTemplate>
  );
};

export default OrderConfirmationEmail;
