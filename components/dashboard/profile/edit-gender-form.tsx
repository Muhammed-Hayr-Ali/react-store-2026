"use client";

import { useForm, SubmitHandler, Controller } from "react-hook-form";
import { useState } from "react";
import { toast } from "sonner";
import { updateUserProfile } from "@/lib/actions/user";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type FormInputs = { gender?: string };

interface EditGenderFormProps {
  user: { gender?: string };
  onFormSubmit: () => void;
}

export function EditGenderForm({ user, onFormSubmit }: EditGenderFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { handleSubmit, control } = useForm<FormInputs>({
    defaultValues: { gender: user.gender || "" },
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
      <FieldGroup>
        <Field>
          <FieldLabel>Gender</FieldLabel>
          <Controller
            name="gender"
            control={control}
            render={({ field }) => (
              <Select
                onValueChange={field.onChange}
                defaultValue={field.value}
                disabled={isSubmitting}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select your gender" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Male">Male</SelectItem>
                  <SelectItem value="Female">Female</SelectItem>
                  <SelectItem value="Prefer not to say">
                    Prefer not to say
                  </SelectItem>
                </SelectContent>
              </Select>
            )}
          />
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
