# Marketna E-Commerce - Supabase Database Setup

## 📁 ترتيب تنفيذ الملفات

**⚠️ مهم جدًا:** نفّذ الملفات بالترتيب التالي لضمان عمل النظام بشكل صحيح.

---

## الترتيب الصحيح

### 1️⃣ الجداول الأساسية (Tables)

```sql
-- 1. الملفات الشخصية
supabase/02_profiles/1_create_table.sql

-- 2. الأدوار
supabase/03_roles/1_create_table.sql

-- 3. ربط الملفات بالأدوار
supabase/04_profile_roles_links/1_create_table.sql

-- 4. خطط الاشتراك
supabase/05_subscription_plans/1_create_table.sql

-- 5. ربط الملفات بالخطط
supabase/06_profile_plans/1_create_table.sql
```

### 2️⃣ البيانات الافتراضية (Default Data)

```sql
-- 1. بيانات الأدوار (admin, vendor, delivery, customer)
supabase/03_roles/4_create_data.sql

-- 2. بيانات خطط الاشتراك
supabase/05_subscription_plans/4_create_data.sql
```

### 3️⃣ الدوال والـ Triggers (Functions & Triggers)

```sql
-- ⭐ ملف واحد يحتوي على كل شيء
supabase/02_profiles/3_create_function.sql
```

---

## 📋 تنفيذ سريع (كل الملفات بالترتيب)

```sql
-- === 1. TABLES ===
\i supabase/02_profiles/1_create_table.sql
\i supabase/03_roles/1_create_table.sql
\i supabase/04_profile_roles_links/1_create_table.sql
\i supabase/05_subscription_plans/1_create_table.sql
\i supabase/06_profile_plans/1_create_table.sql

-- === 2. DATA ===
\i supabase/03_roles/4_create_data.sql
\i supabase/05_subscription_plans/4_create_data.sql

-- === 3. FUNCTIONS & TRIGGERS ===
\i supabase/02_profiles/3_create_function.sql
```

---

## 🚀 كيفية التنفيذ

### الطريقة 1: عبر Supabase Dashboard (موصى بها)

1. افتح [Supabase Dashboard](https://supabase.com/dashboard)
2. اختر مشروعك
3. اذهب إلى **SQL Editor**
4. انسخ محتويات كل ملف والصقها بالترتيب
5. اضغط **Run** لكل ملف

### الطريقة 2: عبر psql

```bash
psql -h db.<project-ref>.supabase.co -U postgres -d postgres -f setup_all.sql
```

### الطريقة 3: عبر Supabase CLI

```bash
npx supabase login
npx supabase link --project-ref <your-project-ref>
npx supabase db execute --file supabase/02_profiles/1_create_table.sql
# ... كرر لكل ملف بالترتيب
```

---

## ✅ ما يحدث عند التنفيذ

بعد تنفيذ جميع الملفات، عند تسجيل مستخدم جديد:

1. ✅ يتم إنشاء ملفه في `public.profiles` تلقائيًا
2. ✅ يتم منحه دور `customer` في `public.profile_roles`
3. ✅ يتم منحه خطة `Free Member` في `public.profile_plans`

---

## 🔍 التحقق من النجاح

```sql
-- التحقق من الـ triggers
SELECT trigger_name, event_manipulation, event_object_table
FROM information_schema.triggers
WHERE trigger_name IN ('on_auth_user_created', 'on_auth_user_login');

-- التحقق من الدوال
SELECT routine_name, security_type
FROM information_schema.routines
WHERE routine_schema = 'public'
  AND routine_name IN ('handle_new_user', 'handle_user_login');

-- التحقق من الأدوار
SELECT name, description FROM public.roles ORDER BY name;

-- التحقق من الخطط
SELECT category, name, price, is_default FROM public.plans ORDER BY category, name;
```

---

## 📊 هيكل قاعدة البيانات

```
supabase/
├── 01_password_reset/          ← استعادة كلمة المرور
├── 02_profiles/                ← الملفات الشخصية
│   ├── 1_create_table.sql
│   └── 3_create_function.sql   ← ⭐ الدوال + triggers
├── 03_roles/                   ← الأدوار
│   ├── 1_create_table.sql
│   └── 4_create_data.sql
├── 04_profile_roles_links/     ← ربط الملفات بالأدوار
│   └── 1_create_table.sql
├── 05_subscription_plans/      ← خطط الاشتراك
│   ├── 1_create_table.sql
│   └── 4_create_data.sql
└── 06_profile_plans/           ← ربط الملفات بالخطط
    └── 1_create_table.sql
```

---

## 🛠️ استكشاف الأخطاء

### المشكلة: خطأ "must be owner of relation users"

**الحل:** نفّذ ملف `02_profiles/3_create_function.sql` فقط عبر postgres user في Supabase Dashboard.

### المشكلة: الدور 'customer' غير موجود

**الحل:** نفّذ ملف `03_roles/4_create_data.sql` أولاً.

### المشكلة: الخطة 'Free Member' غير موجودة

**الحل:** نفّذ ملف `05_subscription_plans/4_create_data.sql` أولاً.
