// components/reviews/AddReviewForm.tsx (الإصدار النهائي)

"use client";

import { useForm, Controller } from "react-hook-form";
import { toast } from "sonner";
import { Star, Send } from "lucide-react";

import { addReview } from "@/lib/actions/reviews";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Spinner } from "@/components/ui/spinner";
import { Label } from "@/components/ui/label";
import { useRouter } from "next/navigation";

type ReviewFormData = {
  rating: number;
  title: string;
  comment: string;
};

interface AddReviewFormProps {
  productId: string;
  productSlug: string;
  onFormSubmit: () => void;
}

export function AddReviewForm({
  productId,
  productSlug,
  onFormSubmit,
}: AddReviewFormProps) {
  const router = useRouter();
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting }, // ✅ نستخدم isSubmitting
    setError,
  } = useForm<ReviewFormData>({
    defaultValues: { rating: 0, title: "", comment: "" },
  });

  const processForm = async (data: ReviewFormData) => {
    const formData = new FormData();
    formData.append("rating", String(data.rating));
    formData.append("title", data.title);
    formData.append("comment", data.comment);
    formData.append("productId", productId);
    formData.append("productSlug", productSlug);

    const result = await addReview({ success: false, message: "" }, formData);

    if (result.success) {
      toast.success(result.message);
      onFormSubmit();
      reset();
      router.refresh();
    } else {
      if (result.message) toast.error(result.message);
      if (result.errors) {
        Object.entries(result.errors).forEach(([key, value]) => {
          if (value) {
            setError(key as keyof ReviewFormData, {
              type: "server",
              message: value[0],
            });
          }
        });
      }
    }
  };

  return (
    <form onSubmit={handleSubmit(processForm)} className="space-y-6 pt-2">
      <Controller
        name="rating"
        control={control}
        rules={{ min: { value: 1, message: "Rating is required." } }}
        render={({ field }) => (
          <div className="space-y-2">
            <Label>Your Rating *</Label>
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={`h-8 w-8 cursor-pointer transition-colors ${
                    field.value >= star
                      ? "text-amber-400 fill-amber-400"
                      : "text-muted-foreground/30"
                  }`}
                  onClick={() => field.onChange(star)}
                />
              ))}
            </div>
            {errors.rating && (
              <p className="text-sm text-destructive mt-1">
                {errors.rating.message}
              </p>
            )}
          </div>
        )}
      />
      <Controller
        name="title"
        control={control}
        render={({ field }) => (
          <div className="space-y-2">
            <Label htmlFor="title">Review Title</Label>
            <Input
              id="title"
              placeholder="e.g., Best purchase ever!"
              {...field}
            />
            {errors.title && (
              <p className="text-sm text-destructive mt-1">
                {errors.title.message}
              </p>
            )}
          </div>
        )}
      />
      <Controller
        name="comment"
        control={control}
        render={({ field }) => (
          <div className="space-y-2">
            <Label htmlFor="comment">Your Review</Label>
            <Textarea
              id="comment"
              placeholder="Tell us more about your experience..."
              {...field}
            />
            {errors.comment && (
              <p className="text-sm text-destructive mt-1">
                {errors.comment.message}
              </p>
            )}
          </div>
        )}
      />
      <div className="flex justify-end pt-2">
        <Button
          type="submit"
          disabled={isSubmitting}
          className="w-full sm:w-auto"
        >
          {isSubmitting ? (
            <Spinner />
          ) : (
            <>
              <Send className="mr-2 h-4 w-4" /> Submit Review
            </>
          )}
        </Button>
      </div>
    </form>
  );
}
