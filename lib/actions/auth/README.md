# 🔐 Auth Actions — نظام المصادقة الموحد

> نظام مصادقة شامل ومتسق يعتمد على Supabase Auth + Server Actions + Zod Validation

---

## 📂 الهيكل

```
lib/actions/auth/
├── login.ts       ← تسجيل الدخول + تسجيل الخروج + استعادة/تحديث كلمة المرور
├── signup.ts      ← إنشاء حساب + إعادة إرسال تأكيد البريد
├── google.ts      ← Google OAuth (signIn, callback, link, unlink)
├── reset.ts       ← طلب إعادة تعيين + استخدام الرمز
├── index.ts       ← إعادة تصدير مركزي + aliases للتوافق
└── README.md      ← هذا الملف
```

---

## 🆚 مقارنة: النظام القديم vs الجديد

| المعيار | ❌ القديم (`authentication/`) | ✅ الجديد (`auth/`) |
|---------|------|------|
| **الملفات** | 6 ملفات منفصلة | 4 ملفات منظمة + barrel |
| **Client Creation** | `createBrowserClient()` مكرر | `createClient()` موحد من `/supabase/server` |
| **Validation** | بدون Zod | ✅ Zod schema لكل دالة |
| **Return Type** | `ApiResult` من ملف مفقود | ✅ `ApiResult` من `@/lib/database/types` |
| **Error Messages** | أكواد خطأ (`USER_SIGNIN_ERROR`) | ✅ رسائل عربية واضحة |
| **Redirect** | في المكونات | ✅ في Server Actions |
| **تسمية الملفات** | `signInWithPassword.ts` (camelCase) | ✅ `login.ts` (مفهومة) |
| **Barrel Export** | ❌ لا يوجد | ✅ `index.ts` مركزي |
| **Aliases** | ❌ — | ✅ `signInWithPassword` = `login` للتوافق |

---

## 📋 الدوال المتوفرة

### تسجيل الدخول (`login.ts`)

| الدالة | المعاملات | الإرجاع | الوصف |
|--------|----------|---------|-------|
| `login()` | `LoginInput` | `ApiResult` | تسجيل دخول + redirect للوحة |
| `logout()` | — | `ApiResult` | تسجيل خروج + redirect للرئيسية |
| `requestPasswordReset()` | `ResetRequestInput` | `ApiResult` | طلب استعادة كلمة المرور |
| `updatePassword()` | `UpdatePasswordInput` | `ApiResult` | تحديث كلمة المرور (مسجل دخول) |

### إنشاء الحساب (`signup.ts`)

| الدالة | المعاملات | الإرجاع | الوصف |
|--------|----------|---------|-------|
| `signup()` | `SignupInput` | `ApiResult<{needsEmailVerification?}>` | إنشاء حساب |
| `resendVerificationEmail()` | `ResendVerificationInput` | `ApiResult` | إعادة إرسال تأكيد البريد |

### Google OAuth (`google.ts`)

| الدالة | المعاملات | الإرجاع | الوصف |
|--------|----------|---------|-------|
| `signInWithGoogle()` | — | `ApiResult` | بدء Google OAuth |
| `handleGoogleCallback()` | — | `ApiResult<{redirectPath}>` | معالجة العودة |
| `linkGoogleAccount()` | — | `ApiResult` | ربط Google بحساب موجود |
| `unlinkGoogleAccount()` | — | `ApiResult` | إلغاء ربط Google |

### إعادة تعيين كلمة المرور (`reset.ts`)

| الدالة | المعاملات | الإرجاع | الوصف |
|--------|----------|---------|-------|
| `requestPasswordReset()` | `ResetRequestInput` | `ApiResult` | طلب استعادة |
| `resetPassword()` | `ResetPasswordInput, token` | `ApiResult` | استخدام الرمز |

### Aliases (للتوافق مع المكونات القديمة)

| Alias | الوظيفة الفعلية |
|-------|-----------------|
| `signInWithPassword` | `login` |
| `signUpWithPassword` | `signup` |
| `verifyResetToken()` | إرجاع `{ isValid: false }` دائماً |

---

## 💡 أمثلة الاستخدام

### مثال 1: تسجيل الدخول

```tsx
"use client"
import { login } from "@/lib/actions/auth"

const result = await login({
  email: "user@example.com",
  password: "MyP@ssw0rd",
  remember: true,
})

if (!result.success) {
  toast.error(result.error)
}
// redirect → /dashboard (تلقائي)
```

### مثال 2: إنشاء حساب

```tsx
import { signup } from "@/lib/actions/auth"

const result = await signup({
  email: "user@example.com",
  password: "MyP@ssw0rd123",
  confirmPassword: "MyP@ssw0rd123",
  first_name: "أحمد",
  last_name: "محمد",
  accept_terms: true,
})

if (result.data?.needsEmailVerification) {
  toast.success("تحقق من بريدك الإلكتروني")
}
```

### مثال 3: استعادة كلمة المرور

```tsx
import { requestPasswordReset } from "@/lib/actions/auth"

await requestPasswordReset({
  email: "user@example.com",
})
// → يرسل بريد الاستعادة بالعربية أو الإنجليزية
```

### مثال 4: Google Sign-In

```tsx
import { signInWithGoogle } from "@/lib/actions/auth"

await signInWithGoogle()
// → redirect → Google OAuth → /callback → /dashboard
```

---

## 🔒 الأمان

| الميزة | الوصف |
|--------|-------|
| ✅ **Zod Validation** | جميع المدخلات مُتحقق منها |
| ✅ **Server Actions** | كل شيء يعمل على الخادم |
| ✅ **لا نكشف عن وجود البريد** | `requestPasswordReset` يرجع success دائماً |
| ✅ **توكن عشوائي** | `crypto.randomUUID()` + base64url |
| ✅ **صلاحية محدودة** | 60 دقيقة |
| ✅ **Soft redirect** | `redirect()` من Next.js |

---

## 🗂️ لماذا هذا التنظيم أفضل؟

### 1. **ملف واحد لكل مجموعة وظائف**
```
login.ts    → كل ما يتعلق بتسجيل الدخول
signup.ts   → كل ما يتعلق بإنشاء الحساب
google.ts   → كل ما يتعلق بـ Google OAuth
reset.ts    → كل ما يتعلق باستعادة كلمة المرور
```

### 2. **Barrel Export**
```ts
// بدل 6 imports
import { a, b, c, d, e, f } from "@/lib/actions/auth/..."

// import واحد
import { login, signup, ... } from "@/lib/actions/auth"
```

### 3. **Zod Validation**
```ts
// قبل: لا يوجد تحقق
export async function login({ email, password }) { ... }

// بعد: Zod schema + safeParse
const LoginSchema = z.object({
  email: z.string().email("البريد الإلكتروني غير صحيح"),
  password: z.string().min(1, "كلمة المرور مطلوبة"),
})
const parsed = LoginSchema.safeParse(input)
```

### 4. **رسائل خطأ واضحة**
```ts
// قبل
return { success: false, error: "USER_SIGNIN_ERROR" }

// بعد
return { success: false, error: "البريد الإلكتروني أو كلمة المرور غير صحيحة" }
```
