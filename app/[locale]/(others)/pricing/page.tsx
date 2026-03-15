"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Check } from "lucide-react";
import { useTranslations } from "next-intl";
import Link from "next/link";

interface SubscriptionPlan {
  id: string;
  name: string;
  name_ar: string;
  slug: string;
  description: string;
  description_ar: string;
  price_monthly: number;
  price_yearly: number;
  currency: string;
  trial_period_days: number;
  max_products: number;
  max_images_per_product: number;
  max_variants_per_product: number;
  storage_limit_mb: number;
  commission_rate: number;
  has_analytics: boolean;
  has_priority_support: boolean;
  has_custom_domain: boolean;
  has_discount_codes: boolean;
  has_bulk_upload: boolean;
  has_api_access: boolean;
  is_popular: boolean;
}

const plans: SubscriptionPlan[] = [
  {
    id: "1",
    name: "Free",
    name_ar: "مجاني",
    slug: "free",
    description: "Perfect for getting started",
    description_ar: "مثالي للبدء",
    price_monthly: 0,
    price_yearly: 0,
    currency: "USD",
    trial_period_days: 0,
    max_products: 10,
    max_images_per_product: 3,
    max_variants_per_product: 5,
    storage_limit_mb: 100,
    commission_rate: 15.0,
    has_analytics: false,
    has_priority_support: false,
    has_custom_domain: false,
    has_discount_codes: false,
    has_bulk_upload: false,
    has_api_access: false,
    is_popular: false,
  },
  {
    id: "2",
    name: "Basic",
    name_ar: "أساسي",
    slug: "basic",
    description: "For growing businesses",
    description_ar: "للشركات الناشئة",
    price_monthly: 29,
    price_yearly: 290,
    currency: "USD",
    trial_period_days: 7,
    max_products: 100,
    max_images_per_product: 10,
    max_variants_per_product: 20,
    storage_limit_mb: 5120,
    commission_rate: 12.0,
    has_analytics: true,
    has_priority_support: false,
    has_custom_domain: false,
    has_discount_codes: true,
    has_bulk_upload: false,
    has_api_access: false,
    is_popular: true,
  },
  {
    id: "3",
    name: "Pro",
    name_ar: "احترافي",
    slug: "pro",
    description: "For established businesses",
    description_ar: "للشركات المتوسطة",
    price_monthly: 79,
    price_yearly: 790,
    currency: "USD",
    trial_period_days: 14,
    max_products: 500,
    max_images_per_product: 20,
    max_variants_per_product: 50,
    storage_limit_mb: 20480,
    commission_rate: 8.0,
    has_analytics: true,
    has_priority_support: true,
    has_custom_domain: false,
    has_discount_codes: true,
    has_bulk_upload: true,
    has_api_access: true,
    is_popular: false,
  },
  {
    id: "4",
    name: "Enterprise",
    name_ar: "مؤسسات",
    slug: "enterprise",
    description: "For large scale operations",
    description_ar: "للشركات الكبيرة",
    price_monthly: 199,
    price_yearly: 1990,
    currency: "USD",
    trial_period_days: 30,
    max_products: 999999,
    max_images_per_product: 50,
    max_variants_per_product: 999,
    storage_limit_mb: 102400,
    commission_rate: 5.0,
    has_analytics: true,
    has_priority_support: true,
    has_custom_domain: true,
    has_discount_codes: true,
    has_bulk_upload: true,
    has_api_access: true,
    is_popular: false,
  },
];

const features = [
  { key: "max_products", icon: "📦" },
  { key: "max_images_per_product", icon: "🖼️" },
  { key: "max_variants_per_product", icon: "🔄" },
  { key: "storage_limit_mb", icon: "💾" },
  { key: "commission_rate", icon: "💰" },
  { key: "has_analytics", icon: "📊" },
  { key: "has_priority_support", icon: "🎧" },
  { key: "has_custom_domain", icon: "🌐" },
  { key: "has_discount_codes", icon: "🏷️" },
  { key: "has_bulk_upload", icon: "📤" },
  { key: "has_api_access", icon: "🔌" },
] as const;

function formatFeatureValue(key: string, value: any): string {
  if (key === "storage_limit_mb") {
    const gb = Math.floor(value / 1024);
    if (gb >= 1) {
      return `${gb} GB`;
    }
    return `${value} MB`;
  }
  if (key === "commission_rate") {
    return `${value}%`;
  }
  if (key === "max_products" && value >= 999999) {
    return "Unlimited";
  }
  if (key === "max_variants_per_product" && value >= 999) {
    return "Unlimited";
  }
  if (typeof value === "boolean") {
    return value ? "Yes" : "No";
  }
  return String(value);
}

function getFeatureLabel(key: string): string {
  const labels: Record<string, string> = {
    max_products: "Max Products",
    max_images_per_product: "Images per Product",
    max_variants_per_product: "Variants per Product",
    storage_limit_mb: "Storage",
    commission_rate: "Commission Rate",
    has_analytics: "Analytics Dashboard",
    has_priority_support: "Priority Support",
    has_custom_domain: "Custom Domain",
    has_discount_codes: "Discount Codes",
    has_bulk_upload: "Bulk Upload",
    has_api_access: "API Access",
  };
  return labels[key] || key;
}

export default function PricingPage() {
  const isYearly = false; // Can be made dynamic with a toggle

  return (
    <div className="container mx-auto px-4 py-16">
      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">Choose Your Plan</h1>
        <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
          Select the perfect plan for your business. All plans include a free trial.
        </p>
      </div>

      {/* Billing Toggle (Optional) */}
      {/* <div className="flex justify-center items-center gap-4 mb-8">
        <span className={!isYearly ? "font-semibold" : "text-muted-foreground"}>Monthly</span>
        <Switch />
        <span className={isYearly ? "font-semibold" : "text-muted-foreground"}>
          Yearly <Badge>Save 2 months</Badge>
        </span>
      </div> */}

      {/* Plans Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {plans.map((plan) => (
          <Card
            key={plan.id}
            className={`relative flex flex-col ${
              plan.is_popular ? "border-primary shadow-lg scale-105" : ""
            }`}
          >
            {plan.is_popular && (
              <Badge className="absolute -top-3 left-1/2 -translate-x-1/2">
                Most Popular
              </Badge>
            )}

            <CardHeader className="text-center pb-4">
              <CardTitle className="text-2xl">{plan.name}</CardTitle>
              <CardDescription>{plan.description}</CardDescription>
            </CardHeader>

            <CardContent className="flex-1">
              {/* Price */}
              <div className="text-center mb-6">
                {plan.price_monthly === 0 ? (
                  <div className="text-4xl font-bold">Free</div>
                ) : (
                  <>
                    <div className="text-4xl font-bold">
                      ${isYearly ? plan.price_yearly : plan.price_monthly}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      /{isYearly ? "year" : "month"}
                    </div>
                  </>
                )}
                {plan.trial_period_days > 0 && (
                  <div className="text-xs text-muted-foreground mt-2">
                    {plan.trial_period_days} days free trial
                  </div>
                )}
              </div>

              {/* Features */}
              <ul className="space-y-3">
                {features.map(([key, icon]) => {
                  const value = plan[key as keyof SubscriptionPlan];
                  const showValue = typeof value !== "boolean" || value === true;
                  const label = getFeatureLabel(key);

                  if (typeof value === "boolean" && !value) {
                    return (
                      <li key={key} className="flex items-center gap-2 text-muted-foreground">
                        <span className="text-lg">{icon}</span>
                        <span className="text-sm">{label}</span>
                      </li>
                    );
                  }

                  return (
                    <li key={key} className="flex items-center gap-2">
                      <Check className="size-4 text-green-500 shrink-0" />
                      <span className="text-sm">
                        {label}
                        {typeof value !== "boolean" && (
                          <span className="font-semibold ml-1">
                            ({formatFeatureValue(key, value)})
                          </span>
                        )}
                      </span>
                    </li>
                  );
                })}
              </ul>
            </CardContent>

            <CardFooter>
              <Button
                className="w-full"
                variant={plan.price_monthly === 0 ? "outline" : "default"}
                asChild
              >
                <Link href={`/dashboard/vendor/subscribe?plan=${plan.slug}`}>
                  {plan.price_monthly === 0 ? "Get Started" : "Start Free Trial"}
                </Link>
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>

      {/* FAQ Section */}
      <div className="mt-16 max-w-3xl mx-auto">
        <h2 className="text-2xl font-bold text-center mb-8">
          Frequently Asked Questions
        </h2>
        <div className="space-y-4">
          <div className="border rounded-lg p-4">
            <h3 className="font-semibold mb-2">Can I change plans later?</h3>
            <p className="text-muted-foreground">
              Yes, you can upgrade or downgrade your plan at any time.
            </p>
          </div>
          <div className="border rounded-lg p-4">
            <h3 className="font-semibold mb-2">What happens after the free trial?</h3>
            <p className="text-muted-foreground">
              After the trial period, you'll be automatically charged based on your selected billing cycle.
            </p>
          </div>
          <div className="border rounded-lg p-4">
            <h3 className="font-semibold mb-2">Can I cancel anytime?</h3>
            <p className="text-muted-foreground">
              Yes, you can cancel your subscription at any time. Your store will remain active until the end of the billing period.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
