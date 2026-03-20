# Marketna E-Commerce - Supabase Database

## 📋 نظرة عامة

هذا المجلد يحتوي على جميع ملفات SQL اللازمة لإعداد قاعدة بيانات Supabase لمنصة Marketna للتجارة الإلكترونية.

---

## 📁 هيكل المجلدات

```
supabase/
├── 01-exchange_rates/              # أسعار الصرف (عملات)
│   ├── exchange_rates.sql
│   └── README.md
├── 02_password_reset_tokens/       # رموز إعادة تعيين كلمة المرور
│   └── password_reset.sql
├── 03_profiles_schema/             # ملفات المستخدمين الشخصية
│   └── profiles_schema.sql
├── 04_roles_permissions_system/    # نظام الأدوار والصلاحيات (RBAC)
│   ├── 01_roles_permissions_system.sql
│   └── README.md
├── 04_seller_subscriptions/        # اشتراكات الباعة
│   ├── 01_seller_subscription_plans.sql   # خطط الاشتراكات
│   ├── 02_seller_subscriptions.sql        # جدول اشتراكات الباعة
│   └── README.md
├── 05_delivery_subscriptions/      # اشتراكات التوصيل
│   ├── 01_delivery_subscription_plans.sql # خطط الاشتراكات
│   ├── 02_delivery_partner_subscriptions.sql # جدول اشتراكات التوصيل
│   └── README.md
├── 06_sellers/                     # الباعة والمتاجر
│   ├── 01_sellers_schema.sql
│   └── README.md
├── sql/                            # ملفات SQL عامة
└── README.md                       # هذا الملف
```

---

## 🚀 دليل التثبيت

### **الترتيب الصحيح للتشغيل:**

```bash
# ============================================
# المرحلة 1: الإعدادات الأساسية
# ============================================
psql -f supabase/01-exchange_rates/exchange_rates.sql
psql -f supabase/02_password_reset_tokens/password_reset.sql
psql -f supabase/03_profiles_schema/profiles_schema.sql

# ============================================
# المرحلة 2: نظام الأدوار والصلاحيات
# ============================================
psql -f supabase/04_roles_permissions_system/01_roles_permissions_system.sql

# ============================================
# المرحلة 3: خطط الاشتراكات (فقط الخطط)
# ============================================
# خطط اشتراكات الباعة
psql -f supabase/04_seller_subscriptions/01_seller_subscription_plans.sql

# خطط اشتراكات التوصيل
psql -f supabase/05_delivery_subscriptions/01_delivery_subscription_plans.sql

# ============================================
# المرحلة 4: الجداول الرئيسية
# ============================================
# جدول الباعة
psql -f supabase/06_sellers/01_sellers_schema.sql

# جدول موظفي التوصيل (مستقبلاً)
# psql -f supabase/07_delivery_partners/01_delivery_partners_schema.sql

# ============================================
# المرحلة 5: جداول الاشتراكات
# ============================================
# اشتراكات الباعة (بعد إنشاء جدول الباعة!)
psql -f supabase/04_seller_subscriptions/02_seller_subscriptions.sql

# اشتراكات التوصيل (بعد إنشاء جدول التوصيل!)
# psql -f supabase/05_delivery_subscriptions/02_delivery_partner_subscriptions.sql
```

---

## 📊 ملخص الجداول

### المرحلة 1: الإعدادات الأساسية

| المجلد                     | الجدول                  | الوصف                        |
| -------------------------- | ----------------------- | ---------------------------- |
| `01-exchange_rates`        | `exchange_rates`        | أسعار صرف العملات            |
| `02_password_reset_tokens` | `password_reset_tokens` | رموز إعادة تعيين كلمة المرور |
| `03_profiles_schema`       | `profiles`              | ملفات المستخدمين الشخصية     |

### المرحلة 2: نظام الأدوار والصلاحيات

| المجلد                        | الجداول                                                  | الوصف          |
| ----------------------------- | -------------------------------------------------------- | -------------- |
| `04_roles_permissions_system` | `roles`, `permissions`, `user_roles`, `role_permissions` | نظام RBAC كامل |

### المرحلة 3-5: الاشتراكات والباعة

| المجلد                      | الجداول                          | الوصف                    | الترتيب                   |
| --------------------------- | -------------------------------- | ------------------------ | ------------------------- |
| `04_seller_subscriptions`   | `seller_subscription_plans`      | خطط اشتراكات الباعة      | 1                         |
| `04_seller_subscriptions`   | `seller_subscriptions`           | اشتراكات الباعة الفعلية  | 3 (بعد sellers)           |
| `05_delivery_subscriptions` | `delivery_subscription_plans`    | خطط اشتراكات التوصيل     | 1                         |
| `05_delivery_subscriptions` | `delivery_partner_subscriptions` | اشتراكات التوصيل الفعلية | 3 (بعد delivery_partners) |
| `06_sellers`                | `sellers`                        | جدول الباعة              | 2                         |

---

## 📋 خطط الاشتراكات

### 🏪 اشتراكات الباعة (04_seller_subscriptions)

| الخطة      | السعر (USD) | عدد المنتجات  | الميزات                               |
| ---------- | ----------- | ------------- | ------------------------------------- |
| **Free**   | $0          | **50 منتج**   | لوحة تحكم أساسية، دعم عبر البريد      |
| **Silver** | $29/شهر     | **200 منتج**  | إحصائيات متقدمة، دعم أولوي، نطاق مخصص |
| **Gold**   | $99/شهر     | **1000 منتج** | إحصائيات كاملة، دعم 24/7، وصول API    |

### 🚴 اشتراكات التوصيل (05_delivery_subscriptions)

| الخطة      | السعر (USD) | الطلبات/يوم   | العمولة | الميزات                      |
| ---------- | ----------- | ------------- | ------- | ---------------------------- |
| **Free**   | $0          | **3 طلبات**   | **15%** | دعم أساسي، منطقة واحدة       |
| **Silver** | $19/شهر     | **10 طلبات**  | **10%** | دعم أولوي، منطقتي تغطية      |
| **Gold**   | $49/شهر     | **غير محدود** | **5%**  | دعم 24/7، كل المناطق، أولوية |

---

## 📊 مخطط قاعدة البيانات (ERD)

```
┌─────────────────┐
│   auth.users    │ (Supabase Auth - Managed by Supabase)
└────────┬────────┘
         │
         ├──────────────────┐
         │                  │
         ▼                  ▼
┌─────────────────┐  ┌─────────────────┐
│     profiles    │  │     sellers     │ (06_sellers)
├─────────────────┤  ├─────────────────┤
│ id (PK)         │  │ id (PK)         │
│ user_id (FK)    │  │ user_id (FK)    │
│ ...             │  │ store_name      │
└─────────────────┘  │ account_status  │
                     └────────┬────────┘
                              │
                              │ 1:1
                              ▼
                     ┌─────────────────┐
                     │seller_subscript.│ (04_seller_subscriptions/02)
                     ├─────────────────┤
                     │ plan_id (FK)    │
                     │ status          │
                     │ max_products    │
                     └────────┬────────┘
                              │
                              │ N:1
                              ▼
                     ┌─────────────────┐
                     │seller_subscript.│ (04_seller_subscriptions/01)
                     ├─────────────────┤
                     │ plan_type       │
                     │ price_usd       │
                     │ max_products    │
                     └─────────────────┘


┌─────────────────────┐ (مستقبلاً)
│  delivery_partners  │
├─────────────────────┤
│ id (PK)             │
│ user_id (FK)        │
│ vehicle_types       │
│ account_status      │
└──────────┬──────────┘
           │
           │ 1:1
           ▼
┌─────────────────────────┐
│delivery_partner_subscript.│ (05_delivery_subscriptions/02)
├─────────────────────────┤
│ plan_id (FK)            │
│ max_orders_per_day      │
│ commission_rate         │
└────────┬────────────────┘
         │
         │ N:1
         ▼
┌─────────────────────────┐
│delivery_subscription_   │ (05_delivery_subscriptions/01)
│ plans                   │
├─────────────────────────┤
│ plan_type               │
│ price_usd               │
│ max_orders_per_day      │
│ commission_rate         │
└─────────────────────────┘
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
STRIPE_PRICE_ID_FREE=price_xxx
STRIPE_PRICE_ID_SILVER=price_xxx
STRIPE_PRICE_ID_GOLD=price_xxx
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
supabase migration new add_seller_subscriptions

# 3. تطبيق على الإنتاج
supabase db push
```

---

## 🔐 الأمان

### سياسات RLS المفعلة

| الجدول                           | السياسات                           |
| -------------------------------- | ---------------------------------- |
| `roles`                          | قراءة عامة، إدارة للأدمن           |
| `permissions`                    | قراءة عامة، إدارة للأدمن           |
| `user_roles`                     | قراءة للأدوار الخاصة، إدارة للأدمن |
| `seller_subscription_plans`      | قراءة الخطط النشطة، إدارة للأدمن   |
| `seller_subscriptions`           | قراءة/كتابة للبائع، إدارة للأدمن   |
| `delivery_subscription_plans`    | قراءة الخطط النشطة، إدارة للأدمن   |
| `delivery_partner_subscriptions` | قراءة/كتابة للسائق، إدارة للأدمن   |
| `sellers`                        | قراءة/كتابة للبائع، إدارة للأدمن   |
| `profiles`                       | قراءة عامة، كتابة للمالك           |

### دوال التحقق

```sql
-- التحقق من الدور
SELECT public.has_role('admin');

-- التحقق من الصلاحية
SELECT public.has_permission('products:create');

-- التحقق الشامل
SELECT public.can_manage_record('products', product_id, 'delete');

-- التحقق من حد المنتجات (الباعة)
SELECT public.can_add_product();

-- التحقق من حد الطلبات (التوصيل)
SELECT public.can_accept_order();
```

---

## 📚 التوثيق

| الملف                                                                  | الوصف                   |
| ---------------------------------------------------------------------- | ----------------------- |
| [04_roles_permissions_system](./04_roles_permissions_system/README.md) | نظام الأدوار والصلاحيات |
| [04_seller_subscriptions](./04_seller_subscriptions/README.md)         | اشتراكات الباعة         |
| [05_delivery_subscriptions](./05_delivery_subscriptions/README.md)     | اشتراكات التوصيل        |
| [06_sellers](./06_sellers/README.md)                                   | الباعة والمتاجر         |

---

## 🐛 استكشاف الأخطاء

### مشكلة: جدول غير موجود

```sql
-- التحقق من الجداول الموجودة
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
ORDER BY table_name;
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

### مشكلة: دالة غير موجودة

```sql
-- التحقق من الدوال
SELECT routine_name, routine_type
FROM information_schema.routines
WHERE routine_schema = 'public'
  AND routine_type = 'FUNCTION'
ORDER BY routine_name;
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
