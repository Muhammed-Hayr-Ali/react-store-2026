// components/reviews/ReviewCard.tsx

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { StarRating } from "../../reviews/star-rating";
import { formatDistanceToNow } from "date-fns";
import { CheckBadgeIcon } from "@heroicons/react/24/solid";
import { TrashIcon } from "@heroicons/react/24/outline";
import { deleteReview, Review } from "@/lib/actions/reviews";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useTransition } from "react";

// ✅ 1. استيراد مكونات AlertDialog
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

import { FlagIcon } from "@heroicons/react/24/outline";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useState } from "react";
import { ReportReviewForm } from "../../reviews/report-review-form";

type ReviewCardProps = {
  review: Review;
  currentUserId: string | undefined;
  productSlug: string;
};

function ReportReviewButton({ reviewId }: { reviewId: number }) {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-muted-foreground hover:text-yellow-600"
          aria-label="Report review"
        >
          <FlagIcon className="h-5 w-5" />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Report this review</DialogTitle>
        </DialogHeader>
        <ReportReviewForm
          reviewId={reviewId}
          onFormSubmit={() => setIsOpen(false)}
        />
      </DialogContent>
    </Dialog>
  );
}

function DeleteReviewButton({
  reviewId,
  productSlug,
}: {
  reviewId: number;
  productSlug: string;
}) {
  const [isPending, startTransition] = useTransition();

  const handleDelete = () => {
    startTransition(async () => {
      const formData = new FormData();
      formData.append("reviewId", String(reviewId));
      formData.append("productSlug", productSlug);

      const result = await deleteReview(formData);
      if (result.success) {
        toast.success(result.message);
      } else {
        toast.error(result.message);
      }
    });
  };

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-muted-foreground hover:text-destructive"
          aria-label="Delete review"
          disabled={isPending}
        >
          <TrashIcon className="h-5 w-5" />
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent size="sm">
        <AlertDialogHeader>
          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. This will permanently delete your
            review from our servers.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={handleDelete} disabled={isPending}>
            {isPending ? "Deleting..." : "Yes, delete it."}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

type DialogState =
  | "RemoveReviewDialog"
  | "EditReviewDialog"
  | "ReportReviewDialog"
  | null;

export function ReviewCard({
  review,
  currentUserId,
  productSlug,
}: ReviewCardProps) {
  if (review.user_id) {
    const authorName =
      [review.author?.first_name, review.author?.last_name]
        .filter(Boolean)
        .join(" ") || "Anonymous";

    const avatarUrl = review.author?.avatar_url;
    const avatarFallback = authorName.charAt(0).toUpperCase();
    const isOwner = currentUserId === review.user_id;

    return (
      <div className="border-t flex flex-col pt-6 gap-2">
        <div className="flex items-center gap-4 ">
          <Avatar size={"lg"}>
            <AvatarImage src={avatarUrl || undefined} alt={authorName} />
            <AvatarFallback>{avatarFallback}</AvatarFallback>
          </Avatar>
          <p className="font-semibold">{authorName}</p>
        </div>

        <div className="flex items-center gap-4">
          {/* {Verified Purchase  */}
          {/* {review.is_verified_purchase && (
            <div className="flex items-center gap-1.5 text-sm font-medium text-emerald-600">
              <CheckBadgeIcon className="h-5 w-5" />
              <span>Verified Purchase</span>
            </div>
          )} */}

          <StarRating rating={review.rating} starClassName="size-4" />

          <span className="text-sm text-muted-foreground">
            {formatDistanceToNow(new Date(review.created_at), {
              addSuffix: true,
            })}
          </span>
        </div>

        {review.title && <h4 className="font-semibold mt-3">{review.title}</h4>}
        {review.comment && (
          <p className="text-muted-foreground mt-1 whitespace-pre-wrap">
            {review.comment}
          </p>
        )}




        {/* <div className="flex-1">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">
                {formatDistanceToNow(new Date(review.created_at), {
                  addSuffix: true,
                })}
              </span>
              {isOwner ? (
                <DeleteReviewButton
                  reviewId={review.id}
                  productSlug={productSlug}
                />
              ) : (
                <ReportReviewButton reviewId={review.id} />
              )}
            </div>
          </div>

          <div className="flex items-center flex-wrap gap-x-4 gap-y-1 my-2">
            <StarRating rating={review.rating} />
            {review.is_verified_purchase && (
              <div className="flex items-center gap-1.5 text-sm font-medium text-emerald-600">
                <CheckBadgeIcon className="h-5 w-5" />
                <span>Verified Purchase</span>
              </div>
            )}
          </div>

          {review.title && (
            <h4 className="font-semibold mt-3">{review.title}</h4>
          )}
          {review.comment && (
            <p className="text-muted-foreground mt-1 whitespace-pre-wrap">
              {review.comment}
            </p>
          )}
        </div> */}
      </div>
    );
  }

  return <span>{review.comment}</span>;
}
