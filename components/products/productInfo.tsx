"use client";

import { Minus, Plus } from "lucide-react";
import { Button } from "../ui/button";
import AddToCartButton from "./add-to-cart-button";
import WishlistButton from "./wishlist-button";
import { StarRating } from "../reviews/star-rating";
import Link from "next/link";
import { Badge } from "../ui/badge";
import {
  getOrganizedOptions,
  ProductInfoProps,
  VariantsChildProps,
} from "./ProductDetails";

import {
  useState,
  useMemo,
  Children,
  cloneElement,
  isValidElement,
  ReactElement,
  useEffect,
} from "react";

export default function ProductInfo({
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
        <div className="flex items-center border rounded-md h-10">
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
          <span className="px-2 font-semibold text-center  min-w-13 ">
            {quantity}
          </span>
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
    </div>
  );
}
