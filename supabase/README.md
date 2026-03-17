# Marketna - Supabase Database

قاعدة بيانات متجر Marketna الإلكتروني على Supabase.

## 📁 هيكل الملفات

```
supabase/
└── sql/
    ├── profiles.sql    - جدول الملفات الشخصية (شامل)
    └── README.md       - هذا الملف
```

## 🚀 كيفية التثبيت

### الطريقة 1: Supabase Dashboard (موصى به)

1. اذهب إلى [Supabase Dashboard](https://supabase.com/dashboard)
2. اختر مشروعك
3. اذهب إلى **SQL Editor**
4. انسخ محتوى `sql/profiles.sql` بالكامل
5. الصق واضغط **Run**

**ملاحظة:** إذا ظهر خطأ "already exists"، قم بتشغيل الأمر التالي أولاً:

```sql
DROP TABLE IF EXISTS profiles CASCADE;
DROP TYPE IF EXISTS gender CASCADE;
```

### الطريقة 2: سطر الأوامر

```bash
psql -h db.xxx.supabase.co -U postgres -d postgres -f sql/profiles.sql
```

### الطريقة 3: Supabase CLI

```bash
supabase db push
```

## 📊 هيكل قاعدة البيانات

### الجداول

| الجدول     | الوصف                      |
| ---------- | -------------------------- |
| `profiles` | الملفات الشخصية للمستخدمين |

### الأنواع (Enums)

| النوع    | الوصف                                              |
| -------- | -------------------------------------------------- |
| `gender` | نوع الجنس (male, female, other, prefer_not_to_say) |

### الدوال (Functions)

| الدالة                          | الوصف                                |
| ------------------------------- | ------------------------------------ |
| `create_profile_for_new_user()` | إنشاء ملف شخصي عند تسجيل مستخدم جديد |
| `update_last_login(user_id)`    | تحديث تاريخ آخر دخول                 |

### المشغلات (Triggers)

| المشغل                 | الوصف                               |
| ---------------------- | ----------------------------------- |
| `on_auth_user_created` | إنشاء ملف شخصي تلقائياً عند التسجيل |

### سياسات الأمان (RLS)

| السياسة                    | الجدول   | الوصف                        |
| -------------------------- | -------- | ---------------------------- |
| `profiles_public_read`     | profiles | السماح للجميع بعرض الملفات   |
| `profiles_user_update_own` | profiles | المستخدم يملك تحديث ملفه فقط |
| `profiles_user_insert_own` | profiles | المستخدم يملك إنشاء ملفه فقط |

## 🔧 إعداد Storage (للصور الشخصية)

### إنشاء Bucket للأفاتار

1. اذهب إلى **Storage** في Supabase Dashboard
2. اضغط **New Bucket**
3. الاسم: `avatars`
4. Public: ✅ نعم
5. اضغط **Create bucket**

### سياسات Storage للأفاتار

```sql
-- السماح للجميع بالعرض
CREATE POLICY "Anyone can view avatars"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'avatars');

-- السماح للمستخدمين برفع صورهم
CREATE POLICY "Users can upload own avatar"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'avatars' AND
  auth.uid()::text = (storage.foldername(name))[1]
);
```

## 🔐 متغيرات البيئة

أنشئ ملف `.env.local` في الجذر:

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=xxx
SUPABASE_SERVICE_ROLE_KEY=xxx
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## 📝 ملاحظات هامة

1. **البريد الإلكتروني**: لا يمكن تحديثه من جدول `profiles` (مثبت من `auth.users`)
2. **last_login_at**: يُحدث تلقائياً عند تسجيل الدخول عبر دالة `update_last_login()`
3. **RLS**: مفعل على جدول `profiles` للحماية
4. **الصور الشخصية**: تُخزن في Supabase Storage bucket `avatars`

## 📋 هيكل جدول profiles

| العمود           | النوع       | الوصف                         |
| ---------------- | ----------- | ----------------------------- |
| `id`             | UUID        | المعرف الفريد (من auth.users) |
| `email`          | TEXT        | البريد الإلكتروني             |
| `phone`          | TEXT        | رقم الهاتف                    |
| `first_name`     | TEXT        | الاسم الأول                   |
| `last_name`      | TEXT        | اسم العائلة                   |
| `full_name`      | TEXT        | الاسم الكامل (محسوب)          |
| `gender`         | gender      | نوع الجنس                     |
| `date_of_birth`  | DATE        | تاريخ الميلاد                 |
| `bio`            | TEXT        | نبذة تعريفية                  |
| `avatar_url`     | TEXT        | رابط الصورة                   |
| `language`       | TEXT        | اللغة (en/ar)                 |
| `timezone`       | TEXT        | المنطقة الزمنية               |
| `email_verified` | BOOLEAN     | التحقق من البريد              |
| `phone_verified` | BOOLEAN     | التحقق من الهاتف              |
| `created_at`     | TIMESTAMPTZ | تاريخ الإنشاء                 |
| `updated_at`     | TIMESTAMPTZ | آخر تحديث                     |
| `last_login_at`  | TIMESTAMPTZ | آخر دخول                      |

## 🆘 استكشاف الأخطاء

### خطأ: "relation already exists"

```sql
-- حذف الجدول وإعادة الإنشاء
DROP TABLE IF EXISTS profiles CASCADE;
DROP TYPE IF EXISTS gender CASCADE;
```

### خطأ: "permission denied"

```sql
-- إعادة تفعيل RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
```

### خطأ: "function does not exist"

```sql
-- إعادة تشغيل ملف profiles.sql
psql -f sql/profiles.sql
```

## 📚 روابط مفيدة

- [Supabase Docs](https://supabase.com/docs)
- [PostgreSQL Enums](https://www.postgresql.org/docs/current/datatype-enum.html)
- [Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)
- [Supabase Storage](https://supabase.com/docs/guides/storage)
