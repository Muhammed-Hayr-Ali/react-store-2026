// components\products\ProductDetails.tsx

"use client";

import { useState, ReactNode } from "react";
import { User } from "@supabase/supabase-js";
import { Option } from "react-day-picker";
import { ImageGallery } from "./image-gallery";
import { Separator } from "../ui/separator";
import ProductInfo from "./productInfo";
import { Variants } from "./variants";
import SummaryReviews from "./summary-reviews";
import ReviewsList from "./reviews";
import { AddReviewGuestForm } from "../reviews/add-review-guest-form";
import { AddReviewUserForm } from "../reviews/add-review-user-form";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Content } from "../editor/content";
import { ProductDetailResponse, ProductVariant } from "@/lib/actions/products";

// ============================================================================
// Types & Interfaces
// ============================================================================


export interface OptionValue {
  value: string;
  unit?: string;
}

export interface Option {
  name: string;
  values: OptionValue[]; // تغيير من string[] إلى OptionValue[]
}


export interface VariantsChildProps {
  options: Option[];
  selectedOptions: Record<string, string>;
  onOptionSelect: (optionName: string, value: string) => void;
}

export interface VariantsProps {
  options?: Option[];
  selectedOptions?: Record<string, string>;
  onOptionSelect?: (optionName: string, value: string) => void;
  variants?: ProductVariant[];
}

export interface ProductInfoProps {
  product: ProductDetailResponse["product"];
  isInitiallyWishlisted: boolean;
  averageRating: number;
  totalReviews: number;
  children?: ReactNode;
  activeVariantFromProps: ProductVariant | undefined; // ✅ استقبال الحالة
  onVariantChange: (variant: ProductVariant | undefined) => void; // ✅ استقبال دالة التحديث
}

export interface ProductDetailsProps {
  user: User | null;
  data: ProductDetailResponse;
}

// ============================================================================
// Utility Functions
// ============================================================================

export const getOrganizedOptions = (
  variants: ProductDetailResponse["product"]["variants"],
): Option[] => {
  const optionsMap = new Map<string, Map<string, string | undefined>>();

  variants.forEach((variant) => {
    variant.variant_option_values.forEach((vo) => {
      const optionData = vo.product_option_values;
      if (optionData && optionData.product_options) {
        const optionName = optionData.product_options.name;
        const optionValue = optionData.value;
        const optionUnit = optionData.product_options.unit;

        if (!optionsMap.has(optionName)) {
          optionsMap.set(optionName, new Map());
        }
        // تخزين القيمة كمفتاح والوحدة كقيمة (لتجنب التكرار)
        optionsMap.get(optionName)!.set(optionValue, optionUnit);
      }
    });
  });

  return Array.from(optionsMap.entries()).map(([name, valuesMap]) => ({
    name,
    values: Array.from(valuesMap.entries()).map(([value, unit]) => ({
      value,
      unit,
    })),
  }));
};


// ============================================================================
// Main Export - ProductDetails Component
// ============================================================================

export default function ProductDetails({ user, data }: ProductDetailsProps) {
  const product = data.product;
  const variants = product.variants;

  const [activeVariant, setActiveVariant] = useState<
    ProductVariant | undefined
  >(() => product.variants.find((v) => v.is_default) || product.variants[0]);

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-8">
        {/* Image Gallery */}
        <ImageGallery product={product} activeVariant={activeVariant} />
        {/* Product Info */}
        <ProductInfo
          product={product}
          isInitiallyWishlisted={data.initiallyWishlisted}
          averageRating={data.summaryReviews.averageRating}
          totalReviews={data.summaryReviews.totalReviews}
          activeVariantFromProps={activeVariant}
          onVariantChange={setActiveVariant}
        >
          <Variants variants={product.variants} />
        </ProductInfo>
      </div>

      {/* Separator */}

      {product.description && (
        <>
          <Separator className="my-12 lg:my-16" />
          <div>
            <h3 className="text-xl font-semibold mb-2">Product Description</h3>
            <Content html={product.description} />
          </div>
        </>
      )}
      {/* Separator */}
      <Separator className="my-12 lg:my-16" />

      {/* Summary Section for Reviews */}
      <SummaryReviews
        averageRating={data.summaryReviews.averageRating}
        totalReviews={data.summaryReviews.totalReviews}
      />

      {/* Reviews List */}
      <ReviewsList
        reviews={data.reviews}
        totalReviews={data.reviews.length}
        userId={user?.id}
        productSlug={product.slug}
      />

      {/* write review for guest */}
      <Card className="shadow-none rounded-none mt-16 mb-10">
        <CardHeader>
          <CardTitle>Leave a Review</CardTitle>
        </CardHeader>
        <CardContent>
          {user ? (
            <AddReviewUserForm
              productId={product.id}
              productSlug={product.slug}
            />
          ) : (
            <AddReviewGuestForm
              productId={product.id}
              productSlug={product.slug}
            />
          )}
        </CardContent>
      </Card>
    </>
  );
}

