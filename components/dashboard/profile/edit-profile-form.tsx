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
import { Textarea } from "@/components/ui/textarea";

// ✅ النوع يستخدم snake_case ليطابق قاعدة البيانات و Server Action
type FormInputs = {
  first_name: string;
  last_name: string;
  status_message?: string;
};

interface EditProfileFormProps {
  user: {
    first_name?: string;
    last_name?: string;
    status_message?: string;
  };
  onFormSubmit: () => void;
}

export function EditProfileForm({ user, onFormSubmit }: EditProfileFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormInputs>({
    defaultValues: {
      first_name: user.first_name || "",
      last_name: user.last_name || "",
      status_message: user.status_message || "",
    },
  });

  const onSubmit: SubmitHandler<FormInputs> = async (formData) => {
    setIsSubmitting(true);
    const result = await updateUserProfile(formData); 
    setIsSubmitting(false);

    if (result?.error) {
      toast.error(result.error);
    } else if (result?.success) {
      toast.success(result.message);
      onFormSubmit();
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <FieldGroup className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field>
            <FieldLabel>First Name</FieldLabel>
            <Input
              {...register("first_name", {
                required: "First name is required.",
              })}
              disabled={isSubmitting}
            />
            {errors.first_name && (
              <FieldDescription>{errors.first_name.message}</FieldDescription>
            )}
          </Field>
          <Field>
            <FieldLabel>Last Name</FieldLabel>
            <Input
              {...register("last_name", { required: "Last name is required." })}
              disabled={isSubmitting}
            />
            {errors.last_name && (
              <FieldDescription>{errors.last_name.message}</FieldDescription>
            )}
          </Field>
        </div>
        <Field>
          <FieldLabel>Status Message</FieldLabel>
          <Textarea
            {...register("status_message")}
            placeholder="Let everyone know what you're up to..."
            disabled={isSubmitting}
            rows={3}
          />
        </Field>
        <div className="flex justify-end pt-4">
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? <Spinner /> : "Save Changes"}
          </Button>
        </div>
      </FieldGroup>
    </form>
  );
}
