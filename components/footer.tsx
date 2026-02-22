"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { siteConfig } from "@/lib/config/site";
import { FaceBookIcon, PinterestIcon, TelegramIcon } from "./custom-ui/icons";
import { AppLogo } from "./custom-ui/app-logo";
import { ModeToggle } from "./custom-ui/mode-toggle";
import { toast } from "sonner";
import { Spinner } from "./ui/spinner";
import { useForm, type SubmitHandler } from "react-hook-form";
import { subscribeToNewsletter } from "@/lib/actions/newsletter";
import { useLocale } from "next-intl";

type FormInputs = {
  email: string;
};

const Footer = () => {
  return (
    <footer className="w-full border-t bg-background/50 text-sm text-muted-foreground">
      <div className="container mx-auto px-4 flex flex-col py-6 gap-2">
        <div className="flex flex-col lg:flex-row  justify-center py-6 gap-10">
          <div className="h-full w-full lg:basis-1/4 ">
            <div className="flex flex-col gap-4 text-foreground">
              <AppLogo size="md" withoutText={false} />
              <p className="text-xs text-accents-5">{siteConfig.description}</p>
              <div className="flex gap-4  text-accent-foreground/50">
                <FaceBookIcon />
                <PinterestIcon />
                <TelegramIcon />
              </div>
              {/* description */}
            </div>
          </div>
          <div className="h-full w-full lg:basis-1/2">
            <div className="flex h-full w-full">
              <div className="w-1/2 h-full ">
                <h4 className="text-sm font-medium text-foreground">
                  Quick Links
                </h4>
                <ul>
                  {siteConfig.quickLinks.map((link) => (
                    <li key={link.href}>
                      <Link
                        href={link.href}
                        className="text-xs text-accents-5 hover:text-foreground"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="w-1/2 h-full">
                <h4 className="text-sm font-medium text-foreground">
                  Support Links
                </h4>
                <ul>
                  {siteConfig.supportLinks.map((link) => (
                    <li key={link.href}>
                      <Link
                        href={link.href}
                        className="text-xs text-accents-5 hover:text-foreground"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
          <Newsletter />
        </div>
        <div className="w-full flex justify-between items-center text-xs">
          <p>
            &copy; {new Date().getFullYear()} {siteConfig.name}. All rights
            reserved.
          </p>
          <ModeToggle />
        </div>
      </div>
    </footer>
  );
};

export default Footer;

const Newsletter = () => {
  const locale = useLocale();
  const {
    register,
    handleSubmit,
    reset,
    formState: { isSubmitting },
  } = useForm<FormInputs>();

  const onSubmit: SubmitHandler<FormInputs> = async (formData) => {
    const { data, error } = await subscribeToNewsletter(
      formData.email,
      locale
    );

    if (error || !data) {
      toast.error(error);
    } else {
      toast.success(data);
      reset();
    }
  };

  return (
    <div className="h-full w-full lg:basis-1/4 ">
      <div className="flex flex-col gap-4">
        <h4 className="text-sm font-medium text-foreground">
          Subscribe to our newsletter
        </h4>
        <p className="text-xs text-accents-5">
          Stay updated on new releases and features, guides, and case studies.
        </p>
        <form onSubmit={handleSubmit(onSubmit)} className="relative">
          <Input
            id="newsletter-email"
            type="email"
            placeholder="you@domain.com"
            className="w-full"
            autoComplete="email"
            disabled={isSubmitting}
            {...register("email", {
              required: "Email is required.",
              pattern: {
                value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                message: "Please enter a valid email address.",
              },
            })}
          />
          <Button
            variant={"secondary"}
            size={"icon-xs"}
            className="absolute top-1/2 -translate-y-1/2 right-1.5 rtl:right-auto rtl:left-1.5 w-fit text-xs rounded-sm px-1.5"
          >
            {isSubmitting ? <Spinner /> : <>Subscribe</>}
          </Button>
        </form>
      </div>
    </div>
  );
};
