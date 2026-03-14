// In: components/profile/manage-mfa.tsx
"use client";

import * as React from "react";
import { toast } from "sonner";
import { type Factor } from "@supabase/supabase-js";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { EnableMfaForm } from "./enable-mfa-form";
import { DisableMfaForm } from "./disable-mfa-form";
import {
  EnrollmentData,
  enrollMfa,
  getMfaFactors,
  unenrollMfa,
} from "@/lib/actions/mfa";

export default function ManageMfa() {
  // ✅ حالة التحميل قبل تحميل حالة الـ MFA
  const [isLoading, setIsLoading] = React.useState(true);

  // ✅ حالة التحميل عند تحديث حالة الـ MFA
  const [isOperationLoading, setIsOperationLoading] = React.useState(false);

  // ✅ حالة التحقق
  const [verifiedFactor, setVerifiedFactor] = React.useState<Factor | null>(
    null,
  );

  // ✅ حالة الدايلوج
  const [dialog, setDialog] = React.useState<"enable" | "disable" | null>(null);

  // بيانات التحقق
  const [enrollmentData, setEnrollmentData] =
    React.useState<EnrollmentData | null>(null);

  // ✅ دالة التحقق من حالة الـ MFA
  const refreshFactors = React.useCallback(async () => {
    setIsLoading(true);
    const { data: factor, error } = await getMfaFactors();

    if (error || !factor) {
      setVerifiedFactor(null);
    } else {
      setVerifiedFactor(factor);
    }

    setIsLoading(false);
  }, []);

  // ✅ تحميل حالة الـ MFA عند التحميل الأول
  React.useLayoutEffect(() => {
    refreshFactors();
  }, [refreshFactors]);

  // =============================================================================
  // ✅ تفعيل الـ MFA
  // =============================================================================
  const handleEnableMfa = async () => {
    setIsOperationLoading(true);

    const { data, error } = await enrollMfa();

    if (error || !data) {
      toast.error("Failed to start MFA enrollment");
      setIsOperationLoading(false);
      return;
    }
    setEnrollmentData(data);
    setDialog("enable");
    setIsOperationLoading(false);
  };

  // ✅ تعطيل الـ MFA
  const handleDisableMfa = React.useCallback(() => {
    if (!verifiedFactor) {
      toast.error("No active MFA factor found to disable");
      return;
    }
    setDialog("disable");
  }, [verifiedFactor]);

  // ✅ اغلاق الدايلوج وتنظيف البيانات
  const handleDialogClose = React.useCallback(
    (open: boolean) => {
      if (open) return;

      if (dialog === "enable" && enrollmentData) {
        unenrollMfa(enrollmentData.id).catch((err) =>
          console.warn("MFA cleanup warning:", err),
        );
      }

      setDialog(null);
      setEnrollmentData(null);
    },
    [dialog, enrollmentData],
  );

  // close dialog
  const handleSuccess = React.useCallback(async () => {
    setDialog(null);
    setEnrollmentData(null);
    await refreshFactors();
  }, [refreshFactors]);

  if (isLoading) {
    return (
      <div
        role="status"
        aria-busy="true"
        className="bg-muted rounded-lg animate-pulse h-9 w-25"
        aria-label="Loading MFA status"
      />
    );
  }

  return (
    <>
      <Button
        onClick={verifiedFactor ? handleDisableMfa : handleEnableMfa}
        disabled={isLoading || isOperationLoading}
        variant={verifiedFactor ? "destructive" : "default"}
        aria-label={
          verifiedFactor
            ? "Disable Two-Factor Authentication"
            : "Enable Two-Factor Authentication"
        }
        className="gap-2"
      >
        {isOperationLoading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            {verifiedFactor ? "Disabling..." : "Enabling..."}
          </>
        ) : verifiedFactor ? (
          <span>Disable 2FA</span>
        ) : (
          <span>Enable 2FA</span>
        )}
      </Button>

      {/* نافذة التفعيل */}
      <Dialog open={dialog === "enable"} onOpenChange={handleDialogClose}>
        <DialogContent className="sm:max-w-md p-0 max-h-[90vh] overflow-hidden gap-0">
          <DialogHeader className="p-4 border-b">
            <DialogTitle>Enable Two-Factor Authentication</DialogTitle>
          </DialogHeader>
          {enrollmentData && (
            <EnableMfaForm
              enrollmentData={enrollmentData}
              onSuccess={handleSuccess}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* نافذة التعطيل */}
      <Dialog open={dialog === "disable"} onOpenChange={handleDialogClose}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Disable Two-Factor Authentication</DialogTitle>
            <p className="text-sm text-muted-foreground mt-2">
              This will remove your current 2FA method. Ensure you have backup
              access.
            </p>
          </DialogHeader>
          {verifiedFactor && (
            <DisableMfaForm
              factorId={verifiedFactor.id}
              onSuccess={handleSuccess}
            />
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
