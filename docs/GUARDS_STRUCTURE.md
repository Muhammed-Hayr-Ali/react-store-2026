# 🛡️ نظام الحماية - هيكل Guards

## 📊 خريطة الحماية الكاملة

```
┌─────────────────────────────────────────────────────────────────┐
│                    ROOT LOCALE LAYOUT                           │
│                   /app/[locale]/layout.tsx                       │
│                                                                 │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │  MfaGuard                                                  │  │
│  │  ✅ يتحقق من مستوى MFA لكل المستخدمين المسجلين            │  │
│  │  ✅ إذا aal1 + nextLevel=aal2 → redirect /verify          │  │
│  │  ✅ يتخطى صفحات MFA (/verify, /two-factor/setup)           │  │
│  │  ✅ إذا aal2 → يُسمح بالمرور                               │  │
│  └───────────────────────────────────────────────────────────┘  │
│                                                                 │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │  (auth)/     │  │   (mfa)/     │  │   (site)/    │          │
│  │  GuestGuard  │  │  AuthGuard   │  │   Public     │          │
│  └──────────────┘  └──────────────┘  └──────────────┘          │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🔐 تفصيل كل Guard

### 1. GuestGuard (`lib/middleware/guest-guard.tsx`)
| البند | القيمة |
|------|--------|
| **الموقع** | `app/[locale]/(auth)/layout.tsx` |
| **الوظيفة** | يمنع المستخدمين المسجلين من الوصول لصفحات المصادقة |
| **إذا مسجل** | يوجّه إلى `/` (home) |
| **إذا زائر** | يُسمح بالمرور |
| **الصفحات المحمية** | `/sign-in`, `/sign-up`, `/forgot-password`, `/reset-password`, `/callback` |

```ts
// GuestGuard Logic
if (user is authenticated) → redirect("/")
else → allow access
```

### 2. AuthGuard (`lib/middleware/auth-guard.ts`)
| البند | القيمة |
|------|--------|
| **الموقع** | `app/[locale]/(mfa)/layout.tsx` |
| **الوظيفة** | يمنع الزوار من الوصول لصفحات MFA |
| **إذا زائر** | يوجّه إلى `/sign-in` |
| **إذا مسجل** | يُسمح بالمرور |
| **الصفحات المحمية** | `/verify`, `/two-factor/setup` |

```ts
// AuthGuard Logic
if (user is NOT authenticated) → redirect("/sign-in")
else → allow access
```

### 3. MfaGuard (`lib/middleware/mfa-guard.ts`)
| البند | القيمة |
|------|--------|
| **الموقع** | `app/[locale]/layout.tsx` (Root Layout) |
| **الوظيفة** | يتحقق من مستوى MFA لكل المستخدمين المسجلين |
| **إذا aal1 + nextLevel=aal2** | redirect `/verify` (ما لم يكن في صفحة MFA) |
| **إذا aal2** | يُسمح بالمرور |
| **إذا لا session** | يُسمح بالمرور (AuthGuard سيتولى) |

```ts
// MfaGuard Logic
if (no session) → allow (AuthGuard will handle)
if (aal1 + nextLevel=aal2) → redirect("/verify") UNLESS already on MFA page
if (aal2) → allow
```

---

## 🔄 تدفق المصادقة الكاملة

### تسجيل الدخول العادي (بريد + كلمة مرور)
```
1. زائر → /sign-in
2. GuestGuard → ✅ يسمح (زائر)
3. يدخل البريد + كلمة المرور
4. signInWithPassword → ✅ نجاح
5. router.push("/") → الصفحة الرئيسية
6. MfaGuard → يتحقق:
   - إذا aal1 + nextLevel=aal2 → redirect /verify
   - إذا aal1 فقط (لا MFA) → ✅ يسمح
   - إذا aal2 (MFA مكتمل) → ✅ يسمح
```

### تسجيل الدخول بـ Google (OAuth)
```
1. زائر → /sign-in → Google Sign In
2. GuestGuard → ✅ يسمح (زائر)
3. Google OAuth → callback page
4. callback-page.tsx (client-side):
   - getUser() → ✅ نجاح
   - getAuthenticatorAssuranceLevel()
   - إذا aal1 + nextLevel=aal2 → router.push("/verify")
   - إذا لا → إظهار رسالة نجاح → /home
5. MfaGuard → يتحقق مرة أخرى (server-side)
```

### إكمال MFA
```
1. مسجل (aal1, nextLevel=aal2) → /verify
2. AuthGuard → ✅ يسمح (مسجل)
3. MfaGuard → ✅ يتخطى (في صفحة MFA)
4. يدخل رمز OTP
5. verifyMfaForLogin → ✅ نجاح → currentLevel=aal2
6. router.push("/home")
7. MfaGuard → aal2 → ✅ يسمح
```

### إعداد MFA لأول مرة
```
1. مسجل (aal1, nextLevel=none أو aal2) → /two-factor/setup
2. AuthGuard → ✅ يسمح (مسجل)
3. MfaGuard → ✅ يسمح (ليس aal1+nextLevel=aal2)
4. يُنشئ MFA factor → nextLevel=aal2
5. من الآن فصاعداً: MfaGuard → redirect /verify
```

---

## 📋 جدول الحماية

| الصفحة | Group | Guard | MfaGuard | النتيجة |
|--------|-------|-------|----------|---------|
| `/sign-in` | (auth) | GuestGuard | ✅ يعمل | زائر فقط |
| `/sign-up` | (auth) | GuestGuard | ✅ يعمل | زائر فقط |
| `/forgot-password` | (auth) | GuestGuard | ✅ يعمل | زائر فقط |
| `/reset-password` | (auth) | GuestGuard | ✅ يعمل | زائر فقط |
| `/callback` | (auth) | GuestGuard | ✅ يعمل | زائر فقط |
| `/verify` | (mfa) | AuthGuard | ✅ يتخطى | مسجل فقط |
| `/two-factor/setup` | (mfa) | AuthGuard | ✅ يتخطى | مسجل فقط |
| `/` (landing) | (site) | لا Guard | ✅ يعمل | عام |
| `/home` | (site) | لا Guard | ✅ يعمل | عام |
| `/terms` | - | لا Guard | ✅ يعمل | عام |
| `/privacy` | - | لا Guard | ✅ يعمل | عام |
| `/dashboard/*` (مستقبلاً) | - | يحتاج AuthGuard | ✅ يعمل | مسجل + MFA مكتمل |

---

## ⚠️ ملاحظات مهمة

1. **MfaGuard في Root Layout** يحمي **كل** الصفحات تلقائياً
2. **MFA Pages مستثناة** من إعادة التوجيه لتجنب الحلقة
3. **Callback Page** يتحقق من MFA أيضاً على مستوى العميل
4. **GuestGuard** يمنع المسجلين من صفحات المصادقة
5. **AuthGuard** يمنع الزوار من صفحات MFA

---

## 🚀 لإضافة صفحات محمية جديدة (مثل Dashboard)

أنشئ route group جديد `(dashboard)`:

```
app/[locale]/
└── (dashboard)/
    ├── layout.tsx     ← يضيف AuthGuard
    └── page.tsx       ← الصفحة الرئيسية للوحة التحكم
```

```tsx
// app/[locale]/(dashboard)/layout.tsx
import { AuthGuard } from "@/lib/middleware/auth-guard";
import { appRouter } from "@/lib/navigation/routes";

export default async function DashboardLayout({ children }) {
  return (
    <main>
      <AuthGuard redirectPath={appRouter.signIn} />
      {/* MfaGuard موجود في Root Layout تلقائياً */}
      {children}
    </main>
  );
}
```

---

## ✅ ملخص الحالة

| البند | الحالة |
|------|--------|
| GuestGuard في (auth) | ✅ صحيح |
| AuthGuard في (mfa) | ✅ صحيح |
| MfaGuard في Root Layout | ✅ مُضاف |
| MfaGuard يتخطى صفحات MFA | ✅ مُعدّل |
| Audit Logging في MfaGuard | ✅ مُستبدل console.error |
| Callback page MFA check | ✅ موجود (client-side) |
| Verify form | ✅ يعمل مع MFA actions |
| Two-factor setup | ✅ محمي بـ AuthGuard |
