"use client";

import { useState, ReactNode } from "react";
import { FullProduct, Review, ProductVariant } from "@/lib/types";
import { User } from "@supabase/supabase-js";
import { Option } from "react-day-picker";
import { ImageGallery } from "./image-gallery";
import { Separator } from "../ui/separator";
import ProductInfo from "./productInfo";
import { Variants } from "./variants";
import SummaryReviews from "./summary-reviews";
import ReviewsList from "./reviews";
import WriteReview from "./review-form";

// ============================================================================
// Types & Interfaces
// ============================================================================

export interface Option {
  name: string;
  values: string[];
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
  product: FullProduct;
  isInitiallyWishlisted: boolean;
  averageRating: number;
  totalReviews: number;
  children?: ReactNode;
  activeVariantFromProps: ProductVariant | undefined; // ✅ استقبال الحالة
  onVariantChange: (variant: ProductVariant | undefined) => void; // ✅ استقبال دالة التحديث
}

export interface ProductDetailsProps {
  user: User | null | undefined;
  product: FullProduct;
  isInitiallyWishlisted: boolean;
  averageRating: number;
  totalReviews: number;
  reviews: Review[];
  errorReviews: string | undefined;
}

// ============================================================================
// Utility Functions
// ============================================================================

export const getOrganizedOptions = (
  variants: FullProduct["variants"],
): Option[] => {
  const optionsMap = new Map<string, Set<string>>();

  variants.forEach((variant) => {
    // ✅ المسار الصحيح للوصول إلى البيانات
    variant.variant_option_values.forEach((vo) => {
      const optionData = vo.product_option_values;
      if (optionData && optionData.product_options) {
        const optionName = optionData.product_options.name;
        const optionValue = optionData.value;

        if (!optionsMap.has(optionName)) {
          optionsMap.set(optionName, new Set());
        }
        optionsMap.get(optionName)!.add(optionValue);
      }
    });
  });

  return Array.from(optionsMap.entries()).map(([name, values]) => ({
    name,
    values: Array.from(values),
  }));
};

// ============================================================================
// Main Export - ProductDetails Component
// ============================================================================

export default function ProductDetails({
  user,
  product,
  isInitiallyWishlisted,
  averageRating,
  totalReviews,
  reviews,
  errorReviews,
}: ProductDetailsProps) {
  // الحالة النشطة للمتغير (النوع المحدد)
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
          isInitiallyWishlisted={isInitiallyWishlisted}
          averageRating={averageRating}
          totalReviews={totalReviews}
          activeVariantFromProps={activeVariant}
          onVariantChange={setActiveVariant}
        >
          <Variants variants={product.variants} />
        </ProductInfo>
      </div>

      {/* Separator */}
      <Separator className="my-12 lg:my-16" />

      {product.description && (
        <div>
          <h3 className="text-xl font-semibold mb-2">Product Description</h3>
          <div
            className="prose dark:prose-invert max-w-none"
            dangerouslySetInnerHTML={{ __html: product.description }}
          />
        </div>
      )}
      {/* Separator */}
      <Separator className="my-12 lg:my-16" />

      {/* Summary Section for Reviews */}
      <SummaryReviews
        averageRating={averageRating}
        totalReviews={totalReviews}
      />

      {/* Review Form */}
      <WriteReview
        productId={product.id}
        productName={product.name}
        productSlug={product.slug}
      />

      {/* Reviews List */}
      <ReviewsList
        reviews={reviews}
        errorReviews={errorReviews}
        totalReviews={totalReviews}
        userId={user?.id}
        productSlug={product.slug}
      />
    </>
  );
}
