"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { AppLogo } from "@/components/shared/app-logo";
import { siteConfig } from "@/lib/config/site_config";
import {
  FacebookIcon,
  InstagramIcon,
  TwitterIcon,
} from "@/components/shared/icons";
import { ThemeToggle } from "../theme-toggle";
import { useState } from "react";
import { toast } from "sonner";
import { Loader2, Send } from "lucide-react";

/**
 * 🦶 Footer Component
 * يعرض معلومات الموقع، روابط سريعة، ونشرة بريدية
 */
const Footer = () => {
  return (
    <footer className="w-full border-t bg-background text-sm text-muted-foreground">
      <div className="container mx-auto px-4 py-8">
        {/* ===== Main Footer Grid ===== */}
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-4">
          {/* ===== Brand Section ===== */}
          <div className="flex flex-col gap-4 lg:col-span-1">
            <AppLogo size="md" />
            <p className="text-xs leading-relaxed">{siteConfig.description}</p>

            {/* Social Links */}
            <div className="flex gap-3">
              <SocialLink
                href="https://facebook.com"
                ariaLabel="Facebook"
                icon={<FacebookIcon />}
              />
              <SocialLink
                href="https://twitter.com"
                ariaLabel="Twitter"
                icon={<TwitterIcon />}
              />
              <SocialLink
                href="https://instagram.com"
                ariaLabel="Instagram"
                icon={<InstagramIcon />}
              />
            </div>
          </div>

          {/* ===== Quick Links ===== */}
          <FooterSection title="Quick Links">
            <ul className="flex flex-col gap-2">
              {siteConfig.quickLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-xs text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </FooterSection>

          {/* ===== Support Links ===== */}
          <FooterSection title="Support">
            <ul className="flex flex-col gap-2">
              {siteConfig.supportLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-xs text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </FooterSection>

          {/* ===== Newsletter ===== */}
          <NewsletterSection />
        </div>

        {/* ===== Footer Bottom ===== */}
        <div className="mt-8 border-t pt-6">
          <div className="flex items-center justify-between">
            <p className="text-xs">
              &copy; {new Date().getFullYear()} {siteConfig.name}. All rights
              reserved.
            </p>
            <ThemeToggle />
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

// =====================================================
// Helper Components
// =====================================================

function FooterSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-4">
      <h4 className="text-sm font-semibold text-foreground">{title}</h4>
      {children}
    </div>
  );
}

function SocialLink({
  href,
  ariaLabel,
  icon,
}: {
  href: string;
  ariaLabel: string;
  icon: React.ReactNode;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={ariaLabel}
      className="flex h-9 w-9 items-center justify-center rounded-full border bg-background text-muted-foreground transition-all hover:bg-accent hover:text-foreground hover:shadow-md"
    >
      {icon}
    </a>
  );
}

function NewsletterSection() {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !email.includes("@")) {
      toast.error("Please enter a valid email address");
      return;
    }

    setIsSubmitting(true);

    try {
      // TODO: Implement newsletter subscription
      // const { data, error } = await subscribeToNewsletter(email);
      // if (error) throw new Error(error);

      toast.success("Thanks for subscribing! 🎉");
      setEmail("");
    } catch (error) {
      toast.error("Failed to subscribe. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col gap-4 lg:col-span-1">
      <div className="flex flex-col gap-2">
        <h4 className="text-sm font-semibold text-foreground">
          Subscribe to our newsletter
        </h4>
        <p className="text-xs leading-relaxed">
          Stay updated on new releases, features, and guides.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="flex gap-2">
        <Input
          type="email"
          placeholder="you@domain.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="h-10 flex-1"
          autoComplete="email"
          disabled={isSubmitting}
          required
        />
        <Button
          type="submit"
          variant="secondary"
          size="icon"
          disabled={isSubmitting}
          className="h-10 w-10 shrink-0"
        >
          {isSubmitting ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Send className="h-4 w-4" />
          )}
        </Button>
      </form>
    </div>
  );
}
