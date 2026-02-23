// lib/types/product.ts

export interface ProductOption {
  id: string;
  name: string;
  description: string | null;
}

export interface ProductOptionValue {
  id: string;
  option_id: string;
  value: string;
}

export interface VariantOptionValue {
  option_value: {
    id: string;
    value: string;
    product_options: {
      id: string;
      name: string;
    };
  };
}

export interface ProductVariantFormData {
  sku: string;
  price: number;
  discount_price?: number;
  discount_expires_at?: string;
  stock_quantity: number;
  image_url?: string;
  is_default: boolean;
  variant_options: VariantOptionValue[];
}

export interface ProductFormData {
  name: string;
  slug: string;
  description: string;
  short_description?: string;
  main_image_url?: string;
  image_urls?: string[] | null;
  category_id: string | null;
  brand_id: string | null;
  tags?: string[] | null;
  is_available: boolean;
  is_featured: boolean;
  variants: ProductVariantFormData[];
}
