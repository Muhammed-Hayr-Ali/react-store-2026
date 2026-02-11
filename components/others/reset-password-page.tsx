"use client";

import { Button } from "@/components/ui/button";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { useForm, SubmitHandler } from "react-hook-form";
import { Spinner } from "@/components/ui/spinner";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { ResetTokenData, updatePassword } from "@/lib/actions/update-password";

interface ResetPasswordPageProps {
  token: string;
  resetTokenData: ResetTokenData;
}

type Inputs = {
  password: string;
  confirmPassword: string;
};

export default function ResetPasswordForm({
  token,
  resetTokenData,
}: ResetPasswordPageProps) {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    getValues,
  } = useForm<Inputs>();

  const onSubmit: SubmitHandler<Inputs> = async (formData) => {
    const { error } = await updatePassword({
      token,
      resetTokenData,
      password: formData.password,
    });

    if (error) {
      toast.error(error);
      return;
    }
    toast.success("Password updated successfully");
    router.refresh();
    router.push("/auth/login");
  };

  return (
    <Card className="mx-auto w-full max-w-sm pb-0 shadow-[0_5px_50px_1px_--theme(--color-foreground/25%)] ring-ring/10">
      <form onSubmit={handleSubmit(onSubmit)}>
        <CardHeader>
          <CardTitle>Update Password</CardTitle>
          <CardDescription>
            You can update your password here. After saving, you&apos;ll be
            logged out.
          </CardDescription>
        </CardHeader>
        <CardContent className="py-8">
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="password">New Password</FieldLabel>
              <Input
                id="password"
                type="password"
                autoComplete="new-password"
                placeholder="••••••••"
                disabled={isSubmitting}
                aria-invalid={errors.password ? "true" : "false"}
                {...register("password", {
                  required: "Please enter a password.",
                  minLength: {
                    value: 8,
                    message: "Password must be at least 8 characters.",
                  },
                })}
              />
              {errors.password ? (
                <FieldDescription>{errors.password.message}</FieldDescription>
              ) : (
                <FieldDescription className="text-xs">
                  Must be at least 8 characters long.
                </FieldDescription>
              )}
            </Field>
            <Field>
              <FieldLabel htmlFor="confirm-password">
                Confirm New Password
              </FieldLabel>
              <Input
                id="confirm-password"
                type="password"
                placeholder="••••••••"
                autoComplete="new-password"
                disabled={isSubmitting}
                aria-invalid={errors.confirmPassword ? "true" : "false"}
                {...register("confirmPassword", {
                  required: "Please confirm your password.",
                  validate: (value) =>
                    value === getValues().password || "Passwords do not match!",
                })}
              />
              {errors.confirmPassword && (
                <FieldDescription>
                  {errors.confirmPassword.message}
                </FieldDescription>
              )}
            </Field>
          </FieldGroup>
        </CardContent>
        <CardFooter className="bg-muted py-4 border-t">
          <Field>
            <Button type="submit" disabled={isSubmitting} className="w-full">
              {isSubmitting ? <Spinner /> : "Set New Password"}
            </Button>
            <Button
              variant={"outline"}
              type="button"
              className="w-full"
              asChild
            >
              <Link href="/">Cancel</Link>
            </Button>
          </Field>
        </CardFooter>
      </form>
    </Card>
  );
}

// <form
//   className={cn("flex flex-col gap-6", className)}
//   {...props}
//   onSubmit={handleSubmit(onSubmit)}
// >
//   <FieldGroup>
//     <Field>
//       <FieldLabel htmlFor="password">New Password</FieldLabel>
//       <Input
//         id="password"
//         type="password"
//         autoComplete="new-password"
//         placeholder="••••••••"
//         disabled={isSubmitting}
//         aria-invalid={errors.password ? "true" : "false"}
//         {...register("password", {
//           required: "Please enter a password.",
//           minLength: {
//             value: 8,
//             message: "Password must be at least 8 characters.",
//           },
//         })}
//       />
//       {errors.password ? (
//         <FieldDescription>{errors.password.message}</FieldDescription>
//       ) : (
//         <FieldDescription className="text-xs">
//           Must be at least 8 characters long.
//         </FieldDescription>
//       )}
//     </Field>
//     <Field>
//       <FieldLabel htmlFor="confirm-password">
//         Confirm New Password
//       </FieldLabel>
//       <Input
//         id="confirm-password"
//         type="password"
//         placeholder="••••••••"
//         autoComplete="new-password"
//         disabled={isSubmitting}
//         aria-invalid={errors.confirmPassword ? "true" : "false"}
//         {...register("confirmPassword", {
//           required: "Please confirm your password.",
//           validate: (value) =>
//             value === getValues().password || "Passwords do not match!",
//         })}
//       />
//       {errors.confirmPassword && (
//         <FieldDescription>
//           {errors.confirmPassword.message}
//         </FieldDescription>
//       )}
//     </Field>
//     <Field>
//       <Button type="submit" disabled={isSubmitting} className="w-full">
//         {isSubmitting ? <Spinner /> : "Set New Password"}
//       </Button>
//       <Button variant={"outline"} type="button" className="w-full" asChild>
//         <Link href="/">Cancel</Link>
//       </Button>
//     </Field>
//   </FieldGroup>
// </form>
