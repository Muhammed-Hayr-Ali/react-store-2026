# نظام إعادة تعيين كلمة المرور (Password Reset System)

## 📋 نظرة عامة

نظام متكامل وآمن لإعادة تعيين كلمة المرور في منصة Marketna للتجارة الإلكترونية.

**الملف الرئيسي:** `supabase/sql/password_reset_system.sql`

---

## 📁 المحتويات

1. [الميزات](#1-الميزات)
2. [بنية الجدول](#2-بنية-الجدول)
3. [الدوال](#3-الدوال)
4. [سياسات الأمان](#4-سياسات-الأمان)
5. [التكامل مع Next.js](#5-التكامل-مع-nextjs)
6. [Cron Job](#6-cron-job)
7. [استكشاف الأخطاء](#7-استكشاف-الأخطاء)

---

## 1. الميزات

| الميزة | الوصف |
|--------|-------|
| 🔐 **أمان عالي** | رموز عشوائية 64 حرف (256-bit) |
| ⏱️ **صلاحية محدودة** | 60 دقيقة افتراضياً |
| 🔄 **استخدام واحد** | الرمز يُستخدم مرة واحدة فقط |
| 🗑️ **تنظيف تلقائي** | حذف الرموز القديمة عبر Cron |
| 📍 **تتبع IP** | تدقيق أمني كامل |
| 🚫 **منع التراكم** | حذف الرموز القديمة عند إنشاء جديد |

---

## 2. بنية الجدول

### `password_reset_tokens`

| العمود | النوع | الوصف |
|--------|-------|-------|
| `id` | UUID | المعرف الفريد |
| `user_id` | UUID | معرف المستخدم (FK → auth.users) |
| `email` | TEXT | البريد الإلكتروني |
| `token` | TEXT | الرمز السري (64 حرف) |
| `expires_at` | TIMESTAMPTZ | انتهاء الصلاحية |
| `used_at` | TIMESTAMPTZ | وقت الاستخدام (NULL = لم يُستخدم) |
| `ip_address` | INET | عنوان IP للتدقيق |
| `created_at` | TIMESTAMPTZ | تاريخ الإنشاء |

### القيود

```sql
CONSTRAINT token_format_check CHECK (token ~ '^[A-Za-z0-9]{64}$')
```

يضمن أن الرمز يتكون من 64 حرف أبجدي رقمي فقط.

---

## 3. الدوال

### 3.1 `create_password_reset_token()`

**الوصف:** إنشاء رمز جديد مع حذف الرموز القديمة

**التوقيع:**
```sql
create_password_reset_token(
  p_user_id UUID,
  p_email TEXT,
  p_expires_in_minutes INTEGER DEFAULT 60,
  p_ip_address INET DEFAULT NULL
) RETURNS TEXT
```

**مثال:**
```sql
SELECT create_password_reset_token(
  'user-uuid',
  'user@example.com',
  60,
  '192.168.1.100'::INET
);
```

---

### 3.2 `claim_password_reset_token()` ⭐

**الوصف:** التحقق الذري واستهلاك الرمز (الأهم للأمان)

**التوقيع:**
```sql
claim_password_reset_token(p_token TEXT)
RETURNS TABLE (
  is_valid BOOLEAN,
  user_id UUID,
  email TEXT,
  message TEXT
)
```

**مثال:**
```sql
SELECT * FROM claim_password_reset_token('token-here');

-- النتيجة الناجحة:
-- is_valid | user_id | email | message
-- TRUE     | uuid    | email | "تم قبول الرمز بنجاح"

-- النتيجة الفاشلة:
-- FALSE    | NULL    | NULL  | "رمز غير صحيح أو منتهي أو مُستخدم مسبقاً"
```

---

### 3.3 `verify_password_reset_token()`

**الوصف:** التحقق من الرمز بدون استهلاكه (للعرض فقط)

**⚠️ تحذير:** لا تستخدم هذه الدالة للأمان!

**التوقيع:**
```sql
verify_password_reset_token(p_token TEXT)
RETURNS TABLE (
  is_valid BOOLEAN,
  user_id UUID,
  email TEXT,
  expires_at TIMESTAMPTZ,
  message TEXT
)
```

**مثال:**
```sql
SELECT * FROM verify_password_reset_token('token-here');

-- النتيجة:
-- is_valid | user_id | email | expires_at | message
-- TRUE     | uuid    | email | 2026-...   | "رمز صالح"
```

---

### 3.4 `cleanup_expired_reset_tokens()`

**الوصف:** تنظيف الرموز القديمة (للـ Cron Job)

**التوقيع:**
```sql
cleanup_expired_reset_tokens() RETURNS INTEGER
```

**مثال:**
```sql
SELECT cleanup_expired_reset_tokens();
-- النتيجة: 42 (عدد الرموز المحذوفة)
```

---

## 4. سياسات الأمان

### RLS Policies

| السياسة | النوع | الوصول |
|---------|-------|--------|
| `password_reset_tokens_no_public_read` | SELECT | ❌ منع كامل (حتى للمصادقين) |
| `password_reset_tokens_service_full_access` | ALL | ✅ Service Role فقط |

### مصفوفة الوصول

| المستخدم | CREATE | READ | UPDATE | DELETE |
|----------|--------|------|--------|--------|
| Anonymous | ❌ | ❌ | ❌ | ❌ |
| Authenticated | ❌ | ❌ | ❌ | ❌ |
| Service Role | ✅ | ✅ | ✅ | ✅ |

---

## 5. التكامل مع Next.js

### 5.1 طلب إعادة التعيين

**الملف:** `lib/actions/authentication/requestPasswordReset.ts`

```typescript
export async function requestPasswordReset(email: string) {
  const supabase = createAdminClient()
  
  // 1. البحث عن المستخدم
  const { data: profile } = await supabase
    .from('profiles')
    .select('id, email')
    .eq('email', email)
    .single()
  
  if (!profile) {
    return { success: true } // لا تكشف عن وجود المستخدم
  }
  
  // 2. الحصول على IP
  const clientIP = await getClientIP()
  
  // 3. إنشاء الرمز
  const { data: token } = await supabase.rpc(
    'create_password_reset_token',
    {
      p_user_id: profile.id,
      p_email: profile.email,
      p_expires_in_minutes: 60,
      p_ip_address: clientIP
    }
  )
  
  // 4. إرسال البريد
  const resetLink = `${appUrl}/reset-password?token=${token}`
  await sendPasswordResetEmail({ email, resetLink })
  
  return { success: true }
}
```

---

### 5.2 إعادة التعيين الفعلية

**الملف:** `lib/actions/authentication/resetPassword.ts`

```typescript
export async function resetPassword(token: string, password: string) {
  const supabase = createAdminClient()
  
  // 1. التحقق الذري من الرمز
  const { data: claimData } = await supabase.rpc(
    'claim_password_reset_token',
    { p_token: token }
  )
  
  if (!claimData?.[0]?.is_valid) {
    return { 
      success: false, 
      error: claimData?.[0]?.message || 'رمز غير صالح' 
    }
  }
  
  // 2. تحديث كلمة المرور
  const { error } = await supabase.auth.admin.updateUserById(
    claimData[0].user_id,
    { password }
  )
  
  if (error) {
    return { success: false, error: 'فشل تحديث كلمة المرور' }
  }
  
  return { success: true }
}
```

---

### 5.3 نموذج إعادة التعيين

**الملف:** `components/auth/reset-password-form.tsx`

```typescript
// التحقق من الرمز عند التحميل (للعرض فقط)
useEffect(() => {
  const verifyToken = async () => {
    const result = await verifyResetToken(token)
    setIsTokenValid(result.isValid)
  }
  verifyToken()
}, [token])

// تقديم النموذج
const onSubmit = async (data) => {
  const result = await resetPassword(token, data.password)
  
  if (result.success) {
    toast.success('تم إعادة تعيين كلمة المرور')
    router.push('/sign-in')
  } else {
    toast.error(result.error)
  }
}
```

---

## 6. Cron Job

### 6.1 الإعدادات

**الملف:** `vercel.json`

```json
{
  "crons": [
    {
      "path": "/api/cron/cleanup-tokens",
      "schedule": "0 2 * * *"
    }
  ]
}
```

**الجدول:** يومياً عند 02:00 UTC (05:00 بتوقيت سوريا)

---

### 6.2 API Route

**الملف:** `app/api/cron/cleanup-tokens/route.ts`

```typescript
export async function GET(request: Request) {
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new NextResponse('Unauthorized', { status: 401 })
  }
  
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
  
  const { data } = await supabase.rpc('cleanup_expired_reset_tokens')
  
  return NextResponse.json({
    success: true,
    deleted_count: data
  })
}
```

---

## 7. استكشاف الأخطاء

### المشكلة: "Invalid Token"

**الأسباب المحتملة:**

1. ❌ الرمز منتهي الصلاحية
2. ❌ الرمز تم استخدامه مسبقاً
3. ❌ الرمز غير موجود في قاعدة البيانات
4. ❌ خطأ في قراءة الرمز من URL

**الحل:**

```sql
-- التحقق من وجود الرمز
SELECT 
  email,
  expires_at,
  used_at,
  CASE
    WHEN used_at IS NOT NULL THEN 'USED'
    WHEN expires_at < NOW() THEN 'EXPIRED'
    ELSE 'ACTIVE'
  END as status
FROM password_reset_tokens
WHERE token = 'YOUR_TOKEN_HERE';
```

---

### المشكلة: "column reference is ambiguous"

**السبب:** تضارب أسماء الأعمدة في الدالة

**الحل:**

```sql
-- ❌ خطأ
SELECT * FROM password_reset_tokens
WHERE expires_at > NOW()

-- ✅ صحيح
SELECT prt.* FROM password_reset_tokens prt
WHERE prt.expires_at > NOW()
```

---

### المشكلة: الرمز لا يعمل بعد التحديث

**الحل:**

1. **تحديث الدوال:**
   ```bash
   # تشغيل ملف SQL
   supabase/sql/password_reset_system.sql
   ```

2. **مسح الرموز القديمة:**
   ```sql
   DELETE FROM password_reset_tokens
   WHERE expires_at < NOW();
   ```

3. **اختبار التدفق:**
   ```sql
   -- إنشاء رمز اختبار
   SELECT create_password_reset_token(
     '00000000-0000-0000-0000-000000000000',
     'test@example.com',
     60
   );
   
   -- التحقق
   SELECT * FROM verify_password_reset_token('TOKEN');
   
   -- الاستهلاك
   SELECT * FROM claim_password_reset_token('TOKEN');
   ```

---

## 📊 مخطط التدفق

```
┌─────────────────────────────────────────────────────────────┐
│              Password Reset Flow                             │
└─────────────────────────────────────────────────────────────┘

1. المستخدم ينقر "نسيت كلمة المرور"
   │
   ▼
2. requestPasswordReset(email)
   │
   ▼
3. create_password_reset_token()
   ├─ حذف الرموز القديمة
   └─ إنشاء رمز جديد (64 حرف)
   │
   ▼
4. إرسال البريد الإلكتروني
   │
   ▼
5. المستخدم ينقر الرابط
   │
   ▼
6. reset-password?token=XXX
   │
   ▼
7. verifyResetToken(token) [للعرض فقط]
   │
   ▼
8. المستخدم يدخل كلمة المرور الجديدة
   │
   ▼
9. resetPassword(token, newPassword)
   │
   ▼
10. claim_password_reset_token(token) [ذري]
    ├─ التحقق من الصلاحية
    ├─ استهلاك الرمز (used_at = NOW())
    └─ إرجاع user_id
    │
    ▼
11. تحديث كلمة المرور في auth.users
    │
    ▼
12. نجاح! إعادة التوجيه إلى /sign-in
```

---

## 🔐 أفضل الممارسات

### 1. استخدم `claim_password_reset_token` للأمان

```typescript
// ✅ صحيح
const { data } = await supabase.rpc('claim_password_reset_token', {
  p_token: token
})

// ❌ خطأ (للعرض فقط)
const { data } = await supabase.rpc('verify_password_reset_token', {
  p_token: token
})
```

---

### 2. احذف الرموز القديمة

```sql
-- تنظيف يدوي
DELETE FROM password_reset_tokens
WHERE expires_at < NOW()
   OR (used_at IS NOT NULL AND used_at < NOW() - INTERVAL '7 days');
```

---

### 3. احتفظ بسجلات IP

```typescript
const clientIP = await getClientIP()

await supabase.rpc('create_password_reset_token', {
  p_ip_address: clientIP
})
```

---

### 4. لا تكشف عن وجود المستخدم

```typescript
if (!profile) {
  // ✅ لا تقل "المستخدم غير موجود"
  return { success: true }
}
```

---

## 📚 الملفات المرتبطة

| الملف | الوصف |
|-------|-------|
| `supabase/sql/password_reset_system.sql` | النظام الكامل |
| `lib/actions/authentication/requestPasswordReset.ts` | طلب الرمز |
| `lib/actions/authentication/resetPassword.ts` | إعادة التعيين |
| `components/auth/reset-password-form.tsx` | النموذج |
| `app/[locale]/(auth)/reset-password/page.tsx` | الصفحة |
| `app/api/cron/cleanup-tokens/route.ts` | Cron Job |

---

**الإصدار:** 2.0  
**آخر تحديث:** 2026  
**المشروع:** Marketna E-Commerce Platform
