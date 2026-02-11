"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { SubmitHandler, useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { submitSupportRequest } from "@/lib/support";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { verifyMfaForLogin } from "@/lib/actions/verify-mfa-actions";

type SupportRequestInputs = {
  email: string;
  subject: string;
  details: string;
};

export default function VerifyMfaPage() {
  const router = useRouter();

  const [code, setCode] = React.useState("");
  const [isProcessing, setIsProcessing] = React.useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code || code.length < 6) {
      toast.warning("Please enter a valid 6-digit code.");
      return;
    }

    setIsProcessing(true);
    const { data, error } = await verifyMfaForLogin(code);

    if (error) {
      console.error("Error verifying MFA code:", error.message);
      toast.error("Verification failed. The code may be incorrect or expired.");
      setIsProcessing(false);
      setCode("");
    }

    if (data) {
      toast.success("Login successful!");
      setIsProcessing(false);
      router.refresh();
      router.push("/");
    }
  };

  return (
    <Card className="mx-auto w-full max-w-sm pb-0 shadow-2xl">
      <CardHeader>
        <CardTitle>Two-Factor Authentication</CardTitle>
        <CardDescription>
          Enter the 6-digit code from your authenticator app.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit}>
          <FieldGroup>
            <Field
              dir="ltr"
              orientation="horizontal"
              className="flex justify-center"
            >
              <InputOTP
                id="mfa-code"
                maxLength={6}
                value={code}
                onChange={(newValue: string) => setCode(newValue)}
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
          </FieldGroup>
        </form>
      </CardContent>
      <CardFooter className="bg-muted py-4 border-t flex flex-col gap-4">
        <Button
          type="button"
          className="w-full"
          disabled={isProcessing}
          onClick={handleSubmit}
        >
          {isProcessing ? <Spinner /> : "Verify & Log In"}
        </Button>
        <RequestHelpDialog />
      </CardFooter>
    </Card>
  );
}

function RequestHelpDialog() {
  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors, isSubmitting, isSubmitSuccessful },
  } = useForm<SupportRequestInputs>();

  const onSubmit: SubmitHandler<SupportRequestInputs> = async (formData) => {
    const { error } = await submitSupportRequest(
      "mfa_access_request",
      formData.details,
      formData.email,
    );

    if (error) {
      setError("email", { message: error.message });
    }
  };

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      reset();
    }
  };

  return (
    <Dialog onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button
          type="button"
          variant={"link"}
          className="cursor-pointer text-xs underline underline-offset-2 hover:text-foreground"
        >
          Lost access to your authenticator app?
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md pt-4">
        {isSubmitSuccessful ? (
          <>
            <DialogHeader>
              <DialogTitle>Request Sent Successfully</DialogTitle>
              <DialogDescription>
                Thank you. Our support team has received your request and will
                contact you via email within 24 hours to assist you further.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <DialogClose asChild>
                <Button>Close</Button>
              </DialogClose>
            </DialogFooter>
          </>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)}>
            <DialogHeader>
              <DialogTitle>Request to Disable 2FA</DialogTitle>
              <DialogDescription>
                Please fill out the form below. Our support team will manually
                verify your identity to help you regain access.
              </DialogDescription>
            </DialogHeader>
            <div className="pt-8">
              <FieldGroup>
                <Field>
                  <FieldLabel htmlFor="email">Account Email</FieldLabel>
                  <Input
                    id="email"
                    type="text"
                    autoComplete="email"
                    placeholder="you@domain.com"
                    disabled={isSubmitting}
                    aria-invalid={errors.email ? "true" : "false"}
                    {...register("email", {
                      required: "Your account email is required.",
                      pattern: {
                        value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                        message: "Please enter a valid email address.",
                      },
                    })}
                  />
                  {errors.email && (
                    <FieldDescription>{errors.email.message}</FieldDescription>
                  )}
                </Field>
                <Field>
                  <Label htmlFor="details">Details</Label>
                  <Textarea
                    id="details"
                    rows={5}
                    placeholder="Please provide any details that can help us verify your identity..."
                    disabled={isSubmitting}
                    aria-invalid={errors.details ? "true" : "false"}
                    {...register("details", {
                      required: "Please provide some details.",
                      minLength: {
                        value: 10,
                        message: "Please provide at least 10 characters.",
                      },
                    })}
                  />
                  {errors.details && (
                    <FieldDescription>
                      {errors.details.message}
                    </FieldDescription>
                  )}
                </Field>

                {errors.root?.serverError && (
                  <FieldDescription className="text-center">
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
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? <Spinner /> : "Send Request"}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
