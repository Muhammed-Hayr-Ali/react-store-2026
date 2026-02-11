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

type FormInputs = { firstName: string; lastName: string };

export function EditNameForm({
  user,
  onFormSubmit,
}: {
  user: { first_name?: string; last_name?: string };
  onFormSubmit: () => void;
}) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormInputs>({
    defaultValues: {
      firstName: user.first_name || "",
      lastName: user.last_name || "",
    },
  });

  const onSubmit: SubmitHandler<FormInputs> = async (formData) => {
    setIsSubmitting(true);
    const result = await updateUserProfile(
      { first_name: formData.firstName, last_name: formData.lastName },
    );
    setIsSubmitting(false);
    if (result?.error) toast.error(result.error);
    else if (result?.success) {
      toast.success(result.message);
      onFormSubmit();
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <FieldGroup >
        <div className="grid grid-cols-1 gap-4">
          <Field>
            <FieldLabel>First Name</FieldLabel>
            <Input
              {...register("firstName", {
                required: "First name is required.",
              })}
            />
            {errors.firstName && (
              <FieldDescription>{errors.firstName.message}</FieldDescription>
            )}
          </Field>
          <Field>
            <FieldLabel>Last Name</FieldLabel>
            <Input
              {...register("lastName", { required: "Last name is required." })}
            />
            {errors.lastName && (
              <FieldDescription>{errors.lastName.message}</FieldDescription>
            )}
          </Field>
        </div>
        <div className="flex justify-end">
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? <Spinner /> : "Save Changes"}
          </Button>
        </div>
      </FieldGroup>
    </form>
  );
}
