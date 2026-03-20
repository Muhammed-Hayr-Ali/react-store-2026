# Marketna E-Commerce - Supabase Database

## 📋 نظرة عامة

هذا المجلد يحتوي على جميع ملفات SQL اللازمة لإعداد قاعدة بيانات Supabase لمنصة Marketna للتجارة الإلكترونية.

---

## 📁 هيكل المجلدات

```
supabase/
├── 01-exchange_rates/              # أسعار الصرف (عملات)
├── 02_password_reset_tokens/       # رموز إعادة تعيين كلمة المرور
├── 03_profiles_schema/             # ملفات المستخدمين الشخصية
├── 04_roles_permissions_system/    # نظام الأدوار والصلاحيات (RBAC)
├── 04_subscriptions/               # نظام الاشتراكات والخطط
│   ├── 01_subscription_plans.sql   # جدول خطط الاشتراكات
│   └── README.md
├── 05_sellers/                     # الباعة والمتاجر
│   ├── 01_sellers_schema.sql       # جدول الباعة
│   └── README.md
├── sql/                            # ملفات SQL عامة
└── README.md                       # هذا الملف
```

---

## 🚀 دليل التثبيت

### الخطوة 1: الإعدادات الأساسية

```bash
# 1. ملفات الإعدادات الأساسية
psql -f supabase/01-exchange_rates/exchange_rates.sql
psql -f supabase/02_password_reset_tokens/password_reset.sql
psql -f supabase/03_profiles_schema/profiles_schema.sql
```

---

### الخطوة 2: نظام الأدوار والصلاحيات

```bash
# 2. نظام الأدوار والصلاحيات (مهم جداً!)
psql -f supabase/04_roles_permissions_system/01_roles_permissions_system.sql
```

**المحتويات:**

- جدول الأدوار (`roles`)
- جدول الصلاحيات (`permissions`)
- جدول أدوار المستخدمين (`user_roles`)
- جدول صلاحيات الأدوار (`role_permissions`)
- دوال التحقق من الصلاحيات
- سياسات الأمان الأساسية

[📖 قراءة التوثيق](./04_roles_permissions_system/README.md)

---

### الخطوة 3: نظام الاشتراكات

```bash
# 3. نظام الاشتراكات (قبل الباعة)
psql -f supabase/04_subscriptions/01_subscription_plans.sql
```

**المحتويات:**

- جدول خطط الاشتراكات (`subscription_plans`)
- جدول اشتراكات الباعة (`seller_subscriptions`)
- دوال إدارة الاشتراكات
- سياسات الأمان

**الخطط المتاحة:**

| الخطة      | السعر (USD) | عدد المنتجات |
| ---------- | ----------- | ------------ |
| **Free**   | $0          | **50 منتج**  |
| **Silver** | $29/شهر     | 200 منتج     |
| **Gold**   | $99/شهر     | 1000 منتج    |

[📖 قراءة التوثيق](./04_subscriptions/README.md)

---

### الخطوة 4: جدول الباعة

```bash
# 4. جدول الباعة
psql -f supabase/05_sellers/01_sellers_schema.sql
```

**المحتويات:**

- جدول الباعة (`sellers`)
- دوال إدارة الباعة
- سياسات الأمان للباعة
- إشعارات تغيير الحالة

[📖 قراءة التوثيق](./05_sellers/README.md)

---

## 📊 مخطط قاعدة البيانات (ERD)

```
┌─────────────────┐
│   auth.users    │ (Supabase Auth)
└────────┬────────┘
         │
         ├──────────────────┐
         │                  │
         ▼                  ▼
┌─────────────────┐  ┌─────────────────┐
│     profiles    │  │     sellers     │
├─────────────────┤  ├─────────────────┤
│ id (PK)         │  │ id (PK)         │
│ user_id (FK)    │  │ user_id (FK)    │
│ ...             │  │ store_name      │
└─────────────────┘  │ store_slug      │
                     │ account_status  │
                     └────────┬────────┘
                              │
                              │ 1:1
                              ▼
                     ┌─────────────────┐
                     │seller_subscript.│
                     ├─────────────────┤
                     │ plan_id (FK)    │
                     │ status          │
                     │ end_date        │
                     └────────┬────────┘
                              │
                              │ N:1
                              ▼
                     ┌─────────────────┐
                     │subscription_plan│
                     ├─────────────────┤
                     │ name (free/..)  │
                     │ price_usd       │
                     │ max_products    │
                     └─────────────────┘
```

---

## 🔧 الإعدادات المطلوبة

### متغيرات البيئة

```env
# .env.local
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Stripe (للاشتراكات)
STRIPE_SECRET_KEY=sk_test_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx
```

### الإضافات المطلوبة

```sql
-- يتم تثبيتها تلقائياً
CREATE EXTENSION IF NOT EXISTS pg_trgm;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
```

---

## 📝 سير العمل الموصى به

### 1. التطوير المحلي

```bash
# 1. تثبيت Supabase CLI
npm install -g supabase

# 2. ربط المشروع
supabase link --project-ref your-project-ref

# 3. تطبيق التغييرات
supabase db push
```

### 2. الإنتاج

```bash
# 1. مراجعة التغييرات
supabase db diff

# 2. إنشاء migration
supabase migration new add_sellers_table

# 3. تطبيق على الإنتاج
supabase db push
```

---

## 🔐 الأمان

### سياسات RLS المفعلة

| الجدول                 | السياسات                           |
| ---------------------- | ---------------------------------- |
| `roles`                | قراءة عامة، إدارة للأدمن           |
| `permissions`          | قراءة عامة، إدارة للأدمن           |
| `user_roles`           | قراءة للأدوار الخاصة، إدارة للأدمن |
| `subscription_plans`   | قراءة الخطط النشطة، إدارة للأدمن   |
| `seller_subscriptions` | قراءة/كتابة للبائع، إدارة للأدمن   |
| `sellers`              | قراءة/كتابة للبائع، إدارة للأدمن   |

### دوال التحقق

```sql
-- التحقق من الدور
SELECT public.has_role('admin');

-- التحقق من الصلاحية
SELECT public.has_permission('products:create');

-- التحقق الشامل
SELECT public.can_manage_record('products', product_id, 'delete');

-- التحقق من حد المنتجات
SELECT public.can_add_product();
```

---

## 📚 التوثيق

| الملف                                                                  | الوصف                   |
| ---------------------------------------------------------------------- | ----------------------- |
| [04_roles_permissions_system](./04_roles_permissions_system/README.md) | نظام الأدوار والصلاحيات |
| [04_subscriptions](./04_subscriptions/README.md)                       | نظام الاشتراكات والخطط  |
| [05_sellers](./05_sellers/README.md)                                   | الباعة والمتاجر         |

---

## 🐛 استكشاف الأخطاء

### مشكلة: جدول غير موجود

```sql
-- التحقق من الجداول الموجودة
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public';
```

### مشكلة: صلاحيات غير كافية

```sql
-- التحقق من أدوار المستخدم الحالي
SELECT * FROM public.get_user_roles();

-- التحقق من صلاحيات المستخدم
SELECT * FROM public.get_user_permissions();
```

### مشكلة: RLS تمنع الوصول

```sql
-- التحقق من حالة RLS
SELECT tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public';

-- تعطيل RLS مؤقتاً (للتطوير فقط!)
ALTER TABLE public.sellers DISABLE ROW LEVEL SECURITY;
```

---

## 📞 الدعم

لأي استفسارات أو مشاكل تقنية:

- 📧 البريد: support@marketna.com
- 📚 التوثيق: https://docs.marketna.com
- 💬 Discord: https://discord.gg/marketna

---

**الإصدار:** 1.0  
**آخر تحديث:** 2026  
**المشروع:** Marketna E-Commerce Platform
