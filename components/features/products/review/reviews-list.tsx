"use client";

import { Review } from "@/lib/actions/reviews";
import { ReviewCard } from "./review-card";
import { Dialog } from "@/components/ui/dialog";
import GuestReviewDialog from "./guest-review-dialog";
import UserReviewDialog from "./review-dialog";
import { useState } from "react";
import { Button } from "@/components/ui/button";

interface ReviewsListProps {
  reviews: Review[];
  totalReviews: number;
  userId: string | undefined;
  productId: string;
  productSlug: string;
}

type DialogState = "GuestReviewDialog" | "UserReviewDialog" | null;

export default function ReviewsList({
  reviews,
  totalReviews,
  userId,
  productId,
  productSlug,
}: ReviewsListProps) {
  const [activeDialog, setActiveDialog] = useState<DialogState>(null);

  const onCloseDialog = () => {
    //New Dialog State

    setActiveDialog(null);
  };

  return (
    <>
      <div className="mt-8">
        {totalReviews === 0 && (
          <div className="text-center py-12 px-4 border border-dashed  rounded-lg">
            <h3 className="text-xl font-semibold">No reviews yet</h3>
            <p className="text-muted-foreground mt-2">
              Be the first to share your thoughts!
            </p>
          </div>
        )}
        <div className="space-y-10">
          {reviews?.map((review) => (
            <ReviewCard
              key={review.id}
              review={review}
              currentUserId={userId}
              productSlug={productSlug}
            />
          ))}
        </div>

        <div className="mt-8 flex justify-end">
          {userId ? (
            <Button
              onClick={() => setActiveDialog("UserReviewDialog")}
            >
              Write a Review
            </Button>
          ) : (
            <Button
              onClick={() => setActiveDialog("GuestReviewDialog")}
            >
              Write a Review
            </Button>
          )}
        </div>
      </div>

      <Dialog
        open={activeDialog === "GuestReviewDialog"}
        onOpenChange={onCloseDialog}
      >
        <GuestReviewDialog
          onClose={onCloseDialog}
          className="lg:max-w-lg"
          productSlug={productSlug}
          productId={productId}
        />
      </Dialog>

      {/* Review Create or Update Dialog */}
      <Dialog
        open={activeDialog === "UserReviewDialog"}
        onOpenChange={onCloseDialog}
      >
        <UserReviewDialog
          onClose={onCloseDialog}
          className="lg:max-w-lg"
          review={null}
          productSlug={productSlug}
          productId={productId}
        />
      </Dialog>
    </>
  );
}
