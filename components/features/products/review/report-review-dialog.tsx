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
  FieldError, // <-- سنستخدم هذا لعرض رسالة الخطأ
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Spinner } from "@/components/ui/spinner";
import { Textarea } from "@/components/ui/textarea"; // لم يتم استخدامه، لكن سأتركه
import { createReport } from "@/lib/actions/reports";
import { siteConfig } from "@/lib/config/site";

import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { SubmitHandler, useForm, Controller } from "react-hook-form"; // استيراد Controller
import { toast } from "sonner";

type Inputs = {
  reason: string;
  details: string;
  reporter_email: string | null;
};

interface DialogProps {
  className?: string;
  onClose: () => void;
  reviewId: number;
}

export default function ReportReviewDialog({
  onClose,
  reviewId,
  className,
  ...props
}: DialogProps) {
  const router = useRouter();

  const {
    register,
    handleSubmit,
    reset,
    control, // <-- سنستخدم control مع Controller
    formState: { errors, isSubmitting },
  } = useForm<Inputs>();

  const onSubmit: SubmitHandler<Inputs> = async (data) => {
    const { error } = await createReport({
      review_id: reviewId,
      reason: data.reason,
      details: data.details,
    });

    if (error) {
      toast.error(error);
      return;
    }
    toast.success("Review reported successfully!");
    router.refresh();
    resetDialog();
  };

  const resetDialog = () => {
    onClose();
    reset();
  };

  useEffect(() => {

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        resetDialog();
      }

      // enter key submit
      if (event.key === "Enter") {
        event.preventDefault();
        handleSubmit(onSubmit)();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  return (
    <DialogContent className={cn("sm:max-w-sm", className)} {...props}>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <DialogHeader>
          <DialogTitle>Report Review</DialogTitle>
          <DialogDescription>
            Please select a reason for reporting this review.
          </DialogDescription>
        </DialogHeader>
        <FieldGroup>
          {/* *** بداية التعديل الرئيسي *** */}
          <Controller
            name="reason"
            control={control}
            rules={{ required: "Please select a reason." }} // قواعد التحقق توضع هنا
            render={({ field }) => (
              <Field>
                <FieldLabel htmlFor="reason">Reason</FieldLabel>
                <Select
                  onValueChange={field.onChange} // تمرير دالة onChange من Controller
                  defaultValue={field.value} // تمرير القيمة الافتراضية
                  value={field.value} // تمرير القيمة الحالية
                >
                  <SelectTrigger
                    id="reason"
                    ref={field.ref} // تمرير الـ ref
                    aria-invalid={errors.reason ? "true" : "false"}
                  >
                    <SelectValue placeholder="Select a reason" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      {siteConfig.reportReasons?.map((reason) => (
                        <SelectItem key={reason} value={reason}>
                          {reason}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
                <FieldError>{errors?.reason?.message}</FieldError>
              </Field>
            )}
          />

          <Field>
            <FieldLabel htmlFor="details">Details</FieldLabel>
            <Textarea
              id="details"
              placeholder="Write your comment here"
              aria-invalid={errors.details ? "true" : "false"}
              disabled={isSubmitting}
              {...register("details", {
                required: "Details is required",
              })}
            />
            <FieldError>{errors.details?.message}</FieldError>
          </Field>
        </FieldGroup>

        {/* يمكنك إضافة حقل التفاصيل هنا بنفس طريقة Controller إذا أردت */}

        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline" onClick={resetDialog}>
              Cancel
            </Button>
          </DialogClose>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? <Spinner /> : "Submit Report"}
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  );
}
