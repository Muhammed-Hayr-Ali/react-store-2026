
//=====================================================================
// Create Order Payload
//=====================================================================
export type CreateOrderPayload = {
  selectedAddressId: string;
  [key: string]: unknown;
};

//=====================================================================
// Select Order Payload
//=====================================================================
export type OrderDetailsPayload = {
  orderId: string;
  [key: string]: unknown;
};



//=====================================================================
// Order item details Types
//=====================================================================
export type OrderItemWithDetails = {
  id: string;
  quantity: number;
  price_at_purchase: number;
  product_name: string;
  variant_options: string | null;
};

//=====================================================================
// Order with details Types
export type OrderWithDetails = {
  id: string;
  created_at: string;
  status: string;
  subtotal: number;
  shipping_cost: number;
  taxes: number;
  total_amount: number;
  shipping_address: {
    first_name: string;
    last_name: string;
    address: string;
    city: string;
    state: string;
    zip: string;
    country: string;
  };
  order_items: OrderItemWithDetails[];
};

