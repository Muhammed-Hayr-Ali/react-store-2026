# 📁 ملفات تعريف المستخدمين (Profiles Schema)

## 📋 نظرة عامة

يحتوي هذا المجلد على مخطط قاعدة البيانات الخاص بملفات تعريف المستخدمين (Profiles) لنظام Marketna للتجارة الإلكترونية.

## 🗂️ الملفات

| الملف                                    | الوصف                                                          |
| ---------------------------------------- | -------------------------------------------------------------- |
| `02_profiles_schema.sql`                 | الملف الرئيسي - يحتوي على جدول profiles وجميع الدوال والسياسات |
| `02_profiles_migration_add_provider.sql` | Migration لإضافة عمود provider وتحديث البيانات الموجودة        |

## 🔧 التثبيت

### 1. تشغيل الملف الرئيسي

```bash
# في Supabase Dashboard → SQL Editor
# قم بتشغيل محتوى ملف: 02_profiles_schema.sql
```

### 2. تشغيل Migration (للقواعد الموجودة)

```bash
# إذا كان لديك مستخدمين موجودين بالفعل
# قم بتشغيل محتوى ملف: 02_profiles_migration_add_provider.sql
```

## 📊 هيكل جدول Profiles

### الأعمدة الرئيسية

| العمود            | النوع       | الوصف                                         |
| ----------------- | ----------- | --------------------------------------------- |
| `id`              | UUID        | المعرف الفريد (مرجع لـ auth.users)            |
| `email`           | TEXT        | البريد الإلكتروني                             |
| `provider`        | TEXT        | مزود المصادقة (email, google, facebook, etc.) |
| `first_name`      | TEXT        | الاسم الأول                                   |
| `last_name`       | TEXT        | اسم العائلة                                   |
| `full_name`       | TEXT        | الاسم الكامل (محسوب تلقائياً)                 |
| `role`            | TEXT        | الدور (customer, vendor, admin, etc.)         |
| `is_verified`     | BOOLEAN     | هل الحساب موثق                                |
| `avatar_url`      | TEXT        | رابط الصورة الشخصية                           |
| `bio`             | TEXT        | نبذة تعريفية                                  |
| `language`        | TEXT        | اللغة المفضلة                                 |
| `timezone`        | TEXT        | المنطقة الزمنية                               |
| `email_verified`  | BOOLEAN     | هل البريد موثق                                |
| `phone_verified`  | BOOLEAN     | هل الهاتف موثق                                |
| `created_at`      | TIMESTAMPTZ | تاريخ الإنشاء                                 |
| `updated_at`      | TIMESTAMPTZ | تاريخ آخر تحديث                               |
| `last_sign_in_at` | TIMESTAMPTZ | تاريخ آخر تسجيل دخول                          |

## 🔐 مزودي المصادقة المدعومين

- ✅ `email` - التسجيل بالبريد الإلكتروني
- ✅ `google` - تسجيل الدخول عبر Google OAuth
- ✅ `facebook` - تسجيل الدخول عبر Facebook
- ✅ `github` - تسجيل الدخول عبر GitHub
- ✅ `apple` - تسجيل الدخول عبر Apple

## 🔄 استخراج البيانات من OAuth

### Google OAuth Data Structure

عند التسجيل عبر Google، يتم تخزين البيانات في:

```json
{
  "raw_user_meta_data": {
    "full_name": "Mohammed kher Ali",
    "name": "Mohammed kher Ali",
    "email": "m.thelord963@gmail.com",
    "picture": "https://lh3.googleusercontent.com/...",
    "avatar_url": "https://lh3.googleusercontent.com/...",
    "email_verified": true
  },
  "raw_app_meta_data": {
    "provider": "google"
  }
}
```

### الدالة `handle_new_user()`

تقوم باستخراج البيانات تلقائياً:

```sql
-- استخراج المزود
v_provider := COALESCE(NEW.raw_app_meta_data->>'provider', 'email');

-- استخراج الاسم الكامل (Google يستخدم full_name أو name)
v_full_name := COALESCE(
  NEW.raw_user_meta_data->>'full_name',
  NEW.raw_user_meta_data->>'name',
  ''
);

-- تقسيم الاسم
v_first_name := SPLIT_PART(v_full_name, ' ', 1);
v_last_name := TRIM(SUBSTRING(v_full_name FROM LENGTH(v_first_name) + 2));

-- استخراج الصورة (Google يستخدم picture أو avatar_url)
v_avatar_url := COALESCE(
  NEW.raw_user_meta_data->>'avatar_url',
  NEW.raw_user_meta_data->>'picture',
  ''
);
```

## 🛠️ إصلاح البيانات الموجودة

إذا كانت لديك مستخدمين مسجلين عبر Google ولديهم أسماء فارغة:

```sql
-- تحديث provider
UPDATE public.profiles p
SET provider = COALESCE(
  (SELECT au.raw_app_meta_data->>'provider' FROM auth.users au WHERE au.id = p.id),
  'email'
);

-- تحديث الأسماء والصور
UPDATE public.profiles p
SET
  first_name = COALESCE(
    NULLIF(SPLIT_PART(
      COALESCE(
        (SELECT au.raw_user_meta_data->>'full_name' FROM auth.users au WHERE au.id = p.id),
        (SELECT au.raw_user_meta_data->>'name' FROM auth.users au WHERE au.id = p.id),
        ''
      ),
      ' ', 1
    ), ''),
    first_name
  ),
  last_name = COALESCE(
    NULLIF(TRIM(SUBSTRING(
      COALESCE(
        (SELECT au.raw_user_meta_data->>'full_name' FROM auth.users au WHERE au.id = p.id),
        (SELECT au.raw_user_meta_data->>'name' FROM auth.users au WHERE au.id = p.id),
        ''
      )
      FROM POSITION(' ' IN
        COALESCE(
          (SELECT au.raw_user_meta_data->>'full_name' FROM auth.users au WHERE au.id = p.id),
          (SELECT au.raw_user_meta_data->>'name' FROM auth.users au WHERE au.id = p.id),
          ''
        )
      ) + 1
    )), ''),
    last_name
  ),
  avatar_url = COALESCE(
    (SELECT au.raw_user_meta_data->>'avatar_url' FROM auth.users au WHERE au.id = p.id),
    (SELECT au.raw_user_meta_data->>'picture' FROM auth.users au WHERE au.id = p.id),
    avatar_url
  );
```

## 🔍 استعلامات مفيدة

### التحقق من المستخدمين حسب المزود

```sql
-- عدد المستخدمين حسب المزود
SELECT provider, COUNT(*) as count
FROM public.profiles
GROUP BY provider;

-- عرض المستخدمين المسجلين عبر Google
SELECT id, email, full_name, avatar_url, created_at
FROM public.profiles
WHERE provider = 'google';

-- عرض المستخدمين بدون أسماء
SELECT id, email, provider, first_name, last_name, full_name
FROM public.profiles
WHERE first_name = '' OR last_name = '';
```

### إصلاح مستخدم محدد

```sql
-- تحديث مستخدم معين بالبيانات من auth.users
UPDATE public.profiles p
SET
  first_name = SPLIT_PART(
    COALESCE(au.raw_user_meta_data->>'full_name', au.raw_user_meta_data->>'name'),
    ' ', 1
  ),
  last_name = TRIM(SUBSTRING(
    COALESCE(au.raw_user_meta_data->>'full_name', au.raw_user_meta_data->>'name')
    FROM POSITION(' ' IN
      COALESCE(au.raw_user_meta_data->>'full_name', au.raw_user_meta_data->>'name')
    ) + 1
  )),
  provider = COALESCE(au.raw_app_meta_data->>'provider', 'email')
FROM auth.users au
WHERE au.id = p.id AND p.id = 'USER_UUID_HERE';
```

## 📝 ملاحظات هامة

1. **الاسم الكامل المحسوب**: العمود `full_name` يتم حسابه تلقائياً من `first_name` و `last_name`

2. **RLS Policies**: جدول profiles محمي بـ Row Level Security

3. **Triggers**:
   - `on_auth_user_created`: ينشئ profile تلقائياً عند التسجيل
   - `update_profiles_updated_at`: يحدّث `updated_at` تلقائياً
   - `on_auth_user_login`: يحدّث `last_sign_in_at` عند تسجيل الدخول

4. **البيانات الحساسة**: لا تعرض السياسات البيانات الحاسة للعامة

## 🔗 الملفات ذات الصلة

- `01_roles_permissions_system.sql` - نظام الأدوار والصلاحيات
- `../hooks/useAuth.tsx` - React hook للمصادقة
- `../lib/types/profile.ts` - TypeScript types

## 📅 سجل التغييرات

| التاريخ    | الإصدار | التغييرات                               |
| ---------- | ------- | --------------------------------------- |
| 2026-03-19 | 1.1     | إضافة عمود `provider` ودعم Google OAuth |
| 2026-03-16 | 1.0     | الإصدار الأولي                          |
