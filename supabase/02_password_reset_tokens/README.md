# نظام رموز إعادة تعيين كلمة المرور (Password Reset Tokens)

## 📋 نظرة عامة

نظام آمن ومتكامل لإدارة رموز إعادة تعيين كلمة المرور في منصة Marketna للتجارة الإلكترونية. يوفر النظام حماية شاملة ضد الهجمات مع ضمان تجربة مستخدم سلسة.

**الاعتماديات:** لا يوجد (ملف مستقل)  
**الاعتماديات الاختيارية:** `01_roles_permissions_system.sql` (للدوال المساعدة)

---

## 📁 محتويات الملف

1. [جدول رموز إعادة التعيين](#1-جدول-رموز-إعادة-التعيين)
2. [الفهرسة](#2-الفهرسة)
3. [سياسات الأمان (RLS)](#3-سياسات-الأمان-row-level-security)
4. [الدوال المساعدة](#4-الدوال-المساعدة)
5. [مهمة التنظيف التلقائي](#5-مهمة-التنظيف-التلقائي-cron-job)
6. [أمثلة الاستخدام](#6-أمثلة-الاستخدام)
7. [أفضل الممارسات الأمنية](#7-أفضل-الممارسات-الأمنية)

---

## 1. جدول رموز إعادة التعيين

### `public.password_reset_tokens`

يخزن جميع رموز إعادة تعيين كلمة المرور مع معلومات التدقيق الأمني.

### 1.1 بنية الجدول

| العمود       | النوع       | القيود                  | الوصف                               |
| ------------ | ----------- | ----------------------- | ----------------------------------- |
| `id`         | UUID        | PRIMARY KEY             | المعرف الفريد للرمز                 |
| `user_id`    | UUID        | NOT NULL, FK→auth.users | معرف المستخدم المستهدف              |
| `email`      | TEXT        | NOT NULL                | البريد الإلكتروني للمستخدم          |
| `token`      | TEXT        | UNIQUE, NOT NULL        | الرمز السري (64 حرف)                |
| `expires_at` | TIMESTAMPTZ | NOT NULL                | وقت انتهاء الصلاحية                 |
| `used_at`    | TIMESTAMPTZ |                         | وقت الاستخدام (NULL إذا لم يُستخدم) |
| `ip_address` | INET        |                         | عنوان IP لمقدم الطلب (للتدقيق)      |
| `created_at` | TIMESTAMPTZ | DEFAULT NOW()           | تاريخ الإنشاء                       |

### 1.2 قيود التحقق

```sql
CONSTRAINT token_format_check CHECK (token ~ '^[A-Za-z0-9]{64}$')
```

**الوصف:** يضمن أن الرمز يتكون من 64 حرف أبجدي رقمي فقط (hexadecimal).

### 1.3 العلاقات

| العلاقة             | الوصف                                       |
| ------------------- | ------------------------------------------- |
| `ON DELETE CASCADE` | عند حذف المستخدم، تُحذف جميع رموزه تلقائيًا |

### 1.4 دورة حياة الرمز

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   CREATED   │ ──► │   ACTIVE    │ ──► │    USED     │
│  (created)  │     │ (valid 60m) │     │ (used_at)   │
└─────────────┘     └──────┬──────┘     └──────┬──────┘
                           │                   │
                           ▼                   ▼
                    ┌─────────────┐     ┌─────────────┐
                    │   EXPIRED   │     │  CLEANED    │
                    │ (expires_at)│     │  (deleted)  │
                    └─────────────┘     └─────────────┘
```

---

## 2. الفهرسة

تم إنشاء 5 فهارس لتحسين الأداء:

| الفهرس                                 | العمود            | الغرض                                     |
| -------------------------------------- | ----------------- | ----------------------------------------- |
| `idx_password_reset_tokens_token`      | `token`           | البحث السريع عن الرمز (الاستخدام الأساسي) |
| `idx_password_reset_tokens_user_id`    | `user_id`         | استعلام رموز مستخدم معين                  |
| `idx_password_reset_tokens_email`      | `email`           | البحث بالبريد الإلكتروني                  |
| `idx_password_reset_tokens_expires_at` | `expires_at`      | تنظيف الرموز المنتهية                     |
| `idx_password_reset_tokens_created_at` | `created_at DESC` | الترتيب الزمني                            |

---

## 3. سياسات الأمان (Row Level Security)

### 3.1 تفعيل RLS

```sql
ALTER TABLE public.password_reset_tokens ENABLE ROW LEVEL SECURITY;
```

### 3.2 سياسة منع القراءة العامة

```sql
CREATE POLICY "password_reset_tokens_no_public_read"
  ON public.password_reset_tokens FOR SELECT
  TO authenticated, anon
  USING (false);
```

**الوصف:** يمنع **أي** قراءة من أي مستخدم (حتى المصادقين). الرموز سرية تمامًا.

### 3.3 سياسة الوصول الكامل للخدمة الخلفية

```sql
CREATE POLICY "password_reset_tokens_service_full_access"
  ON public.password_reset_tokens FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);
```

**الوصف:** يسمح فقط للخدمة الخلفية (Service Role Key) بالوصول الكامل. جميع العمليات تتم عبر Server Actions/API.

### 3.4 مصفوفة الوصول

| المستخدم      | CREATE | READ | UPDATE | DELETE |
| ------------- | ------ | ---- | ------ | ------ |
| Anonymous     | ❌     | ❌   | ❌     | ❌     |
| Authenticated | ❌     | ❌   | ❌     | ❌     |
| Service Role  | ✅     | ✅   | ✅     | ✅     |

---

## 4. الدوال المساعدة

### 4.1 `create_password_reset_token()`

**الوصف:** إنشاء رمز إعادة تعيين كلمة مرور جديد مع إبطال الرموز القديمة.

**التوقيع:**

```sql
CREATE FUNCTION create_password_reset_token(
  p_user_id UUID,
  p_email TEXT,
  p_expires_in_minutes INTEGER DEFAULT 60,
  p_ip_address INET DEFAULT NULL
) RETURNS TEXT
```

**المعلمات:**
| المعامل | النوع | الافتراضي | الوصف |
|---------|-------|-----------|-------|
| `p_user_id` | UUID | - | معرف المستخدم |
| `p_email` | TEXT | - | البريد الإلكتروني |
| `p_expires_in_minutes` | INTEGER | 60 | مدة الصلاحية بالدقائق |
| `p_ip_address` | INET | NULL | عنوان IP للتدقيق |

**الإرجاع:** `TEXT` - الرمز المُنشأ (64 حرف)

**العمليات:**

1. توليد رمز عشوائي آمن (32 بايت → 64 حرف hex)
2. حساب وقت الانتهاء
3. **إبطال الرموز النشطة السابقة** للمستخدم (أمان)
4. إدخال الرمز الجديد

**مثال:**

```sql
SELECT create_password_reset_token(
  'user-uuid-here',
  'user@example.com',
  60,
  '192.168.1.100'::INET
);
-- Returns: "a1b2c3d4e5f6..." (64 characters)
```

**في TypeScript:**

```typescript
const { data: token } = await supabase
  .rpc('create_password_reset_token', {
    p_user_id: userId,
    p_email: email,
    p_expires_in_minutes: 60,
    p_ip_address: requestIp
  })
  .single();
```

---

### 4.2 `claim_password_reset_token()`

**الوصف:** التحقق الذري من الرمز واستهلاكه في خطوة واحدة (يمنع الاستخدام المزدوج).

**التوقيع:**

```sql
CREATE FUNCTION claim_password_reset_token(p_token TEXT)
RETURNS TABLE (
  is_valid BOOLEAN,
  user_id UUID,
  email TEXT,
  message TEXT
)
```

**المعلمات:**
| المعامل | النوع | الوصف |
|---------|-------|-------|
| `p_token` | TEXT | الرمز المُدخل من المستخدم |

**الإرجاع:** TABLE

| العمود     | النوع   | الوصف                     |
| ---------- | ------- | ------------------------- |
| `is_valid` | BOOLEAN | TRUE إذا كان الرمز صالحًا |
| `user_id`  | UUID    | معرف المستخدم (إذا صالح)  |
| `email`    | TEXT    | البريد الإلكتروني         |
| `message`  | TEXT    | رسالة الحالة              |

**العمليات الذرية:**

```sql
UPDATE password_reset_tokens
SET used_at = NOW()
WHERE token = p_token
  AND expires_at > NOW()
  AND used_at IS NULL
RETURNING * INTO v_record;
```

**مثال:**

```sql
SELECT * FROM claim_password_reset_token('a1b2c3d4...');

-- النتيجة الناجحة:
-- is_valid | user_id | email | message
-- TRUE     | uuid    | email | "تم قبول الرمز بنجاح"

-- النتيجة الفاشلة:
-- FALSE | NULL | NULL | "رمز غير صحيح أو منتهي أو مُستخدم مسبقاً"
```

**في TypeScript:**

```typescript
const { data } = await supabase
  .rpc('claim_password_reset_token', { p_token: userToken })
  .single();

if (data.is_valid) {
  // ✅ الرمز صالح - اعرض صفحة تغيير كلمة المرور
  // data.user_id متاح لتحديث كلمة المرور
} else {
  // ❌ الرمز غير صالح
  console.error(data.message);
}
```

---

### 4.3 `verify_password_reset_token()`

**الوصف:** فحص صلاحية الرمز **دون** استهلاكه (للعرض فقط).

**التوقيع:**

```sql
CREATE FUNCTION verify_password_reset_token(p_token TEXT)
RETURNS TABLE (
  is_valid BOOLEAN,
  user_id UUID,
  email TEXT,
  expires_at TIMESTAMPTZ,
  message TEXT
)
```

**⚠️ تحذير:** لا تستخدم هذه الدالة كخطوة وحيدة للأمان. يجب استخدام `claim_password_reset_token()` قبل تغيير كلمة المرور.

**مثال:**

```sql
SELECT * FROM verify_password_reset_token('a1b2c3d4...');

-- النتيجة:
-- is_valid | user_id | email | expires_at | message
-- TRUE     | uuid    | email | 2026-...   | "رمز صالح"
```

**في TypeScript:**

```typescript
// للعرض فقط - إظهار وقت الانتهاء
const { data } = await supabase
  .rpc('verify_password_reset_token', { p_token: userToken })
  .single();

if (data.is_valid) {
  const expiresAt = new Date(data.expires_at);
  const minutesLeft = Math.floor((expiresAt.getTime() - Date.now()) / 60000);
  console.log(`الرمز صالح لمدة ${minutesLeft} دقيقة`);
}
```

---

### 4.4 `cleanup_expired_reset_tokens()`

**الوصف:** حذف الرموز القديمة والمستخدمة (للتنظيف الدوري).

**التوقيع:**

```sql
CREATE FUNCTION cleanup_expired_reset_tokens() RETURNS INTEGER
```

**الإرجاع:** `INTEGER` - عدد الرموز المحذوفة

**معايير الحذف:**

1. رموز منتهية منذ أكثر من **30 يوم**
2. رموز مُستخدمة منذ أكثر من **7 أيام**

**مثال:**

```sql
SELECT cleanup_expired_reset_tokens();
-- Returns: 42 (عدد الرموز المحذوفة)
```

**في TypeScript:**

```typescript
const { data: deletedCount } = await supabase
  .rpc('cleanup_expired_reset_tokens')
  .single();

console.log(`Deleted ${deletedCount} expired tokens`);
```

---

## 5. مهمة التنظيف التلقائي (Cron Job)

### 5.1 إعداد Vercel Cron

**الملف:** `vercel.json`

```json
{
  "crons": [
    {
      "path": "/api/cron/cleanup-tokens",
      "schedule": "0 0 * * *"
    }
  ]
}
```

**الجدول:** يوميًا عند الساعة 00:00 (منتصف الليل)

| الحقل        | القيمة | الوصف            |
| ------------ | ------ | ---------------- |
| Minute       | 0      | عند الدقيقة 0    |
| Hour         | 0      | عند الساعة 00:00 |
| Day of Month | \*     | كل يوم           |
| Month        | \*     | كل شهر           |
| Day of Week  | \*     | كل يوم أسبوع     |

---

### 5.2 API Route للتنظيف

**الملف:** `cleanup-tokens.ts`

```typescript
import { createClient } from "@supabase/supabase-js"
import { NextResponse } from "next/server"

export async function GET(request: Request) {
  // 1. التحقق من أن الطلب قادم من المصدر الموثوق
  const authHeader = request.headers.get("authorization")
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new NextResponse("Unauthorized", { status: 401 })
  }

  // 2. الاتصال بـ Supabase باستخدام Service Role
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  try {
    // 3. استدعاء دالة التنظيف
    const { data, error } = await supabase.rpc("cleanup_expired_reset_tokens")

    if (error) throw error

    return NextResponse.json({
      success: true,
      message: "Cleanup completed",
      deleted_count: data,
    })
  } catch (error) {
    console.error("Cleanup failed:", error)
    return NextResponse.json(
      { success: false, error: "Cleanup failed" },
      { status: 500 }
    )
  }
}
```

**الميزات الأمنية:**

1. ✅ التحقق من `Authorization` header
2. ✅ استخدام `SUPABASE_SERVICE_ROLE_KEY` (يتجاوز RLS)
3. ✅ معالجة الأخطاء

**المتغيرات البيئية المطلوبة:**

```env
CRON_SECRET=your-secret-key-here
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...
```

---

## 6. أمثلة الاستخدام

### 6.1 التطبيق الفعلي (Server Actions)

#### `lib/actions/authentication/requestPasswordReset.ts`

```typescript
"use server"

import { createAdminClient } from "@/lib/supabase/createAdminClient"

/**
 * الحصول على عنوان IP من الطلب (للتدقيق الأمني)
 */
async function getClientIP(): Promise<string | null> {
  const { headers } = await import("next/headers")
  const headersList = await headers()

  const forwardedFor = headersList.get("x-forwarded-for")
  if (forwardedFor) {
    return forwardedFor.split(",")[0].trim()
  }

  const realIp = headersList.get("x-real-ip")
  if (realIp) {
    return realIp.trim()
  }

  return null
}

export async function requestPasswordReset(
  email: string
): Promise<{ success: boolean }> {
  const supabase = createAdminClient()

  // 1. البحث عن المستخدم
  const { data: profile } = await supabase
    .from("profiles")
    .select("id, email")
    .eq("email", email)
    .single()

  if (!profile) {
    // لا نكشف عن وجود المستخدم
    return { success: true }
  }

  // 2. الحصول على IP للتدقيق
  const clientIP = await getClientIP()

  // 3. إنشاء رمز جديد (الدالة تبطل الرموز القديمة تلقائياً)
  const { data: token } = await supabase.rpc(
    "create_password_reset_token",
    {
      p_user_id: profile.id,
      p_email: profile.email,
      p_expires_in_minutes: 60,
      p_ip_address: clientIP || null,
    }
  )

  // 4. إرسال البريد الإلكتروني
  await sendPasswordResetEmail({
    email: profile.email,
    resetLink: `${process.env.NEXT_PUBLIC_APP_URL}/reset-password?token=${token}`,
    expiresInMinutes: 60,
  })

  return { success: true }
}
```

#### `lib/actions/authentication/resetPassword.ts`

```typescript
"use server"

import { createAdminClient } from "@/lib/supabase/createAdminClient"

export async function resetPassword(
  token: string,
  password: string
): Promise<{ success: boolean; error?: string }> {
  const supabase = createAdminClient()

  // 1. التحقق الذري من الرمز واستهلاكه (Atomic Claim)
  const { data: claimData } = await supabase.rpc(
    "claim_password_reset_token",
    { p_token: token }
  )

  if (!claimData?.[0]?.is_valid) {
    return {
      success: false,
      error: claimData?.[0]?.message || "رمز غير صالح",
    }
  }

  const { user_id } = claimData[0]

  // 2. تحديث كلمة المرور
  const { error } = await supabase.auth.admin.updateUserById(
    user_id,
    { password }
  )

  if (error) {
    return { success: false, error: "فشل تحديث كلمة المرور" }
  }

  // ✅ الرمز تم استهلاكه تلقائياً
  return { success: true }
}

// للعرض فقط - ليس للأمان
export async function verifyResetToken(token: string) {
  const supabase = createAdminClient()

  const { data } = await supabase.rpc("verify_password_reset_token", {
    p_token: token,
  })

  if (!data?.[0]?.is_valid) {
    return { isValid: false }
  }

  return {
    isValid: true,
    email: data[0].email,
    expiresAt: data[0].expires_at,
  }
}
```

---

### 6.2 مقارنة بين دوال التحقق

| الدالة                          | الغرض              | استهلاك الرمز | الاستخدام الموصى به                    |
| ------------------------------- | ------------------ | ------------- | -------------------------------------- |
| `claim_password_reset_token()`  | تحقق ذري + استهلاك | ✅ نعم        | **الاستخدام الأساسي في resetPassword** |
| `verify_password_reset_token()` | تحقق فقط (للعرض)   | ❌ لا         | للعرض فقط (إظهار وقت الانتهاء)         |
| `create_password_reset_token()` | إنشاء رمز جديد     | -             | في requestPasswordReset                |

**⚠️ تحذير أمني:**

```typescript
// ❌ خطأ - التحقق ثم الاستخدام منفصل (Race Condition)
const { data: verify } = await supabase
  .rpc('verify_password_reset_token', { p_token: token })

if (verify.is_valid) {
  // قد يستخدم الرمز مرتين بين التحقق والاستخدام!
  await changePassword()
}

// ✅ صحيح - تحقق ذري في خطوة واحدة
const { data: claim } = await supabase
  .rpc('claim_password_reset_token', { p_token: token })

if (claim.is_valid) {
  // الرمز تم استهلاكه بالفعل - آمن 100%
  await changePassword()
}
```

---

### 6.3 صفحة إدخال الرمز (React)

```tsx
// app/reset-password/verify/page.tsx
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { verifyResetToken } from '@/actions/reset-password'

export default function VerifyTokenPage({
  searchParams
}: {
  searchParams: { token?: string }
}) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const formData = new FormData(e.target as HTMLFormElement)
      const token = formData.get('token') as string

      const result = await verifyResetToken(token)

      // الانتقال لصفحة تغيير كلمة المرور
      router.push(`/reset-password/new?userId=${result.userId}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'حدث خطأ')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <h1>إدخال رمز إعادة التعيين</h1>

      {error && <div className="error">{error}</div>}

      <input
        name="token"
        placeholder="أدخل الرمز من بريدك الإلكتروني"
        required
        disabled={loading}
      />

      <button type="submit" disabled={loading}>
        {loading ? 'جاري التحقق...' : 'تحقق من الرمز'}
      </button>
    </form>
  )
}
```

---

### 6.4 إرسال بريد إعادة التعيين

```typescript
// lib/email.ts
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY!)

export async function sendResetEmail(email: string, token: string) {
  const resetLink = `${process.env.NEXT_PUBLIC_APP_URL}/reset-password/verify?token=${token}`

  await resend.emails.send({
    from: 'Marketna <noreply@marketna.com>',
    to: email,
    subject: 'إعادة تعيين كلمة المرور',
    html: `
      <div dir="rtl">
        <h1>إعادة تعيين كلمة المرور</h1>
        <p>لقد تلقينا طلبًا لإعادة تعيين كلمة المرور لحسابك.</p>

        <p><strong>رمز إعادة التعيين:</strong></p>
        <code style="font-size: 18px; padding: 10px; background: #f0f0f0;">
          ${token}
        </code>

        <p>أو انقر على الرابط:</p>
        <a href="${resetLink}">${resetLink}</a>

        <p><strong>هذا الرمز صالح لمدة 60 دقيقة.</strong></p>

        <p>إذا لم تطلب إعادة التعيين، يرجى تجاهل هذا البريد.</p>

        <hr />
        <p>فريق Marketna</p>
      </div>
    `,
  })
}
```

---

### 6.4 Server Action كامل

```typescript
// actions/reset-password.ts
'use server'

import { createClient } from '@/utils/supabase/server'
import { headers } from 'next/headers'
import { sendResetEmail } from '@/lib/email'

export async function requestPasswordReset(email: string) {
  const supabase = createBrowserClient()

  // البحث عن المستخدم
  const { data: authData } = await supabase.auth.admin.getUserByEmail(email)
  if (!authData.user) {
    // لا تكشف عن وجود المستخدم (أمان)
    return { success: true, message: 'إذا كان الحساب موجودًا، سيتم إرسال الرمز' }
  }

  // الحصول على IP
  const headersList = await headers()
  const ip = headersList.get('x-forwarded-for')?.split(',')[0] || '0.0.0.0'

  // إنشاء الرمز
  const { data: token, error } = await supabase.rpc('create_password_reset_token', {
    p_user_id: authData.user.id,
    p_email: email,
    p_expires_in_minutes: 60,
    p_ip_address: ip
  }).single()

  if (error) {
    console.error('Token creation failed:', error)
    throw new Error('فشل إنشاء الرمز')
  }

  // إرسال البريد
  await sendResetEmail(email, token)

  return { success: true, message: 'إذا كان الحساب موجودًا، سيتم إرسال الرمز' }
}

export async function verifyAndClaimToken(token: string) {
  const supabase = createBrowserClient()

  const { data, error } = await supabase
    .rpc('claim_password_reset_token', { p_token: token })
    .single()

  if (error || !data.is_valid) {
    throw new Error(data?.message || 'رمز غير صالح')
  }

  return {
    success: true,
    userId: data.user_id,
    email: data.email
  }
}

export async function completePasswordReset(
  token: string,
  userId: string,
  newPassword: string
) {
  const supabase = createBrowserClient()

  // التحقق النهائي
  const { data: claimData } = await supabase
    .rpc('claim_password_reset_token', { p_token: token })
    .single()

  if (!claimData?.is_valid || claimData.user_id !== userId) {
    throw new Error('رمز غير صالح أو مستخدم مسبقًا')
  }

  // تحديث كلمة المرور
  const { error } = await supabase.auth.admin.updateUserById(
    userId,
    { password: newPassword }
  )

  if (error) throw error

  return { success: true }
}
```

---

### 6.5 Server Action كامل (مثال إضافي)

```typescript
// actions/reset-password.ts
'use server'

import { createClient } from '@/utils/supabase/server'
import { headers } from 'next/headers'
import { sendResetEmail } from '@/lib/email'

export async function requestPasswordReset(email: string) {
  const supabase = createBrowserClient()

  const { data: authData } = await supabase.auth.admin.getUserByEmail(email)
  if (!authData.user) {
    // لا تكشف عن وجود المستخدم (أمان)
    return { success: true, message: 'إذا كان الحساب موجودًا، سيتم إرسال الرمز' }
  }

  // الحصول على IP
  const headersList = await headers()
  const ip = headersList.get('x-forwarded-for')?.split(',')[0] || '0.0.0.0'

  // إنشاء الرمز
  const { data: token, error } = await supabase.rpc('create_password_reset_token', {
    p_user_id: authData.user.id,
    p_email: email,
    p_expires_in_minutes: 60,
    p_ip_address: ip
  }).single()

  if (error) {
    console.error('Token creation failed:', error)
    throw new Error('فشل إنشاء الرمز')
  }

  // إرسال البريد
  await sendResetEmail(email, token)

  return { success: true, message: 'إذا كان الحساب موجودًا، سيتم إرسال الرمز' }
}

export async function verifyAndClaimToken(token: string) {
  const supabase = createBrowserClient()

  const { data, error } = await supabase
    .rpc('claim_password_reset_token', { p_token: token })
    .single()

  if (error || !data.is_valid) {
    throw new Error(data?.message || 'رمز غير صالح')
  }

  return {
    success: true,
    userId: data.user_id,
    email: data.email
  }
}

export async function completePasswordReset(
  token: string,
  userId: string,
  newPassword: string
) {
  const supabase = createBrowserClient()

  // التحقق النهائي
  const { data: claimData } = await supabase
    .rpc('claim_password_reset_token', { p_token: token })
    .single()

  if (!claimData?.is_valid || claimData.user_id !== userId) {
    throw new Error('رمز غير صالح أو مستخدم مسبقًا')
  }

  // تحديث كلمة المرور
  const { error } = await supabase.auth.admin.updateUserById(
    userId,
    { password: newPassword }
  )

  if (error) throw error

  return { success: true }
}
```

---

## 7. أفضل الممارسات الأمنية

### 7.1 منع الاستخدام المزدوج (Double-Spend)

راجع القسم [6.2 مقارنة بين دوال التحقق](#62-مقارنة-بين-دوال-التحقق) للتفاصيل الكاملة.

**الخلاصة:**

```typescript
// ✅ صحيح - استخدام claim (ذري)
const { data } = await supabase
  .rpc('claim_password_reset_token', { p_token: token })
  .single()

if (data.is_valid) {
  // الرمز تم استهلاكه بالفعل - آمن 100%
  await changePassword()
}
```

---

### 7.2 إبطال الرموز القديمة

عند إنشاء رمز جديد، تُبطل الدالة الرموز النشطة السابقة تلقائيًا:

```sql
UPDATE password_reset_tokens
SET expires_at = NOW() - INTERVAL '1 second'
WHERE user_id = p_user_id
  AND used_at IS NULL
  AND expires_at > NOW();
```

**الفائدة:** يمنع تراكم الرموز ويقلل من سطح الهجوم.

---

### 7.3 حماية RLS

```sql
-- ✅ صحيح - منع أي قراءة عامة
USING (false)

-- ❌ خطأ - السماح بالقراءة
USING (true) -- كارثة أمنية!
```

---

### 7.4 تسجيل IP للتدقيق

```typescript
// الحصول على IP الحقيقي خلف Proxy
const ip = request.headers.get('x-forwarded-for')?.split(',')[0] || '0.0.0.0'

// تخزينه مع الرمز
await supabase.rpc('create_password_reset_token', {
  p_user_id: userId,
  p_email: email,
  p_ip_address: ip
})
```

**الاستخدام:**

- تحليل أنماط الطلبات المشبوهة
- تتبع محاولات الاختراق
- منع الهجمات المتكررة (Rate Limiting)

**مثال على التحليل:**

```typescript
// التحقق من عدد الطلبات من نفس IP
const { data: recentRequests } = await supabase
  .from('password_reset_tokens')
  .select('id, created_at')
  .eq('ip_address', clientIP)
  .gt('created_at', new Date(Date.now() - 60 * 60 * 1000).toISOString()) // آخر ساعة

if (recentRequests && recentRequests.length > 10) {
  throw new Error('محاولات كثيرة، يرجى المحاولة لاحقاً')
}
```

---

## 📊 مخطط التدفق

```
┌──────────────────────────────────────────────────────────────────┐
│                    Password Reset Flow                           │
└──────────────────────────────────────────────────────────────────┘

1. طلب إعادة التعيين
   ┌─────────┐     ┌─────────────┐     ┌─────────────┐
   │ User    │ ──► │ Enter Email │ ──► │ Server      │
   │         │     │             │     │ Action      │
   └─────────┘     └─────────────┘     └──────┬──────┘
                                              │
                    ┌─────────────────────────┼─────────────────────┐
                    │                         ▼                     │
                    │              ┌───────────────────┐            │
                    │              │ create_password_  │            │
                    │              │ reset_token()     │            │
                    │              └─────────┬─────────┘            │
                    │                        │                      │
                    │                        ▼                      │
                    │              ┌───────────────────┐            │
                    │              │ INSERT token      │            │
                    │              │ (60 min expiry)   │            │
                    │              └─────────┬─────────┘            │
                    │                        │                      │
                    │                        ▼                      │
                    │              ┌───────────────────┐            │
                    │              │ Send Email        │            │
                    │              │ (with token)      │            │
                    │              └───────────────────┘            │
                    └───────────────────────────────────────────────┘

2. إدخال الرمز
   ┌─────────┐     ┌─────────────┐     ┌─────────────┐
   │ User    │ ──► │ Enter Token │ ──► │ Server      │
   │         │     │             │     │ Action      │
   └─────────┘     └─────────────┘     └──────┬──────┘
                                              │
                    ┌─────────────────────────┼─────────────────────┐
                    │                         ▼                     │
                    │              ┌───────────────────┐            │
                    │              │ claim_password_   │            │
                    │              │ reset_token()     │            │
                    │              └─────────┬─────────┘            │
                    │                        │                      │
                    │                        ▼                      │
                    │              ┌───────────────────┐            │
                    │              │ UPDATE used_at    │            │
                    │              │ (Atomic)          │            │
                    │              └─────────┬─────────┘            │
                    │                        │                      │
                    │              ┌─────────┴─────────┐            │
                    │              │                   │            │
                    │              ▼                   ▼            │
                    │         ┌─────────┐       ┌─────────┐        │
                    │         │ Valid   │       │ Invalid │        │
                    │         │ ✓       │       │ ✗       │        │
                    │         └────┬────┘       └────┬────┘        │
                    │              │                 │              │
                    │              ▼                 ▼              │
                    │         ┌─────────┐       ┌─────────┐        │
                    │         │ Show    │       │ Show    │        │
                    │         │ Reset   │       │ Error   │        │
                    │         │ Form    │       │         │        │
                    │         └─────────┘       └─────────┘        │
                    └───────────────────────────────────────────────┘

3. تغيير كلمة المرور
   ┌─────────┐     ┌─────────────┐     ┌─────────────┐
   │ User    │ ──► │ New Password│ ──► │ Server      │
   │         │     │             │     │ Action      │
   └─────────┘     └─────────────┘     └──────┬──────┘
                                              │
                    ┌─────────────────────────┼─────────────────────┐
                    │                         ▼                     │
                    │              ┌───────────────────┐            │
                    │              │ claim_password_   │            │
                    │              │ reset_token()     │            │
                    │              │ (Final Check)     │            │
                    │              └─────────┬─────────┘            │
                    │                        │                      │
                    │                        ▼                      │
                    │              ┌───────────────────┐            │
                    │              │ Update Auth       │            │
                    │              │ Password          │            │
                    │              └─────────┬─────────┘            │
                    │                        │                      │
                    │                        ▼                      │
                    │              ┌───────────────────┐            │
                    │              │ Success!          │            │
                    │              │ Redirect to Login │            │
                    │              └───────────────────┘            │
                    └───────────────────────────────────────────────┘

4. التنظيف التلقائي (Cron)
   ┌─────────────────┐
   │ Vercel Cron     │
   │ 0 0 * * *       │
   └────────┬────────┘
            │
            ▼
   ┌─────────────────┐
   │ /api/cron/      │
   │ cleanup-tokens  │
   └────────┬────────┘
            │
            ▼
   ┌─────────────────┐
   │ cleanup_expired_│
   │ reset_tokens()  │
   └────────┬────────┘
            │
            ▼
   ┌─────────────────┐
   │ DELETE old      │
   │ tokens          │
   └─────────────────┘
```

---

## ⚠️ ملاحظات هامة

1. **الرموز لمرة واحدة:** كل رمز يُستخدم مرة واحدة فقط (بفضل `claim_password_reset_token`).

2. **مدة الصلاحية:** 60 دقيقة افتراضيًا، قابلة للتخصيص.

3. **التنظيف:** الرموز تُحذف تلقائيًا بعد 30 يوم من الانتهاء أو 7 أيام من الاستخدام.

4. **RLS صارم:** لا وصول من المتصفح، جميع العمليات عبر Service Role.

5. **تدقيق IP:** يتم تخزين عنوان IP لكل طلب للتدقيق الأمني.

6. **إبطال تلقائي:** إنشاء رمز جديد يُبطل الرموز النشطة السابقة.

---

## 🔄 ملخص التحديثات الأخيرة

### التحديثات المطبقة على الكود (2026)

| الملف                     | التحديث                                 | السبب                                                  |
| ------------------------- | --------------------------------------- | ------------------------------------------------------ |
| `requestPasswordReset.ts` | ✅ إضافة `getClientIP()`                | تخزين IP للتدقيق الأمني                                |
| `requestPasswordReset.ts` | ✅ إزالة التحقق من الرموز القديمة       | الدالة `create_password_reset_token` تفعل ذلك تلقائياً |
| `resetPassword.ts`        | ✅ استخدام `claim_password_reset_token` | تحقق ذري يمنع الاستخدام المزدوج                        |
| `resetPassword.ts`        | ✅ إزالة `use_password_reset_token`     | دالة غير موجودة في المخطط الجديد                       |
| `README.md`               | ✅ تحديث أمثلة الكود                    | لتعكس التطبيق الفعلي                                   |

---

## 🚀 الترقية والصيانة

### تعديل مدة الصلاحية

```sql
-- تغيير الافتراضي إلى 30 دقيقة
CREATE OR REPLACE FUNCTION public.create_password_reset_token(
  p_user_id UUID,
  p_email TEXT,
  p_expires_in_minutes INTEGER DEFAULT 30,  -- Changed from 60
  p_ip_address INET DEFAULT NULL
) RETURNS TEXT AS $$
  -- ...
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

### إضافة حد أقصى للرموز النشطة

```sql
-- إضافة قيد للحد من الرموز النشطة
ALTER TABLE public.password_reset_tokens
ADD CONSTRAINT max_active_tokens_per_user
CHECK (
  (SELECT COUNT(*) FROM public.password_reset_tokens prt
   WHERE prt.user_id = user_id AND prt.used_at IS NULL AND prt.expires_at > NOW()) <= 5
);
```

---

## 📞 الدعم

لأي استفسارات أو مشاكل تقنية، يرجى التواصل مع فريق التطوير.

---

**الإصدار:** 1.0  
**آخر تحديث:** 2026  
**المشروع:** Marketna E-Commerce Platform  
**الحالة:** مستقل (لا يحتاج اعتماديات)
