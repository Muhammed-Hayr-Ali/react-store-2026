// components\account\profile\update-password-form.tsx

"use client";

import { useForm, SubmitHandler } from "react-hook-form";
import { useState } from "react";
import { toast } from "sonner";
import { updateUserPassword } from "@/lib/actions/user";
import {
  Field,
  FieldGroup,
  FieldLabel,
  FieldDescription,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { MailCheck } from "lucide-react";
import {
  AlertDialog,
  AlertDialogDescription,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

// ... (تعريف FormInputs و UpdatePasswordFormProps)
type FormInputs = {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
};
interface UpdatePasswordFormProps {
  onFormSubmit?: () => void;
}

export function UpdatePasswordForm({ onFormSubmit }: UpdatePasswordFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  // ✅ حالة جديدة لعرض رسالة إعادة المصادقة
  const [showReauthMessage, setShowReauthMessage] = useState(false);

  const {
    register,
    handleSubmit,
    getValues,
    formState: { errors },
    reset,
  } = useForm<FormInputs>();

  const onSubmit: SubmitHandler<FormInputs> = async (formData) => {
    setIsSubmitting(true);
    setShowReauthMessage(false); // إخفاء الرسالة القديمة عند كل محاولة جديدة
    const { error } = await updateUserPassword(formData);

    // ✅ === الجزء الجديد ===
    if (error) {
      toast.error(error);
      setIsSubmitting(false);
      return;
    }
    toast.success("Password updated successfully.");
    reset();
    onFormSubmit?.();
    setIsSubmitting(false);
  };

  // ✅ إذا كانت رسالة إعادة المصادقة ظاهرة، اعرضها بدلاً من النموذج
  if (showReauthMessage) {
    return (
      <AlertDialog>
        <MailCheck className="h-4 w-4" />
        <AlertDialogTitle>Check Your Email</AlertDialogTitle>
        <AlertDialogDescription>
          A confirmation link has been sent to your email address. Please click
          the link to finalize your password change.
        </AlertDialogDescription>
      </AlertDialog>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <FieldGroup>
        <Field>
          <FieldLabel>Current Password</FieldLabel>
          <Input
            type="password"
            autoComplete="current-password"
            disabled={isSubmitting}
            {...register("currentPassword", {
              required: "Current password is required.",
            })}
          />
          {errors.currentPassword && (
            <FieldDescription>
              {errors.currentPassword.message}
            </FieldDescription>
          )}
        </Field>
        <Field>
          <FieldLabel>New Password</FieldLabel>
          <Input
            type="password"
            autoComplete="new-password"
            disabled={isSubmitting}
            {...register("newPassword", {
              required: "New password is required.",
              minLength: {
                value: 8,
                message: "Password must be at least 8 characters.",
              },
            })}
          />
          {errors.newPassword && (
            <FieldDescription>{errors.newPassword.message}</FieldDescription>
          )}
        </Field>
        <Field>
          <FieldLabel>Confirm New Password</FieldLabel>
          <Input
            type="password"
            autoComplete="new-password"
            disabled={isSubmitting}
            {...register("confirmPassword", {
              required: "Please confirm your new password.",
              validate: (value) =>
                value === getValues().newPassword ||
                "The passwords do not match.",
            })}
          />
          {errors.confirmPassword && (
            <FieldDescription>
              {errors.confirmPassword.message}
            </FieldDescription>
          )}
        </Field>
        <div className="flex justify-end">
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? <Spinner /> : "Update Password"}
          </Button>
        </div>
      </FieldGroup>
    </form>
  );
}
