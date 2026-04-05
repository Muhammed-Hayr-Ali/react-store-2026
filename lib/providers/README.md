# 🔐 Auth Provider

> مزود مصادقة شامل يوفر حالة المستخدم الكاملة (بروفايل + أدوار + اشتراكات + صلاحيات) لجميع مكونات التطبيق.

---

## 📂 الموقع

```
lib/providers/auth-provider.tsx
```

---

## 🏗️ الهيكل

```tsx
import { AuthProvider } from "@/lib/providers/auth-provider"

// في Root Layout
<AuthProvider>
  {children}
</AuthProvider>
```

---

## 📋 البيانات المتوفرة

### AuthState

| الحقل | النوع | الوصف |
|-------|-------|-------|
| `session` | `Session \| null` | جلسة Supabase الحالية |
| `user` | `User \| null` | المستخدم من Supabase Auth |
| `profile` | `FullProfile \| null` | البروفايل الكامل من `get_user_full_profile()` |
| `isLoading` | `boolean` | جاري التحميل |
| `isAuthenticated` | `boolean` | هل المستخدم مسجل الدخول؟ |

### FullProfile

```ts
type FullProfile = {
  profile: UserProfile          // بيانات البروفايل
  roles: Role[]                 // الأدوار مع الصلاحيات
  subscriptions: Subscription[] // الاشتراكات النشطة
  permissions: string[]         // جميع الصلاحيات مجتمعة
}
```

### UserProfile

| الحقل | النوع | مثال |
|-------|-------|------|
| `id` | `string \| null` | `"550e8400-..."` |
| `email` | `string \| null` | `"user@example.com"` |
| `full_name` | `string \| null` | `"أحمد محمد"` |
| `first_name` | `string \| null` | `"أحمد"` |
| `last_name` | `string \| null` | `"محمد"` |
| `avatar_url` | `string \| null` | `"https://..."` |
| `phone_number` | `string \| null` | `"+966..."` |
| `is_phone_verified` | `boolean` | `true` |
| `preferred_language` | `string` | `"ar"` |
| `timezone` | `string` | `"Asia/Riyadh"` |

### Role

```ts
type Role = {
  code: string           // "admin" | "vendor" | "customer" | "delivery" | "support"
  description: string | null
  permissions: string[]  // ["products:read", "orders:create", ...]
}
```

### Subscription

```ts
type Subscription = {
  plan_id: string
  category: string          // "free" | "seller" | "delivery" | "enterprise"
  name_ar: string           // "خطة مجانية"
  name_en: string | null    // "Free Plan"
  price: number             // 0
  currency: string          // "USD"
  billing_cycle: string     // "monthly" | "yearly" | "lifetime"
  permissions: string[]     // ["products:read", "orders:create", ...]
  features: string[]        // ["عدد محدود من المنتجات", ...]
  status: string            // "active" | "trialing" | "expired"
  starts_at: string | null
  ends_at: string | null
  auto_renew: boolean | null
}
```

---

## 🎯 الدوال (Methods)

### `refresh()`

إعادة جلب بيانات البروفايل من قاعدة البيانات.

```ts
const { refresh } = useAuth()

await refresh()
// → يُحدّث profile تلقائياً
```

### `signOut()`

تسجيل الخروج — يمسح الجلسة والبروفايل.

```ts
const { signOut } = useAuth()

await signOut()
// → session = null, user = null, profile = null
```

### `hasRole(code: string)`

هل يملك دور معين؟

```ts
const { hasRole } = useAuth()

hasRole("admin")     // true
hasRole("vendor")    // false
hasRole("customer")  // true
```

### `hasPermission(permission: string)`

هل يملك صلاحية معينة؟

```ts
const { hasPermission } = useAuth()

hasPermission("products:read")    // true
hasPermission("orders:create")    // true
hasPermission("users:manage")     // false
```

### `hasAnyPermission(permission: string)`

هل يملك صلاحية (يشمل `*:*` التامة)؟

```ts
const { hasAnyPermission } = useAuth()

hasAnyPermission("*:*")            // true (لو كان admin)
hasAnyPermission("products:read")  // true (من أي دور أو خطة)
```

### `hasActivePlan()`

هل لديه خطة/اشتراك نشط؟

```ts
const { hasActivePlan } = useAuth()

hasActivePlan()  // true (active أو trialing + لم تنتهِ)
```

### `getActivePlan()`

إرجاع تفاصيل الخطة النشطة أو `null`.

```ts
const { getActivePlan } = useAuth()

const plan = getActivePlan()
// → { name_ar: "بائع مبتدئ", price: 29.99, billing_cycle: "yearly", ... }
// أو null إذا لم توجد خطة نشطة
```

---

## 💡 أمثلة الاستخدام

### مثال 1: إخفاء عنصر حسب الدور

```tsx
function AdminPanel() {
  const { hasRole } = useAuth()

  if (!hasRole("admin")) return null

  return <div>لوحة تحكم الأدمن</div>
}
```

### مثال 2: زر إنشاء منتج (صلاحية)

```tsx
function CreateProductButton() {
  const { hasPermission } = useAuth()

  if (!hasPermission("products:create")) return null

  return <Button>إنشاء منتج جديد</Button>
}
```

### مثال 3: عرض اسم المستخدم

```tsx
function UserGreeting() {
  const { profile } = useAuth()

  return <p>مرحباً، {profile?.profile.full_name ?? "زائر"}</p>
}
```

### مثال 4: خطة المستخدم

```tsx
function PlanBadge() {
  const { getActivePlan } = useAuth()
  const plan = getActivePlan()

  if (!plan) return <span>بدون خطة</span>

  return (
    <span className="badge">
      {plan.name_ar} — ${plan.price}/{plan.billing_cycle}
    </span>
  )
}
```

### مثال 5: إعادة التحميل بعد تغيير الأدوار

```tsx
function RefreshButton() {
  const { refresh } = useAuth()

  return (
    <button onClick={refresh}>
      تحديث البيانات
    </button>
  )
}
```

---

## 🔄 دورة الحياة

```
┌──────────────────────────────────────────────┐
│              AuthProvider mounts             │
└──────────────────┬───────────────────────────┘
                   │
                   ▼
┌──────────────────────────────────────────────┐
│  supabase.auth.getSession()                  │
│  → هل توجد جلسة؟                             │
└──────────────────┬───────────────────────────┘
                   │
         ┌─────────┴─────────┐
         │                   │
         ▼                   ▼
    توجد جلسة          لا توجد جلسة
         │                   │
         ▼                   ▼
┌──────────────────┐  ┌──────────────────────┐
│ setUser(session) │  │ setUser(null)        │
│ setSession(sess) │  │ setProfile(null)     │
│ refresh()        │  │ setIsLoading(false)  │
└────────┬─────────┘  └──────────────────────┘
         │
         ▼
┌──────────────────────────────────────────────┐
│  supabase.rpc('get_user_full_profile')       │
│  → جلب البروفايل + الأدوار + الاشتراكات     │
└──────────────────┬───────────────────────────┘
                   │
                   ▼
┌──────────────────────────────────────────────┐
│  setProfile(normalizedData)                  │
│  setIsLoading(false)                         │
└──────────────────┬───────────────────────────┘
                   │
                   ▼
┌──────────────────────────────────────────────┐
│  onAuthStateChange listener active           │
│  → يُعيد التحميل تلقائياً عند:              │
│    • تسجيل دخول جديد                        │
│    • تسجيل خروج                             │
│    • انتهاء الجلسة                          │
│    • تحديث التوكن                           │
└──────────────────────────────────────────────┘
```

---

## ⚠️ ملاحظات مهمة

1. **يجب وضع `AuthProvider` أعلى شجرة المكونات** — عادة في `RootLayout`
2. **`useAuth()` يُطلق خطأ** إذا لم يُستخدم داخل `AuthProvider`
3. **البيانات تُجلب من `get_user_full_profile()`** — يجب أن تكون هذه الدالة موجودة في Supabase
4. **`isLoading` يكون `true` حتى اكتمال أول جلب** — استخدمه لعرض spinner
5. **`profile` يمكن أن يكون `null`** حتى لو كان `isAuthenticated = true` (في حالة فشل جلب البروفايل)

---

## 📁 الملفات ذات الصلة

| الملف | الوصف |
|-------|-------|
| `supabase/005_Trigger Functions/001_get_user_profile.sql` | الدالة `get_user_full_profile()` |
| `supabase/005_Trigger Functions/000_trigger_functions.sql` | `sync_profile_data()` — تنشئ البروفايل تلقائياً |
| `components/debug/auth-debug.tsx` | مكون عرض حالة المصادقة للتطوير |
