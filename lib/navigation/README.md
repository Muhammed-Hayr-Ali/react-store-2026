# 🗺️ Navigation System — نظام التنقل المركزي

> مصدر واحد ومركزي لجميع مسارات التطبيق — يمنع الروابط المكسورة ويُسهّل الصيانة.

---

## 📂 الهيكل

```
lib/navigation/
├── routes.ts     ← تعريف المسارات + الدوال المساعدة
├── index.ts      ← إعادة تصدير مركزي
└── README.md     ← هذا الملف
```

---

## 🎯 لماذا؟

| المشكلة بدون خريطة | الحل مع `appRouter` |
|---------------------|---------------------|
| روابط مكسورة بعد تغيير مسار | تغيير واحد في `routes.ts` يكفي |
| تكرار `"/sign-in"` في 20 ملف | مرجع واحد `appRouter.signIn` |
| نسيان الـ locale في الروابط | دالة `buildLocalRoute()` تضمن ذلك |
| أخطاء إملائية `"/sing-in"` ❌ | Auto-complete من TypeScript |

---

## 📋 جميع المسارات

### الرئيسية

| الاسم | المسار | الوصف |
|-------|--------|-------|
| `home` | `/` | الصفحة الرئيسية |

### القانونية

| الاسم | المسار | الوصف |
|-------|--------|-------|
| `terms` | `/terms` | الشروط والأحكام |
| `privacy` | `/privacy` | سياسة الخصوصية |

### المصادقة (Auth)

| الاسم | المسار | الوصف |
|-------|--------|-------|
| `callback` | `/callback` | معالجة العودة من OAuth |
| `forgotPassword` | `/forgot-password` | نسيان كلمة المرور |
| `resetPassword` | `/reset-password` | إعادة تعيين كلمة المرور |
| `signIn` | `/sign-in` | تسجيل الدخول |
| `signUp` | `/sign-up` | إنشاء حساب جديد |

### التحقق الثنائي (MFA)

| الاسم | المسار | الوصف |
|-------|--------|-------|
| `verifyOtp` | `/verify` | التحقق من رمز OTP |
| `twoFactorSetup` | `/two-factor/setup` | إعداد التحقق الثنائي |

### لوحة التحكم (Dashboard)

| الاسم | المسار | الوصف |
|-------|--------|-------|
| `dashboard` | `/dashboard` | لوحة التحكم الرئيسية |
| `products` | `/dashboard/products` | إدارة المنتجات |
| `orders` | `/dashboard/orders` | إدارة الطلبات |

### الترقية (Upgrade)

| الاسم | المسار | الوصف |
|-------|--------|-------|
| `upgrade` | `/dashboard/upgrade` | صفحة الترقية الرئيسية |
| `upgradeDeliveryForm` | `/dashboard/upgrade/delivery-form` | نموذج ترقية التوصيل |
| `upgradeDeliveryPlans` | `/dashboard/upgrade/delivery-plans` | خطط التوصيل |
| `upgradeSellerForm` | `/dashboard/upgrade/seller-form` | نموذج ترقية البائع |
| `upgradeSellerPlans` | `/dashboard/upgrade/seller-plans` | خطط البائعين |
| `upgradeSuccess` | `/dashboard/upgrade/success` | نجاح الترقية |
| `upgradeStatus` | `/dashboard/upgrade/status` | حالة الترقية |

### الإدارة (Admin)

| الاسم | المسار | الوصف |
|-------|--------|-------|
| `adminDashboard` | `/admin` | لوحة تحكم الأدمن |
| `adminUpgradeRequests` | `/admin/upgrade-requests` | طلبات الترقية |

### الملف الشخصي (Profile)

| الاسم | المسار | الوصف |
|-------|--------|-------|
| `profile` | `/dashboard/profile` | الملف الشخصي |
| `settings` | `/dashboard/settings` | الإعدادات |

---

## 🛠️ الدوال المساعدة

### `getRoute(name)`

جلب مسار بالاسم.

```ts
import { getRoute } from "@/lib/navigation"

getRoute("signIn")  // → "/sign-in"
getRoute("dashboard") // → "/dashboard"
```

### `buildLocalRoute(locale, name)`

بناء مسار مع locale.

```ts
import { buildLocalRoute } from "@/lib/navigation"

buildLocalRoute("ar", "signIn")  // → "/ar/sign-in"
buildLocalRoute("en", "signIn")  // → "/en/sign-in"
buildLocalRoute("ar", "dashboard") // → "/ar/dashboard"
```

### `buildUrl(path, params?)`

بناء URL مع معلمات الاستعلام.

```ts
import { buildUrl } from "@/lib/navigation"

buildUrl("/ar/sign-in", { next: "/dashboard" })
// → "/ar/sign-in?next=%2Fdashboard"

buildUrl("/ar/sign-up", { ref: "google" })
// → "/ar/sign-up?ref=google"

buildUrl("/ar/dashboard")
// → "/ar/dashboard" (بدون params)
```

### `loginWithRedirect(redirectUrl)`

إنشاء رابط تسجيل دخول مع redirect.

```ts
import { loginWithRedirect } from "@/lib/navigation"

loginWithRedirect("/dashboard/settings")
// → "/sign-in?next=%2Fdashboard%2Fsettings"

loginWithRedirect("/")
// → "/sign-in?next=%2F"
```

### `callbackWithNext(nextUrl)`

إنشاء رابط callback مع next.

```ts
import { callbackWithNext } from "@/lib/navigation"

callbackWithNext("/dashboard")
// → "/callback?next=%2Fdashboard"
```

---

## 💡 أمثلة الاستخدام

### مثال 1: رابط عادي (Client Component)

```tsx
import Link from "next/link"
import { appRouter } from "@/lib/navigation"

export default function Header() {
  return (
    <nav>
      <Link href={appRouter.home}>الرئيسية</Link>
      <Link href={appRouter.signIn}>تسجيل الدخول</Link>
      <Link href={appRouter.signUp}>إنشاء حساب</Link>
    </nav>
  )
}
```

### مثال 2: إعادة توجيه (Server Action)

```tsx
"use server"
import { redirect } from "next/navigation"
import { appRouter } from "@/lib/navigation"

export async function handleLogin() {
  // ... منطق تسجيل الدخول
  redirect(appRouter.dashboard)
}
```

### مثال 3: حماية مسار مع locale

```tsx
import { buildLocalRoute } from "@/lib/navigation"

// في middleware
export function middleware(request: NextRequest) {
  const locale = request.cookies.get("NEXT_LOCALE")?.value ?? "ar"
  const signInUrl = buildLocalRoute(locale, "signIn")

  if (!isAuthenticated) {
    return NextResponse.redirect(new URL(signInUrl, request.url))
  }
}
```

### مثال 4: رابط مع redirect بعد الدخول

```tsx
import Link from "next/link"
import { loginWithRedirect } from "@/lib/navigation"

export default function PremiumFeature() {
  return (
    <div>
      <p>هذه الميزة متاحة للأعضاء فقط</p>
      <Link href={loginWithRedirect("/dashboard/upgrade")}>
        سجّل الدخول للترقية
      </Link>
    </div>
  )
}
```

### مثال 5: استخدام النوع `RouteName`

```tsx
import { type RouteName, getRoute } from "@/lib/navigation"

// TypeScript يضمن أن الاسم موجود
const routes: RouteName[] = ["signIn", "signUp", "dashboard"]

routes.forEach(name => {
  console.log(`${name}: ${getRoute(name)}`)
})
```

### مثال 6: التنقل بعد تسجيل الدخول

```tsx
"use client"
import { useRouter } from "next/navigation"
import { appRouter } from "@/lib/navigation"

export function useLoginNavigation() {
  const router = useRouter()

  return () => {
    // ... منطق تسجيل الدخول
    router.push(appRouter.dashboard)
  }
}
```

---

## 📐 الهيكل مقابل URL الفعلي

> ⚠️ Route Groups مثل `(auth)` و `(mfa)` لا تظهر في URL.

| مسار الملفات | URL الفعلي |
|-------------|-----------|
| `[locale]/(auth)/sign-in/page.tsx` | `/ar/sign-in` |
| `[locale]/(auth)/sign-up/page.tsx` | `/ar/sign-up` |
| `[locale]/(mfa)/verify/page.tsx` | `/ar/verify` |
| `[locale]/(mfa)/two-factor/setup/page.tsx` | `/ar/two-factor/setup` |
| `[locale]/(site)/page.tsx` | `/ar/` |
| `[locale]/(site)/home/page.tsx` | `/ar/home` |

---

## ✅ قواعد الاستخدام

1. **لا تستخدم نصوص مسارات مباشرة** — دائماً من `appRouter`
2. **استخدم `buildLocalRoute()`** عند التنقل بين locales
3. **استخدم `buildUrl()`** لإضافة query params
4. **أضف المسار الجديد** في `routes.ts` قبل استخدامه
5. **لا تحذف مساراً** دون التحقق من جميع أماكن استخدامه

---

## 🔍 إضافة مسار جديد

```ts
// 1. أضف المسار في routes.ts
export const appRouter = {
  // ... المسارات الحالية
  myNewPage: "/dashboard/my-page",
} as const

// 2. استخدمه في أي مكان
import { appRouter } from "@/lib/navigation"
<Link href={appRouter.myNewPage}>صفحتي</Link>
```

---

## 🔧 تغيير مسار موجود

```ts
// قبل
upgrade: "/dashboard/upgrade",

// بعد
upgrade: "/dashboard/billing",

// ✅ كل الروابط في التطبيق تتحدث تلقائياً
```
