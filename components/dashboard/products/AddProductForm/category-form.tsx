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
import { Category, createCategory } from "@/lib/actions/category";
import { useRouter } from "next/navigation";
import { SubmitHandler, useForm } from "react-hook-form";
import { toast } from "sonner";
import slugify from "slugify";
import { useLocale } from "next-intl";
import { useEffect } from "react";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type Inputs = {
  name: string;
  slug: string;
  parent_id?: string;
};

const isRtlLocale = (locale: string) => {
  return ["ar", "fa", "he", "ur"].includes(locale);
};

export default function CategoryForm({
  closeDialog,
  categories,
}: {
  closeDialog: () => void;
  categories?: Category[];
}) {
  const router = useRouter();

  const locale = useLocale();
  const dir = isRtlLocale(locale) ? "rtl" : "ltr";

  const {
    register,
    reset,
    watch,
    setValue,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<Inputs>();

  const name = watch("name");

  useEffect(() => {
    if (name) {
      const slug = slugify(name, {
        lower: true,
        strict: true,
        locale: locale,
      });
      setValue("slug", slug, { shouldValidate: true });
    }
  }, [name, setValue, locale]);

  const onSubmit: SubmitHandler<Inputs> = async (data) => {
    const { error } = await createCategory({
      name: data.name,
      slug: data.slug,
      description: null,
      image_url: null,
      parent_id: data.parent_id || null,
    });

    if (error) {
      toast.error(error);
      return;
    }

    toast.success("Category created successfully");

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
            <DialogTitle>Add a category</DialogTitle>
            <DialogDescription>Add a category to your store.</DialogDescription>
          </DialogHeader>
          <FieldGroup>
            <Field>
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                type="text"
                {...register("name", { required: "Name is required" })}
              />
              <FieldError>{errors.name?.message}</FieldError>
            </Field>
            <Field>
              <Label htmlFor="slug">Slug</Label>
              <Input
                id="slug"
                type="text"
                {...register("slug", { required: "Slug is required" })}
              />
              <FieldError>{errors.slug?.message}</FieldError>
            </Field>
            {categories && categories.length > 0 && (
              <Field>
                <Label htmlFor="slug">Parent</Label>
                <Select onValueChange={(val) => setValue("parent_id", val)}>
                  <SelectTrigger dir={dir} className="w-full">
                    <SelectValue placeholder="Select a Category" />
                  </SelectTrigger>
                  <SelectContent dir={dir}>
                    <SelectGroup>
                      {categories
                        .filter((cat) => !cat.parent_id)
                        .map((cat) => (
                          <SelectItem key={cat.name} value={cat.id}>
                            {cat.name}
                          </SelectItem>
                        ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </Field>
            )}
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
