"use client";

import { useState } from "react";
import { useForm, type SubmitHandler, Controller } from "react-hook-form";
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
} from "@/components/ui/card";
import { unsubscribeFromNewsletter } from "@/lib/actions/newsletter";
import { siteConfig } from "@/lib/config/site";

// أسباب شائعة لإلغاء الاشتراك

type FormInputs = {
  reason: string;
  otherReason?: string;
};

export default function UnsubscribePage({ token }: { token: string }) {
  const [formState, setFormState] = useState<"idle" | "success" | "error">(
    "idle",
  );
  const [feedbackMessage, setFeedbackMessage] = useState("");

  const unsubscribeReasons = siteConfig.UNSUBSCRIBE_REASONS;

  const {
    register,
    handleSubmit,
    watch,
    control,
    formState: { errors, isSubmitting },
  } = useForm<FormInputs>({
    defaultValues: {
      reason: unsubscribeReasons[2],
      otherReason: "",
    },
  });

  // eslint-disable-next-line react-hooks/incompatible-library
  const selectedReason = watch("reason");

  const onSubmit: SubmitHandler<FormInputs> = async (formData) => {
    //
    if (!token) return;

    let finalReason = formData.reason;
    if (formData.reason === "Other") {
      finalReason = formData.otherReason?.trim() || "Other";
    }

    const { data, error } = await unsubscribeFromNewsletter(token, finalReason);

    if (error) {
      setFormState("error");
      setFeedbackMessage(error);
      return;
    }

    if (data) {
      setFormState("success");
      return;
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
        <p className="mt-2 text-muted-foreground">Unsubscribe successful</p>
      </div>
    );
  }

  return (
    <Card className="mx-auto w-full max-w-xl pb-0 shadow-[0_5px_50px_1px_--theme(--color-foreground/25%)] ring-ring/10">
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
                {unsubscribeReasons.map((reason) => (
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
