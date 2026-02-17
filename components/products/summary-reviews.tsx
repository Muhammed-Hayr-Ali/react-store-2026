import { StarRating } from "../reviews/star-rating";

export default function SummaryReviews({
  averageRating,
  totalReviews,
}: {
  averageRating: number;
  totalReviews: number;
}) {
  return (
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
  );
}
