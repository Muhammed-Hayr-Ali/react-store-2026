"use client";

import { useForm, SubmitHandler } from "react-hook-form";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Field,
  FieldGroup,
  FieldLabel,
  FieldDescription,
} from "@/components/ui/field";
import { Spinner } from "@/components/ui/spinner";
import { submitSupportRequest } from "@/lib/support";

/**
 * 1. أنواع مدخلات النموذج.
 * لم نعد بحاجة إلى البريد الإلكتروني هنا لأنه سيتم تمريره كخاصية.
 */

type DeleteRequestInputs = {
  subject: string;
  details: string;
};
/**
 * 2. واجهة الخصائص (Props) للمكون.
 * يتطلب الآن البريد الإلكتروني للمستخدم الحالي بشكل إلزامي.
 */
interface RequestDeleteAccountDialogProps {
  children: React.ReactNode;
  email: string | null; // خاصية إلزامية لضمان الأمان
}

/**
 * مكون RequestDeleteAccountDialog
 * يعرض نافذة منبثقة لطلب حذف الحساب.
 * يجلب البريد الإلكتروني للمستخدم الحالي تلقائيًا ويمنع تعديله.
 */
export function RequestDeleteAccountDialog({
  children,
  email,
}: RequestDeleteAccountDialogProps) {
  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors, isSubmitting, isSubmitSuccessful },
  } = useForm<DeleteRequestInputs>();


  const onSubmit: SubmitHandler<DeleteRequestInputs> = async (formData) => {
    if (!email) return;
    const { error } = await submitSupportRequest(
      "delete_account_request",
      formData.details,
      email,
    );

    if (error) {
      setError("root.serverError", { type: "server", message: error.message });
    }
  };

  /**
   * دالة لإعادة تعيين النموذج عند إغلاق النافذة.
   */
  const handleOpenChange = (open: boolean) => {
    if (!open) {
      reset();
    }
  };

  return (
    <Dialog onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-md pt-4">
        {isSubmitSuccessful ? (
          // --- رسالة النجاح ---
          <>
            <DialogHeader>
              <DialogTitle className="text-destructive">
                Deletion Request Sent
              </DialogTitle>
              <DialogDescription>
                Your account deletion request has been received. For security,
                our team will verify your request and process it within 48
                hours. You will receive a final confirmation email.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <DialogClose asChild>
                <Button>Close</Button>
              </DialogClose>
            </DialogFooter>
          </>
        ) : (
          // --- نموذج الطلب ---
          <form onSubmit={handleSubmit(onSubmit)}>
            <DialogHeader>
              <DialogTitle className="text-destructive">
                Request Account Deletion
              </DialogTitle>
              <DialogDescription>
                This is a final, irreversible action. Please review your account
                email and provide a reason for deletion.
              </DialogDescription>
            </DialogHeader>
            <div className="pt-8">
              <FieldGroup>
                {/* --- 4. حقل البريد الإلكتروني الآمن (للقراءة فقط) --- */}
                <Field>
                  <FieldLabel htmlFor="email">Account to be Deleted</FieldLabel>
                  <Input
                    id="email"
                    type="email"
                    value={email || ''} // القيمة تأتي من الخاصية
                    readOnly // جعله للقراءة فقط لمنع التعديل
                    className="bg-muted/50 cursor-not-allowed focus-visible:ring-0" // تصميم مرئي للإشارة إلى أنه غير قابل للتعديل
                  />
                  <FieldDescription>
                    This is the account that will be scheduled for deletion.
                    This cannot be changed.
                  </FieldDescription>
                </Field>

                {/* --- حقل سبب الحذف --- */}
                <Field>
                  <Label htmlFor="reason">Reason for Deletion (Optional)</Label>
                  <Textarea
                    id="reason"
                    placeholder="We're sorry to see you go. Any feedback is appreciated."
                    disabled={isSubmitting}
                    aria-invalid={errors.details ? "true" : "false"}
                    {...register("details", {
                      minLength: {
                        value: 5,
                        message: "Please provide a few more details.",
                      },
                    })}
                  />
                  {errors.details && (
                    <FieldDescription>
                      {errors.details.message}
                    </FieldDescription>
                  )}
                </Field>

                {/* --- عرض أخطاء الخادم --- */}
                {errors.root?.serverError && (
                  <FieldDescription className="text-center text-destructive">
                    {errors.root.serverError.message}
                  </FieldDescription>
                )}
              </FieldGroup>
            </div>
            <DialogFooter className="pt-8">
              <DialogClose asChild>
                <Button type="button" variant="outline" disabled={isSubmitting}>
                  Cancel
                </Button>
              </DialogClose>
              <Button
                type="submit"
                variant="destructive"
                disabled={isSubmitting}
              >
                {isSubmitting ? <Spinner /> : "Submit Deletion Request"}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
