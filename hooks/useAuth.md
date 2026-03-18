# AuthProvider - مزود المصادقة

## نظرة عامة

`AuthProvider` هو Context Provider يدير حالة المصادقة (Authentication) في التطبيق باستخدام **Supabase**. يوفر بيانات المستخدم والملف الشخصي لجميع مكونات التطبيق.

---

## 📍 الموقع

```
hooks/useAuth.tsx
```

---

## 🔧 التثبيت والاستخدام

### 1. التكوين في Root Layout

يتم تثبيت المزود مرة واحدة في `app/[locale]/layout.tsx`:

```typescript
import { AuthProvider } from "@/hooks/useAuth"

export default async function RootLayout({ children, params }) {
  const { locale } = await params
  const messages = await getMessages()

  return (
    <html lang={locale} dir={locale === "ar" ? "rtl" : "ltr"}>
      <body>
        <NextIntlClientProvider messages={messages}>
          <ThemeProvider>
            <AuthProvider>{children}</AuthProvider>
            <Toaster position="top-center" richColors />
          </ThemeProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  )
}
```

### 2. الاستخدام في المكونات

```typescript
'use client'

import { useAuth } from "@/hooks/useAuth"

export default function MyComponent() {
  const { 
    user, 
    session, 
    profile, 
    status, 
    isLoading, 
    isAuthenticated,
    signOut,
    refreshProfile 
  } = useAuth()

  // عرض حالة التحميل
  if (status === 'loading') {
    return <Spinner />
  }

  // عرض محتوى للمستخدمين المسجلين
  if (isAuthenticated) {
    return (
      <div>
        <p>مرحباً، {user?.email}</p>
        <Button onClick={signOut}>تسجيل الخروج</Button>
      </div>
    )
  }

  // عرض محتوى للزوار
  return <SignInButton />
}
```

---

## 📦 API Reference

### AuthContextType

| الخاصية | النوع | الوصف |
|---------|-------|-------|
| `user` | `User \| null` | بيانات مستخدم Supabase الحالي |
| `session` | `Session \| null` | جلسة المصادقة الحالية |
| `profile` | `Profile \| null` | الملف الشخصي من جدول `profiles` |
| `status` | `AuthStatus` | حالة المصادقة: `'loading' \| 'authenticated' \| 'unauthenticated'` |
| `isLoading` | `boolean` | هل لا يزال التحميل جارياً (مكافئ لـ `status === 'loading'`) |
| `isAuthenticated` | `boolean` | هل المستخدم مسجل دخول (مكافئ لـ `status === 'authenticated'`) |
| `signOut` | `() => Promise<void>` | دالة تسجيل الخروج |
| `refreshProfile` | `() => Promise<void>` | دالة تحديث بيانات الملف الشخصي |

### AuthStatus

```typescript
type AuthStatus = 'loading' | 'authenticated' | 'unauthenticated'
```

| الحالة | الوصف |
|--------|-------|
| `'loading'` | جاري تحميل جلسة المصادقة الأولية |
| `'authenticated'` | المستخدم مسجل الدخول بنجاح |
| `'unauthenticated'` | المستخدم غير مسجل الدخول |

---

## ⚙️ المميزات

### 1. إدارة تلقائية للجلسة
- جلب تلقائي للجلسة عند تحميل التطبيق
- الاستماع للتغييرات في حالة المصادقة
- تحديث تلقائي عند تسجيل الدخول/الخروج

### 2. Retry Logic للملف الشخصي
```typescript
const PROFILE_FETCH_RETRIES = 3        // عدد المحاولات
const PROFILE_FETCH_RETRY_DELAY = 1000 // التأخير بالميلي ثانية
```

### 3. منع التكرار
يستخدم `Ref` لمنع جلب الملف الشخصي أكثر من مرة في نفس الوقت.

### 4. معالجة الأخطاء
- `try-catch` لجميع العمليات
- فشل آمن (Graceful Degradation)
- سجل أخطاء للتطوير

---

## 📊 دورة الحياة (Lifecycle)

```
┌─────────────────────────────────────────────────────────┐
│  1. Component Mount                                      │
│     └─► getSession() ← جلب الجلسة الأولية               │
│     └─► fetchProfileWithRetry() ← جلب الملف الشخصي     │
│     └─► setStatus('authenticated' \| 'unauthenticated') │
├─────────────────────────────────────────────────────────┤
│  2. Auth State Change                                    │
│     └─► onAuthStateChange() ← الاستماع للتغييرات       │
│     └─► updateAuthState() ← تحديث الحالة               │
├─────────────────────────────────────────────────────────┤
│  3. Component Unmount                                    │
│     └─► subscription.unsubscribe() ← تنظيف              │
└─────────────────────────────────────────────────────────┘
```

---

## 🎯 أمثلة عملية

### مثال 1: حماية مسار (Protected Route)

```typescript
'use client'

import { useAuth } from "@/hooks/useAuth"
import { useRouter } from "next/navigation"
import { useEffect } from "react"

export default function ProtectedPage() {
  const { isAuthenticated, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/sign-in')
    }
  }, [isAuthenticated, isLoading, router])

  if (isLoading) return <Spinner />
  if (!isAuthenticated) return null

  return <Dashboard />
}
```

### مثال 2: عرض معلومات المستخدم

```typescript
'use client'

import { useAuth } from "@/hooks/useAuth"

export default function UserProfile() {
  const { user, profile, refreshProfile } = useAuth()

  return (
    <Card>
      <CardHeader>
        <CardTitle>{profile?.full_name || user?.email}</CardTitle>
      </CardHeader>
      <CardContent>
        <p>{profile?.phone}</p>
        <p>{profile?.bio}</p>
        <Button onClick={refreshProfile} variant="outline">
          تحديث البيانات
        </Button>
      </CardContent>
    </Card>
  )
}
```

### مثال 3: زر تسجيل الخروج

```typescript
'use client'

import { useAuth } from "@/hooks/useAuth"
import { Button } from "@/components/ui/button"
import { LogOut } from "lucide-react"

export default function SignOutButton() {
  const { signOut } = useAuth()

  return (
    <Button 
      variant="ghost" 
      onClick={signOut}
      className="flex items-center gap-2"
    >
      <LogOut className="h-4 w-4" />
      تسجيل الخروج
    </Button>
  )
}
```

---

## 🔐 الأمان

### PKCE Flow
```typescript
auth: {
  flowType: 'pkce',           // Proof Key for Code Exchange
  autoRefreshToken: true,     // تحديث تلقائي للرمز
  persistSession: true,       // حفظ الجلسة
  detectSessionInUrl: true,   // كشف الجلسة في الرابط
}
```

### أفضل الممارسات
- ✅ لا تخزن البيانات الحساسة في Context
- ✅ استخدم `signOut` لتنظيف جميع البيانات
- ✅ تحقق من `isAuthenticated` قبل عرض المحتوى المحمي

---

## ⚡ الأداء

### التحسينات المطبقة

| التحسين | الوصف |
|---------|-------|
| **Retry Logic** | 3 محاولات مع تأخير متزايد (1s, 2s, 3s) |
| **Request Deduplication** | منع التكرار بـ `isProfileFetchingRef` |
| **Lazy Loading** | جلب البيانات فقط عند الحاجة |
| **Cleanup** | إلغاء الاشتراك عند Unmount |

---

## 🐛 معالجة الأخطاء

### الأخطاء الشائعة

#### 1. "useAuth must be used within an AuthProvider"
```typescript
// ❌ خطأ: استخدام خارج AuthProvider
function MyComponent() {
  const auth = useAuth() // Error!
}

// ✅ صحيح: تأكد من التغليف
<AuthProvider>
  <MyComponent />
</AuthProvider>
```

#### 2. حالة التحميل اللانهائية
```typescript
// تأكد من معالجة جميع الحالات
if (status === 'loading') return <Spinner />
if (status === 'unauthenticated') return <SignIn />
if (status === 'authenticated') return <Dashboard />
```

---

## 📝 ملاحظات التطوير

### 1. استخدام `void` مع الدوال غير المتوقعة
```typescript
void initializeAuth() // توضيح أن الدالة لا تُنتظر
```

### 2. Ref لمنع Race Conditions
```typescript
const isProfileFetchingRef = useRef(false)
// يمنع جلب الملف الشخصي مرتين في نفس الوقت
```

### 3. تحديث الحالة بشكل آمن
```typescript
setStatus(prev => prev === 'loading' ? 'unauthenticated' : prev)
// حماية من الانتقال المباشر من loading
```

---

## 🔄 التحديثات المستقبلية المقترحة

- [ ] إضافة React Query لإدارة البيانات
- [ ] إضافة Offline Support
- [ ] تحسين معالجة الأخطاء مع Reporting
- [ ] إضافة Loading States أكثر تفصيلاً
- [ ] دعم Multiple Auth Providers

---

## 📚 الملفات ذات الصلة

| الملف | الوصف |
|-------|-------|
| [`lib/supabase/createBrowserClient.ts`](../lib/supabase/createBrowserClient.ts) | إنشاء عميل Supabase للمتصفح |
| [`lib/types/profile.ts`](../lib/types/profile.ts) | تعريف نوع Profile |
| [`app/[locale]/layout.tsx`](../app/[locale]/layout.tsx) | تثبيت AuthProvider |

---

## 📞 الدعم

للاستفسارات أو الإبلاغ عن مشاكل، راجع:
- [Supabase Documentation](https://supabase.com/docs)
- [Next.js Authentication](https://nextjs.org/docs/authentication)

---

**آخر تحديث:** 2026-03-17  
**الإصدار:** 2.0 (مع Retry Logic و AuthStatus)
