# Marketna E-Commerce - Supabase Database

## 📋 نظرة عامة

هذا المجلد يحتوي على جميع ملفات SQL اللازمة لإعداد قاعدة بيانات Supabase لمنصة Marketna للتجارة الإلكترونية.

**كل جدول في مجلد منفصل ومرقم حسب الترتيب الصحيح للتشغيل.**

---

## 📁 هيكل المجلدات

```
supabase/
├── 01-exchange_rates/              # 1. أسعار الصرف
├── 02_password_reset_tokens/       # 2. رموز إعادة تعيين كلمة المرور
├── 03_profiles_schema/             # 3. ملفات المستخدمين
├── 04_roles_permissions_system/    # 4. نظام الأدوار والصلاحيات
├── 05_seller_subscription_plans/   # 5. خطط اشتراكات الباعة
├── 06_delivery_subscription_plans/ # 6. خطط اشتراكات التوصيل
├── 07_sellers_table/               # 7. جدول الباعة
├── 08_delivery_partners/           # 8. جدول موظفي التوصيل
├── 09_delivery_partner_subscriptions/ # 9. اشتراكات التوصيل
├── 10_seller_subscriptions/        # 10. اشتراكات الباعة
├── sql/                            # ملفات عامة
├── README.md                       # هذا الملف
├── DATABASE_STRUCTURE.md           # هيكلية قاعدة البيانات
└── QUICK_START.md                  # دليل التشغيل السريع
```

---

## 🚀 دليل التثبيت

### **الترتيب الصحيح للتشغيل:**

```bash
# ============================================
# 1. الإعدادات الأساسية
# ============================================
psql -f supabase/01-exchange_rates/exchange_rates.sql
psql -f supabase/02_password_reset_tokens/password_reset.sql
psql -f supabase/03_profiles_schema/profiles_schema.sql

# ============================================
# 2. نظام الأدوار والصلاحيات
# ============================================
psql -f supabase/04_roles_permissions_system/01_roles_permissions_system.sql

# ============================================
# 3. خطط الاشتراكات (فقط الخطط)
# ============================================
# خطط اشتراكات الباعة
psql -f supabase/05_seller_subscription_plans/01_seller_subscription_plans.sql

# خطط اشتراكات التوصيل
psql -f supabase/06_delivery_subscription_plans/01_delivery_subscription_plans.sql

# ============================================
# 4. الجداول الرئيسية
# ============================================
# جدول الباعة
psql -f supabase/07_sellers_table/01_sellers_schema.sql

# جدول موظفي التوصيل
psql -f supabase/08_delivery_partners/01_delivery_partners_schema.sql

# ============================================
# 5. جداول الاشتراكات
# ============================================
# اشتراكات التوصيل (بعد إنشاء جدول التوصيل!)
psql -f supabase/09_delivery_partner_subscriptions/02_delivery_partner_subscriptions.sql

# اشتراكات الباعة (بعد إنشاء جدول الباعة!)
psql -f supabase/10_seller_subscriptions/02_seller_subscriptions.sql
```

---

## 📊 ملخص الجداول

| #   | المجلد                              | الجدول                                                   | الوصف                        | الاعتماديات                                        |
| --- | ----------------------------------- | -------------------------------------------------------- | ---------------------------- | -------------------------------------------------- |
| 1   | `01-exchange_rates`                 | `exchange_rates`                                         | أسعار صرف العملات            | -                                                  |
| 2   | `02_password_reset_tokens`          | `password_reset_tokens`                                  | رموز إعادة تعيين كلمة المرور | -                                                  |
| 3   | `03_profiles_schema`                | `profiles`                                               | ملفات المستخدمين الشخصية     | `auth.users`                                       |
| 4   | `04_roles_permissions_system`       | `roles`, `permissions`, `user_roles`, `role_permissions` | نظام RBAC                    | -                                                  |
| 5   | `05_seller_subscription_plans`      | `seller_subscription_plans`                              | خطط اشتراكات الباعة          | -                                                  |
| 6   | `06_delivery_subscription_plans`    | `delivery_subscription_plans`                            | خطط اشتراكات التوصيل         | -                                                  |
| 7   | `07_sellers_table`                  | `sellers`                                                | الباعة والمتاجر              | `auth.users`, `profiles` (اختياري)                 |
| 8   | `08_delivery_partners`              | `delivery_partners`                                      | موظفي التوصيل                | `auth.users`, `profiles` (اختياري)                 |
| 9   | `09_delivery_partner_subscriptions` | `delivery_partner_subscriptions`                         | اشتراكات التوصيل الفعلية     | `delivery_partners`, `delivery_subscription_plans` |
| 10  | `10_seller_subscriptions`           | `seller_subscriptions`                                   | اشتراكات الباعة الفعلية      | `sellers`, `seller_subscription_plans`             |

---

## 📋 خطط الاشتراكات

### 🏪 اشتراكات الباعة

| الخطة      | السعر (USD) | عدد المنتجات  |
| ---------- | ----------- | ------------- |
| **Free**   | $0          | **50 منتج**   |
| **Silver** | $29/شهر     | **200 منتج**  |
| **Gold**   | $99/شهر     | **1000 منتج** |

### 🚴 اشتراكات التوصيل

| الخطة      | السعر (USD) | الطلبات/يوم   | العمولة |
| ---------- | ----------- | ------------- | ------- |
| **Free**   | $0          | **3 طلبات**   | **15%** |
| **Silver** | $19/شهر     | **10 طلبات**  | **10%** |
| **Gold**   | $49/شهر     | **غير محدود** | **5%**  |

---

## 📊 مخطط قاعدة البيانات (ERD)

```
auth.users (Supabase Managed)
    │
    ├─→ profiles (03_profiles_schema)
    │
    ├─→ user_roles (04_roles_permissions_system)
    │       ├─→ roles (04_roles_permissions_system)
    │       └─→ permissions (04_roles_permissions_system)
    │               └─→ role_permissions (04_roles_permissions_system)
    │
    ├─→ seller_subscription_plans (05_seller_subscription_plans)
    │
    ├─→ delivery_subscription_plans (06_delivery_subscription_plans)
    │
    ├─→ sellers (07_sellers_table)
    │       └─→ seller_subscriptions (10_seller_subscriptions)
    │
    └─→ delivery_partners (08_delivery_partners)
            └─→ delivery_partner_subscriptions (09_delivery_partner_subscriptions)
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
CREATE EXTENSION IF NOT EXISTS pg_trgm;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
```

---

## 📚 التوثيق

| المجلد                              | التوثيق                                                    |
| ----------------------------------- | ---------------------------------------------------------- |
| `04_roles_permissions_system`       | [README.md](./04_roles_permissions_system/README.md)       |
| `05_seller_subscription_plans`      | [README.md](./05_seller_subscription_plans/README.md)      |
| `06_delivery_subscription_plans`    | [README.md](./06_delivery_subscription_plans/README.md)    |
| `07_sellers_table`                  | [README.md](./07_sellers_table/README.md)                  |
| `08_delivery_partners`              | [README.md](./08_delivery_partners/README.md)              |
| `09_delivery_partner_subscriptions` | [README.md](./09_delivery_partner_subscriptions/README.md) |
| `10_seller_subscriptions`           | [README.md](./10_seller_subscriptions/README.md)           |

**ملفات التوثيق العامة:**

- [DATABASE_STRUCTURE.md](./DATABASE_STRUCTURE.md) - هيكلية قاعدة البيانات
- [QUICK_START.md](./QUICK_START.md) - دليل التشغيل السريع

---

## 🐛 استكشاف الأخطاء

### مشكلة: جدول غير موجود

```sql
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
ORDER BY table_name;
```

### مشكلة: صلاحيات غير كافية

```sql
SELECT * FROM public.get_user_roles();
SELECT * FROM public.get_user_permissions();
```

---

## 📞 الدعم

- 📧 البريد: support@marketna.com
- 📚 التوثيق: https://docs.marketna.com

---

**الإصدار:** 1.0  
**آخر تحديث:** 2026  
**المشروع:** Marketna E-Commerce Platform
