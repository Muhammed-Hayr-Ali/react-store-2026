"use client";
import * as React from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { Field } from "@/components/ui/field";
import { CheckCheckIcon, CopyIcon } from "lucide-react";
import { EnrollmentData, verifyMfa } from "@/lib/actions/mfa";

interface EnableMfaFormProps {
  enrollmentData: EnrollmentData;
  onSuccess: () => void;
}

export function EnableMfaForm({
  enrollmentData,
  onSuccess,
}: EnableMfaFormProps) {
  const [isProcessing, setIsProcessing] = React.useState(false);
  const [verificationCode, setVerificationCode] = React.useState("");
  const [isCopied, setIsCopied] = React.useState(false);




  const handleVerificationSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!verificationCode.trim()) {
      toast.error("Please enter the verification code.");
      return;
    }

    setIsProcessing(true);

    // --- الخطوة 1: التحقق من الرمز ---
    const {error: verificationError } = await verifyMfa(
      enrollmentData.id,
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

      setIsProcessing(false); // ✅ لا تنس إنهاء حالة التحميل
      return; // 🛑 أوقف التنفيذ هنا
    }

    setIsProcessing(false);
    onSuccess(); // ✅ لا تنس إنهاء حالة التحميل
    return; // 🛑 أوقف التنفيذ هنا
  };

  const handleCopyClick = async () => {
    const textToCopy = enrollmentData.totp.secret;

    // التحقق مما إذا كانت واجهة الحافظة مدعومة
    if (!navigator.clipboard) {
      // يمكنك هنا وضع حل احتياطي بالطريقة القديمة إذا أردت دعم متصفحات قديمة جدًا
      toast.error("Clipboard API not supported on this browser.");
      return;
    }

    try {
      // محاولة الكتابة إلى الحافظة
      await navigator.clipboard.writeText(textToCopy);

      // نجحت العملية!
      setIsCopied(true);
      toast.success("Secret copied to clipboard!");

      // إعادة الأيقونة إلى شكلها الأصلي بعد فترة
      setTimeout(() => {
        setIsCopied(false);
      }, 2000); // بعد ثانيتين
    } catch (err) {
      // فشلت العملية
      console.error("Failed to copy text: ", err);
      toast.error("Failed to copy. Please copy manually.");
    }
  };

  return (
    <ScrollArea className="max-h-[80vh] rounded-md p-4 text-center">
      <div className="flex flex-col items-center gap-4">
        <h4 className="font-semibold text-sm">Step 1: Scan QR Code</h4>
        <p className="text-sm text-muted-foreground">
          Scan this image with an authenticator app.
        </p>
        <div className="inline-block rounded-lg border bg-white p-0">
          <img src={enrollmentData.totp.qr_code} alt="QR Code for 2FA" />
        </div>
        <p className="flex items-center gap-4 text-sm text-muted-foreground mt-2 bg-muted/50 p-2 rounded-md w-fit">
          {enrollmentData.totp.secret}
          <button
            onClick={handleCopyClick}
            type="button"
            className="hidden lg:block"
          >
            {isCopied ? (
              <CheckCheckIcon className="h-4 w-4" />
            ) : (
              <CopyIcon className="h-4 w-4" />
            )}
          </button>
        </p>
      </div>
      <hr className="my-6" />
      <div>
        <h4 className="font-semibold text-sm mb-2">Step 2: Verify Code</h4>
        <p className="text-sm text-muted-foreground mb-2">
          Enter the 6-digit code from your app.
        </p>
        <form
          onSubmit={handleVerificationSubmit}
          className="flex flex-col items-center space-y-6 mt-6 px-6 pb-4"
        >
          <Field
            dir="ltr"
            className="flex justify-center"
            orientation={"horizontal"}
          >
            <InputOTP
              id="verification-code"
              maxLength={6}
              value={verificationCode}
              onChange={setVerificationCode}
              disabled={isProcessing}
              autoFocus
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
          <Button type="submit" disabled={isProcessing} className="w-full">
            {isProcessing ? <Spinner /> : "Verify & Enable"}
          </Button>
        </form>
      </div>
    </ScrollArea>
  );
}
