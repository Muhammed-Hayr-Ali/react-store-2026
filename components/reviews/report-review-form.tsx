// components/reviews/ReportReviewForm.tsx

"use client";

import { useForm, Controller } from "react-hook-form";
import { toast } from "sonner";
import { reportReview } from "@/lib/actions/reports";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Spinner } from "@/components/ui/spinner";

// ✅ 1. استيراد مكونات بناء النموذج المخصصة
import { Field, FieldDescription, FieldGroup, FieldLabel } from "../ui/field";
import { cn } from "@/lib/utils";

// نوع بيانات النموذج
type ReportFormData = {
  reason: string;
  details: string;
};

interface ReportReviewFormProps extends React.ComponentPropsWithoutRef<"form"> {
  reviewId: number;
  onFormSubmit: () => void;
}

export function ReportReviewForm({
  reviewId,
  onFormSubmit,
  className,
  ...props
}: ReportReviewFormProps) {
  const {
    control,
    handleSubmit,
    formState: { isSubmitting, errors },
  } = useForm<ReportFormData>({
    defaultValues: {
      reason: "",
      details: "",
    },
  });

  // دالة لمعالجة الإرسال
  const processForm = async (data: ReportFormData) => {
    const formData = new FormData();
    formData.append("reviewId", String(reviewId));
    formData.append("reason", data.reason);
    formData.append("details", data.details);

    const result = await reportReview(
      { success: false, message: "" },
      formData,
    );

    if (result.success) {
      toast.success(result.message);
      onFormSubmit();
    } else {
      toast.error(result.message || "An unknown error occurred.");
    }
  };

  return (
    // ✅ 2. استخدام نفس بنية <form>
    <form
      className={cn("flex flex-col gap-6 pt-2", className)}
      {...props}
      onSubmit={handleSubmit(processForm)}
    >
      <FieldGroup>
        {/* حقل سبب الإبلاغ (Reason) */}
        <Field>
          <FieldLabel htmlFor="reason">Reason for reporting *</FieldLabel>
          <Controller
            name="reason"
            control={control}
            rules={{ required: "Please select a reason for reporting." }}
            render={({ field }) => (
              <Select
                onValueChange={field.onChange}
                defaultValue={field.value}
                required
                disabled={isSubmitting}
              >
                <SelectTrigger id="reason" className="w-full">
                  <SelectValue placeholder="Select a reason" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="spam">Spam or Advertisement</SelectItem>
                  <SelectItem value="hate_speech">
                    Hate Speech or Harassment
                  </SelectItem>
                  <SelectItem value="irrelevant">
                    Not Relevant to the Product
                  </SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            )}
          />
          {errors.reason && (
            <FieldDescription>{errors.reason.message}</FieldDescription>
          )}
        </Field>

        {/* حقل التفاصيل (Details) */}
        <Field>
          <FieldLabel htmlFor="details">
            Additional Details (optional)
          </FieldLabel>
          <Controller
            name="details"
            control={control}
            render={({ field }) => (
              <Textarea
                id="details"
                placeholder="Provide more information..."
                disabled={isSubmitting}
                {...field}
              />
            )}
          />
        </Field>

        {/* زر الإرسال */}
        <Field>
          <Button type="submit" disabled={isSubmitting} className="w-full">
            {isSubmitting ? <Spinner /> : "Submit Report"}
          </Button>
        </Field>
      </FieldGroup>
    </form>
  );
}
