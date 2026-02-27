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
import { createReview} from "@/lib/actions/reviews";

import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { SubmitHandler, useForm } from "react-hook-form";
import { toast } from "sonner";

type Inputs = {
  product_id: string;
  rating: number;
  name: string;
  email: string;
  comment: string;
};

interface DialogProps {
  className?: string;
  onClose: () => void;
  productId: string;
  productSlug: string;
}



export default function GuestReviewDialog({
  onClose,
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
    formState: { errors, isSubmitting },
  } = useForm<Inputs>();
  const onSubmit: SubmitHandler<Inputs> = async (data) => {
    const { error: reviewError } = await createReview({
      productSlug: productSlug,
      payload: {
        product_id: productId,
        rating: 0,
        name: data.name,
        email: data.email,
        comment: data.comment,
      },
    });

    if (reviewError) {
      toast.error(reviewError);
      return;
    }
    toast.success(`Review created successfully.`);
    router.refresh();
    resetDialog();
  };

  const resetDialog = () => {
    onClose();
    reset();
  };

  return (
    <DialogContent className={cn("sm:max-w-sm", className)} {...props}>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <DialogHeader>
          <DialogTitle>Create Review</DialogTitle>
          <DialogDescription>
            Create a new Review and Publish.
          </DialogDescription>
        </DialogHeader>
        <FieldGroup className="gap-4">
          <Field>
            <FieldLabel htmlFor="name">Name</FieldLabel>
            <Input
              id="name"
              type="name"
              placeholder="John Doe"
              aria-invalid={errors.name ? "true" : "false"}
              disabled={isSubmitting}
              {...register("name", {
                required: "Name is required",
              })}
            />
            <FieldError>{errors.name?.message}</FieldError>
          </Field>

          <Field>
            <FieldLabel htmlFor="email">Email</FieldLabel>
            <Input
              id="email"
              type="email"
              placeholder="you@domain.com"
              aria-invalid={errors.email ? "true" : "false"}
              disabled={isSubmitting}
              {...register("email", {
                required: "Email is required",
              })}
            />
            <FieldError>{errors.email?.message}</FieldError>
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
          <Button type="submit">{isSubmitting ? <Spinner /> : "Create"}</Button>
        </DialogFooter>
      </form>
    </DialogContent>
  );
}



   

