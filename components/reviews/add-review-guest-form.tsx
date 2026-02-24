// components/reviews/AddReviewForm.tsx (الإصدار النهائي)

"use client";

import { useForm, SubmitHandler } from "react-hook-form";
import { useRouter } from "next/navigation";
import { createReview } from "@/lib/actions/reviews";
import { toast } from "sonner";
import {
  Field,
  FieldGroup,
  FieldLabel,
  FieldError,
  FieldDescription,
} from "../ui/field";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { Spinner } from "../ui/spinner";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { Textarea } from "../ui/textarea";

type Inputs = {
  name: string;
  email: string;
  title: string;
  comment: string;
};

interface AddReviewFormProps {
  productId: string;
  productSlug: string;
}

export function AddReviewGuestForm({
  productId,
  productSlug,
}: AddReviewFormProps) {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<Inputs>();

  const onSubmit: SubmitHandler<Inputs> = async (formData: Inputs) => {
    const { data, error } = await createReview({
      ...formData,
      product_id: productId,
      product_slug: productSlug,
    });

    if (error) {
      toast.error(error);
      return;
    }

    if (data) {
      toast.success("Review submitted successfully!");
      router.refresh();
      reset();
    }
  };

  return (
    <Card className="w-full lg:max-w-3xl shadow-none">
      <CardHeader>
        <CardTitle>Leave a Review</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)}>
          <FieldGroup>
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
            <Field>
              <Button type="submit">
                {isSubmitting ? <Spinner /> : "Submit"}
              </Button>
              <FieldDescription className="text-center">
                Visitor comments are only published after they have been
                approved.
              </FieldDescription>
            </Field>
          </FieldGroup>
        </form>
      </CardContent>
    </Card>
  );
}
