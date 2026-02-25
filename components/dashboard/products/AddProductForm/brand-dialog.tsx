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
import { Brand, createBrand, updateBrand } from "@/lib/actions/brands";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { SubmitHandler, useForm, useWatch } from "react-hook-form";
import slugify from "slugify";
import { toast } from "sonner";

type Inputs = {
  name: string;
  slug: string;
  description: string | null;
  logo_url: string | null;
};

interface DialogProps {
  className?: string;
  onClose: () => void;
  brand: Brand | null;
}
export default function BrandDialog({
  onClose,
  brand,
  className,
  ...props
}: DialogProps) {
  const router = useRouter();

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    control,
    formState: { errors, isSubmitting },
  } = useForm<Inputs>({
    defaultValues: {
      name: brand?.name || "",
      slug: brand?.slug || "",
      description: brand?.description || "",
      logo_url: brand?.logo_url || "",
    },
  });
  const onSubmit: SubmitHandler<Inputs> = async (data) => {
    const { error: brandError } =
      brand && brand?.id
        ? await updateBrand(brand.id, data)
        : await createBrand(data);

    if (brandError) {
      toast.error(brandError);
      return;
    }
    toast.success(`Brand ${brand ? "updated" : "created"} successfully.`);
    router.refresh();
    resetDialog();
  };

  const resetDialog = () => {
    onClose();
    reset();
  };

  const name = useWatch({ control, name: "name" });

  useEffect(() => {
    if (brand) {
      reset(brand);
      console.log("brand", brand);
    }else{
      console.log("reset");
      reset();
    }

    if (name) {
      const slug = slugify(name, {
        lower: true,
        strict: true,
        locale: "ar",
      });
      setValue("slug", slug, { shouldValidate: true });
    }
  }, [brand, reset, name, setValue]);


  return (
    <DialogContent className={cn("sm:max-w-sm", className)} {...props}>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <DialogHeader>
          <DialogTitle>{brand ? "Edit" : "Create"} Brand</DialogTitle>
          <DialogDescription>
            {/* Create Or Update Dialog discription */}
            {brand
              ? "Update Brand Information and save changes."
              : "Create a new Brand and add it to your store."}
          </DialogDescription>
        </DialogHeader>
        <FieldGroup>
          {/* name */}
          <Field>
            <FieldLabel htmlFor="name">Name</FieldLabel>
            <Input
              id="name"
              placeholder="Brand Name"
              disabled={isSubmitting}
              aria-invalid={errors.name ? "true" : "false"}
              {...register("name", { required: "Name is required" })}
            />
            <FieldError>{errors.name?.message}</FieldError>
          </Field>

          {/* slug */}
          <Field>
            <FieldLabel htmlFor="slug">Slug</FieldLabel>
            <Input
              id="slug"
              placeholder="Slug"
              disabled={isSubmitting}
              aria-invalid={errors.slug ? "true" : "false"}
              {...register("slug", { required: "Slug is required" })}
            />
            <FieldError>{errors.slug?.message}</FieldError>
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

          {/* description */}
          <Field>
            <FieldLabel htmlFor="logo_url">Description</FieldLabel>
            <Input
              id="logo_url"
              placeholder="https://example.com/logo.png"
              disabled={isSubmitting}
              {...register("logo_url")}
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
            {isSubmitting ? <Spinner /> : brand ? "Update" : "Create"}
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  );
}
