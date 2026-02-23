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
import { Field, FieldGroup, FieldError } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";
import { useRouter } from "next/navigation";
import { SubmitHandler, useForm } from "react-hook-form";
import { toast } from "sonner";
import { useLocale } from "next-intl";
import { createProductOptionValue } from "@/lib/actions/product-option-values";

type Inputs = {
  value: string;
};

const isRtlLocale = (locale: string) => {
  return ["ar", "fa", "he", "ur"].includes(locale);
};

export default function VariantsForm({
  closeDialog,
  optionId,
  optionName,
}: {
  closeDialog: () => void;
  optionId: string | undefined;
  optionName: string | undefined;
}) {
  const locale = useLocale();
  const router = useRouter();

  const dir = isRtlLocale(locale) ? "rtl" : "ltr";

  const {
    register,
    reset,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<Inputs>();

  const onSubmit: SubmitHandler<Inputs> = async (data) => {
    if (!optionId) {
      toast.error("Something went wrong");
      return;
    }

    const { error } = await createProductOptionValue({
      value: data.value,
      option_id: optionId,
    });

    if (error) {
      toast.error(error);
      return;
    }

    toast.success("Product Option Value created successfully");

    // Reset the form after successful submission
    reset();

    // Refresh the page after successful submission
    router.refresh();

    // Delay
    await new Promise((resolve) => setTimeout(resolve, 1000));
    // Close the dialog after successful submission
    closeDialog();
  };

  return (
    <>
      <DialogContent className="sm:max-w-sm" dir={dir}>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-2">
          <DialogHeader>
            <DialogTitle>Add New Value</DialogTitle>
            <DialogDescription>
              Add New Value to {optionName} option.
            </DialogDescription>
          </DialogHeader>
          <FieldGroup>
            {/* Name */}
            <Field>
              <Label htmlFor="value">Value</Label>
              <Input
                id="value"
                type="text"
                {...register("value", { required: "Value is required" })}
              />
              <FieldError>{errors.value?.message}</FieldError>
            </Field>
          </FieldGroup>
          <DialogFooter className="pt-8">
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? <Spinner /> : "Save changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </>
  );
}
