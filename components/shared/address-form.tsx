"use client";

import { useForm, SubmitHandler } from "react-hook-form";
import { useState } from "react";
import { toast } from "sonner";
import {
  Field,
  FieldGroup,
  FieldLabel,
  FieldDescription,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { addAddress, updateAddress, UserAddress } from "@/lib/actions/address";

type AddressInputs = Omit<UserAddress, "id" | "user_id" | "created_at">;

interface AddressFormProps {
  mode?: "add" | "edit";
  addressToEdit?: UserAddress;
  onFormSubmit?: () => void;
  onCancel?: () => void;
}

export function AddressForm({
  mode = "add",
  addressToEdit,
  onCancel,
}: AddressFormProps) {
  // تهيئة النموذج بالبيانات الحالية إذا كنا في وضع التعديل
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<AddressInputs>({
    defaultValues: mode === "edit" ? addressToEdit : {},
  });

  const onSubmit: SubmitHandler<AddressInputs> = async (formData) => {
    const { data: addressResult, error: addressError } =
      mode === "edit" && addressToEdit
        ? await updateAddress(addressToEdit.id, formData) // استدعاء دالة التعديل
        : await addAddress(formData); // استدعاء دالة الإضافة

    if (addressError) {
      toast.error(addressError);
      return;
    }
    if (addressResult) {
      toast.success(
        mode === "edit"
          ? "Address updated successfully."
          : "Address added successfully.",
      );
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <FieldGroup>
        <Field>
          <FieldLabel htmlFor="address_nickname">
            Address Nickname (e.g., Home, Work)
          </FieldLabel>
          <Input
            id="address_nickname"
            disabled={isSubmitting}
            aria-invalid={errors.address_nickname ? "true" : "false"}
            {...register("address_nickname", {
              required: "Nickname is required",
            })}
          />
          {errors.address_nickname && (
            <FieldDescription>
              {errors.address_nickname.message}
            </FieldDescription>
          )}
        </Field>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field>
            <FieldLabel htmlFor="first_name">First Name</FieldLabel>
            <Input
              id="first_name"
              disabled={isSubmitting}
              aria-invalid={errors.first_name ? "true" : "false"}
              {...register("first_name", {
                required: "First name is required",
              })}
            />
            {errors.first_name && (
              <FieldDescription>{errors.first_name.message}</FieldDescription>
            )}
          </Field>
          <Field>
            <FieldLabel htmlFor="last_name">Last Name</FieldLabel>
            <Input
              id="last_name"
              disabled={isSubmitting}
              aria-invalid={errors.last_name ? "true" : "false"}
              {...register("last_name", { required: "Last name is required" })}
            />
            {errors.last_name && (
              <FieldDescription>{errors.last_name.message}</FieldDescription>
            )}
          </Field>
        </div>
        <Field>
          <FieldLabel htmlFor="address">Address</FieldLabel>
          <Input
            id="address"
            disabled={isSubmitting}
            aria-invalid={errors.address ? "true" : "false"}
            {...register("address", { required: "Address is required" })}
          />
          {errors.address && (
            <FieldDescription>{errors.address.message}</FieldDescription>
          )}
        </Field>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Field>
            <FieldLabel htmlFor="city">City</FieldLabel>
            <Input
              id="city"
              disabled={isSubmitting}
              aria-invalid={errors.city ? "true" : "false"}
              {...register("city", { required: "City is required" })}
            />
            {errors.city && (
              <FieldDescription>{errors.city.message}</FieldDescription>
            )}
          </Field>
          <Field>
            <FieldLabel htmlFor="state">State / Province</FieldLabel>
            <Input
              id="state"
              disabled={isSubmitting}
              aria-invalid={errors.state ? "true" : "false"}
              {...register("state", { required: "State is required" })}
            />
            {errors.state && (
              <FieldDescription>{errors.state.message}</FieldDescription>
            )}
          </Field>
          <Field>
            <FieldLabel htmlFor="zip">ZIP / Postal Code</FieldLabel>
            <Input
              id="zip"
              disabled={isSubmitting}
              aria-invalid={errors.zip ? "true" : "false"}
              {...register("zip", { required: "ZIP code is required" })}
            />
            {errors.zip && (
              <FieldDescription>{errors.zip.message}</FieldDescription>
            )}
          </Field>
        </div>
        <Field>
          <FieldLabel htmlFor="country">Country</FieldLabel>
          <Input
            id="country"
            disabled={isSubmitting}
            aria-invalid={errors.country ? "true" : "false"}
            {...register("country", { required: "Country is required" })}
          />
          {errors.country && (
            <FieldDescription>{errors.country.message}</FieldDescription>
          )}
        </Field>

        <div className="flex items-center justify-end gap-4 mt-4">
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? (
              <Spinner />
            ) : mode === "edit" ? (
              "Update Address"
            ) : (
              "Save Address"
            )}
          </Button>
          {onCancel && (
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
          )}
        </div>
      </FieldGroup>
    </form>
  );
}
