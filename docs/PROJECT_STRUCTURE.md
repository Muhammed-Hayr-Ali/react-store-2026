# 📚 هيكلية المشروع - Marketna

## 🎯 الهيكل المعتمد

### **1. المكونات (Components):**

```
components/
├── auth/                      ← مكونات المصادقة
│   ├── sign-in-form.tsx
│   ├── sign-up-form.tsx
│   └── forgot-password-form.tsx
├── admin/                     ← مكونات الإدارة
│   └── upgrade-requests.tsx
└── dashboard/                 ← مكونات لوحة التحكم
    ├── upgrade-account.tsx
    └── upgrade/
        ├── seller-form/index.tsx
        ├── seller-plans/index.tsx
        ├── delivery-form/index.tsx
        ├── delivery-plans/index.tsx
        ├── success/index.tsx
        └── status/index.tsx
```

### **2. الصفحات (Pages):**

```
app/[locale]/
├── admin/
│   └── upgrade-requests/
│       └── page.tsx          ← AdminUpgradeRequests
└── dashboard/
    └── upgrade/
        ├── page.tsx          ← UpgradeAccount
        ├── seller-form/
        │   └── page.tsx      ← UpgradeSellerForm
        ├── seller-plans/
        │   └── page.tsx      ← UpgradeSellerPlans
        ├── delivery-form/
        │   └── page.tsx      ← UpgradeDeliveryForm
        ├── delivery-plans/
        │   └── page.tsx      ← UpgradeDeliveryPlans
        ├── success/
        │   └── page.tsx      ← UpgradeSuccess
        └── status/
            └── page.tsx      ← UpgradeStatus
```

### **3. الترجمات (Translations):**

```
messages/
├── en.json                    ← الترجمة الإنجليزية
└── ar.json                    ← الترجمة العربية
```

---

## 🔑 مفاتيح الترجمة

### **الهيكل:**

```json
{
  "Auth": { ... },            ← المصادقة
  "Dashboard": {              ← لوحة التحكم
    "upgrade": { ... },       ← ترقية الحساب
    "sellerForm": { ... },    ← نموذج البائع
    "sellerPlans": { ... },   ← خطط البائع
    "deliveryForm": { ... },  ← نموذج التوصيل
    "deliveryPlans": { ... }, ← خطط التوصيل
    "success": { ... },       ← النجاح
    "status": { ... }         ← الحالة
  },
  "Admin": {                  ← الإدارة
    "upgradeRequests": { ... } ← طلبات الترقية
  },
  "seo": {                    ← SEO Metadata
    "dashboard": { ... },
    "admin": { ... }
  },
  "siteName": "Marketna"
}
```

---

## 📝 نمط الكتابة

### **1. المكونات:**

```typescript
"use client"

import { useTranslations } from "next-intl"

export default function UpgradeSellerForm() {
  const t = useTranslations("Dashboard.sellerForm")
  
  return (
    <div>
      <h1>{t("title")}</h1>
    </div>
  )
}
```

### **2. الصفحات:**

```typescript
import { UpgradeSellerForm } from "@/components/dashboard/upgrade/seller-form"
import { createMetadata } from "@/lib/config/metadata_generator"
import { getTranslations } from "next-intl/server"

export async function generateMetadata() {
  const t = await getTranslations()

  return createMetadata({
    siteName: t("siteName"),
    title: t("seo.dashboard.sellerForm.title"),
    description: t("seo.dashboard.sellerForm.description"),
  })
}

export default function Page() {
  return <UpgradeSellerForm />
}
```

---

## 🌍 الترجمة

### **1. استخدام useTranslations:**

```typescript
// في المكونات
const t = useTranslations("Dashboard.sellerForm")

// استخدام
<h1>{t("title")}</h1>
<p>{t("description")}</p>
```

### **2. استخدام getTranslations:**

```typescript
// في الصفحات (Server Components)
const t = await getTranslations()

// استخدام
title: t("seo.dashboard.sellerForm.title")
```

---

## 📊 هيكل الملفات الكامل

```
application/
├── app/
│   └── [locale]/
│       ├── admin/
│       │   └── upgrade-requests/
│       │       └── page.tsx
│       └── dashboard/
│           └── upgrade/
│               ├── page.tsx
│               ├── seller-form/page.tsx
│               ├── seller-plans/page.tsx
│               ├── delivery-form/page.tsx
│               ├── delivery-plans/page.tsx
│               ├── success/page.tsx
│               └── status/page.tsx
├── components/
│   ├── admin/
│   │   └── upgrade-requests.tsx
│   ├── auth/
│   │   └── *.tsx
│   └── dashboard/
│       ├── upgrade-account.tsx
│       └── upgrade/
│           ├── seller-form/index.tsx
│           ├── seller-plans/index.tsx
│           ├── delivery-form/index.tsx
│           ├── delivery-plans/index.tsx
│           ├── success/index.tsx
│           └── status/index.tsx
└── messages/
    ├── en.json
    └── ar.json
```

---

## ✅ التحقق من الصحة

### **1. المكونات:**

```bash
# تحقق من أن جميع المكونات تُصدّر بشكل صحيح
ls components/dashboard/upgrade/*/index.tsx
```

### **2. الصفحات:**

```bash
# تحقق من أن جميع الصفحات موجودة
ls app/[locale]/dashboard/upgrade/*/page.tsx
```

### **3. الترجمات:**

```bash
# تحقق من وجود جميع المفاتيح
grep -o '"Dashboard":' messages/en.json
grep -o '"seo":' messages/en.json
```

---

## 🎯 أفضل الممارسات

### **1. ✅ استخدم المكونات في الصفحات:**

```typescript
// ✅ صحيح
import { UpgradeSellerForm } from "@/components/dashboard/upgrade/seller-form"
export default function Page() {
  return <UpgradeSellerForm />
}

// ❌ خطأ
export default function Page() {
  return <div>...</div>  // كود مباشر في الصفحة
}
```

### **2. ✅ استخدم الترجمة في جميع النصوص:**

```typescript
// ✅ صحيح
const t = useTranslations("Dashboard.sellerForm")
<h1>{t("title")}</h1>

// ❌ خطأ
<h1>Store Information</h1>
```

### **3. ✅ استخدم generateMetadata في جميع الصفحات:**

```typescript
// ✅ صحيح
export async function generateMetadata() {
  const t = await getTranslations()
  return createMetadata({
    title: t("seo.dashboard.sellerForm.title"),
  })
}

// ❌ خطأ
export const metadata = {
  title: "Store Information",  // نص ثابت
}
```

---

**آخر تحديث:** 2026  
**المشروع:** Marketna E-Commerce Platform
