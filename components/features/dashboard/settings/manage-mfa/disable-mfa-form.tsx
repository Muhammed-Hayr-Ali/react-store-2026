"use client";

import * as React from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import {
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { Field } from "@/components/ui/field";
import { verifyMfa, unenrollMfa } from "@/lib/actions/mfa";

interface DisableMfaFormProps {
  factorId: string;
  onSuccess: () => void;
}

export function DisableMfaForm({ factorId, onSuccess }: DisableMfaFormProps) {
  const [isProcessing, setIsProcessing] = React.useState(false);
  const [verificationCode, setVerificationCode] = React.useState("");
const handleDisableSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  if (!verificationCode.trim()) {
    toast.error("Please enter the verification code.");
    return;
  }

  setIsProcessing(true);

  // --- الخطوة 1: التحقق من الرمز ---
  const { error: verificationError } = await verifyMfa(
    factorId,
    verificationCode,
  );

  // --- الخطوة 2: التعامل مع خطأ التحقق ---
  if (verificationError) {
    toast.error(verificationError);
    // إذا كان الخطأ يتعلق برمز غير صالح، قم بمسح حقل الإدخال
    if (
      verificationError.toLowerCase().includes("invalid") &&
      verificationError.toLowerCase().includes("code")
    ) {
      setVerificationCode("");
    }
    setIsProcessing(false); 
    onSuccess();
    return; // 🛑 أوقف التنفيذ هنا
  }

  // --- الخطوة 3: إلغاء التسجيل (فقط إذا نجح التحقق) ---
  const { error: unenrollError } = await unenrollMfa(factorId);

  // --- الخطوة 4: التعامل مع خطأ إلغاء التسجيل ---
  if (unenrollError) {
    toast.error(unenrollError);
    setIsProcessing(false); // ✅ لا تنس إنهاء حالة التحميل
    return; // 🛑 أوقف التنفيذ هنا
  }

  // --- الخطوة 5: النجاح النهائي ---
  toast.success("Two-Factor Authentication disabled successfully.");
  onSuccess();
  // ملاحظة: لا تحتاج إلى استدعاء setIsProcessing(false) هنا لأن المكون سيتم إلغاء تحميله
};






return (
    <form onSubmit={handleDisableSubmit}>
      <div className="py-4">
        <DialogDescription className="text-center mb-6">
          For your security, please enter the 6-digit code from your
          authenticator app to confirm this action.
        </DialogDescription>
        <Field
          dir="ltr"
          className="flex justify-center"
          orientation={"horizontal"}
        >
          <InputOTP
            id="disable-code"
            maxLength={6}
            value={verificationCode}
            onChange={setVerificationCode}
            disabled={isProcessing}
            autoFocus
            {...{ "aria-label": "Verification code" }}
          >
            <InputOTPGroup>
              <InputOTPSlot index={0} />
              <InputOTPSlot index={1} />
              <InputOTPSlot index={2} />
            </InputOTPGroup>
            <InputOTPSeparator />
            <InputOTPGroup>
              <InputOTPSlot index={3} />
              <InputOTPSlot index={4} />
              <InputOTPSlot index={5} />
            </InputOTPGroup>
          </InputOTP>
        </Field>
      </div>
      <DialogFooter className="mt-4">
        <DialogClose asChild>
          <Button type="button" variant="ghost" disabled={isProcessing}>
            Cancel
          </Button>
        </DialogClose>
        <Button type="submit" variant="destructive" disabled={isProcessing}>
          {isProcessing ? <Spinner /> : "Confirm & Disable"}
        </Button>
      </DialogFooter>
    </form>
  );
}
