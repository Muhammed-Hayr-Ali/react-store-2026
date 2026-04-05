# 🛡️ CSRF Protection - دليل التفعيل والاستخدام

## 📋 نظرة عامة

تم تفعيل حماية **CSRF (Cross-Site Request Forgery)** باستخدام نهج **Double Submit Cookie** المتوافق مع **Next.js App Router** و **Server Actions**.

---

## 🔧 كيف تعمل الحماية

```
┌─────────────┐     ┌────────────────┐     ┌──────────────┐
│   Client    │     │  CSRF Provider │     │ Server Action│
│  (Browser)  │────▶│  (fetch token) │────▶│  (verify)    │
└─────────────┘     └────────────────┘     └──────────────┘
       │                      │                      │
       │  1. GET /api/csrf-token                      │
       │◀─────────────────────┤                      │
       │  Cookie: csrf-token=abc123                  │
       │                      │                      │
       │  2. Submit Form                              │
       │  + hidden csrfToken=abc123                  │
       │─────────────────────────────────────────────▶│
       │                      │  3. verifyCsrfToken()│
       │                      │  cookie === form     │
       │◀─────────────────────────────────────────────┤
       │  Success / Error                              │
└─────────────┘     └────────────────┘     └──────────────┘
```

---

## 📁 الملفات المنشأة

### 1. **API Route** - جلب CSRF Token
```
app/api/csrf-token/route.ts
```
- يعيد CSRF token في cookie
- يُستدعى تلقائياً عند تحميل التطبيق

### 2. **CSRF Provider** - Context
```
lib/providers/csrf-provider.tsx
```
- يجلب token عند التحميل
- يخزنه في React Context

### 3. **CsrfTokenInput** - مكون مخفي
```
components/shared/csrf-token-input.tsx
```
- يُضاف داخل كل form
- يربط token مع البيانات المرسلة

### 4. **Server Action Verifier**
```
lib/security/csrf-server-action.ts
```
- يتحقق من token في Server Actions
- يمنع الطلبات المزورة

---

## ✅ النماذج المحمية

| النموذج | الملف | الحالة |
|---------|-------|--------|
| Sign In | `components/auth/sign-in-form.tsx` | ✅ محمي |
| Sign Up | `components/auth/sign-up-form.tsx` | ✅ محمي |
| Forgot Password | `components/auth/forgot-password-form.tsx` | ✅ محمي |
| Reset Password | `components/auth/reset-password-form.tsx` | ✅ محمي |

---

## 🚀 كيفية إضافة CSRF لنموذج جديد

### الخطوة 1: أضف `CsrfTokenInput` داخل النموذج

```tsx
import { CsrfTokenInput } from "@/components/shared/csrf-token-input";

export default function MyForm() {
  return (
    <form action={myServerAction}>
      <CsrfTokenInput /> {/* ← أضف هذا السطر */}
      
      {/* باقي الحقول */}
      <Input name="email" type="email" />
      <Button type="submit">إرسال</Button>
    </form>
  );
}
```

### الخطوة 2: تحقق من CSRF في Server Action

```ts
"use server";

import { verifyCsrfToken } from "@/lib/security/csrf-server-action";

export async function myServerAction(
  _prevState: unknown,
  formData: FormData,
) {
  // ✅ تحقق من CSRF أولاً
  const csrfCheck = await verifyCsrfToken(formData);
  if (!csrfCheck.valid) {
    return { success: false, error: "أمان: طلب غير صالح" };
  }

  // ✅ باقي المعالجة
  const email = formData.get("email") as string;
  // ...
}
```

### الخطوة 3: استخدم `useActionState` في المكون

```tsx
"use client";
import { useActionState } from "react";

export default function MyForm() {
  const [state, formAction, isPending] = useActionState(
    async (_prevState, formData) => {
      return await myServerAction(_prevState, formData);
    },
    { success: false, error: "" },
  );

  return (
    <form action={formAction}>
      <CsrfTokenInput />
      {/* ... */}
    </form>
  );
}
```

---

## 🔍 آلية التحقق

```ts
// lib/security/csrf-server-action.ts

export async function verifyCsrfToken(formData: FormData) {
  const cookieToken = await cookies().get("csrf-token")?.value;
  const formToken = formData.get("csrfToken") as string;

  if (!cookieToken) return { valid: false, error: "CSRF cookie not found" };
  if (!formToken) return { valid: false, error: "CSRF token not in form" };
  if (cookieToken !== formToken) {
    return { valid: false, error: "CSRF token mismatch" };
  }

  return { valid: true };
}
```

---

## 🛡️ خصائص الأمان

| الخاصية | القيمة |
|---------|--------|
| Token Length | 48 bytes (96 hex chars) |
| Cookie SameSite | `strict` |
| Cookie Secure | `true` (في الإنتاج) |
| Cookie HttpOnly | `false` (يحتاجه العميل) |
| Token TTL | 24 ساعة |
| Generation | `crypto.getRandomValues()` |

---

## ⚠️ ملاحظات مهمة

### ✅ ما يجب فعله
- أضف `<CsrfTokenInput />` في **كل** نموذج
- تحقق من CSRF في **كل** Server Action
- استخدم `useActionState` بدلاً من `useForm` للإرسال

### ❌ ما لا يجب فعله
- لا تُزل `CsrfTokenInput` من النماذج
- لا تتحقق من CSRF **بعد** المعالجة
- لا تخزن CSRF token في localStorage

---

## 🧪 اختبار الحماية

### طلب صالح ✅
```tsx
// يعمل بشكل طبيعي
<form action={myAction}>
  <CsrfTokenInput />
  <Button type="submit">Send</Button>
</form>
```

### طلب مزور ❌
```js
// سيتم رفضه - لا يوجد csrfToken
fetch("/api/...", {
  method: "POST",
  body: JSON.stringify({ email: "test@test.com" }),
});
// ❌ Error: "أمان: طلب غير صالح"
```

---

## 🔗 المراجع

- [OWASP CSRF Prevention](https://cheatsheetseries.owasp.org/cheatsheets/Cross-Site_Request_Forgery_Prevention_Cheat_Sheet.html)
- [Next.js Server Actions](https://nextjs.org/docs/app/building-your-application/data-fetching/server-actions-and-mutations)
- [React useActionState](https://react.dev/reference/react/useActionState)
