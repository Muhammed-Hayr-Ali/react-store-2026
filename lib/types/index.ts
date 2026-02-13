import { SVGProps } from "react";

export type IconSvgProps = SVGProps<SVGSVGElement> & {
  size?: number;
};



//=====================================================================
// Response Status
//=====================================================================
export type ResponseStatus<T = null> = {
  success: boolean;
  error?: string | null;
  message?: string | null;
  data?: T;
};




// تحديث نوع بيانات العنوان
export interface Address {
  id: string;
  user_id: string;
  created_at: string;
  address_name: string;
  country: string;
  province: string;
  city: string;
  street: string;
  country_code: string;
  phone_number: string;
  flag: string;
  notes?: string | null;
  isDefault: boolean;
  location?: Location | null;
}

export type PaymentStatus = "pending" | "paid" | "failed";
export type ShipmentStatus =
  | "pending"
  | "processing"
  | "shipped"
  | "delivered"
  | "cancelled";

export interface Order {
  id: number;
  created_at: string;
  user_id: string;
  total_amount: number;
  payment_status: PaymentStatus;
  shipment_status: ShipmentStatus;
  // يمكنك إضافة حقول أخرى هنا مثل order_items إذا كنت ستجلبها
}


export type ServerActionResponse = {
  success: boolean;
  error?: string | null;
  message?: string | null;
  requiresReauthentication?: boolean;
};



export type CartItemWithDetails = {
  id: string;
  quantity: number;
  product_variants: {
    id: string;
    price: number;
    discount_price: number | null;
    products: {
      id: string;
      name: string;
      // أضف أي حقول أخرى تحتاجها من المنتجات
    } | null;
  } | null;
};

export type CartWithDetails = {
  id: string;
  user_id: string;
  cart_items: CartItemWithDetails[];
};

