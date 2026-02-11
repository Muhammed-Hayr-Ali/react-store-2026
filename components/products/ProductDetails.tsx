// components/products/ProductDetails.tsx

"use client";

import { useState } from "react";
import { type FullProduct } from "@/types";
import { ProductImageGallery } from "./ProductImageGallery";
import { ProductInfo } from "./ProductInfo";

// --- استيرادات التقييمات ---
import { type ReviewWithAuthor } from "@/lib/actions/reviews";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/provider/auth-provider";
import { StarRating } from "../reviews/star-rating";
import { AddReviewForm } from "../reviews/add-review-form";
import { ReviewCard } from "../reviews/review-card";


interface ProductDetailsProps {
  product: FullProduct;
  isInitiallyWishlisted: boolean;
  reviews: ReviewWithAuthor[];
  averageRating: number;
  totalReviews: number;
  reviewsError: string | null;
}

export function ProductDetails({
  product,
  isInitiallyWishlisted,
  reviews,
  averageRating,
  totalReviews,
  reviewsError,
}: ProductDetailsProps) {
  const [activeImageUrl, setActiveImageUrl] = useState<string | null>(
    product.main_image_url ||
      product.variants.find((v) => v.is_default)?.image_url ||
      null,
  );
  const [isReviewFormOpen, setIsReviewFormOpen] = useState(false);

  // ✅ 2. الحصول على بيانات المستخدم الحالي من الـ provider
  const { user } = useAuth();

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
        <div>
          <ProductImageGallery
            product={product}
            activeImageUrl={activeImageUrl}
            setActiveImageUrl={setActiveImageUrl}
          />
        </div>
        <div>
          <ProductInfo
            product={product}
            isInitiallyWishlisted={isInitiallyWishlisted}
            averageRating={averageRating}
            totalReviews={totalReviews}
          />
        </div>
      </div>

      <Separator className="my-12 lg:my-16" />

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

          <Dialog open={isReviewFormOpen} onOpenChange={setIsReviewFormOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">Write a Review</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-120">
              <DialogHeader>
                <DialogTitle>Write a review for</DialogTitle>
                <p className="text-sm text-muted-foreground pt-1">
                  {product.name}
                </p>
              </DialogHeader>
              <AddReviewForm
                productId={product.id}
                productSlug={product.slug}
                onFormSubmit={() => setIsReviewFormOpen(false)}
              />
            </DialogContent>
          </Dialog>
        </div>

        <div className="mt-8">
          {reviewsError && <p className="text-destructive">{reviewsError}</p>}
          {totalReviews === 0 && !reviewsError && (
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
      </div>
    </>
  );
}
