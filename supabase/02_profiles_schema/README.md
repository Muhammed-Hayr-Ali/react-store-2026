# 📁 ملفات تعريف المستخدمين (Profiles Schema)

## 📋 نظرة عامة

يحتوي هذا المجلد على مخطط قاعدة البيانات الخاص بملفات تعريف المستخدمين (Profiles) لنظام Marketna للتجارة الإلكترونية.

## 🗂️ الملفات

| الملف                        | الوصف                                                               |
| ---------------------------- | ------------------------------------------------------------------- |
| **`02_profiles_schema.sql`** | ⭐ **الملف الوحيد** - يحتوي على كل شيء: جدول، دوال، سياسات، إصلاحات |
| **`README.md`**              | 📖 هذا الملف - التوثيق الكامل                                       |

## 🔧 التثبيت (5 خطوات بسيطة)

### الخطوة 1: افتح Supabase Dashboard

```
https://app.supabase.com
→ اختر مشروعك
```

### الخطوة 2: اذهب إلى SQL Editor

```
في القائمة الجانبية:
→ Database
→ SQL Editor
```

### الخطوة 3: انسخ الملف

```
افتح ملف: 02_profiles_schema.sql
انسخ المحتوى بالكامل (Ctrl+A ثم Ctrl+C)
```

### الخطوة 4: الصق وشغّل

```
في SQL Editor:
→ الصق المحتوى (Ctrl+V)
→ اضغط Run أو (Ctrl+Enter)
```

### الخطوة 5: تحقق من النجاح

```
يجب أن تظهر رسالة:
"Success. No rows returned"

إذا ظهرت أخطاء، اقرأ قسم "حل المشاكل" أدناه
```

## 📊 هيكل جدول Profiles

### الأعمدة (17 عمود)

| #   | العمود            | النوع       | افتراضي           | وصف                                |
| --- | ----------------- | ----------- | ----------------- | ---------------------------------- |
| 1   | `id`              | UUID        | -                 | المعرف الفريد (مرجع لـ auth.users) |
| 2   | `email`           | TEXT        | -                 | البريد الإلكتروني (فريد)           |
| 3   | `provider`        | TEXT        | `'email'`         | مزود المصادقة                      |
| 4   | `first_name`      | TEXT        | -                 | الاسم الأول                        |
| 5   | `last_name`       | TEXT        | -                 | اسم العائلة                        |
| 6   | `full_name`       | TEXT        | -                 | الاسم الكامل (محسوب)               |
| 7   | `role`            | TEXT        | `'customer'`      | الدور                              |
| 8   | `is_verified`     | BOOLEAN     | `FALSE`           | الحساب موثق                        |
| 9   | `phone`           | TEXT        | -                 | رقم الهاتف                         |
| 10  | `phone_verified`  | BOOLEAN     | `FALSE`           | الهاتف موثق                        |
| 11  | `avatar_url`      | TEXT        | -                 | الصورة الشخصية                     |
| 12  | `bio`             | TEXT        | -                 | نبذة تعريفية                       |
| 13  | `language`        | TEXT        | `'ar'`            | اللغة المفضلة                      |
| 14  | `timezone`        | TEXT        | `'Asia/Damascus'` | المنطقة الزمنية                    |
| 15  | `email_verified`  | BOOLEAN     | `FALSE`           | البريد موثق                        |
| 16  | `date_of_birth`   | DATE        | -                 | تاريخ الميلاد                      |
| 17  | `gender`          | gender      | -                 | النوع الاجتماعي                    |
| 18  | `created_at`      | TIMESTAMPTZ | `NOW()`           | تاريخ الإنشاء                      |
| 19  | `updated_at`      | TIMESTAMPTZ | `NOW()`           | آخر تحديث                          |
| 20  | `last_sign_in_at` | TIMESTAMPTZ | `NOW()`           | آخر تسجيل دخول                     |

## 🔐 مزودي المصادقة

| المزود               | القيمة     | الوصف                     |
| -------------------- | ---------- | ------------------------- |
| 📧 البريد الإلكتروني | `email`    | التسجيل بالبريد           |
| 🔵 Google            | `google`   | تسجيل الدخول عبر Google   |
| 🔵 Facebook          | `facebook` | تسجيل الدخول عبر Facebook |
| ⚫ GitHub            | `github`   | تسجيل الدخول عبر GitHub   |
| 🍎 Apple             | `apple`    | تسجيل الدخول عبر Apple    |

## 🔄 الاستخراج التلقائي للبيانات

### من Google OAuth

```json
{
  "raw_user_meta_data": {
    "full_name": "Mohammed kher Ali",
    "name": "Mohammed kher Ali",
    "email": "user@gmail.com",
    "picture": "https://lh3.googleusercontent.com/...",
    "email_verified": true
  },
  "raw_app_meta_data": {
    "provider": "google"
  }
}
```

### الدالة `handle_new_user()`

تستخرج تلقائياً:

| الحقل        | المصدر                                      | الأولوية |
| ------------ | ------------------------------------------- | -------- |
| `provider`   | `raw_app_meta_data.provider`                | مباشر    |
| `first_name` | `raw_user_meta_data.first_name`             | أولاً    |
| `first_name` | `raw_user_meta_data.full_name` (أول كلمة)   | ثانياً   |
| `first_name` | `raw_user_meta_data.name` (أول كلمة)        | ثالثاً   |
| `last_name`  | `raw_user_meta_data.last_name`              | أولاً    |
| `last_name`  | `raw_user_meta_data.full_name` (باقي الاسم) | ثانياً   |
| `avatar_url` | `raw_user_meta_data.avatar_url`             | أولاً    |
| `avatar_url` | `raw_user_meta_data.picture`                | ثانياً   |

## 🎯 ما يتم إنشاؤه تلقائياً

### 1. الجدول (Table)

```sql
public.profiles
```

### 2. الفهارس (Indexes)

```sql
idx_profiles_email
idx_profiles_provider
idx_profiles_role
idx_profiles_role_verified
idx_profiles_created_at
idx_profiles_last_sign_in
```

### 3. الدوال (Functions)

```sql
handle_new_user()          -- إنشاء بروفايل عند التسجيل
update_updated_at_column() -- تحديث updated_at
handle_user_login()        -- تحديث last_sign_in_at
get_public_profile()       -- قراءة بروفايل عام
get_public_vendors()       -- قائمة البائعين
```

### 4. الـ Triggers

```sql
on_auth_user_created       -- عند إنشاء مستخدم جديد
update_profiles_updated_at -- عند تحديث البروفايل
on_auth_user_login         -- عند تسجيل الدخول
```

### 5. سياسات الأمان (RLS Policies)

```sql
users_read_own          -- قراءة الملف الشخصي
admins_read_all         -- المدير يقرأ الجميع
users_read_public_info  -- المستخدمون يقرأون العام
support_read_all        -- الدعم يقرأ الجميع
users_update_own        -- المستخدم يعدل ملفه
admins_update_all       -- المدير يعدل الجميع
support_update_all      -- الدعم يعدل الجميع
users_insert_own        -- المستخدم ينشئ ملفه
admins_insert_any       -- المدير ينشئ أي ملف
users_delete_own        -- المستخدم يحذف ملفه
admins_delete_all       -- المدير يحذف أي ملف
```

### 6. العرض الآمن (Security View)

```sql
public.public_profiles  -- معلومات عامة فقط
```

## 🔍 استعلامات مفيدة

### 1. التحقق من الإنشاء

```sql
-- التحقق من الدالة
SELECT routine_name
FROM information_schema.routines
WHERE routine_name = 'handle_new_user';

-- التحقق من الـ Trigger
SELECT trigger_name
FROM information_schema.triggers
WHERE trigger_name = 'on_auth_user_created';
```

### 2. عرض المستخدمين

```sql
-- آخر 10 مستخدمين
SELECT
  id, email, provider,
  first_name, last_name, full_name,
  avatar_url, created_at
FROM public.profiles
ORDER BY created_at DESC
LIMIT 10;
```

### 3. المستخدمين حسب المزود

```sql
SELECT
  provider,
  COUNT(*) as count
FROM public.profiles
GROUP BY provider
ORDER BY count DESC;
```

### 4. البحث عن مشكلة

```sql
-- مستخدمين بدون بروفايل
SELECT au.id, au.email
FROM auth.users au
LEFT JOIN public.profiles p ON au.id = p.id
WHERE p.id IS NULL;

-- مستخدمين بأسماء فارغة
SELECT id, email, provider, first_name, last_name
FROM public.profiles
WHERE first_name = '' OR last_name = '';
```

## 🔧 حل المشاكل

### مشكلة 1: "column provider does not exist"

**السبب:** العمود غير موجود في جدول قديم

**الحل:**

```sql
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS provider TEXT DEFAULT 'email';
```

### مشكلة 2: "relation already exists"

**السبب:** الجدول موجود بالفعل

**الحل:** تجاهل الخطأ، الملف مصمم ليعمل مع `CREATE IF NOT EXISTS`

### مشكلة 3: "function already exists"

**السبب:** الدالة موجودة

**الحل:** تجاهل الخطأ، `CREATE OR REPLACE` سيقوم بالتحديث

### مشكلة 4: مستخدمين حاليين بدون بيانات

**الحل:**

```sql
-- تحديث البيانات من Google OAuth
UPDATE public.profiles p
SET
  first_name = COALESCE(
    CASE
      WHEN au.raw_user_meta_data->>'first_name' <> ''
        THEN au.raw_user_meta_data->>'first_name'
      ELSE SPLIT_PART(COALESCE(au.raw_user_meta_data->>'full_name', au.raw_user_meta_data->>'name'), ' ', 1)
    END,
    p.first_name
  ),
  last_name = COALESCE(
    CASE
      WHEN au.raw_user_meta_data->>'last_name' <> ''
        THEN au.raw_user_meta_data->>'last_name'
      ELSE TRIM(SUBSTRING(COALESCE(au.raw_user_meta_data->>'full_name', au.raw_user_meta_data->>'name')
                   FROM POSITION(' ' IN COALESCE(au.raw_user_meta_data->>'full_name', au.raw_user_meta_data->>'name')) + 1))
    END,
    p.last_name
  )
FROM auth.users au
WHERE au.id = p.id;
```

### مشكلة 5: RLS تمنع القراءة/الكتابة

**الحل:** تحقق من السياسات

```sql
-- عرض السياسات الحالية
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies
WHERE tablename = 'profiles';
```

## ✅ اختبار التسجيل

### 1. شغّل التطبيق

```bash
npm run dev
```

### 2. سجّل دخول عبر Google

```
http://localhost:3000/ar/sign-in
→ Sign in with Google
→ اختر الحساب
```

### 3. تحقق من النتيجة

```sql
SELECT
  id, email, provider,
  first_name, last_name, full_name,
  avatar_url
FROM public.profiles
ORDER BY created_at DESC
LIMIT 1;
```

### 4. النتيجة المتوقعة

```
✅ provider: google
✅ first_name: Mohammed
✅ last_name: kher Ali
✅ full_name: Mohammed kher Ali
✅ avatar_url: https://...
```

## 📝 ملاحظات هامة

### 1. الاسم الكامل

```sql
-- محسوب تلقائياً ولا يمكن تعديله يدوياً
full_name TEXT GENERATED ALWAYS AS (
  NULLIF(TRIM(COALESCE(first_name, '') || ' ' || COALESCE(last_name, '')), '')
) STORED
```

### 2. RLS Policies

- ✅ المستخدم يقرأ ويعدل **ملفه فقط**
- ✅ المدير يقرأ ويعدل **الجميع**
- ✅ الدعم الفني يقرأ ويعدل **الجميع**
- ✅ العام يقرأ **المعلومات الأساسية فقط**

### 3. Triggers

- `on_auth_user_created`: ينشئ البروفايل **تلقائياً** عند التسجيل
- `update_profiles_updated_at`: يحدّث `updated_at` **تلقائياً** عند التعديل
- `on_auth_user_login`: يحدّث `last_sign_in_at` **تلقائياً** عند الدخول

### 4. البيانات الحساسة

**لا تُعرض للعامة:**

- ❌ `email`
- ❌ `phone`
- ❌ `email_verified`
- ❌ `phone_verified`
- ❌ `date_of_birth`
- ❌ `gender`

**تُعرض للعامة:**

- ✅ `full_name`
- ✅ `avatar_url`
- ✅ `bio`
- ✅ `role`
- ✅ `is_verified`

## 📚 ملفات ذات صلة

| المسار                                                | الوصف                   |
| ----------------------------------------------------- | ----------------------- |
| `01_roles_permissions_system.sql`                     | نظام الأدوار والصلاحيات |
| `../hooks/useAuth.tsx`                                | React hook للمصادقة     |
| `../lib/types/profile.ts`                             | TypeScript types        |
| `../lib/actions/authentication/signIn-with-google.ts` | Google OAuth            |

## 📅 الإصدارات

| التاريخ    | الإصدار | التغييرات              |
| ---------- | ------- | ---------------------- |
| 2026-03-19 | 3.0     | ملف واحد شامل لكل شيء  |
| 2026-03-19 | 2.0     | تحسين دعم Google OAuth |
| 2026-03-19 | 1.1     | إضافة عمود provider    |
| 2026-03-16 | 1.0     | الإصدار الأولي         |

## 🔗 روابط مفيدة

- 📘 [Supabase Auth Documentation](https://supabase.com/docs/guides/auth)
- 🔵 [Google OAuth Setup](https://supabase.com/docs/guides/auth/social-login/auth-google)
- 📊 [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- 🔒 [RLS Best Practices](https://supabase.com/docs/guides/auth/row-level-security)

---

**تم التطوير بواسطة:** Mohammed Kher Ali  
**التاريخ:** 2026-03-19  
**الترخيص:** Copyright © 2026 Marketna
