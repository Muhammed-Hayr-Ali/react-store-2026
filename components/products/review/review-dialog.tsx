"use client";

import { Button } from "@/components/ui/button";
import {
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { Textarea } from "@/components/ui/textarea";
import {
  createReview,
  // updateReview,
  Review as ReviewData,
  updateReview,
} from "@/lib/actions/reviews";

import { cn } from "@/lib/utils";
import { StarIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { SubmitHandler, useForm, Controller } from "react-hook-form";
import { toast } from "sonner";

type Inputs = {
  product_id: string;
  rating: number;
  title?: string;
  comment: string;
};

interface DialogProps {
  className?: string;
  onClose: () => void;
  review: ReviewData | null;
  productId: string;
  productSlug: string;
}



export default function UserReviewDialog({
  onClose,
  review,
  productId,
  productSlug,
  className,
  ...props
}: DialogProps) {
  const router = useRouter();

  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors, isSubmitting },
  } = useForm<Inputs>({
    defaultValues: {
      product_id: productId,
      rating: review?.rating || 0,
      title: review?.title || "",
      comment: review?.comment || "",
    },
  });
  const onSubmit: SubmitHandler<Inputs> = async (data) => {
    const { error: reviewError } =
      review && review?.id
        ? await updateReview(review.id, {
            product_id: productId,
            rating: data.rating,
            title: data.title,
            comment: data.comment,
          })
        : await createReview({
            productSlug: productSlug,
            payload: {
              product_id: productId,
              rating: data.rating,
              title: data.title,
              comment: data.comment,
            },
          });

    if (reviewError) {
      toast.error(reviewError);
      return;
    }
    toast.success(`Review ${review ? "updated" : "created"} successfully.`);
    router.refresh();
    resetDialog();
  };

  const resetDialog = () => {
    onClose();
    reset();
  };

  useEffect(() => {
    if (review) {
      reset(review);
    } else {
      reset({
        product_id: productId,
        rating: 0,
        title: "",
        comment: "",
      });
    }
  }, [review, productId, reset]);

  return (
    <DialogContent className={cn("sm:max-w-sm", className)} {...props}>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <DialogHeader>
          <DialogTitle>{review ? "Edit" : "Create"} Review</DialogTitle>
          <DialogDescription>
            {/* Create Or Update Dialog discription */}
            {review
              ? "Update Review Information and save changes."
              : "Create a new Review and Publish."}
          </DialogDescription>
        </DialogHeader>
        <FieldGroup className="gap-4">
          <Controller
            name="rating"
            control={control}
            rules={{ min: { value: 1, message: "Rating is required." } }}
            render={({ field }) => (
              <Field>
                <FieldLabel>Your Rating</FieldLabel>
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      type="button"
                      key={star}
                      onClick={() => field.onChange(star)}
                    >
                      <StarIcon
                        key={star}
                        className={`h-8 w-8 cursor-pointer transition-colors ${
                          field.value >= star
                            ? "text-amber-400 fill-amber-400"
                            : "text-muted-foreground/30"
                        }`}
                      />
                    </button>
                  ))}
                </div>
                {errors.rating && (
                  <p className="text-sm text-destructive mt-1">
                    {errors.rating.message}
                  </p>
                )}
              </Field>
            )}
          />

          <Field>
            <FieldLabel htmlFor="title">Title</FieldLabel>
            <Input
              id="title"
              type="title"
              placeholder="Give your review a title"
              aria-invalid={errors.title ? "true" : "false"}
              disabled={isSubmitting}
              {...register("title", {
                required: "Title is required",
              })}
            />
            <FieldError>{errors.title?.message}</FieldError>
          </Field>

          <Field>
            <FieldLabel htmlFor="comment">Comment</FieldLabel>
            <Textarea
              id="comment"
              placeholder="Write your comment here"
              aria-invalid={errors.comment ? "true" : "false"}
              disabled={isSubmitting}
              {...register("comment", {
                required: "Comment is required",
              })}
            />
            <FieldError>{errors.comment?.message}</FieldError>
          </Field>
        </FieldGroup>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline" onClick={resetDialog}>
              Cancel
            </Button>
          </DialogClose>
          <Button type="submit">
            {isSubmitting ? <Spinner /> : review ? "Update" : "Create"}
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  );
}



   

