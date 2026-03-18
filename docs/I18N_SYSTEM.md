# نظام تعدد اللغات (Internationalization - i18n)

## 📋 نظرة عامة

نظام تعدد اللغات في منصة Marketna يستخدم مكتبة `next-intl` لدعم اللغتين العربية والإنجليزية مع **إخفاء اللغة من URL** للحصول على روابط نظيفة واحترافية.

---

## 📁 هيكل الملفات

```
application/
├── proxy.ts                      # Middleware لاكتشاف اللغة
├── i18n/
│   ├── routing.ts                # إعدادات اللغة
│   └── request.ts                # تحميل الرسائل
├── messages/
│   ├── ar.json                   # الرسائل العربية
│   └── en.json                   # الرسائل الإنجليزية
└── lib/config/
    └── site_config.ts            # إعدادات الموقع (بما فيها اللغات)
```

---

## 🌐 اللغات المدعومة

| الكود | اللغة | الاتجاه | الافتراضي |
|-------|-------|---------|----------|
| `ar` | العربية | RTL (من اليمين لليسار) | ✅ نعم |
| `en` | English | LTR (من اليسار لليمين) | ❌ لا |

---

## 🔧 الإعدادات

### 1. `proxy.ts` - Middleware

**الموقع:** `proxy.ts` (في الجذر)

**الوظيفة:** اكتشاف لغة المستخدم وتعيينها

```typescript
export default createMiddleware({
  locales: ["en", "ar"],           // اللغات المدعومة
  defaultLocale: "en",             // اللغة الافتراضية
  localePrefix: "never",           // إخفاء اللغة من URL
  localeDetection: true,           // تفعيل اكتشاف اللغة
})
```

**خيارات `localePrefix`:**

| القيمة | الوصف | مثال URL |
|--------|-------|----------|
| `"never"` | إخفاء اللغة تماماً | `https://example.com/` |
| `"as-needed"` | إظهار فقط إذا مختلفة عن الافتراضي | `https://example.com/en/` |
| `"always"` | إظهار دائماً | `https://example.com/ar/` |

---

### 2. `i18n/routing.ts` - إعدادات التوجيه

**الموقع:** `i18n/routing.ts`

```typescript
export const routing = defineRouting({
  locales: ["en", "ar"],
  defaultLocale: "en",
  localePrefix: "never",  // مهم: يجب أن يطابق proxy.ts
})
```

---

### 3. `i18n/request.ts` - تحميل الرسائل

**الموقع:** `i18n/request.ts`

```typescript
export default getRequestConfig(async ({requestLocale}) => {
  const requested = await requestLocale
  const locale = hasLocale(routing.locales, requested)
    ? requested
    : routing.defaultLocale

  const messages = (await import(`@/messages/${locale}.json`)).default

  return {
    locale,
    messages,
  }
})
```

---

## 🎯 كيف يعمل النظام

### تدفق اكتشاف اللغة

```
┌─────────────────────────────────────────────────────────────┐
│                    User Request                             │
│                    https://example.com                      │
└──────────────────────────┬──────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│  Middleware (proxy.ts)                                      │
│  1. Check NEXT_LOCALE cookie                               │
│  2. Check Accept-Language header                           │
│  3. Fallback to defaultLocale                              │
└──────────────────────────┬──────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│  Set Locale                                                 │
│  - Store in request                                         │
│  - Set NEXT_LOCALE cookie                                   │
│  - URL stays clean (no /ar/ or /en/)                        │
└──────────────────────────┬──────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│  Server Component                                           │
│  - getMessages() returns correct locale messages            │
│  - Render page in detected language                         │
└─────────────────────────────────────────────────────────────┘
```

---

## 📝 أمثلة الاستخدام

### 1. في Server Components

```tsx
// app/[locale]/page.tsx
import { getMessages } from 'next-intl/server'

export default async function HomePage() {
  const messages = await getMessages()
  
  return (
    <div>
      <h1>{messages.home.title}</h1>
      <p>{messages.home.description}</p>
    </div>
  )
}
```

### 2. في Client Components

```tsx
// components/Welcome.tsx
'use client'

import { useTranslations } from 'next-intl'

export function Welcome() {
  const t = useTranslations()
  
  return (
    <div>
      <h1>{t('home.title')}</h1>
      <p>{t('home.description')}</p>
    </div>
  )
}
```

### 3. تغيير اللغة

```tsx
// components/LocaleSwitcher.tsx
'use client'

import { useRouter, usePathname } from '@/i18n/routing'
import { useLocale } from 'next-intl'

export function LocaleSwitcher() {
  const router = useRouter()
  const pathname = usePathname()
  const locale = useLocale()

  function switchLocale(newLocale: string) {
    // Set cookie for next visit
    document.cookie = `NEXT_LOCALE=${newLocale}; path=/; max-age=31536000`
    
    // Reload current page with new locale
    router.refresh()
  }

  return (
    <select 
      value={locale} 
      onChange={(e) => switchLocale(e.target.value)}
    >
      <option value="ar">العربية</option>
      <option value="en">English</option>
    </select>
  )
}
```

---

## 🍪 Cookie Management

### كيف يتم تخزين اللغة

**اسم الـ Cookie:** `NEXT_LOCALE`

**القيمة:** `"ar"` أو `"en"`

**مدة الصلاحية:** سنة واحدة (31536000 ثانية)

**مثال:**
```
NEXT_LOCALE=ar; Path=/; Expires=Thu, 18 Mar 2027 00:00:00 GMT
```

### تعيين الـ Cookie يدوياً

```typescript
// في Client Component
document.cookie = `NEXT_LOCALE=ar; path=/; max-age=31536000`

// في Server Component (من Response Header)
response.headers.set('Set-Cookie', 'NEXT_LOCALE=ar; Path=/; Max-Age=31536000')
```

---

## 🔍 Matcher Pattern

### فهم الـ Regex

```typescript
matcher: [
  "/((?!api|trpc|_next|_vercel|.*\\..*).*)",
]
```

**الشرح:**

| الجزء | المعنى |
|-------|--------|
| `/` | بداية المسار |
| `(?! ... )` | Negative Lookahead (استثناء) |
| `api` | استبعاد /api/* |
| `trpc` | استبعاد /trpc/* |
| `_next` | استبعاد /_next/* |
| `_vercel` | استبعاد /_vercel/* |
| `.*\\..*` | استبعاد الملفات ذات الامتدادات |
| `.*` | مطابقة باقي المسار |

**المسارات المستبعدة:**
- ❌ `/api/auth/signin`
- ❌ `/trpc/users`
- ❌ `/_next/static/chunks/main.js`
- ❌ `/favicon.ico`
- ❌ `/manifest.json`
- ❌ `/logo.png`

**المسارات المشمولة:**
- ✅ `/`
- ✅ `/comingsoon`
- ✅ `/sign-in`
- ✅ `/dashboard`
- ✅ `/products/123`

---

## 🎨 اتجاه النص (RTL/LTR)

### التطبيق التلقائي

```tsx
// app/[locale]/layout.tsx
export default function RootLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: { locale: string }
}) {
  return (
    <html 
      lang={params.locale}
      dir={params.locale === 'ar' ? 'rtl' : 'ltr'}
    >
      <body>{children}</body>
    </html>
  )
}
```

### CSS حسب الاتجاه

```css
/* globals.css */
[dir="rtl"] {
  --text-direction: rtl;
}

[dir="ltr"] {
  --text-direction: ltr;
}

/* استخدام logical properties */
.card {
  margin-inline-start: 1rem;  /* بدلاً من margin-left */
  padding-inline: 1rem;       /* بدلاً من padding-left/right */
}
```

---

## 📦 هيكل ملفات الرسائل

### `messages/ar.json`

```json
{
  "home": {
    "title": "مرحباً بكم في Marketna",
    "description": "وجهتكم الذكية للتسوق اليومي"
  },
  "common": {
    "loading": "جاري التحميل...",
    "error": "حدث خطأ",
    "success": "تم بنجاح"
  },
  "auth": {
    "signIn": "تسجيل الدخول",
    "signUp": "إنشاء حساب",
    "logout": "تسجيل الخروج"
  }
}
```

### `messages/en.json`

```json
{
  "home": {
    "title": "Welcome to Marketna",
    "description": "Your smart destination for everyday essentials"
  },
  "common": {
    "loading": "Loading...",
    "error": "An error occurred",
    "success": "Success"
  },
  "auth": {
    "signIn": "Sign In",
    "signUp": "Sign Up",
    "logout": "Logout"
  }
}
```

---

## 🛠️ استكشاف الأخطاء

### المشكلة: اللغة لا تتغير

**الحل:**
1. تأكد من أن `NEXT_LOCALE` cookie يتم تعيينه بشكل صحيح
2. تحقق من أن `localePrefix: "never"` في كلا الملفين
3. تأكد من أن الـ matcher لا يستبعد المسار

### المشكلة: المحتوى لا يترجم

**الحل:**
1. تحقق من وجود المفاتيح في ملفات الرسائل
2. تأكد من استخدام `useTranslations()` بشكل صحيح
3. تأكد من أن `NextIntlClientProvider` يغلف المكونات

### المشكلة: الاتجاه RTL لا يعمل

**الحل:**
1. تحقق من أن `dir` attribute تم تعيينه في `<html>`
2. استخدم logical properties في CSS
3. تأكد من أن Tailwind CSS يدعم RTL

---

## 📊 مقارنة: مع وبدون إخفاء اللغة

### مع إخفاء اللغة (`localePrefix: "never"`)

```
✅ URLs نظيفة: https://example.com/
✅ أفضل للـ SEO
✅ تجربة مستخدم أفضل
❌ صعوبة مشاركة رابط بلغة محددة
```

### بدون إخفاء اللغة (`localePrefix: "always"`)

```
✅ سهولة مشاركة رابط بلغة محددة
✅ وضوح اللغة في URL
❌ URLs أطول: https://example.com/ar/products
❌ أقل احترافية
```

---

## 🚀 أفضل الممارسات

### 1. استخدام مفاتيح ذات معنى

```typescript
// ✅ جيد
t('products.addToCart')

// ❌ سيء
t('btn_1')
```

### 2. تنظيم الرسائل منطقياً

```json
{
  "products": {
    "list": { ... },
    "detail": { ... },
    "cart": { ... }
  },
  "auth": {
    "signIn": { ... },
    "signUp": { ... }
  }
}
```

### 3. استخدام Interpolation

```json
{
  "welcome": "مرحباً {name}",
  "itemCount": "{count, plural, =0 {لا توجد عناصر} one {عنصر واحد} other {# عناصر}}"
}
```

```typescript
t('welcome', { name: 'أحمد' })
t('itemCount', { count: 5 })
```

---

## 📞 الدعم

لأي استفسارات حول نظام تعدد اللغات، يرجى التواصل مع فريق التطوير.

---

**الإصدار:** 1.0  
**آخر تحديث:** 2026  
**المشروع:** Marketna E-Commerce Platform  
**المكتبة:** next-intl
