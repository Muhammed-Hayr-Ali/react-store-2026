// ReviewCard.tsx

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { formatDistanceToNow } from "date-fns";
import { Flag, ShieldCheck, TrashIcon, User } from "lucide-react";
import { Review as ReviewData } from "@/lib/actions/reviews";
import { StarRating } from "@/components/reviews/star-rating";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { AlertDialog } from "@/components/ui/alert-dialog";
import DeleteReviewAlertDialog from "./review-delete";

type ReviewCardProps = {
  review: ReviewData;
  currentUserId: string | undefined;
  productSlug: string;
};

type DialogState = "ReviewDialog" | "DeleteReviewDialog" | null;

export function ReviewCard({
  review,
  currentUserId,
  productSlug,
}: ReviewCardProps) {
  const [activeDialog, setActiveDialog] = useState<DialogState>(null);
  const [selcetedReview, setSelcetedReview] = useState<ReviewData>(review);

  const isOwner = currentUserId === review.user_id;
  const isUserReview = !!review.user_id && !!review.author;
  const authorName = isUserReview
    ? [review.author?.first_name, review.author?.last_name]
        .filter(Boolean)
        .join(" ") || "Registered User"
    : review.name || "Guest";

  const avatarUrl = isUserReview ? review.author?.avatar_url : undefined;
  const avatarFallback = authorName.charAt(0).toUpperCase();

  return (
    <>
      <Card className="w-full rounded-none shadow-none">
        <CardHeader>
          <div className="flex items-start justify-between gap-4">
            {/* معلومات الكاتب */}
            <div className="flex items-center gap-3">
              <Avatar>
                <AvatarImage src={avatarUrl || undefined} alt={authorName} />
                <AvatarFallback>
                  {/* أيقونة مختلفة للزائر */}
                  {isUserReview ? avatarFallback : <User className="size-4" />}
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col">
                <p className="font-semibold">{authorName}</p>
                <StarRating rating={review.rating} starClassName="size-3.5" />
              </div>
            </div>

            {/* عرض النجوم */}
          </div>
        </CardHeader>

        <CardContent>
          {review.title && (
            <CardTitle className="mb-2 text-lg">{review.title}</CardTitle>
          )}
          {review.comment && (
            <CardDescription className="whitespace-pre-wrap text-base">
              {review.comment}
            </CardDescription>
          )}
        </CardContent>

        {/* معلومات إضافية في الفوتر */}
        <CardFooter className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="text-xs text-muted-foreground">
              {formatDistanceToNow(new Date(review.created_at), {
                addSuffix: true,
              })}
            </span>{" "}
            {review.is_verified_purchase && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Badge variant="secondary" className="cursor-default">
                      <ShieldCheck className="mr-1.5 size-4 text-emerald-600" />
                      Verified Purchase
                    </Badge>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>This review is from a user who purchased the product.</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
          </div>
          {
            // تحديد اذا كان المستخدم هو صاحب التعليق
            isOwner ? (
              <Button
                size={"icon-xs"}
                variant="destructive"
                onClick={() => setActiveDialog("DeleteReviewDialog")}
              >
                <TrashIcon />
              </Button>
            ) : (
              <Button size={"icon-xs"} variant="secondary">
                <Flag />
              </Button>
            )
          }
        </CardFooter>
      </Card>

      {/* Category Delete Dialog */}
      <AlertDialog
        open={activeDialog === "DeleteReviewDialog"}
        onOpenChange={() => setActiveDialog(null)}
      >
        <DeleteReviewAlertDialog
          onClose={() => setActiveDialog(null)}
          review={selcetedReview}
          productSlug={productSlug}
          className="max-w-lg"
        />
      </AlertDialog>
    </>
  );
}
