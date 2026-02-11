// In: hooks/use-mfa.ts
import * as React from "react";
import { toast } from "sonner";
import { type Factor } from "@supabase/supabase-js";

import { getErrorMessage } from "@/lib/utils";
import { EnrollmentData, enrollMfa, listMfaFactors, unenrollMfa } from "@/lib/actions/mfa";

export function useMfa() {
  const [isLoading, setIsLoading] = React.useState(true);
  const [isOperationLoading, setIsOperationLoading] = React.useState(false);
  const [verifiedFactor, setVerifiedFactor] = React.useState<Factor | null>(
    null,
  );
  const [dialog, setDialog] = React.useState<"enable" | "disable" | null>(null);
  const [enrollmentData, setEnrollmentData] =
    React.useState<EnrollmentData | null>(null);

  const loadMfaStatus = React.useCallback(async (): Promise<void> => {
    setIsLoading(true);
    try {
      const data = await listMfaFactors();
      const activeFactor =
        data.all?.find((f) => f.status === "verified") ?? null;
      setVerifiedFactor(activeFactor);
    } catch (error) {
      console.error("Failed to load MFA status:", error);
      toast.error(getErrorMessage(error, "Failed to load security settings"));
      setVerifiedFactor(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const startEnableMfa = React.useCallback(async (): Promise<void> => {
    setIsOperationLoading(true);
    try {
      const data = await enrollMfa();
      setEnrollmentData(data);
      setDialog("enable");
    } catch (error) {
      console.error("Failed to start MFA enrollment:", error);
      toast.error(getErrorMessage(error, "Failed to start 2FA setup"));
    } finally {
      setIsOperationLoading(false);
    }
  }, []);

  const startDisableMfa = React.useCallback((): void => {
    if (!verifiedFactor) {
      toast.error("No active 2FA method found to disable");
      return;
    }
    setDialog("disable");
  }, [verifiedFactor]);

  const handleCloseDialog = React.useCallback(
    (isOpen: boolean): void => {
      if (isOpen) return;

      if (dialog === "enable" && enrollmentData) {
        unenrollMfa(enrollmentData.id).catch((err) => {
          if (err.message !== "MFA factor not found") {
            console.warn("MFA cleanup warning:", err);
          }
        });
      }

      setDialog(null);
      setEnrollmentData(null);
    },
    [dialog, enrollmentData],
  );

  const handleSuccess = React.useCallback(async (): Promise<void> => {
    setDialog(null);
    setEnrollmentData(null);
    await loadMfaStatus();

    toast.success(
      verifiedFactor
        ? "Two-Factor Authentication has been disabled"
        : "Two-Factor Authentication has been enabled",
    );
  }, [loadMfaStatus, verifiedFactor]);

  const handleFailure = React.useCallback((error: unknown): void => {
    console.error("MFA operation failed:", error);
    toast.error(getErrorMessage(error, "Operation failed. Please try again."));
    setDialog(null);
    setEnrollmentData(null);
  }, []);

  React.useLayoutEffect(() => {
    loadMfaStatus();
  }, [loadMfaStatus]);

  return {
    isLoading,
    isOperationLoading,
    verifiedFactor,
    dialog,
    enrollmentData,
    startEnableMfa,
    startDisableMfa,
    handleCloseDialog,
    handleSuccess,
    handleFailure,
  };
}
