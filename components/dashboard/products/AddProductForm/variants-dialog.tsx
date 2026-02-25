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
import { createProductOptionValue } from "@/lib/actions/product-option-values";
import { cn } from "@/lib/utils";
import { useLocale } from "next-intl";
import { useRouter } from "next/navigation";
import { SubmitHandler, useForm } from "react-hook-form";
import { toast } from "sonner";

type Inputs = {
  value: string;
};

interface DialogProps {
  className?: string;
  optionName: string;
  optionId: string | null;
  onClose: () => void;
}


export default function VariantDialog({
  onClose,
  optionName,
  optionId,
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
    if (!optionId) return;
    const { error } = await createProductOptionValue({
      value: data.value,
      option_id: optionId,
    });

    if (error) {
      toast.error(error);
      return;
    }

    toast.success("Product Option Value created successfully");
    resetDialog();
  };

  const resetDialog = () => {
    onClose();
    reset();
    router.refresh();
 };

  return (
    <DialogContent
      className={cn("sm:max-w-sm", className)}
      {...props}
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <DialogHeader>
          <DialogTitle>Create Value</DialogTitle>
          <DialogDescription>
            {/* Create Or Update Dialog discription */}
            Create new value forproduct option {optionName}
          </DialogDescription>
        </DialogHeader>
        <FieldGroup className="gap-4">
          {/* name */}
          <Field>
            <FieldLabel htmlFor="value">Value</FieldLabel>
            <Input
              id="value"
              placeholder="eg: 100ml"
              disabled={isSubmitting}
              aria-invalid={errors.value ? "true" : "false"}
              {...register("value", { required: "value is required" })}
            />
            <FieldError>{errors.value?.message}</FieldError>
          </Field>
        </FieldGroup>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline" onClick={resetDialog}>
              Cancel
            </Button>
          </DialogClose>
          <Button type="submit">
            {isSubmitting ? <Spinner /> : isSubmitting ? "Update" : "Create"}
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  );
}
