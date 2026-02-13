// components/products/ProductInfo.tsx

"use client";

import {
  useState,
  useMemo,
  useEffect,
  useTransition,
  useActionState,
} from "react";
import { useFormStatus } from "react-dom";
import { toast } from "sonner";
import Link from "next/link"; // ✅ 1. استيراد Link

// --- استيرادات الواجهة والأيقونات ---
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { ShoppingCart, Minus, Plus, Heart } from "lucide-react";

// --- استيرادات الأنواع و Server Actions ---
import { type FullProduct } from "@/types";
import { addItemToCart, ApiResponse } from "@/lib/actions/cart";
import { addToWishlist, removeFromWishlist } from "@/lib/actions/wishlist";

// --- استيرادات أخرى ---
import { StarRating } from "../reviews/star-rating";
import { useCartCount } from "@/lib/provider/cart-provider";
import { useRouter } from "next/navigation";

// ... (دالة getOrganizedOptions لم تتغير) ...
const getOrganizedOptions = (variants: FullProduct["variants"]) => {
  const optionsMap = new Map<string, Set<string>>();
  variants.forEach((variant) => {
    variant.variant_options?.forEach((vo) => {
      if (vo && vo.option_value && vo.option_value.option) {
        const optionName = vo.option_value.option.name;
        const optionValue = vo.option_value.value;
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

function AddToCartButton({ disabled }: { disabled: boolean }) {
  const { pending } = useFormStatus();
  return (
    <Button
      size={"lg"}
      className="grow h-10"
      type="submit"
      disabled={disabled || pending}
    >
      {pending ? (
        <Spinner />
      ) : (
        <>
          <ShoppingCart className="mr-2 h-5 w-5" />
          Add to Cart
        </>
      )}
    </Button>
  );
}

interface WishlistButtonProps {
  productId: string;
  initialIsWishlisted: boolean;
}

function WishlistButton({
  productId,
  initialIsWishlisted,
}: WishlistButtonProps) {
  const [isWishlisted, setIsWishlisted] = useState(initialIsWishlisted);
  const [isPending, startTransition] = useTransition();

  const handleWishlistToggle = () => {
    startTransition(async () => {
      const action = isWishlisted ? removeFromWishlist : addToWishlist;
      const result = await action(productId);
      if (result.success) {
        toast.success(result.message);
        setIsWishlisted(!isWishlisted);
      } else {
        toast.error(result.error);
      }
    });
  };

  return (
    <Button
      size="lg"
      variant="outline"
      className="shrink-0 aspect-square p-0"
      onClick={handleWishlistToggle}
      disabled={isPending}
      aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
    >
      {isPending ? (
        <Spinner />
      ) : (
        <Heart
          className={`h-6 w-6 transition-all ${
            isWishlisted
              ? "fill-destructive text-destructive"
              : "text-muted-foreground"
          }`}
        />
      )}
    </Button>
  );
}

// ✅ 3. تحديث الواجهة (Props) لتشمل ملخص التقييمات
interface ProductInfoProps {
  product: FullProduct;
  isInitiallyWishlisted: boolean;
  averageRating: number;
  totalReviews: number;
}

export function ProductInfo({
  product,
  isInitiallyWishlisted,
  averageRating,
  totalReviews,
}: ProductInfoProps) {
  const { refreshCount } = useCartCount();
  const router = useRouter();
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
    defaultVariant?.variant_options?.forEach((vo) => {
      if (vo?.option_value?.option) {
        options[vo.option_value.option.name] = vo.option_value.value;
      }
    });
    return options;
  });

  const activeVariant = useMemo(() => {
    return product.variants.find((variant) =>
      Object.entries(selectedOptions).every(([optionName, optionValue]) =>
        variant.variant_options?.some(
          (vo) =>
            vo?.option_value?.option?.name === optionName &&
            vo?.option_value?.value === optionValue,
        ),
      ),
    );
  }, [selectedOptions, product.variants]);

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
      if (newQuantity > stock) return stock;
      return newQuantity;
    });
  };

  const initialState: ApiResponse<boolean> = { data: false, error: "" };
  const [state, formAction] = useActionState(addItemToCart, initialState);

  useEffect(() => {
    if (state.data) {
      toast.success("Item added to cart.");
      refreshCount();
    } else if (state.error) {
      if(state.error === "Auth session missing!") {router.push("/auth/login");};
      toast.error(state.error);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state]); // أضفت refreshCart إلى مصفوفة الاعتماديات

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

      {/* ✅ 4. إضافة قسم ملخص التقييمات */}
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
      {/* -------------------------------- */}

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

      <div className="border-t pt-6 space-y-4">
        {organizedOptions.map((option) => (
          <div key={option.name}>
            <h3 className="text-md font-semibold mb-2">{option.name}</h3>
            <div className="flex flex-wrap gap-3">
              {option.values.map((value) => (
                <Button
                  key={value}
                  variant={
                    selectedOptions[option.name] === value
                      ? "default"
                      : "outline"
                  }
                  onClick={() =>
                    setSelectedOptions((prev) => ({
                      ...prev,
                      [option.name]: value,
                    }))
                  }
                >
                  {value}
                </Button>
              ))}
            </div>
          </div>
        ))}
      </div>

      {isAvailable ? (
        <p className="text-sm text-green-600">In stock ({stock} available)</p>
      ) : (
        <p className="text-sm text-destructive">
          {activeVariant ? "Out of stock" : "This combination is not available"}
        </p>
      )}

      <form action={formAction} className="space-y-4">
        <div className="flex items-stretch gap-2">
          <div className="flex items-center border rounded-md h-10">
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
            <span className="px-4 font-semibold text-center">{quantity}</span>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-full rounded-l-none"
              onClick={() => handleQuantityChange(1)}
              disabled={!isAvailable || quantity >= stock}
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>

          <div className="grow flex gap-2">
            <AddToCartButton disabled={!isAvailable} />
            <WishlistButton
              productId={product.id}
              initialIsWishlisted={isInitiallyWishlisted}
            />
          </div>
        </div>
        <input type="hidden" name="variantId" value={activeVariant?.id || ""} />
        <input type="hidden" name="quantity" value={quantity} />
      </form>

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
