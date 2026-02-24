import { Review } from "@/lib/actions/reviews";
import { ReviewCard } from "../reviews/review-card";



interface ReviewsListProps {
  reviews: Review[];
  totalReviews: number;
  userId: string | undefined;
  productSlug: string;
}

export default function ReviewsList({
  reviews,
  totalReviews,
  userId,
  productSlug,
}: ReviewsListProps) {
  return (
    <div className="mt-8">
      {totalReviews === 0 && (
        <div className="text-center py-12 px-4 border border-dashed  rounded-lg">
          <h3 className="text-xl font-semibold">No reviews yet</h3>
          <p className="text-muted-foreground mt-2">
            Be the first to share your thoughts!
          </p>
        </div>
      )}
      <div className="space-y-8">
        {reviews?.map((review) => (
          <ReviewCard
            key={review.id}
            review={review}
            currentUserId={userId}
            productSlug={productSlug}
          />
        ))}
      </div>
    </div>
  );
}
