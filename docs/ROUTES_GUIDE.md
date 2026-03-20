# 🔗 دليل الروابط - Marketna

## 📋 استخدام `appRouter` للروابط

تم إنشاء ملف `lib/app-routes.ts` لتسهيل إدارة الروابط مع التوطين.

---

## 🚀 كيفية الاستخدام

### 1. استيراد `appRouter`:

```typescript
import { appRouter } from '@/lib/app-routes'
```

### 2. استخدام الروابط:

```typescript
// في مكونات React
<Link href={appRouter.upgrade}>ترقية الحساب</Link>

// في useRouter
const router = useRouter()
router.push(appRouter.upgradeSellerForm)

// في النماذج
<form action={appRouter.signIn}>
```

---

## 📊 جميع الروابط المتاحة

### المصادقة:

```typescript
appRouter.signIn          // /en/auth/signin
appRouter.signUp          // /en/auth/signup
appRouter.forgotPassword  // /en/auth/forgot-password
appRouter.resetPassword   // /en/auth/reset-password
appRouter.verifyOtp       // /en/auth/verify-otp
```

### لوحة التحكم:

```typescript
appRouter.dashboard       // /en/dashboard
appRouter.profile         // /en/dashboard/profile
appRouter.settings        // /en/dashboard/settings
```

### الترقية:

```typescript
appRouter.upgrade              // /en/dashboard/upgrade
appRouter.upgradeSellerForm    // /en/dashboard/upgrade/seller-form
appRouter.upgradeSellerPlans   // /en/dashboard/upgrade/seller-plans
appRouter.upgradeDeliveryForm  // /en/dashboard/upgrade/delivery-form
appRouter.upgradeDeliveryPlans // /en/dashboard/upgrade/delivery-plans
appRouter.upgradeSuccess       // /en/dashboard/upgrade/success
appRouter.upgradeStatus        // /en/dashboard/upgrade/status
```

### الإدارة:

```typescript
appRouter.adminDashboard       // /en/admin
appRouter.adminUpgradeRequests // /en/admin/upgrade-requests
```

### المتجر:

```typescript
appRouter.products  // /en/dashboard/products
appRouter.orders    // /en/dashboard/orders
```

---

## 🌍 مع الترجمة (i18n)

### استخدام `getRoute`:

```typescript
import { getRoute } from '@/lib/app-routes'

// باللغة الإنجليزية (الافتراضي)
const enRoute = getRoute('upgrade')  // /en/dashboard/upgrade

// باللغة العربية
const arRoute = getRoute('upgrade', 'ar')  // /ar/dashboard/upgrade
```

### في المكونات:

```typescript
'use client'

import { useLocale } from 'next-intl'
import { getRoute } from '@/lib/app-routes'
import Link from 'next/link'

export default function Navigation() {
  const locale = useLocale()
  
  return (
    <nav>
      <Link href={getRoute('upgrade', locale)}>
        ترقية الحساب
      </Link>
    </nav>
  )
}
```

---

## 📝 أمثلة عملية

### 1. في Component:

```typescript
'use client'

import { useRouter } from 'next/navigation'
import { appRouter } from '@/lib/app-routes'

export default function UpgradeButton() {
  const router = useRouter()
  
  const handleUpgrade = () => {
    router.push(appRouter.upgrade)
  }
  
  return (
    <Button onClick={handleUpgrade}>
      ترقية الحساب
    </Button>
  )
}
```

### 2. في Link:

```typescript
import Link from 'next/link'
import { appRouter } from '@/lib/app-routes'

export default function Navigation() {
  return (
    <nav>
      <Link href={appRouter.dashboard}>لوحة التحكم</Link>
      <Link href={appRouter.upgrade}>ترقية الحساب</Link>
      <Link href={appRouter.adminUpgradeRequests}>الإدارة</Link>
    </nav>
  )
}
```

### 3. في Form Action:

```typescript
import { appRouter } from '@/lib/app-routes'

export default function SignInForm() {
  return (
    <form action={appRouter.signIn}>
      {/* حقول النموذج */}
    </form>
  )
}
```

---

## ⚠️ ملاحظات هامة

### 1. ❌ لا تستخدم الروابط المباشرة:

```typescript
// ❌ خطأ
<Link href="/dashboard/upgrade">ترقية</Link>

// ✅ صحيح
<Link href={appRouter.upgrade}>ترقية</Link>
```

### 2. ✅ استخدم `appRouter` دائماً:

```typescript
// ✅ صحيح
router.push(appRouter.upgradeSellerForm)

// ✅ صحيح
<Link href={appRouter.upgradeStatus}>حالة الطلب</Link>
```

### 3. 🌍 مع الترجمة:

```typescript
// ✅ صحيح
<Link href={getRoute('upgrade', locale)}>
  {locale === 'ar' ? 'ترقية' : 'Upgrade'}
</Link>
```

---

## 🎯 تحديث ملف sign-in-form

```typescript
import { appRouter } from '@/lib/app-routes'

// في النموذج
<Link href={appRouter.forgotPassword}>
  {t('forgotPassword')}
</Link>

// في الإرسال
router.push(appRouter.dashboard)
```

---

## 📊 هيكل الملفات النهائي

```
app/
├── [locale]/
│   ├── auth/
│   │   ├── signin/
│   │   ├── signup/
│   │   └── forgot-password/
│   ├── dashboard/
│   │   ├── upgrade/
│   │   │   ├── page.tsx
│   │   │   ├── seller-form/
│   │   │   ├── seller-plans/
│   │   │   ├── delivery-form/
│   │   │   ├── delivery-plans/
│   │   │   ├── success/
│   │   │   └── status/
│   │   └── products/
│   └── admin/
│       └── upgrade-requests/
└── lib/
    └── app-routes.ts
```

---

## 🔧 إضافة روابط جديدة

في `lib/app-routes.ts`:

```typescript
export const appRouter = {
  // ... الروابط الموجودة
  
  // أضف رابط جديد
  newRoute: '/en/dashboard/new-route',
} as const
```

---

**آخر تحديث:** 2026  
**المشروع:** Marketna E-Commerce Platform
