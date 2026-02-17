"use client";

import {
  useState,
  useMemo,
  ReactNode,
  Children,
  cloneElement,
  isValidElement,
  ReactElement,
  useEffect,
} from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Minus, Plus } from "lucide-react";
import { FullProduct, Review, ProductVariant } from "@/lib/types";
import { User } from "@supabase/supabase-js";
import { Label } from "../ui/label";
import { Option } from "react-day-picker";
import { StarRating } from "../reviews/star-rating";
import WishlistButton from "./wishlist-button";
import AddToCartButton from "./add-to-cart-button";
import { ImageGallery } from "./image-gallery";
import { ReviewCard } from "../reviews/review-card";
import { Separator } from "../ui/separator";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import { AddReviewForm } from "../reviews/add-review-form";

// ============================================================================
// Types & Interfaces
// ============================================================================

interface Option {
  name: string;
  values: string[];
}

interface VariantsChildProps {
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

interface ProductInfoProps {
  product: FullProduct;
  isInitiallyWishlisted: boolean;
  averageRating: number;
  totalReviews: number;
  children?: ReactNode;
  activeVariantFromProps: ProductVariant | undefined; // ✅ استقبال الحالة
  onVariantChange: (variant: ProductVariant | undefined) => void; // ✅ استقبال دالة التحديث
}

interface ProductDetailsProps {
  user: User | null | undefined;
  product: FullProduct;
  isInitiallyWishlisted: boolean;
  averageRating: number;
  totalReviews: number;
  reviews: Review[];
  errorReviews: string | null| undefined;
}

// ============================================================================
// Utility Functions
// ============================================================================

const getOrganizedOptions = (variants: FullProduct["variants"]): Option[] => {
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
// AddToCartButton Component
// ============================================================================

// ============================================================================
// Variants Component
// ============================================================================

export function Variants({
  options,
  selectedOptions = {},
  onOptionSelect = () => {},
  variants,
}: VariantsProps) {
  const organizedOptions: Option[] = useMemo(() => {
    if (options && options.length > 0) {
      return options;
    }
    if (variants && variants.length > 0) {
      return getOrganizedOptions(variants);
    }
    return [];
  }, [options, variants]);

  if (organizedOptions.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4">
      {organizedOptions.map((option) => (
        <div key={option.name} className="space-y-2">
          <Label className="text-sm font-medium leading-none">
            {option.name}
          </Label>
          <div className="flex flex-wrap gap-2">
            {option.values.map((value) => {
              const isSelected = selectedOptions[option.name] === value;
              return (
                <Button
                  key={value}
                  type="button"
                  variant={isSelected ? "default" : "outline"}
                  onClick={() => onOptionSelect(option.name, value)}
                >
                  {value}
                </Button>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}

// ============================================================================
// ProductInfo Component
// ============================================================================

export function ProductInfo({
  product,
  isInitiallyWishlisted,
  averageRating,
  totalReviews,
  children,
  onVariantChange,
}: ProductInfoProps) {
  const organizedOptions = useMemo(
    () => getOrganizedOptions(product.variants),
    [product.variants],
  );

  const [selectedOptions, setSelectedOptions] = useState<
    Record<string, string>
  >(() => {
    const defaultVariant =
      product.variants.find((v) => v.is_default) || product.variants[0];
    const options: Record<string, string> = {};

    if (defaultVariant) {
      // ✅ المسار الصحيح للوصول إلى البيانات
      defaultVariant.variant_option_values.forEach((vo) => {
        const optionData = vo.product_option_values;
        if (optionData && optionData.product_options) {
          options[optionData.product_options.name] = optionData.value;
        }
      });
    }
    return options;
  });

  const handleOptionSelect = (optionName: string, value: string) => {
    setSelectedOptions((prev) => ({ ...prev, [optionName]: value }));
  };

  const activeVariant = useMemo(() => {
    return product.variants.find((variant) =>
      Object.entries(selectedOptions).every(([optionName, optionValue]) =>
        // ✅ المسار الصحيح للوصول إلى البيانات
        variant.variant_option_values.some(
          (vo) =>
            vo.product_option_values?.product_options?.name === optionName &&
            vo.product_option_values?.value === optionValue,
        ),
      ),
    );
  }, [selectedOptions, product.variants]);

  useEffect(() => {
    const newActiveVariant = product.variants.find((variant) =>
      Object.entries(selectedOptions).every(([optionName, optionValue]) =>
        variant.variant_option_values.some(
          (vo) =>
            vo.product_option_values?.product_options?.name === optionName &&
            vo.product_option_values?.value === optionValue,
        ),
      ),
    );
    onVariantChange(newActiveVariant);
  }, [selectedOptions, product.variants, onVariantChange]);

  // ... (باقي منطق `useMemo` و `useState` لـ price, stock, quantity يبقى كما هو) ...
  const { price, originalPrice, stock, isAvailable } = useMemo(() => {
    const price = activeVariant?.discount_price ?? activeVariant?.price ?? 0;
    const originalPrice = activeVariant?.discount_price
      ? activeVariant.price
      : null;
    const stock = activeVariant?.stock_quantity ?? 0;
    return {
      price,
      originalPrice,
      stock,
      isAvailable: !!activeVariant && stock > 0,
    };
  }, [activeVariant]);

  const [quantity, setQuantity] = useState(1);

  const handleQuantityChange = (amount: number) => {
    setQuantity((prev) => {
      const newQuantity = prev + amount;
      if (newQuantity < 1) return 1;
      if (stock > 0 && newQuantity > stock) return stock;
      return newQuantity;
    });
  };

  const renderChildrenWithProps = () => {
    if (!children) return null;
    return Children.map(children, (child) => {
      if (isValidElement(child)) {
        return cloneElement(child as ReactElement<VariantsChildProps>, {
          options: organizedOptions,
          selectedOptions,
          onOptionSelect: handleOptionSelect,
        });
      }
      return child;
    });
  };

  // handle +/- using keyboard

  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (event.key === "+") {
        handleQuantityChange(1);
      } else if (event.key === "-") {
        if (quantity === 1) return;
        handleQuantityChange(-1);
      }
    };
    document.addEventListener("keydown", handleKeyPress);
    return () => document.removeEventListener("keydown", handleKeyPress);
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        {product.category && (
          <Badge variant="outline">{product.category.name}</Badge>
        )}
        {product.brand && (
          <Badge variant="secondary">{product.brand.name}</Badge>
        )}
      </div>

      <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
        {product.name}
      </h1>

      {totalReviews > 0 ? (
        <div className="flex items-center gap-2">
          <StarRating rating={averageRating} starClassName="h-4 w-4" />
          <Link
            href="#reviews"
            className="text-sm text-muted-foreground hover:underline"
          >
            ({totalReviews} review{totalReviews > 1 ? "s" : ""})
          </Link>
        </div>
      ) : (
        <div className="flex items-center gap-2">
          <StarRating rating={0} starClassName="h-4 w-4" />
          <p className="text-sm text-muted-foreground">No reviews yet</p>
        </div>
      )}

      <div className="flex items-baseline gap-3">
        <p className="text-3xl font-semibold">${price.toFixed(2)}</p>
        {originalPrice && (
          <p className="text-xl text-muted-foreground line-through">
            ${originalPrice.toFixed(2)}
          </p>
        )}
      </div>

      {product.short_description && (
        <p className="text-lg text-muted-foreground">
          {product.short_description}
        </p>
      )}

      <div className="border-t pt-6 space-y-4">{renderChildrenWithProps()}</div>

      {isAvailable ? (
        <p className="text-sm text-green-600 font-medium">
          ✓ In stock ({stock} available)
        </p>
      ) : (
        <p className="text-sm text-destructive font-medium">
          ✗{" "}
          {activeVariant ? "Out of stock" : "This combination is not available"}
        </p>
      )}

      <div className="flex items-stretch gap-2">
        <div className="flex rtl:flex-row-reverse items-center border rounded-md h-10">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-full rounded-r-none"
            onClick={() => handleQuantityChange(-1)}
            disabled={!isAvailable || quantity <= 1}
          >
            <Minus className="h-4 w-4" />
          </Button>
          <span className="px-2 font-semibold text-center  min-w-13 ">
            {quantity}
          </span>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-full rounded-l-none"
            onClick={() => handleQuantityChange(1)}
            disabled={!isAvailable || (stock > 0 && quantity >= stock)}
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>

        <div className="grow flex gap-2">
          {/* AddToCartButton Component */}
          <AddToCartButton
            variantId={activeVariant?.id || ""}
            quantity={quantity}
          />

          {/* WishlistButton Component*/}

          <WishlistButton
            productId={product.id}
            initialIsWishlisted={isInitiallyWishlisted}
          />
        </div>
      </div>

      {product.description && (
        <div className="border-t pt-6">
          <h3 className="text-xl font-semibold mb-2">Product Description</h3>
          <div
            className="prose dark:prose-invert max-w-none"
            dangerouslySetInnerHTML={{ __html: product.description }}
          />
        </div>
      )}
    </div>
  );
}

// ============================================================================
// ProductDetails Component (Main Export)
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
  const [activeVariant, setActiveVariant] = useState<
    ProductVariant | undefined
  >(() => product.variants.find((v) => v.is_default) || product.variants[0]);
  const [isReviewFormOpen, setIsReviewFormOpen] = useState(false);

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-8">
        <ImageGallery product={product} activeVariant={activeVariant} />

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

      <Separator className="my-12 lg:my-16" />
      {/* Summary Section for Reviews */}
      <div id="reviews" className="scroll-mt-20">
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-6">
          <div>
            <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
              Customer Reviews
            </h2>
            {totalReviews > 0 && (
              <div className="flex items-center gap-3 mt-2">
                <StarRating rating={averageRating} />
                <p className="text-muted-foreground text-sm">
                  {averageRating.toFixed(1)} based on {totalReviews} review
                  {totalReviews > 1 ? "s" : ""}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Review Form */}
      <Dialog open={isReviewFormOpen} onOpenChange={setIsReviewFormOpen}>
        <DialogTrigger asChild>
          <Button variant="outline">Write a Review</Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-120">
          <DialogHeader>
            <DialogTitle>Write a review for</DialogTitle>
            <p className="text-sm text-muted-foreground pt-1">{product.name}</p>
          </DialogHeader>
          <AddReviewForm
            productId={product.id}
            productSlug={product.slug}
            onFormSubmit={() => setIsReviewFormOpen(false)}
          />
        </DialogContent>
      </Dialog>

      <div className="mt-8">
        {errorReviews && <p className="text-destructive">{errorReviews}</p>}
        {totalReviews === 0 && !errorReviews && (
          <div className="text-center py-12 px-4 border-2 border-dashed rounded-lg">
            <h3 className="text-xl font-semibold">No reviews yet</h3>
            <p className="text-muted-foreground mt-2">
              Be the first to share your thoughts!
            </p>
          </div>
        )}
        <div className="space-y-8">
          {/* ✅ 3. تحديث استدعاء ReviewCard لتمرير الـ props الجديدة */}
          {reviews?.map((review) => (
            <ReviewCard
              key={review.id}
              review={review}
              currentUserId={user?.id}
              productSlug={product.slug}
            />
          ))}
        </div>
      </div>
    </>
  );
}
