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
import { createProductOption, ProductOption, updateProductOption } from "@/lib/actions/product-options";
import { cn } from "@/lib/utils";
import { useLocale } from "next-intl";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import { toast } from "sonner";

type Inputs = {
  name: string;
  unit: string;
  description: string | undefined;
};

interface DialogProps {
  className?: string;
  onClose: () => void;
  productOption: ProductOption | null;
}

const isRtlLocale = (locale: string) => {
  return ["ar", "fa", "he", "ur"].includes(locale);
};
export default function ProductOptionsDialog({
  onClose,
  productOption,
  className,
  ...props
}: DialogProps) {
  const router = useRouter();
  const locale = useLocale();
  const dir = isRtlLocale(locale) ? "rtl" : "ltr";

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<Inputs>({
    defaultValues: {
      name: productOption?.name || "",
      unit: productOption?.unit || "",
      description: productOption?.description || "",
    },
  });
  const onSubmit: SubmitHandler<Inputs> = async (data) => {
    const { error: productOptionError } =
      productOption && productOption?.id
        ? await updateProductOption(productOption.id, data)
        : await createProductOption(data);

    if (productOptionError) {
      toast.error(productOptionError);
      return;
    }
    toast.success(
      `Brand ${productOption ? "updated" : "created"} successfully.`,
    );
    router.refresh();
    resetDialog();
  };

  const resetDialog = () => {
    onClose();
    reset();
  };

  useEffect(() => {
    if (productOption) {
      reset(productOption);
    } else {
      reset({
        name: "",
        unit: "",
        description: "",
      });
    }
  }, [productOption, reset]);

  return (
    <DialogContent
      className={cn("sm:max-w-sm", className)}
      {...props}
      dir={dir}
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <DialogHeader>
          <DialogTitle>
            {productOption ? "Edit" : "Create"} Product Option{" "}
            {productOption && productOption.name}
          </DialogTitle>
          <DialogDescription>
            {/* Create Or Update Dialog discription */}
            {productOption
              ? "Update Product Option Information and save changes."
              : "Create a new Product Option and add it to your store."}
          </DialogDescription>
        </DialogHeader>
        <FieldGroup className="gap-4">
          {/* name */}
          <Field>
            <FieldLabel htmlFor="name">Name</FieldLabel>
            <Input
              id="name"
              placeholder="eg: name"
              disabled={isSubmitting}
              aria-invalid={errors.name ? "true" : "false"}
              {...register("name", { required: "Name is required" })}
            />
            <FieldError>{errors.name?.message}</FieldError>
          </Field>

          {/* slug */}
          <Field>
            <FieldLabel htmlFor="unit">Unit</FieldLabel>
            <Input
              id="unit"
              placeholder="eg: kg, ml, ltr, box, pack, etc"
              disabled={isSubmitting}
              aria-invalid={errors.unit ? "true" : "false"}
              {...register("unit")}
            />
            <FieldError>{errors.unit?.message}</FieldError>
          </Field>

          {/* description */}
          <Field>
            <FieldLabel htmlFor="description">Description</FieldLabel>
            <Input
              id="description"
              placeholder="some description"
              disabled={isSubmitting}
              aria-invalid={errors.description ? "true" : "false"}
              {...register("description")}
            />
          </Field>
        </FieldGroup>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline" onClick={resetDialog}>
              Cancel
            </Button>
          </DialogClose>
          <Button type="submit">
            {isSubmitting ? <Spinner /> : productOption ? "Update" : "Create"}
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  );
}
