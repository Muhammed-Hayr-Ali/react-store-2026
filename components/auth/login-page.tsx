"use client";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldSeparator,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { useForm, SubmitHandler } from "react-hook-form";
import { Spinner } from "@/components/ui/spinner";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import Link from "next/link";
import React from "react";
import { useLocale } from "next-intl";
import { AppLogo } from "../custom-ui/app-logo";
import { signInWithPassword } from "@/lib/actions/signIn-with-password-action";
import { signInWithGoogle } from "@/lib/actions/signIn-with-google";

type Inputs = {
  email: string;
  password: string;
};

export function LoginPage({}: React.ComponentProps<"div">) {
  const locale = useLocale();
  const router = useRouter();
  const [isLoading, setIsLoading] = React.useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<Inputs>();

  const onSubmit: SubmitHandler<Inputs> = async (formData) => {
    const { data, error, mfaData } = await signInWithPassword(
      formData.email,
      formData.password,
    );

    if (error) {
      toast.error(error.message);
      return;
    }

    if (mfaData) {
      router.push(`/${locale}/verify`);
    }
    if (data) {
      router.refresh();
      router.push("/");
    }
  };

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    try {
      await signInWithGoogle(locale);
    } catch (error) {
      toast.error((error as Error).message);
      setIsLoading(false);
    }
  };

  return (
    <form className="p-6 md:p-8" onSubmit={handleSubmit(onSubmit)}>
      <FieldGroup>
        <div className="flex flex-col items-center gap-2 text-center">
          <AppLogo />
          <h1 className="text-2xl font-bold mt-4">Welcome back</h1>
          <p className="text-muted-foreground text-balance">
            Login to your Acme Inc account
          </p>
        </div>
        <Field>
          <FieldLabel htmlFor="email">Email</FieldLabel>
          <Input
            id="email"
            type="email"
            placeholder="you@domain.com"
            required
            {...register("email", {
              required: "Email is required",
              pattern: {
                value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                message: "Invalid email address",
              },
            })}
          />
          <FieldError>{errors.email?.message}</FieldError>
        </Field>
        <Field>
          <div className="flex items-center justify-between">
            <FieldLabel htmlFor="password">Password</FieldLabel>
            <Link
              href="/auth/forgot-password"
              className="ml-0  text-sm underline-offset-2 hover:underline"
            >
              Forgot your password?
            </Link>
          </div>
          <Input
            id="password"
            type="password"
            required
            {...register("password", {
              required: "Password is required",
              maxLength: {
                value: 100,
                message: "Password must be less than 100 characters",
              },
              minLength: {
                value: 3,
                message: "Password must be more than 3 characters",
              },
            })}
          />
          <FieldError>{errors.password?.message}</FieldError>
        </Field>
        <Field>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? <Spinner /> : "Login"}
          </Button>
        </Field>
        <FieldSeparator className="*:data-[slot=field-separator-content]:bg-card">
          Or continue with
        </FieldSeparator>
        <Field>
          <Button
            variant="outline"
            type="button"
            onClick={handleGoogleSignIn}
            disabled={isLoading}
          >
            {isLoading ? (
              <Spinner />
            ) : (
              <div className="flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                  <path
                    d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z"
                    fill="currentColor"
                  />
                </svg>
                Login with Google
              </div>
            )}
          </Button>
          <FieldDescription className="text-center">
            Don&apos;t have an account? <Link href="/auth/signup">Sign up</Link>
          </FieldDescription>
        </Field>
      </FieldGroup>
    </form>
  );
}

//   return (
//     <form
//       className={cn("flex flex-col gap-6", className)}
//       {...props}
//       onSubmit={handleSubmit(onSubmit)}
//     >
//       <FieldGroup>
//         <div className="flex flex-col items-center gap-1 text-center">
//           <h1 className="text-2xl font-bold">Login to your account</h1>
//           <p className="text-muted-foreground text-sm text-balance">
//             Enter your email below to login to your account
//           </p>
//         </div>
//         <Field>
//           <FieldLabel htmlFor="email">Email</FieldLabel>
//           <Input
//             id="email"
//             type="email"
//             autoComplete="email"
//             placeholder="you@domain.com"
//             disabled={isSubmitting}
//             aria-invalid={errors.email ? "true" : "false"}
//             {...register("email", {
//               required: "Email is required",
//               pattern: {
//                 value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
//                 message: "Invalid email address",
//               },
//               maxLength: {
//                 value: 100,
//                 message: "Email must be less than 100 characters",
//               },
//               minLength: {
//                 value: 3,
//                 message: "Email must be at least 3 characters",
//               },
//             })}
//           />
//           {errors.email && (
//             <FieldDescription>{errors.email.message}</FieldDescription>
//           )}
//         </Field>
//         <Field>
//           <div className="flex items-center justify-between">
//             <FieldLabel htmlFor="password">Password</FieldLabel>
//             <div>
//               <Link
//                 href={`/${locale}/auth/forgot-password`}
//                 className="ml-auto underline-offset-4 text-xs"
//               >
//                 Forgot your password?
//               </Link>
//             </div>
//           </div>
//           <Input
//             id="password"
//             autoComplete="new-password"
//             type="password"
//             placeholder="••••••••"
//             disabled={isSubmitting}
//             aria-invalid={errors.password ? "true" : "false"}
//             {...register("password", {
//               required: "Password is required",
//               maxLength: {
//                 value: 100,
//                 message: "Password must be less than 100 characters",
//               },
//               minLength: {
//                 value: 3,
//                 message: "Password must be at least 3 characters",
//               },
//             })}
//           />
//           {errors.password && (
//             <FieldDescription>{errors.password.message}</FieldDescription>
//           )}
//         </Field>
//         <Field>
//           <Button
//             type="button"
//             onClick={handleSubmit(onSubmit)}
//             disabled={isSubmitting}
//           >
//             {isSubmitting ? <Spinner /> : "Login"}
//           </Button>
//         </Field>
//         <FieldSeparator>Or continue with</FieldSeparator>
//         <Field>
//           <Button
//             variant="outline"
//             type="button"
//             onClick={handleGoogleSignIn}
//             disabled={isLoading}
//           >
//             {isLoading ? (
//               <Spinner />
//             ) : (
//               <div className="flex items-center gap-2">
//                 <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
//                   <path
//                     d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z"
//                     fill="currentColor"
//                   />
//                 </svg>
//                 Login with Google
//               </div>
//             )}
//           </Button>
//           <FieldDescription className="text-center">
//             Don&apos;t have an account?{" "}
//             <Link
//               href={`/${locale}/auth/signup`}
//               className="underline underline-offset-4"
//             >
//               Sign up
//             </Link>
//           </FieldDescription>
//         </Field>
//       </FieldGroup>
//     </form>
//   );
// }
