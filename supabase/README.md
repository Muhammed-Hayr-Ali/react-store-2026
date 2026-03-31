# Marketna E-Commerce - Supabase Database Setup

## 📁 ترتيب تنفيذ الملفات (Execution Order)

**⚠️ مهم جدًا:** يجب تنفيذ الملفات بالترتيب الرقمي للمجلدات لضمان معالجة التبعيات (Dependencies) بشكل صحيح.

---

## 🚀 الترتيب الصحيح للتنفيذ

### 1️⃣ المرحلة الأولى: الجداول والبيانات الأساسية

```sql
-- 1. ملفات التعريف (Profiles)
supabase/01_profiles/1_create_table.sql
supabase/01_profiles/2_create_function.sql

-- 2. استعادة كلمة المرور (Password Reset)
supabase/02_password_reset/1_create_table.sql

-- 3. الأدوار وصلاحيات الوصول (Roles)
supabase/03_roles/1_create_table.sql
supabase/03_roles/2_create_policy.sql

-- 4. ربط المستخدمين بالأدوار
supabase/04_profile_roles_links/1_create_table.sql

-- 5. خطط الاشتراك (Subscription Plans)
supabase/05_subscription_plans/1_create_table.sql
supabase/05_subscription_plans/2_create_policy.sql

-- 6. ربط المستخدمين بالخطط
supabase/06_profile_plans_links/1_create_table.sql
```

### 2️⃣ المرحلة الثانية: الخدمات الإضافية

```sql
-- 7. أسعار الصرف (Exchange Rates)
supabase/07_exchange_rates/1_create_table.sql

-- 8. التنبيهات داخل التطبيق (In-App Notifications)
supabase/08_In-App Notifications/1_create_table.sql
```

---

## 📋 كيفية التنفيذ (How to Execute)

### الخيار 1: عبر Supabase SQL Editor (موصى به)
1. افتح مشروعك في [Supabase Dashboard](https://supabase.com/dashboard).
2. اذهب إلى قسم **SQL Editor**.
3. انسخ محتوى كل ملف SQL بالترتيب المذكور أعلاه والصقه في المحرر.
4. اضغط على الزر **Run**.

### الخيار 2: عبر psql
```bash
psql -h db.<project-ref>.supabase.co -U postgres -d postgres -f <file_path>
```

---

## ✅ ما الذي يوفره هذا النظام؟

بمجرد تنفيذ جميع الملفات بالترتيب، سيقوم النظام تلقائياً بـ:
1. إنشاء ملف الشخصي (Profile) لأي مستخدم جديد يسجل عبر Auth.
2. تعيين دور `customer` افتراضياً للمستخدم الجديد.
3. تفعيل خطة "Free Member" للمستخدم الجديد.
4. إعداد نظام آمن لاستعادة كلمة المرور عبر التوكنات (Tokens).

---

## 🛠️ استكشاف الأخطاء (Troubleshooting)

### خطأ "Foreign Key Constraint"
**السبب:** محاولة تنفيذ ملف قبل ملف آخر يعتمد عليه (مثلاً تنفيذ `02_password_reset` قبل `01_profiles`).
**الحل:** التزم بالترتيب الرقمي للمجلدات (01 -> 02 -> 03...).

### خطأ "Trigger function does not exist"
**السبب:** عدم تنفيذ ملف `2_create_function.sql` في مجلد `01_profiles`.
**الحل:** تأكد من تنفيذ جميع ملفات المجلد قبل الانتقال للمجلد التالي.

---

## 📂 هيكل المجلدات الحالي

```
supabase/
├── 01_profiles/               # الملفات الشخصية والوظائف الأساسية
├── 02_password_reset/         # نظام استعادة كلمة المرور
├── 03_roles/                  # تعريف الأدوار (Admin, Vendor, etc.)
├── 04_profile_roles_links/    # ربط المستخدمين بالأدوار
├── 05_subscription_plans/     # تعريف خطط الاشتراك
├── 06_profile_plans_links/    # ربط المستخدمين بالخطط
├── 07_exchange_rates/         # نظام أسعار الصرف
├── 08_In-App Notifications/   # نظام التنبيهات الداخلية
└── templates/                 # قوالب SQL للاستخدام المستقبلي
```
ble.sql
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
