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
import { CheckCircle2, Bike, ArrowLeft } from "lucide-react"
import Link from "next/link"
import { useTranslations } from "next-intl"
import { appRouter } from "@/lib/app-routes"
import {
  createDeliveryPartner,
  CreateDeliveryPartnerInput,
} from "@/lib/actions/delivery/createDeliveryPartner"
import { createDeliveryUpgradeRequest } from "@/lib/actions/subscriptions/createUpgradeRequest"
import { Badge } from "@/components/ui/badge"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"

interface Plan {
  id: string
  name: string
  name_ar: string
  price_usd: number
  max_orders_per_day: number
  commission_rate: number
  features_ar: string[]
  is_popular?: boolean
}

interface DeliveryFormData {
  company_name: string
  phone: string
  email: string
  license_number: string
  insurance_number: string
  vehicle_types: string
  coverage_areas: string
  max_delivery_radius: string
}

export default function DeliveryFormWithPlan() {
  const t = useTranslations("Dashboard.deliveryForm")
  const plansT = useTranslations("Dashboard.deliveryPlans")
  const router = useRouter()
  const supabase = createBrowserClient()

  const [loading, setLoading] = useState(false)
  const [selectedPlan, setSelectedPlan] = useState<string>("")
  const [plans, setPlans] = useState<Plan[]>([])

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<DeliveryFormData>()

  useEffect(() => {
    async function loadPlans() {
      const { data, error } = await supabase
        .from("delivery_subscription_plans")
        .select("*")
        .eq("plan_type", "delivery_partner")
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

  const onSubmit = async (data: DeliveryFormData) => {
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

      const deliveryInput: CreateDeliveryPartnerInput = {
        company_name: data.company_name,
        phone: data.phone,
        email: data.email,
        license_number: data.license_number,
        insurance_number: data.insurance_number,
        vehicle_types: data.vehicle_types,
        coverage_areas: data.coverage_areas,
        max_delivery_radius: parseInt(data.max_delivery_radius),
      }

      console.log("Creating delivery partner with input:", deliveryInput)

      const deliveryResult = await createDeliveryPartner(deliveryInput)

      console.log("Delivery partner result:", deliveryResult)

      if (!deliveryResult.success) {
        if (deliveryResult.error === "USER_NOT_AUTHENTICATED") {
          alert(t("alertSignIn"))
          router.push(appRouter.signIn)
        } else if (deliveryResult.error === "DELIVERY_PARTNER_ALREADY_EXISTS") {
          alert(t("alertPartnerExists"))
        } else {
          alert(t("alertError"))
        }
        setLoading(false)
        return
      }

      console.log(
        "Creating upgrade request with partnerId:",
        deliveryResult.partnerId,
        "planId:",
        selectedPlan
      )

      const upgradeResult = await createDeliveryUpgradeRequest({
        partnerId: deliveryResult.partnerId!,
        planId: selectedPlan,
        contactMethod: "email",
        contactValue: data.email,
        notes: `Upgrade request for ${data.company_name}`,
      })

      console.log("Upgrade result:", upgradeResult)

      if (!upgradeResult.success) {
        alert(t("alertError"))
        setLoading(false)
        return
      }

      router.push("/dashboard/upgrade/success?type=delivery")
    } catch (error: unknown) {
      const err = error as { message?: string }
      console.error("Error creating delivery partner:", err)
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
          <Bike className="h-8 w-8 text-primary" />
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
                "اختر خطة الاشتراك السنوية المناسبة لعملك"}
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
                          {plan.max_orders_per_day === 999
                            ? plansT("unlimitedOrders")
                            : `${plan.max_orders_per_day} ${plansT("ordersPerDay")}`}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 flex-shrink-0 text-green-500" />
                        <span className="text-sm font-medium">
                          {plansT("commissionRate", {
                            rate: plan.commission_rate,
                          })}
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
              🚴 {t("deliveryInfoTitle") || "معلومات التوصيل"}
            </CardTitle>
            <CardDescription>
              {t("deliveryInfoDescription") || "أدخل معلوماتك الأساسية للتوصيل"}
            </CardDescription>
          </CardHeader>

          <form onSubmit={handleSubmit(onSubmit)}>
            <CardContent className="space-y-6">
              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="company_name" className="font-medium">
                    {t("companyName")} *
                  </Label>
                  <Input
                    id="company_name"
                    {...register("company_name", {
                      required: "Company name is required",
                      minLength: {
                        value: 2,
                        message: "Company name must be at least 2 characters",
                      },
                    })}
                    placeholder={t("companyNamePlaceholder")}
                    className="h-11"
                  />
                  {errors.company_name && (
                    <p className="text-sm text-red-600">
                      {errors.company_name.message}
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
                  <Label htmlFor="vehicle_types" className="font-medium">
                    {t("vehicleType")}
                  </Label>
                  <select
                    id="vehicle_types"
                    {...register("vehicle_types")}
                    className="flex h-11 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  >
                    <option value="motorcycle">
                      {t("vehicleTypeMotorcycle")}
                    </option>
                    <option value="car">{t("vehicleTypeCar")}</option>
                    <option value="van">{t("vehicleTypeVan")}</option>
                  </select>
                </div>
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="license_number" className="font-medium">
                    {t("licenseNumber")}
                  </Label>
                  <Input
                    id="license_number"
                    {...register("license_number")}
                    className="h-11"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="insurance_number" className="font-medium">
                    {t("insuranceNumber")}
                  </Label>
                  <Input
                    id="insurance_number"
                    {...register("insurance_number")}
                    className="h-11"
                  />
                </div>
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="coverage_areas" className="font-medium">
                    {t("coverageCity")}
                  </Label>
                  <Input
                    id="coverage_areas"
                    {...register("coverage_areas")}
                    placeholder="Damascus"
                    className="h-11"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="max_delivery_radius" className="font-medium">
                    {t("maxDeliveryRadius")}
                  </Label>
                  <Input
                    id="max_delivery_radius"
                    type="number"
                    {...register("max_delivery_radius", {
                      min: { value: 1, message: "Minimum radius is 1 km" },
                      max: { value: 100, message: "Maximum radius is 100 km" },
                    })}
                    className="h-11"
                  />
                  {errors.max_delivery_radius && (
                    <p className="text-sm text-red-600">
                      {errors.max_delivery_radius.message}
                    </p>
                  )}
                </div>
              </div>

              <div className="mb-6 rounded-lg border border-blue-200 bg-blue-50 p-4">
                <p className="text-sm text-blue-800">
                  {t("noteUpdated") ||
                    "ملاحظة: بعد اختيار الخطة وحفظ المعلومات، سيتم إرسال طلبك للإدارة للمراجعة. بعد الموافقة ودفع رسوم الاشتراك السنوي، سيتم تفعيل حسابك فوراً."}
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
                {loading ? (
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
