"use client";

import { useForm, SubmitHandler } from "react-hook-form";
import { useState } from "react";
import { toast } from "sonner";
import { updateUserProfile } from "@/lib/actions/user";
import {
  Field,
  FieldGroup,
  FieldLabel,
  FieldDescription,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";

type FormInputs = { phone: string };

interface EditContactFormProps {
  user: { phone?: string };
  onFormSubmit: () => void;
}

export function EditContactForm({ user, onFormSubmit }: EditContactFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormInputs>({
    defaultValues: { phone: user.phone || "" },
  });

  const onSubmit: SubmitHandler<FormInputs> = async (formData) => {
    setIsSubmitting(true);
    const { error } = await updateUserProfile(formData);

    if (error) {
      toast.error(error);
      setIsSubmitting(false);
      return;
    }

    toast.success("Phone number updated successfully!");
    onFormSubmit();

    setIsSubmitting(false);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <FieldGroup>
        <Field>
          <FieldLabel>Phone Number</FieldLabel>
          <Input type="tel" disabled={isSubmitting} {...register("phone")} />
          {errors.phone && (
            <FieldDescription>{errors.phone.message}</FieldDescription>
          )}
        </Field>
        <div className="flex justify-end">
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? <Spinner /> : "Save Changes"}
          </Button>
        </div>
      </FieldGroup>
    </form>
  );
}
