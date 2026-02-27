"use client";
import { SummaryReviews } from "@/lib/actions/products";
import { StarRating } from "../../ui/star-rating";
import { Progress } from "@/components/ui/progress";

interface Props {
  reviews: SummaryReviews;
}

interface RatingBarProps {
  name: string;
  rating: number;
  totalReviews: number;
}

const RatingBar = ({ name, rating, totalReviews }: RatingBarProps) => {
  const percentage = (rating * 100) / totalReviews;
  return (
    <div className="flex gap-4 items-center">
      <p>{name}</p>
      <Progress
        className="h-2 bg-gray-100 [&>div]:bg-blue-600 [&>div]:rounded-full dark:bg-gray-800"
        value={percentage}
      />
    </div>
  );
};

export default function SummaryReviewsComponent({ reviews }: Props) {
  const STAR_KEYS = [
    "oneStar",
    "twoStar",
    "threeStar",
    "fourStar",
    "fiveStar",
  ] as const;

  return (
    <div className="flex flex-col">
      <h1 className="text-2xl font-bold">Product Reviews</h1>
      <p className="text-xs text-muted-foreground">
        Reviews are from registered users. Note: Purchasing this product is not
        required to leave a review.
      </p>
      <div className="w-full pt-6 grid grid-cols-3 gap-4">
        <div className="col-span-1">
          <div className="flex flex-col h-full items-center justify-center gap-2">
            <p className="text-5xl lg:text-7xl">
              {reviews.averageRating.toFixed(1)}
            </p>

            <div className="flex flex-col items-center">
              <StarRating
                rating={reviews.averageRating}
                starClassName="size-4 lg:size-6"
              />
              <p className="text-muted-foreground text-xs">
                {reviews.totalReviews} review
              </p>
            </div>
          </div>
        </div>
        <div className="col-span-2 flex flex-col justify-center">
          {[4, 3, 2, 1, 0].map((index) => {
            const starKey = STAR_KEYS[index]; // ✅ 'oneStar', 'twoStar', ...
            const count = reviews.starCounts[starKey]; // ✅ العدد الصحيح

            return (
              <RatingBar
                key={index}
                name={`${index + 1}`}
                rating={count} // ✅ العدد المطلوب
                totalReviews={reviews.totalReviews}
              />
            );
          })}

          {/* <RatingBar
            name="5"
            rating={reviews.starCounts.fiveStar}
            totalReviews={reviews.totalReviews}
          /> */}
        </div>

        {/* <p className="text-7xl font-semibold">
              {averageRating.toFixed(1)}
            </p> */}

        {/* <p className="text-muted-foreground text-sm">
              {averageRating.toFixed(1)} based on {totalReviews} review
              {totalReviews > 1 ? "s" : ""}
            </p> */}
      </div>
    </div>
  );
}
