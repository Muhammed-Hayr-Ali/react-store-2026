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
import { createProductOption } from "@/lib/actions/product-options";

type Inputs = {
  name: string;
  unit: string;
  description: string;
};



export default function OptionsForm({
  closeDialog,
}: {
  closeDialog: () => void;
}) {
  const router = useRouter();

  const {
    register,
    reset,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<Inputs>();

  const onSubmit: SubmitHandler<Inputs> = async (data) => {
    const { error } = await createProductOption({
      name: data.name,
      unit: data.unit,
      description: data.description,
    });

    if (error) {
      toast.error(error);
      return;
    }

    toast.success("Product Option created successfully");

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
      <DialogContent className="sm:max-w-sm" >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-2">
          <DialogHeader>
            <DialogTitle>Add a Product Options</DialogTitle>
            <DialogDescription>
              Add a new Product Options to your store.
            </DialogDescription>
          </DialogHeader>
          <FieldGroup>
            {/* Name */}
            <Field>
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                type="text"
                {...register("name", { required: "Name is required" })}
              />
              <FieldError>{errors.name?.message}</FieldError>
            </Field>
            {/* Unit */}
            <Field>
              <Label htmlFor="unit">Unit</Label>
              <Input
                id="unit"
                type="text"
                {...register("unit")}
              />
              <FieldError>{errors.unit?.message}</FieldError>
            </Field>
            {/* description */}
            <Field>
              <Label htmlFor="slug">Description</Label>
              <Input
                id="description"
                type="text"
                {...register("description", {
                  required: "Description is required",
                })}
              />
              <FieldError>{errors.description?.message}</FieldError>
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
