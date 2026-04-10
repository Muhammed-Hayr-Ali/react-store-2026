# 🔐 Password Reset System — نظام استعادة كلمة المرور

> نظام آمن وشامل لإعادة تعيين كلمة المرور مع رموز عشوائية (64 حرف) + استهلاك ذري + بريد إلكتروني رسمي.

---

## 📂 الهيكل الكامل

```
supabase/007_Password Reset/
├── 001_functions.sql         ← 4 دوال SQL (إنشاء + استهلاك ذكي + تحقق + تنظيف)
├── 002_rls_policies.sql      ← 3 سياسات RLS
└── README.md                 ← هذا الملف

lib/actions/auth/
└── reset.ts                  ← Server Actions (طلب + استعادة + تحقق)

lib/email/
├── templates/index.ts        ← قالب البريد الرسمي
└── service.ts                ← خدمة الإرسال

components/auth/
├── forgot-password-form.tsx  ← نموذج طلب الاستعادة
└── reset-password-form.tsx   ← نموذج تعيين كلمة مرور جديدة
```

---

## 🗃️ جدول `auth_password_reset`

(معرّف في `001_Schema/001_schema.sql`)

```sql
CREATE TABLE "auth_password_reset" (
  "id"         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "profile_id" uuid NOT NULL REFERENCES core_profile(id) ON DELETE CASCADE,
  "email"      text NOT NULL,
  "token"      text UNIQUE NOT NULL CHECK (length(token) = 64),
  "expires_at" timestamptz NOT NULL,
  "used_at"    timestamptz,
  "is_revoked" boolean DEFAULT false,
  "ip_address" text,
  "created_at" timestamptz DEFAULT now(),
  "updated_at" timestamptz DEFAULT now()
);
```

| العمود       | النوع       | الوصف                                                 |
| ------------ | ----------- | ----------------------------------------------------- |
| `id`         | uuid        | معرف فريد                                             |
| `profile_id` | uuid        | معرف البروفايل (FK → core_profile, ON DELETE CASCADE) |
| `email`      | text        | بريد المستخدم                                         |
| `token`      | text        | رمز عشوائي (64 حرف hex)                               |
| `expires_at` | timestamptz | وقت انتهاء الصلاحية (60 دقيقة)                        |
| `used_at`    | timestamptz | وقت الاستخدام (NULL = لم يُستخدم)                     |
| `is_revoked` | boolean     | هل تم إبطاله؟                                         |
| `ip_address` | text        | عنوان IP للمراجعة الأمنية                             |
| `created_at` | timestamptz | وقت الإنشاء                                           |
| `updated_at` | timestamptz | وقت آخر تحديث                                         |

### الفهارس

| الفهرس                            | العمود       | الغرض                                   |
| --------------------------------- | ------------ | --------------------------------------- |
| `idx_auth_password_reset_profile` | `profile_id` | بحث رموز مستخدم معين                    |
| `idx_auth_password_reset_expires` | `expires_at` | تنظيف الرموز المنتهية                   |
| `idx_auth_password_reset_token`   | `token`      | البحث السريع عن رمز (الاستخدام الرئيسي) |

---

## ⚙️ دوال SQL الأربع (`001_functions.sql`)

### 1️⃣ `create_password_reset_token()` — إنشاء رمز جديد

تنشئ رمز عشوائي (64 حرف) + تُبطل الرموز القديمة لنفس المستخدم.

| المعامل                | النوع   | الافتراضي | الوصف                       |
| ---------------------- | ------- | --------- | --------------------------- |
| `p_profile_id`         | uuid    | —         | معرف البروفايل              |
| `p_email`              | text    | —         | البريد الإلكتروني           |
| `p_expires_in_minutes` | integer | 60        | مدة الصلاحية (5–1440 دقيقة) |
| `p_ip_address`         | text    | NULL      | عنوان IP للمراجعة           |

**الإرجاع:** `text` (رمز 64 حرف hex)

**الخطوات الداخلية:**

1. التحقق من صيغة البريد (regex)
2. التحقق من مدة الصلاحية (5–1440 دقيقة)
3. إنشاء رمز عشوائي: `encode(gen_random_bytes(32), 'hex')`
4. إبطال الرموز القديمة: `UPDATE ... SET is_revoked = true`
5. إدراج الرمز الجديد
6. إرجاع الرمز

```sql
SELECT create_password_reset_token(
  'profile-uuid',
  'user@example.com',
  60,
  '192.168.1.1'
);
-- النتيجة: 'a1b2c3d4e5f6a7b8c9d0...'
```

---

### 2️⃣ `claim_password_reset_token()` — الاستهلاك الذكي 🛡️

التحقق من الرمز + استهلاكه في عملية ذرية واحدة. **تمنع الاستخدام المزدوج.**

| المعامل   | النوع | الوصف                |
| --------- | ----- | -------------------- |
| `p_token` | text  | الرمز النصي (64 حرف) |

**الإرجاع:** جدول

| العمود       | النوع   | الوصف                     |
| ------------ | ------- | ------------------------- |
| `is_valid`   | boolean | هل الرمز صالح؟            |
| `profile_id` | uuid    | معرف البروفايل (إذا صالح) |
| `email`      | text    | البريد (إذا صالح)         |
| `message`    | text    | رسالة توضيحية             |

**الخطوات الداخلية:**

1. التحقق من صيغة الرمز: `p_token ~ '^[A-Za-z0-9]{64}$'`
2. `UPDATE ... SET used_at = NOW() WHERE token = x AND expires_at > NOW() AND used_at IS NULL AND is_revoked = false`
3. إذا لم يتم العثور → `is_valid = false`
4. إذا تم العثور → `is_valid = true` + البيانات

> 🔒 **لماذا ذرية؟** لأن `UPDATE ... RETURNING` يتحقق ويحدث في عملية واحدة — لا يمكن لطلبين استهلاك نفس الرمز في نفس الوقت.

```sql
SELECT * FROM claim_password_reset_token('a1b2c3d4...');
-- is_valid | profile_id | email | message
-- ---------+------------+-------+--------
-- true     | abc-123    | u@... | Token claimed successfully
```

---

### 3️⃣ `verify_password_reset_token()` — التحقق فقط (للعرض)

التحقق من الرمز **بدون** استهلاكه. ⚠️ للعرض فقط — لا تستخدمها للاستعادة.

| المعامل   | النوع | الوصف       |
| --------- | ----- | ----------- |
| `p_token` | text  | الرمز النصي |

**الإرجاع:** جدول (`is_valid`, `profile_id`, `email`, `expires_at`, `message`)

```sql
SELECT * FROM verify_password_reset_token('a1b2c3d4...');
```

---

### 4️⃣ `cleanup_expired_reset_tokens()` — تنظيف الرموز (Cron Job)

حذف الرموز المنتهية والمستهلكة القديمة.

| المعامل        | النوع   | الافتراضي | الوصف                           |
| -------------- | ------- | --------- | ------------------------------- |
| `p_batch_size` | integer | 1000      | عدد الصفوف المحذوفة في كل عملية |

**الإرجاع:** `integer` (عدد الصفوف المحذوفة)

**المعايير:**

- رموز منتهية منذ 30+ يوم
- رموز مستخدمة منذ 7+ يوم

```sql
SELECT cleanup_expired_reset_tokens(500);
-- النتيجة: 47 (تم حذف 47 رمز)
```

---

## 🔒 سياسات RLS (`002_rls_policies.sql`)

| السياسة                              | المستخدم        | الغرض                           |
| ------------------------------------ | --------------- | ------------------------------- |
| `password_reset_no_public_read`      | `authenticated` | منع أي قراءة عامة — الرموز سرية |
| `password_reset_service_full_access` | `service_role`  | صلاحية كاملة لخدمة الخادم       |
| `password_reset_user_own`            | `authenticated` | المستخدم يرى طلباته فقط         |

> ⚠️ الدوال الأربع تستخدم `SECURITY DEFINER` — تتجاوز RLS تلقائياً.

---

## 🔄 TypeScript — Server Actions (`lib/actions/auth/reset.ts`)

### `requestPasswordReset(input)` — طلب استعادة كلمة المرور

```ts
import { requestPasswordReset } from "@/lib/actions/auth";

await requestPasswordReset({ email: "user@example.com" });
// → يُنشئ رمز + يرسل بريد + يرجع success دائماً
```

**الخطوات:**

1. التحقق من البريد (Zod)
2. البحث في `core_profile`
3. `RPC: create_password_reset_token()`
4. `sendPasswordResetEmail()` (بريد رسمي + رابط)
5. يرجع `{ success: true }` دائماً (لا نكشف وجود البريد)

### `resetPassword(input, token)` — استعادة كلمة المرور

```ts
import { resetPassword } from "@/lib/actions/auth";

await resetPassword(
  {
    password: "NewP@ssw0rd123",
    confirmPassword: "NewP@ssw0rd123",
  },
  "a1b2c3d4e5f6...", // الرمز من الرابط
);
// → تستهلك الرمز + تحدث كلمة المرور → redirect("/sign-in?reset=success")
```

**الخطوات:**

1. التحقق من كلمة المرور (Zod: 8+ أحرف، حرف كبير، صغير، رقم)
2. `RPC: claim_password_reset_token()` ← استهلاك ذري
3. `supabase.auth.admin.updateUserById()` ← تحديث كلمة المرور (service_role)
4. `redirect("/sign-in?reset=success")`

### `verifyResetToken(token)` — التحقق (للعرض فقط)

```ts
import { verifyResetToken } from "@/lib/actions/auth";

const result = await verifyResetToken("a1b2c3d4e5f6...");
// → { isValid: true, email: "user@example.com", expiresAt: "2025-..." }
```

---

## 📧 البريد الإلكتروني

القالب يُرسَل بتصميم رسمي (مستوحى من shadcn/ui) مع خطوط آمنة:

| العنصر             | الوصف                                                       |
| ------------------ | ----------------------------------------------------------- |
| **التصميم**        | بطاقة بيضاء مع حدود `zinc-200` + زر أسود `zinc-900`         |
| **الخط العربي**    | `'Segoe UI', Tahoma, Arial` (RTL)                           |
| **الخط الإنجليزي** | `'-apple-system, BlinkMacSystemFont, 'Segoe UI'` (LTR)      |
| **المحتوى**        | تحية + نص توضيحي + زر "إعادة تعيين كلمة المرور" + رابط بديل |
| **الإشعار**        | "هذا الرمز صالح لمدة 15 دقيقة"                              |

> ❌ لا يوجد رمز قصير — الرابط الكامل هو ما يعمل فعلياً.

---

## 🗺️ التدفق الكامل

```
┌─────────────────────────────────────────────────────────────┐
│  1. المستخدم يدخل البريد (forgot-password-form)             │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│  2. requestPasswordReset({ email })                         │
│     → بحث في core_profile                                  │
│     → create_password_reset_token() → رمز 64 حرف           │
│     → sendPasswordResetEmail() → بريد رسمي + رابط          │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│  3. المستخدم يستلم البريد                                   │
│     [ زر: إعادة تعيين كلمة المرور ]                        │
│     الرابط: /reset-password?token=xxxxx                    │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│  4. صفحة إعادة التعيين                                      │
│     → verifyResetToken(token) → التحقق (بدون استهلاك)      │
│     → إذا صالح: عرض نموذج كلمة المرور الجديدة              │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│  5. المستخدم يدخل كلمة مرور جديدة                           │
│     → resetPassword({ password, confirmPassword }, token)   │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│  6. claim_password_reset_token() ← استهلاك ذري 🛡️          │
│     → updateUserById() ← تحديث كلمة المرور (service_role)  │
│     → redirect("/sign-in?reset=success")                   │
└─────────────────────────────────────────────────────────────┘
```

---

## 🔒 الأمان

| الميزة                      | الوصف                                           |
| --------------------------- | ----------------------------------------------- |
| ✅ **رمز 64 حرف**           | `gen_random_bytes(32)` — غير قابل للتخمين       |
| ✅ **صلاحية محدودة**        | 60 دقيقة افتراضياً                              |
| ✅ **استهلاك ذري**          | `UPDATE ... RETURNING` — يمنع الاستخدام المزدوج |
| ✅ **إبطال الرموز القديمة** | كل رمز جديد يبطل الرموز السابقة                 |
| ✅ **لا نكشف عن البريد**    | `requestPasswordReset` يرجع success دائماً      |
| ✅ **تسجيل IP**             | عنوان IP يُخزَّن للمراجعة الأمنية               |
| ✅ **RLS**                  | لا يمكن قراءة الرموز من الخارج                  |
| ✅ **SECURITY DEFINER**     | الدوال فقط يمكنها الوصول للرموز                 |
| ✅ **Soft cleanup**         | Cron Job ينظف الرموز القديمة (30+ يوم)          |
| ✅ **Fallback**             | إذا فشل RPC → Supabase native reset             |

---

## 📋 ترتيب التنفيذ

```
1. ✅ 001_Schema/001_schema.sql           ← جدول auth_password_reset
2. ✅ 002_Utility Functions/...           ← دالة current_user_id()
3. ✅ 003_RLS Policies/...                ← سياسات عامة
4. ✅ 007_Password Reset/001_functions.sql ← الدوال الأربع
5. ✅ 007_Password Reset/002_rls_policies  ← سياسات RLS الخاصة
```

---

## 🛠️ التحقق من الإعداد

```sql
-- التحقق من الدوال
SELECT routine_name
FROM information_schema.routines
WHERE routine_schema = 'public'
  AND routine_name LIKE '%password_reset%'
ORDER BY routine_name;
-- النتيجة: claim_password_reset_token, create_password_reset_token,
--          cleanup_expired_reset_tokens, verify_password_reset_token

-- التحقق من السياسات
SELECT policyname
FROM pg_policies
WHERE tablename = 'auth_password_reset'
ORDER BY policyname;
-- النتيجة: password_reset_no_public_read, password_reset_service_full_access,
--          password_reset_user_own

-- التحقق من الفهارس
SELECT indexname
FROM pg_indexes
WHERE tablename = 'auth_password_reset'
ORDER BY indexname;
-- النتيجة: idx_auth_password_reset_expires, idx_auth_password_reset_profile,
--          idx_auth_password_reset_token, auth_password_reset_pkey,
--          auth_password_reset_token_key
```

---

## 🗄️ Cron Job

مجدول Vercel ينظف الرموز المنتهية يومياً الساعة 2:00 AM:

```
GET /api/cron/cleanup-tokens
→ cleanup_expired_reset_tokens(5000)
→ يحذف الرموز المنتهية (30+ يوم) والمستهلكة (7+ يوم)
```
