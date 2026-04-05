# 📧 Email Service — خدمة البريد الإلكتروني

> نظام إرسال البريد متعدد اللغات باستخدام Nodemailer + Gmail SMTP

---

## 📂 الهيكل

```
lib/email/
├── transporter.ts          ← إعداد Nodemailer (الاتصال بـ SMTP)
├── service.ts              ← دوال إرسال عالية المستوى
├── actions.ts              ← Server Actions للاستخدام في الواجهة
├── templates/
│   └── index.ts            ← قوالب HTML متعددة اللغات (ar/en)
├── index.ts                ← إعادة تصدير مركزي
└── README.md               ← هذا الملف
```

---

## ⚙️ الإعداد

### `.env.local`:

```env
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=m.thelord963@gmail.com
EMAIL_PASSWORD=wqpoyxoruemikbpc
EMAIL_FROM=m.thelord963@gmail.com
EMAIL_FROM_NAME=Multi-Vendor Platform
```

> ⚠️ **مهم:** `EMAIL_PASSWORD` يجب أن يكون **App Password** وليس كلمة مرور Gmail العادية.
>
> للإعداد: Google Account → Security → 2-Step Verification → App Passwords

---

## 🌍 دعم اللغات

جميع القوالب تدعم **العربية** (`ar`) و **الإنجليزية** (`en`).

### كيف تعمل:

```
1. الصفحة تستدعي Server Action مع اللغة
   (تأتي من URL: /ar/ أو /en/)
        ↓
2. Server Action تمرّر اللغة للـ Service
        ↓
3. القالب يُولّد بالعربية أو الإنجليزية
   (المحتوى + العنوان + اتجاه النص rtl/ltr)
        ↓
4. يتم إرسال البريد
```

> ⚠️ **اللغة تُمرَّر من الصفحة (Caller)** ولا تعتمد على جلسة المستخدم —
> لأن المستخدم قد لا يكون مسجّلاً بعد (مثل: تأكيد البريد، إعادة تعيين كلمة المرور).

### نوع اللغة:

```ts
export type Lang = "ar" | "en"
```

---

## 📋 الوظائف المتوفرة

### عبر Service (مباشرة في Server Components)

| الدالة                       | المعاملات                                                | الاستخدام               |
| ---------------------------- | -------------------------------------------------------- | ----------------------- |
| `sendVerificationEmail`      | `to, userName, verificationUrl, code?, lang?`            | تأكيد البريد            |
| `sendPasswordResetEmail`     | `to, userName, resetUrl, code?, lang?`                   | إعادة تعيين كلمة المرور |
| `sendWelcomeEmail`           | `to, userName, lang?`                                    | ترحيب بالمستخدم الجديد  |
| `sendOrderConfirmationEmail` | `to, userName, orderNumber, total, orderUrl?, lang?`     | تأكيد الطلب             |
| `sendSupportTicketEmail`     | `to, userName, ticketNumber, subject, ticketUrl?, lang?` | إشعار تذكرة الدعم       |
| `testEmailConnection`        | `to?, lang?`                                             | اختبار الاتصال          |

### عبر Server Actions (من Client Components)

| الدالة                        | المعاملات                                      | الاستخدام               |
| ----------------------------- | ---------------------------------------------- | ----------------------- |
| `sendVerificationAction`      | `email, fullName, url, code?, lang`            | تأكيد البريد            |
| `sendPasswordResetAction`     | `email, fullName, url, code?, lang`            | إعادة تعيين كلمة المرور |
| `sendWelcomeAction`           | `email, fullName, lang`                        | ترحيب                   |
| `sendOrderConfirmationAction` | `email, fullName, orderNumber, total, lang`    | تأكيد الطلب             |
| `sendSupportTicketAction`     | `email, fullName, ticketNumber, subject, lang` | إشعار التذكرة           |
| `testEmailConnectionAction`   | `testEmail?, lang`                             | اختبار الاتصال          |

---

## 💡 أمثلة الاستخدام

### مثال 1: إرسال بريد ترحيبي (مع اللغة من URL)

```tsx
"use client"
import { sendWelcomeAction } from "@/lib/email"
import type { Lang } from "@/lib/email"

export default function WelcomeButton({ locale }: { locale: Lang }) {
  const handleClick = async () => {
    const result = await sendWelcomeAction(
      "user@example.com",
      "أحمد محمد",
      locale  // ← اللغة من الـ URL
    )

    if (result.success) {
      toast.success("تم إرسال البريد الترحيبي ✅")
    } else {
      toast.error(result.error)
    }
  }

  return <button onClick={handleClick}>إرسال ترحيب</button>
}
```

### مثال 2: إعادة تعيين كلمة المرور

```tsx
"use client"
import { sendPasswordResetAction } from "@/lib/email"
import type { Lang } from "@/lib/email"

const APP_URL = process.env.NEXT_PUBLIC_APP_URL

export async function handlePasswordReset(
  email: string,
  fullName: string,
  token: string,
  locale: Lang
) {
  const resetUrl = `${APP_URL}/auth/reset-password?token=${token}`

  return sendPasswordResetAction(email, fullName, resetUrl, undefined, locale)
}
```

### مثال 3: تأكيد الطلب (Server Component)

```ts
import { sendOrderConfirmationEmail } from "@/lib/email"

// في Server Action أو API Route
await sendOrderConfirmationEmail(
  "customer@example.com",
  "أحمد",
  "ORD-2025-001",
  "$149.99",
  "/orders/ORD-2025-001",
  "ar"  // ← اللغة
)
```

### مثال 4: اختبار الاتصال (للأدمن)

```tsx
"use client"
import { testEmailConnectionAction } from "@/lib/email"

export default function TestEmailButton() {
  const handleTest = async () => {
    const result = await testEmailConnectionAction(undefined, "ar")

    if (result.success) {
      toast.success("الاتصال يعمل! ✅")
    } else {
      toast.error(`خطأ: ${result.error}`)
    }
  }

  return <button onClick={handleTest}>اختبار البريد</button>
}
```

---

## 🎨 القوالب المتوفرة

| القالب                      | الوصف                                    | اللغات |
| --------------------------- | ---------------------------------------- | :----: |
| `emailVerificationTemplate` | تأكيد البريد (مع رمز أو رابط)            | ar, en |
| `passwordResetTemplate`     | إعادة تعيين كلمة المرور (مع رمز أو رابط) | ar, en |
| `welcomeTemplate`           | ترحيب بالمستخدم الجديد                   | ar, en |
| `orderConfirmationTemplate` | تأكيد الطلب                              | ar, en |
| `supportTicketTemplate`     | إشعار تذكرة الدعم                        | ar, en |

### مميزات القوالب:

| الميزة              | الوصف                                    |
| ------------------- | ---------------------------------------- |
| 🌐 **متعدد اللغات** | عربي + إنجليزي مع قاموس ترجمة مركزي      |
| 📐 **اتجاه النص**   | `rtl` للعربية، `ltr` للإنجليزية تلقائياً |
| 🔤 **الخط**         | `Cairo` للعربية، `Inter` للإنجليزية      |
| 📱 **متجاوب**       | يعمل على جميع أحجام الشاشات              |
| 🎨 **تصميم موحد**   | Header متدرج + Footer موحد               |

### تخصيص القالب:

```ts
import { emailVerificationTemplate } from "./templates"
import { sendEmail } from "./transporter"

const { html, subject } = emailVerificationTemplate(
  "أحمد",
  "https://...",
  "123456",
  "ar"  // ← اللغة
)

await sendEmail({
  to: "user@example.com",
  subject,   // ← العنوان باللغة المحددة
  html,      // ← المحتوى باللغة المحددة
})
```

---

## 🔒 الأمان

- ✅ جميع دوال الإرسال تعمل **على الخادم فقط** (Server Actions / Server Components)
- ✅ بيانات SMTP لا تصل إلى المتصفح
- ✅ اللغة تُمرَّر صراحةً من الـ Caller (لا تعتمد على الجلسة)
- ✅ يعمل مع المستخدمين غير المسجلين (signup, password reset)
