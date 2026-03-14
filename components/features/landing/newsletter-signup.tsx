// components/landing/newsletter-signup.tsx

"use client";

import React from "react";
import { motion } from "framer-motion";
import { useForm, type SubmitHandler } from "react-hook-form";
import { toast } from "sonner";
import { Mail, ArrowRight } from "lucide-react";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { Field, FieldDescription } from "@/components/ui/field";
import { subscribeToNewsletter } from "@/lib/actions/newsletter";

// 1. تعريف أنواع حقول النموذج
type FormInputs = {
  email: string;
};

// 2. تعريف متغيرات الحركة
const FADE_IN_ANIMATION_VARIANTS = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0, transition: { type: "spring", duration: 0.8 } },
} as const;

// ====================================================================
// المكون الرئيسي للقسم
// ====================================================================
export const NewsletterSignup = () => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormInputs>();

  const onSubmit: SubmitHandler<FormInputs> = async (formData) => {
    const { data, error } = await subscribeToNewsletter(formData.email);

    if (error || !data) {
      toast.error(error);
    } else {
      toast.success(data);
      reset();
    }
  };

  return (
    <section className="py-16 sm:py-24 bg-background">
      <div className="container mx-auto ">
        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          variants={FADE_IN_ANIMATION_VARIANTS}
          className="
            relative 
            bg-muted/60 
            border 
            rounded-2xl 
            p-8 
            sm:p-12 
            text-center 
            overflow-hidden
          "
        >
          {/* عنصر زخرفي في الخلفية */}
          <div
            aria-hidden="true"
            className="absolute -top-1/2 -left-1/4 w-full h-full -z-10"
          >
            <div className="w-full h-full bg-primary/5 rounded-full blur-3xl" />
          </div>

          <Mail className="h-12 w-12 mx-auto text-primary mb-4" />
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tighter">
            Never Miss a Deal!
          </h2>
          <p className="mt-2 text-lg text-muted-foreground max-w-2xl mx-auto">
            Subscribe to our newsletter and get a{" "}
            <span className="font-bold text-primary">10% discount</span> on your
            first order, plus exclusive offers.
          </p>

          <form
            onSubmit={handleSubmit(onSubmit)}
            className="mt-8 max-w-md mx-auto"
          >
            <Field>
              <div className="relative">
                <Input
                  id="newsletter-email"
                  type="email"
                  placeholder="Enter your email address"
                  autoComplete="email"
                  disabled={isSubmitting}
                  {...register("email", {
                    required: "Email is required.",
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: "Please enter a valid email address.",
                    },
                  })}
                  className="h-12 pl-4 pr-36 text-base"
                />
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="absolute top-1/2 right-1.5 -translate-y-1/2 h-9"
                >
                  {isSubmitting ? (
                    <Spinner />
                  ) : (
                    <>
                      Subscribe <ArrowRight className="h-4 w-4 ml-2" />
                    </>
                  )}
                </Button>
              </div>
              {errors.email && (
                <FieldDescription className="mt-2 text-left">
                  {errors.email.message}
                </FieldDescription>
              )}
            </Field>
          </form>
        </motion.div>
      </div>
    </section>
  );
};
