// app/unsubscribe/page.tsx

"use client";

import React, { useState } from "react";
import { useForm, type SubmitHandler, Controller } from "react-hook-form";
import { toast } from "sonner";
import { CheckCircle, AlertTriangle } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { unsubscribeFromNewsletter } from "@/lib/actions/unsubscribe-actions";

// أسباب شائعة لإلغاء الاشتراك
const UNSUBSCRIBE_REASONS = [
  "I receive too many emails.",
  "The content is not relevant to me.",
  "I no longer wish to receive these emails.",
  "I signed up by accident.",
];

type FormInputs = {
  reason: string;
  otherReason?: string;
};

export default function UnsubscribePage({ token }: { token: string }) {
  const [formState, setFormState] = useState<"idle" | "success" | "error">(
    "idle",
  );
  const [feedbackMessage, setFeedbackMessage] = useState("");

  const {
    register,
    handleSubmit,
    watch,
    control,
    formState: { errors, isSubmitting },
  } = useForm<FormInputs>({
    defaultValues: {
      reason: UNSUBSCRIBE_REASONS[2],
      otherReason: "",
    },
  });

  // eslint-disable-next-line react-hooks/incompatible-library
  const selectedReason = watch("reason");

  const onSubmit: SubmitHandler<FormInputs> = async (data) => {
    if (!token) return;

    let finalReason = data.reason;
    if (data.reason === "Other") {
      finalReason = data.otherReason?.trim() || "Other";
    }

    const result = await unsubscribeFromNewsletter(token, finalReason);

    if (result.error) {
      setFormState("error");
      setFeedbackMessage(result.error.message);
      toast.error(result.error.message);
    } else if (result.data) {
      setFormState("success");
      setFeedbackMessage(result.data.message);
      toast.success(result.data.message);
    }
  };

  if (formState === "error") {
    return (
      <div className="text-center">
        <AlertTriangle className="h-12 w-12 mx-auto text-destructive mb-4" />
        <h2 className="text-2xl font-bold">An Error Occurred</h2>
        <p className="mt-2 text-muted-foreground">{feedbackMessage}</p>
      </div>
    );
  }

  if (formState === "success") {
    return (
      <div className="text-center">
        <CheckCircle className="h-12 w-12 mx-auto text-green-500 mb-4" />
        <h2 className="text-2xl font-bold">Unsubscribed Successfully</h2>
        <p className="mt-2 text-muted-foreground">{feedbackMessage}</p>
      </div>
    );
  }

  return (
    <Card className="mx-auto w-full max-w-xl pb-0 shadow-2xl">
      <form onSubmit={handleSubmit(onSubmit)}>
        <CardHeader>
          <CardTitle>Unsubscribe</CardTitle>
          <CardDescription>
            We&#39;re sorry to see you go. Please let us know why you&#39;re
            unsubscribing.
          </CardDescription>
        </CardHeader>
        <CardContent className="py-8">
          <Controller
            control={control}
            name="reason"
            rules={{ required: "Please select a reason." }}
            render={({ field }) => (
              <RadioGroup
                onValueChange={field.onChange}
                defaultValue={field.value}
                className="space-y-2"
              >
                {UNSUBSCRIBE_REASONS.map((reason) => (
                  <div key={reason} className="flex items-center space-x-2">
                    <RadioGroupItem value={reason} id={reason} />
                    <Label htmlFor={reason} className="font-normal">
                      {reason}
                    </Label>
                  </div>
                ))}
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="Other" id="other" />
                  <Label htmlFor="other" className="font-normal">
                    Other (please specify)
                  </Label>
                </div>
              </RadioGroup>
            )}
          />
          {errors.reason && (
            <p className="text-sm text-destructive">{errors.reason.message}</p>
          )}

          {selectedReason === "Other" && (
            <div className="grid gap-2">
              <Textarea
                {...register("otherReason", {
                  required: "Please specify your reason.",
                })}
                placeholder="Your reason for unsubscribing..."
                className="mt-2"
              />
              {errors.otherReason && (
                <p className="text-sm text-destructive">
                  {errors.otherReason.message}
                </p>
              )}
            </div>
          )}
        </CardContent>
        <CardFooter className="bg-muted py-4 border-t">
          <Button
            type="submit"
            disabled={isSubmitting}
            className="w-full"
            size="lg"
          >
            {isSubmitting ? <Spinner /> : "Confirm Unsubscription"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
