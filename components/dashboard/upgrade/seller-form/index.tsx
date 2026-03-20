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
import { Textarea } from "@/components/ui/textarea"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { useTranslations } from "next-intl"
import { appRouter } from "@/lib/app-routes"

export default function UpgradeSellerForm() {
  const t = useTranslations("Dashboard.sellerForm")
  const router = useRouter()
  const supabase = createBrowserClient()

  const [loading, setLoading] = useState(false)
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

      const { data: seller, error: sellerError } = await supabase
        .from("sellers")
        .insert({
          user_id: user.id,
          store_name: formData.store_name,
          store_slug: formData.store_name
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, "-"),
          store_description: formData.store_description,
          phone: formData.phone,
          email: formData.email,
          tax_number: formData.tax_number,
          commercial_registration: formData.commercial_registration,
          address: {
            street: formData.street,
            city: formData.city,
            country: formData.country,
          },
          account_status: "pending",
        })
        .select()
        .single()

      if (sellerError) throw sellerError

      router.push(`/dashboard/upgrade/seller-plans?seller_id=${seller.id}`)
    } catch (error: unknown) {
      const err = error as { message?: string }
      console.error("Error creating seller:", err)
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
              <Label htmlFor="store_description">{t("storeDescription")}</Label>
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
  )
}
