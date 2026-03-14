"use client";

import { useForm, SubmitHandler, Controller } from "react-hook-form";
// ✅ 1. استيراد useState
import { useState } from "react";
import { toast } from "sonner";
import { updateUserProfile } from "@/lib/actions/user";
import { cn } from "@/lib/utils";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Calendar as CalendarIcon } from "lucide-react";
import { format } from "date-fns";

// (الدالة المساعدة toSafeUTCDate التي أنشأناها سابقًا يجب أن تكون هنا)
const toSafeUTCDate = (dateString: string | undefined): Date | undefined => {
  if (!dateString) return undefined;
  const date = new Date(dateString);
  return new Date(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate());
};

type FormInputs = { date_birth?: string };

interface EditBirthdateFormProps {
  user: { date_birth?: string };
  onFormSubmit: () => void;
}

export function EditBirthdateForm({
  user,
  onFormSubmit,
}: EditBirthdateFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  // ✅ 2. إنشاء حالة للتحكم في فتح وإغلاق التقويم
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);

  const { handleSubmit, control } = useForm<FormInputs>({
    defaultValues: { date_birth: user.date_birth },
  });

  const onSubmit: SubmitHandler<FormInputs> = async (formData) => {
    setIsSubmitting(true);
    const { data: error } = await updateUserProfile(formData);

    if (error) {
      toast.error(error);
      setIsSubmitting(false);
      return;
    }

    toast.success("Date of birth updated successfully!");
    onFormSubmit();

    setIsSubmitting(false);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <FieldGroup>
        <Field>
          <FieldLabel>Date of Birth</FieldLabel>
          <Controller
            name="date_birth"
            control={control}
            render={({ field }) => (
              // ✅ 3. ربط حالة الفتح/الإغلاق بالـ Popover
              <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !field.value && "text-muted-foreground",
                    )}
                    disabled={isSubmitting}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {field.value ? (
                      format(field.value!, "PPP")
                    ) : (
                      <span>Pick a date</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" sideOffset={-50}>
                  <Calendar
                    mode="single"
                    captionLayout="dropdown"
                    fromYear={1900}
                    toYear={new Date().getFullYear()}
                    selected={field.value ? new Date(field.value) : undefined}
                    onSelect={(date) => {
                      // تحديث قيمة الحقل
                      field.onChange(date ? date : undefined);
                      // ✅ 4. إغلاق النافذة المنبثقة بعد الاختيار
                      setIsCalendarOpen(false);
                    }}
                    disabled={(date) =>
                      date > new Date() || date < new Date("1900-01-01")
                    }
                    // يمكنك إضافة الشهر الافتراضي هنا إذا أردت
                    defaultMonth={toSafeUTCDate(field.value) || new Date()}
                  />
                </PopoverContent>
              </Popover>
            )}
          />
        </Field>
        <div className="flex justify-end">
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? <Spinner /> : "Save Changes"}
          </Button>
        </div>
      </FieldGroup>
    </form>
  );
}
