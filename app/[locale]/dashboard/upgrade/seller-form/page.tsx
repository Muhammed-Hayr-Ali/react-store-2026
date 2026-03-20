"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
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
import { ArrowLeft, CheckCircle2 } from "lucide-react"
import Link from "next/link"
import { useTranslations } from "next-intl"
import { appRouter } from "@/lib/app-routes"
import {
  createSeller,
  CreateSellerInput,
} from "@/lib/actions/sellers/createSeller"
import { createUpgradeRequest } from "@/lib/actions/subscriptions/createUpgradeRequest"
import { Badge } from "@/components/ui/badge"

interface Plan {
  id: string
  name: string
  name_ar: string
  price_usd: number
  max_products: number
  features_ar: string[]
  is_popular?: boolean
}

export default function SellerFormWithPlan() {
  const t = useTranslations("Dashboard.sellerForm")
  const plansT = useTranslations("Dashboard.sellerPlans")
  const router = useRouter()
  const supabase = createBrowserClient()

  const [loading, setLoading] = useState(false)
  const [selectedPlan, setSelectedPlan] = useState<string>("")
  const [plans, setPlans] = useState<Plan[]>([])
  const [formData, setFormData] = useState({
    store_name: "",
    store_description: "",
    phone: "",
    email: "",
    tax_number: "",
    commercial_registration: "",
    street: "",
    city: "",
    country: "Saudi Arabia",
  })

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
        // Select first plan by default
        if (data.length > 0) {
          setSelectedPlan(data[0].id)
        }
      }
    }

    loadPlans()
  }, [supabase])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

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

      // 1. Create seller account
      const sellerInput: CreateSellerInput = {
        store_name: formData.store_name,
        store_description: formData.store_description,
        phone: formData.phone,
        email: formData.email,
        tax_number: formData.tax_number,
        commercial_registration: formData.commercial_registration,
        street: formData.street,
        city: formData.city,
        country: formData.country,
      }

      const sellerResult = await createSeller(sellerInput)

      if (!sellerResult.success) {
        if (sellerResult.error === "USER_NOT_AUTHENTICATED") {
          alert(t("alertSignIn"))
          router.push(appRouter.signIn)
        } else if (sellerResult.error === "SELLER_ALREADY_EXISTS") {
          alert(t("alertSellerExists"))
        } else {
          alert(t("alertError"))
        }
        return
      }

      // 2. Create upgrade request with selected plan
      const upgradeResult = await createUpgradeRequest({
        sellerId: sellerResult.sellerId!,
        planId: selectedPlan,
        contactMethod: "email",
        contactValue: formData.email,
        notes: `Upgrade request for ${formData.store_name}`,
      })

      if (!upgradeResult.success) {
        alert(t("alertError"))
        return
      }

      // 3. Redirect to success page
      router.push("/dashboard/upgrade/success?type=seller")
    } catch (error: unknown) {
      const err = error as { message?: string }
      console.error("Error creating seller:", err)
      alert(t("alertError"))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto max-w-6xl px-4 py-8">
      <Link href={appRouter.upgrade}>
        <Button variant="ghost" className="mb-4 gap-2">
          <ArrowLeft className="h-4 w-4" />
          {t("back")}
        </Button>
      </Link>

      <div className="grid gap-8 md:grid-cols-3">
        {/* Store Information Form */}
        <div className="md:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">{t("title")}</CardTitle>
              <CardDescription>{t("description")}</CardDescription>
            </CardHeader>

            <form onSubmit={handleSubmit}>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="store_name">{t("storeName")} *</Label>
                  <Input
                    id="store_name"
                    value={formData.store_name}
                    onChange={(e) =>
                      setFormData({ ...formData, store_name: e.target.value })
                    }
                    placeholder={t("storeNamePlaceholder")}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="store_description">
                    {t("storeDescription")}
                  </Label>
                  <Textarea
                    id="store_description"
                    value={formData.store_description}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        store_description: e.target.value,
                      })
                    }
                    placeholder={t("storeDescriptionPlaceholder")}
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="phone">{t("phone")} *</Label>
                    <Input
                      id="phone"
                      value={formData.phone}
                      onChange={(e) =>
                        setFormData({ ...formData, phone: e.target.value })
                      }
                      placeholder={t("phonePlaceholder")}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">{t("email")} *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) =>
                        setFormData({ ...formData, email: e.target.value })
                      }
                      placeholder={t("emailPlaceholder")}
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="tax_number">{t("taxNumber")}</Label>
                    <Input
                      id="tax_number"
                      value={formData.tax_number}
                      onChange={(e) =>
                        setFormData({ ...formData, tax_number: e.target.value })
                      }
                      placeholder={t("taxNumberPlaceholder")}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="commercial_registration">
                      {t("commercialRegistration")}
                    </Label>
                    <Input
                      id="commercial_registration"
                      value={formData.commercial_registration}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          commercial_registration: e.target.value,
                        })
                      }
                      placeholder={t("commercialRegistrationPlaceholder")}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="city">{t("city")} *</Label>
                    <Input
                      id="city"
                      value={formData.city}
                      onChange={(e) =>
                        setFormData({ ...formData, city: e.target.value })
                      }
                      placeholder={t("cityPlaceholder")}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="street">{t("street")}</Label>
                    <Input
                      id="street"
                      value={formData.street}
                      onChange={(e) =>
                        setFormData({ ...formData, street: e.target.value })
                      }
                      placeholder={t("streetPlaceholder")}
                    />
                  </div>
                </div>

                <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
                  <p className="text-sm text-blue-800">{t("note")}</p>
                </div>
              </CardContent>

              <CardFooter>
                <Button
                  type="submit"
                  className="w-full"
                  size="lg"
                  disabled={loading}
                >
                  {loading ? t("saving") : t("saveAndContinue")}
                </Button>
              </CardFooter>
            </form>
          </Card>
        </div>

        {/* Plan Selection */}
        <div className="space-y-4">
          <h2 className="text-2xl font-bold">{plansT("title")}</h2>
          <p className="text-gray-600">{plansT("description")}</p>

          {plans.map((plan) => (
            <Card
              key={plan.id}
              className={`cursor-pointer transition-all ${
                selectedPlan === plan.id
                  ? "scale-105 border-primary shadow-lg"
                  : "hover:shadow-md"
              }`}
              onClick={() => setSelectedPlan(plan.id)}
            >
              {plan.is_popular && (
                <Badge className="absolute -top-3 right-4 bg-primary">
                  {plansT("mostPopular")}
                </Badge>
              )}

              <CardHeader className="pb-4">
                <CardTitle className="text-xl">{plan.name_ar}</CardTitle>
                <CardDescription className="text-2xl font-bold">
                  ${plan.price_usd}
                  <span className="text-sm font-normal text-gray-500">
                    {plansT("perMonth")}
                  </span>
                </CardDescription>
              </CardHeader>

              <CardContent>
                <ul className="space-y-2">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                    <span className="text-sm">{plan.max_products} منتج</span>
                  </li>
                  {plan.features_ar.map((feature, index) => (
                    <li key={index} className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>

              <CardFooter>
                <div className="flex items-center gap-2">
                  <div
                    className={`h-4 w-4 rounded-full border-2 ${
                      selectedPlan === plan.id
                        ? "border-primary bg-primary"
                        : "border-gray-300"
                    }`}
                  />
                  <span className="text-sm font-medium">
                    {selectedPlan === plan.id ? "محدد" : "اختر"}
                  </span>
                </div>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}
