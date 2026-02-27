"use client";

import { StarRating } from "@/components/ui/star-rating";
import { deleteReview, UserReview } from "@/lib/actions/reviews";
import Link from "next/link";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { TrashIcon } from "lucide-react";
import { useTransition } from "react";
import { toast } from "sonner";
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

      const { error } = await deleteReview(reviewId, productSlug);

      if (error) {
        console.error("Error deleting review:", error);
        toast.error("Failed to delete your review. Please try again.");
        return;
      }

      toast.success("Review deleted successfully!");
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
          disabled={isPending} // تعطيل الزر أثناء الحذف
        >
          <TrashIcon className="h-5 w-5" />
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
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
            {isPending ? "Deleting..." : "Continue"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

export function UserReviewCard({ review }: { review: UserReview }) {
  return (
    <div className="border rounded-lg p-4 flex flex-col sm:flex-row items-start gap-4 transition-colors hover:bg-muted/50">
      <Link href={`/products/${review.product.slug}`}>
        <img
          width={112}
          height={112}
          src={review.product.main_image_url || "/placeholder.svg"}
          alt={review.product.name}
          className="rounded-md object-cover bg-muted shrink-0"
        />
      </Link>
      <div className="flex-1">
        <Link
          href={`/products/${review.product.slug}`}
          className="font-semibold text-lg hover:underline"
        >
          {review.product.name}
        </Link>
        <div className="flex items-center gap-3 my-1.5">
          <StarRating rating={review.rating} starClassName="h-4 w-4" />
          <span className="text-sm text-muted-foreground">
            {format(new Date(review.created_at), "dd MMM yyyy")}
          </span>
        </div>
        {review.title && (
          <h4 className="font-medium mt-2 text-base">{review.title}</h4>
        )}
        {review.comment && (
          <p className="text-muted-foreground text-sm line-clamp-3 mt-1">
            {review.comment}
          </p>
        )}
      </div>
      <div className="w-full sm:w-auto mt-2 sm:mt-0">
        <DeleteReviewButton
          reviewId={review.id}
          productSlug={review.product.slug}
        />
      </div>
    </div>
  );
}
