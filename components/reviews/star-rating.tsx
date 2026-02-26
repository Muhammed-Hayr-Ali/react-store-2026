// components/reviews/StarRating.tsx (أو star-rating.tsx)

import { cn } from "@/lib/utils";
import { StarIcon } from "../custom-ui/icons";

interface StarRatingProps {
  rating: number;
  totalStars?: number;
  className?: string;
  starClassName?: string;
}

export function StarRating({
  rating,
  totalStars = 5,
  className,
  starClassName,
}: StarRatingProps) {
  return (
    <div className={cn("flex items-center gap-0.5", className)}>
      {Array.from({ length: totalStars }, (_, index) => {
        const starValue = index + 1;
        return (
          <StarIcon
            key={index}
            className={cn(
              "h-5 w-5", 
              starClassName,

            
              starValue <= rating
                ? "fill-orange-400 text-orange-400"
                : "fill-muted text-muted-foreground",
              // -------------------------
            )}
          />
        );

       
      })}
    </div>
  );
}
