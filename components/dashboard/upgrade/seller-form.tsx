"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { createBrowserClient } from "@/lib/supabase/createBrowserClient"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { CheckCircle2, Store, ArrowLeft } from "lucide-react"
import Link from "next/link"
import { useTranslations } from "next-intl"
import { appRouter } from "@/lib/app-routes"
import {
  createSeller,
  CreateSellerInput,
} from "@/lib/actions/sellers/createSeller"
import { createUpgradeRequest } from "@/lib/actions/subscriptions/createUpgradeRequest"
import { Badge } from "@/components/ui/badge"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"

interface Plan {
  id: string
  name: string
  name_ar: string
  price_usd: number
  max_products: number
  features_ar: string[]
  is_popular?: boolean
}

interface SellerFormData {
  store_name: string
  store_description: string
  phone: string
  email: string
  tax_number: string
  commercial_registration: string
  street: string
  city: string
}

export default function SellerFormWithPlan() {
  const t = useTranslations("Dashboard.sellerForm")
  const plansT = useTranslations("Dashboard.sellerPlans")
  const router = useRouter()
  const supabase = createBrowserClient()

  const [loading, setLoading] = useState(false)
  const [selectedPlan, setSelectedPlan] = useState<string>("")
  const [plans, setPlans] = useState<Plan[]>([])

  const {
    register,
    handleSubmit,
    formState: { errors ,isSubmitting },
  } = useForm<SellerFormData>()

  useEffect(() => {
    async function loadPlans() {
      const { data, error } = await supabase
        .from("seller_subscription_plans")
        .select("*")
        .eq("plan_type", "seller")
        .eq("is_active", true)
        .order("sort_order")

      if (!error && data) {
        setPlans(data)
        if (data.length > 0) {
          setSelectedPlan(data[0].id)
        }
      }
    }

    loadPlans()
  }, [supabase])

  const onSubmit = async (data: SellerFormData) => {
    if (!selectedPlan) {
      alert("Please select a plan")
      return
    }

    setLoading(true)

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        alert(t("alertSignIn"))
        router.push(appRouter.signIn)
        return
      }

      const sellerInput: CreateSellerInput = {
        store_name: data.store_name,
        store_description: data.store_description,
        phone: data.phone,
        email: data.email,
        tax_number: data.tax_number,
        commercial_registration: data.commercial_registration,
        street: data.street,
        city: data.city,
        country: "Syria",
      }

      console.log("Creating seller with input:", sellerInput)

      const sellerResult = await createSeller(sellerInput)

      console.log("Seller result:", sellerResult)

      if (!sellerResult.success) {
        if (sellerResult.error === "USER_NOT_AUTHENTICATED") {
          alert(t("alertSignIn"))
          router.push(appRouter.signIn)
        } else if (sellerResult.error === "SELLER_ALREADY_EXISTS") {
          alert(t("alertSellerExists"))
        } else {
          alert(t("alertError"))
        }
        setLoading(false)
        return
      }

      console.log(
        "Creating upgrade request with sellerId:",
        sellerResult.sellerId,
        "planId:",
        selectedPlan
      )

      const upgradeResult = await createUpgradeRequest({
        sellerId: sellerResult.sellerId!,
        planId: selectedPlan,
        contactMethod: "email",
        contactValue: data.email,
        notes: `Upgrade request for ${data.store_name}`,
      })

      console.log("Upgrade result:", upgradeResult)

      if (!upgradeResult.success) {
        alert(t("alertError"))
        setLoading(false)
        return
      }

      router.push("/dashboard/upgrade/success?type=seller")
    } catch (error: unknown) {
      const err = error as { message?: string }
      console.error("Error creating seller:", err)
      alert(t("alertError"))
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Link href={appRouter.upgrade}>
        <Button variant="ghost" className="mb-6 gap-2">
          <ArrowLeft className="h-4 w-4" />
          {t("back")}
        </Button>
      </Link>

      <div className="mb-8 text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
          <Store className="h-8 w-8 text-primary" />
        </div>
        <h1 className="mb-2 text-3xl font-bold">{t("title")}</h1>
        <p className="text-gray-600">{t("description")}</p>
      </div>

      <div className="mx-auto max-w-5xl space-y-8">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">💎 {plansT("title")}</CardTitle>
            <CardDescription>
              {plansT("yearlyDescription") ||
                "اختر خطة الاشتراك السنوية المناسبة لمتجرك"}
            </CardDescription>
          </CardHeader>

          <CardContent>
            <RadioGroup
              value={selectedPlan}
              onValueChange={setSelectedPlan}
              className="grid gap-4 md:grid-cols-3"
            >
              {plans.map((plan) => (
                <label
                  key={plan.id}
                  className={`relative cursor-pointer rounded-lg border-2 p-4 transition-all ${
                    selectedPlan === plan.id
                      ? "border-primary bg-primary/5"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <RadioGroupItem value={plan.id} className="sr-only" />

                  {plan.is_popular && (
                    <Badge className="absolute -top-3 right-4 bg-primary">
                      {plansT("mostPopular")}
                    </Badge>
                  )}

                  <div className="space-y-3">
                    <div className="text-center">
                      <h3 className="text-lg font-bold">{plan.name_ar}</h3>
                      <div className="mt-2 text-3xl font-bold text-primary">
                        ${plan.price_usd}
                        <span className="text-sm font-normal text-gray-500">
                          {plansT("perYear") || "/سنة"}
                        </span>
                      </div>
                      {plan.price_usd > 0 && (
                        <div className="mt-1 text-xs text-gray-500">
                          ${Math.round(plan.price_usd / 12)}{" "}
                          {plansT("perMonth") || "/شهر"}
                        </div>
                      )}
                    </div>

                    <div className="space-y-2 border-t pt-3">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 flex-shrink-0 text-green-500" />
                        <span className="text-sm font-medium">
                          {plan.max_products} منتج
                        </span>
                      </div>
                      {plan.features_ar.map((feature, index) => (
                        <div key={index} className="flex items-center gap-2">
                          <CheckCircle2 className="h-4 w-4 flex-shrink-0 text-green-500" />
                          <span className="text-sm text-gray-600">
                            {feature}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="mt-4 flex items-center justify-center gap-2">
                    <div
                      className={`h-4 w-4 rounded-full border-2 ${
                        selectedPlan === plan.id
                          ? "border-primary bg-primary"
                          : "border-gray-300"
                      }`}
                    />
                    <span className="text-xs font-medium">
                      {selectedPlan === plan.id ? "محدد" : "اختر"}
                    </span>
                  </div>
                </label>
              ))}
            </RadioGroup>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">
              📋 {t("storeInfoTitle") || "معلومات المتجر"}
            </CardTitle>
            <CardDescription>
              {t("storeInfoDescription") || "أدخل معلومات متجرك الأساسية"}
            </CardDescription>
          </CardHeader>

          <form onSubmit={handleSubmit(onSubmit)}>
            <CardContent className="space-y-6">
              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="store_name" className="font-medium">
                    {t("storeName")} *
                  </Label>
                  <Input
                    id="store_name"
                    {...register("store_name", {
                      required: "Store name is required",
                      minLength: {
                        value: 2,
                        message: "Store name must be at least 2 characters",
                      },
                    })}
                    placeholder={t("storeNamePlaceholder")}
                    className="h-11"
                  />
                  {errors.store_name && (
                    <p className="text-sm text-red-600">
                      {errors.store_name.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone" className="font-medium">
                    {t("phone")} *
                  </Label>
                  <Input
                    id="phone"
                    {...register("phone", {
                      required: "Phone is required",
                      pattern: {
                        value: /^\+?[\d\s-()]+$/,
                        message: "Please enter a valid phone number",
                      },
                    })}
                    placeholder="+963 9XX XXX XXX"
                    className="h-11"
                  />
                  {errors.phone && (
                    <p className="text-sm text-red-600">
                      {errors.phone.message}
                    </p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="store_description" className="font-medium">
                  {t("storeDescription")}
                </Label>
                <Textarea
                  id="store_description"
                  {...register("store_description")}
                  placeholder={t("storeDescriptionPlaceholder")}
                  rows={3}
                  className="resize-none"
                />
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="email" className="font-medium">
                    {t("email")} *
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    {...register("email", {
                      required: "Email is required",
                      pattern: {
                        value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                        message: "Invalid email address",
                      },
                    })}
                    placeholder={t("emailPlaceholder")}
                    className="h-11"
                  />
                  {errors.email && (
                    <p className="text-sm text-red-600">
                      {errors.email.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="city" className="font-medium">
                    {t("city")} *
                  </Label>
                  <Input
                    id="city"
                    {...register("city", { required: "City is required" })}
                    placeholder="Damascus"
                    className="h-11"
                  />
                  {errors.city && (
                    <p className="text-sm text-red-600">
                      {errors.city.message}
                    </p>
                  )}
                </div>
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="tax_number" className="font-medium">
                    {t("taxNumber")}
                  </Label>
                  <Input
                    id="tax_number"
                    {...register("tax_number")}
                    placeholder={t("taxNumberPlaceholder")}
                    className="h-11"
                  />
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="commercial_registration"
                    className="font-medium"
                  >
                    {t("commercialRegistration")}
                  </Label>
                  <Input
                    id="commercial_registration"
                    {...register("commercial_registration")}
                    placeholder={t("commercialRegistrationPlaceholder")}
                    className="h-11"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="street" className="font-medium">
                  {t("street")}
                </Label>
                <Input
                  id="street"
                  {...register("street")}
                  placeholder={t("streetPlaceholder")}
                  className="h-11"
                />
              </div>

              <div className="mb-6 rounded-lg border border-blue-200 bg-blue-50 p-4">
                <p className="text-sm text-blue-800">
                  {t("noteUpdated") ||
                    "ملاحظة: بعد حفظ المعلومات واختيار الخطة، سيتم إرسال طلبك للإدارة للمراجعة. بعد الموافقة ودفع رسوم الاشتراك، سيتم تفعيل حسابك فوراً."}
                </p>
              </div>
            </CardContent>

            <CardFooter className="flex flex-col gap-4">
              <Button
                type="submit"
                className="w-full"
                size="lg"
                disabled={loading || !selectedPlan}
              >
                {isSubmitting ? (
                  <>
                    <svg
                      className="mr-3 -ml-1 h-5 w-5 animate-spin text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    {t("saving")}
                  </>
                ) : (
                  t("submitWithPlan")
                )}
              </Button>
              {!selectedPlan && (
                <p className="text-sm text-red-600">
                  Please select a plan first
                </p>
              )}
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  )
}
