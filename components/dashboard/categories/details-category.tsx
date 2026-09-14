"use client"

import * as React from "react"
import { useIsMobile } from "@/hooks/use-mobile"
import { useLocale } from "next-intl"
import { Category } from "./categories-table"

// Custom UI Components
import { CustomButton } from "@/components/ui/custom-button"
import {
  CustomSheet,
  CustomSheetClose,
  CustomSheetContent,
  CustomSheetDescription,
  CustomSheetFooter,
  CustomSheetHeader,
  CustomSheetTitle,
} from "@/components/ui/custom-sheet"

// مكونات مساعدة للعرض
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"

// أيقونات لتحسين المظهر البصري
import {
  CalendarIcon,
  GlobeIcon,
  HashIcon,
  ImageIcon,
  LanguagesIcon,
  LayersIcon,
  PencilIcon,
} from "lucide-react"
import Image from "next/image"

interface DetailsCategorySheetProps {
  isOpen: string | null
  onOpenChange: (open: boolean) => void
  item: Category | null
  onEdit?: () => void
}

export function getSide({
  isMobile,
  locale,
}: {
  isMobile: boolean
  locale: string
}) {
  const dir = locale === "ar" ? "left" : "right"
  return isMobile ? "bottom" : dir
}

export default function DetailsCategorySheet({
  isOpen,
  onOpenChange,
  item,
  onEdit,
}: DetailsCategorySheetProps) {
  const isMobile = useIsMobile()
  const locale = useLocale()
  const side = getSide({ isMobile, locale })

  if (!item) return null

  const isValidImage = item.image_url && item.image_url.startsWith("http")

  return (
    <CustomSheet open={isOpen === "details"} onOpenChange={onOpenChange}>
      {/* 
        ✅ التصحيح هنا: 
        1. استبدال h-dvh بـ h-full max-h-[100dvh] لتجنب مشاكل حساب الارتفاع في متصفحات الموبايل.
        2. استبدال min-w-1/2 بـ w-full للموبايل، و min-w للشاشات الأكبر.
      */}
      <CustomSheetContent
        showCloseButton={false}
        side={side}
        className="flex h-full max-h-dvh w-full flex-col p-0 sm:min-w-125 md:min-w-150"
      >
        {/* Header ثابت مع تقليل الحشو في الموبايل */}
        <CustomSheetHeader className="shrink-0 border-b px-4 py-4 sm:px-6">
          <CustomSheetTitle className="text-base font-semibold">
            Category Details
          </CustomSheetTitle>
          <CustomSheetDescription className="mt-1 text-xs">
            Viewing details for this category
          </CustomSheetDescription>
        </CustomSheetHeader>

        {/* 
          ✅ منطقة السكرول: 
          تقليل الحشو الجانبي في الموبايل (px-4) لمنع أي تمرير أفقي عرضي 
          الذي قد يعطل التمرير العمودي في متصفحات الموبايل.
        */}
        <div className="flex-1 overflow-y-auto px-4 py-4 sm:px-6 sm:py-6">
          <div className="flex flex-col gap-6 text-sm">
            {/* 1. Basic Information (Names) */}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="rounded-lg border p-4">
                <span className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                  <GlobeIcon className="size-3.5" /> English Name
                </span>
                <p className="mt-2 text-base font-semibold wrap-break-word text-foreground">
                  {item.name}
                </p>
              </div>

              <div className="rounded-lg border p-4">
                <span className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                  <LanguagesIcon className="size-3.5" /> Arabic Name
                </span>
                <p
                  className="mt-2 text-right text-base font-semibold wrap-break-word text-foreground"
                  dir="rtl"
                >
                  {item.name_ar || (
                    <span className="text-sm font-normal text-muted-foreground">
                      Not provided
                    </span>
                  )}
                </p>
              </div>
            </div>

            {/* 2. Image Preview (إذا وجد) */}
            {isValidImage && (
              <div className="rounded-lg border p-4">
                <span className="mb-2 block items-center gap-1.5 text-xs font-medium text-muted-foreground">
                  <ImageIcon className="size-3.5" /> Category Image
                </span>
                <div className="aspect-video w-full overflow-hidden rounded-md border bg-muted">
                  <Image
                    width={400}
                    height={225}
                    src={item.image_url!}
                    alt={item.image_alt || item.name}
                    className="h-full w-full object-cover object-center"
                    onError={(e) => (e.currentTarget.style.display = "none")}
                  />
                </div>
              </div>
            )}

            {/* 3. Status & Sort Order */}
            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-lg border p-4">
                <span className="text-xs text-muted-foreground">Status</span>
                <div className="mt-2">
                  <Badge
                    variant={item.is_active ? "default" : "destructive"}
                    className="gap-1"
                  >
                    {item.is_active ? "Active" : "Inactive"}
                  </Badge>
                </div>
              </div>
              <div className="rounded-lg border p-4">
                <span className="text-xs text-muted-foreground">
                  Sort Order
                </span>
                <div className="mt-2 flex items-center gap-2 font-medium">
                  <HashIcon className="size-4 text-muted-foreground" />
                  {item.sort_order}
                </div>
              </div>
            </div>

            {/* 4. Description */}
            {item.description && (
              <div className="rounded-lg border p-4">
                <span className="text-xs font-medium text-muted-foreground">
                  Description
                </span>
                <p className="mt-2 leading-relaxed text-foreground">
                  {item.description}
                </p>
              </div>
            )}

            {/* 5. Technical Info */}
            <div className="rounded-lg border p-4">
              <span className="text-xs font-medium text-muted-foreground">
                Technical Info
              </span>
              <div className="mt-3 flex flex-col gap-4">
                {/* Slug */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <GlobeIcon className="size-4" />
                    <span>Slug</span>
                  </div>
                  <span className="rounded-md bg-muted px-2 py-1 font-mono text-xs break-all">
                    {item.slug}
                  </span>
                </div>

                <Separator />

                {/* Type */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <LayersIcon className="size-4" />
                    <span>Type</span>
                  </div>
                  <span className="font-medium">
                    {item.parent_id ? "Subcategory" : "Main Category"}
                  </span>
                </div>

                <Separator />

                {/* Created At */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <CalendarIcon className="size-4" />
                    <span>Created At</span>
                  </div>
                  <span className="text-xs">
                    {new Date(item.created_at).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}
                  </span>
                </div>

                {/* Image Alt */}
                {item.image_alt && (
                  <>
                    <Separator />
                    <div className="flex items-start justify-between gap-4">
                      <div className="mt-0.5 flex items-center gap-2 text-muted-foreground">
                        <ImageIcon className="size-4 shrink-0" />
                        <span>Image Alt Text</span>
                      </div>
                      <span className="text-right text-xs wrap-break-word text-foreground">
                        {item.image_alt}
                      </span>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Footer ثابت مع تقليل الحشو في الموبايل */}
        <CustomSheetFooter className="shrink-0 gap-3 border-t bg-background px-4 py-4 sm:px-6">
          {onEdit && (
            <CustomButton
              variant="outline"
              onClick={onEdit}
              className="flex-1 gap-2 tracking-wide uppercase"
            >
              <PencilIcon className="size-4" />
              Edit
            </CustomButton>
          )}

          <CustomSheetClose asChild>
            <CustomButton
              variant="default"
              className="flex-1 tracking-wide uppercase"
            >
              Close
            </CustomButton>
          </CustomSheetClose>
        </CustomSheetFooter>
      </CustomSheetContent>
    </CustomSheet>
  )
}
