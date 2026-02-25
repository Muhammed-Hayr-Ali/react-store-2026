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
import {
  Category,
  createCategory,
  updateCategory,
} from "@/lib/actions/category";
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
  image_url: string | null;
  parent_id: string | null;
};

interface DialogProps {
  className?: string;
  onClose: () => void;
  category: Category | null;
}
export default function CategoryDialog({
  onClose,
  category,
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
      name: category?.name || "",
      slug: category?.slug || "",
      description: category?.description || "",
      image_url: category?.image_url || "",
      parent_id: category?.parent_id || null,
    },
  });
  const onSubmit: SubmitHandler<Inputs> = async (data) => {
    const { error: categoryError } =
      category && category?.id
        ? await updateCategory(category.id, data)
        : await createCategory(data);

    if (categoryError) {
      toast.error(categoryError);
      return;
    }
    toast.success(`category ${category ? "updated" : "created"} successfully.`);
    router.refresh();
    resetDialog();
  };

  const resetDialog = () => {
    onClose();
    reset();
  };

  const name = useWatch({ control, name: "name" });

  useEffect(() => {
    if (category) {
      reset(category);
    } else {
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
  }, [category, reset, name, setValue]);

  return (
    <DialogContent className={cn("sm:max-w-sm", className)} {...props}>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <DialogHeader>
          <DialogTitle>{category ? "Edit" : "Create"} Category</DialogTitle>
          <DialogDescription>
            {/* Create Or Update Dialog discription */}
            {category
              ? "Update Category Information and save changes."
              : "Create a new Category and add it to your store."}
          </DialogDescription>
        </DialogHeader>
        <FieldGroup>
          {/* name */}
          <Field>
            <FieldLabel htmlFor="name">Name</FieldLabel>
            <Input
              id="name"
              placeholder="Category Name"
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

          {/* image url */}
          <Field>
            <FieldLabel htmlFor="logo_url">Description</FieldLabel>
            <Input
              id="logo_url"
              placeholder="https://example.com/logo.png"
              disabled={isSubmitting}
              {...register("image_url")}
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
            {isSubmitting ? <Spinner /> : category ? "Update" : "Create"}
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  );
}
