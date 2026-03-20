"use client"

import { useState } from "react"
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
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { useTranslations } from "next-intl"
import { appRouter } from "@/lib/app-routes"
import {
  createDeliveryPartner,
  CreateDeliveryPartnerInput,
} from "@/lib/actions/delivery/createDeliveryPartner"

export default function DeliveryFormPage() {
  const t = useTranslations("Dashboard.deliveryForm")
  const router = useRouter()
  const supabase = createBrowserClient()

  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    company_name: "",
    phone: "",
    email: "",
    license_number: "",
    insurance_number: "",
    vehicle_types: "motorcycle",
    coverage_areas: "",
    max_delivery_radius: "10",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    setLoading(true)

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        alert("Please sign in first")
        router.push(appRouter.signIn)
        return
      }

      const deliveryInput: CreateDeliveryPartnerInput = {
        company_name: formData.company_name,
        phone: formData.phone,
        email: formData.email,
        license_number: formData.license_number,
        insurance_number: formData.insurance_number,
        vehicle_types: formData.vehicle_types,
        coverage_areas: formData.coverage_areas,
        max_delivery_radius: parseInt(formData.max_delivery_radius),
      }

      const result = await createDeliveryPartner(deliveryInput)

      if (!result.success) {
        if (result.error === "USER_NOT_AUTHENTICATED") {
          alert("Please sign in first")
          router.push(appRouter.signIn)
        } else if (result.error === "DELIVERY_PARTNER_ALREADY_EXISTS") {
          alert("You already have a delivery partner account")
        } else {
          alert("An error occurred. Please try again.")
        }
        return
      }

      router.push(
        `/dashboard/upgrade/delivery-plans?partner_id=${result.partnerId}`
      )
    } catch (error: unknown) {
      const err = error as { message?: string }
      console.error("Error creating delivery partner:", err)
      alert("An error occurred. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto max-w-2xl px-4 py-8">
      <Link href={appRouter.upgrade}>
        <Button variant="ghost" className="mb-4 gap-2">
          <ArrowLeft className="h-4 w-4" />
          {t("back")}
        </Button>
      </Link>

      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">{t("title")}</CardTitle>
          <CardDescription>{t("description")}</CardDescription>
        </CardHeader>

        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="company_name">{t("companyName")}</Label>
              <Input
                id="company_name"
                value={formData.company_name}
                onChange={(e) =>
                  setFormData({ ...formData, company_name: e.target.value })
                }
                placeholder={t("companyNamePlaceholder")}
                required
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
                <Label htmlFor="license_number">{t("licenseNumber")}</Label>
                <Input
                  id="license_number"
                  value={formData.license_number}
                  onChange={(e) =>
                    setFormData({ ...formData, license_number: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="insurance_number">{t("insuranceNumber")}</Label>
                <Input
                  id="insurance_number"
                  value={formData.insurance_number}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      insurance_number: e.target.value,
                    })
                  }
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="vehicle_types">{t("vehicleType")}</Label>
              <select
                id="vehicle_types"
                value={formData.vehicle_types}
                onChange={(e) =>
                  setFormData({ ...formData, vehicle_types: e.target.value })
                }
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="motorcycle">{t("vehicleTypeMotorcycle")}</option>
                <option value="car">{t("vehicleTypeCar")}</option>
                <option value="van">{t("vehicleTypeVan")}</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="coverage_areas">{t("coverageCity")}</Label>
                <Input
                  id="coverage_areas"
                  value={formData.coverage_areas}
                  onChange={(e) =>
                    setFormData({ ...formData, coverage_areas: e.target.value })
                  }
                  placeholder={t("coverageCityPlaceholder")}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="max_delivery_radius">
                  {t("maxDeliveryRadius")}
                </Label>
                <Input
                  id="max_delivery_radius"
                  type="number"
                  value={formData.max_delivery_radius}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      max_delivery_radius: e.target.value,
                    })
                  }
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
  )
}
