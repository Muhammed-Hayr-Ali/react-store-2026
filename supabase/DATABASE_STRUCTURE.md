# 📚 هيكلية قاعدة البيانات - Marketna E-Commerce

## 🎯 نظرة عامة

تم تنظيم قاعدة البيانات في **10 مجلدات مرتبة حسب الأولوية والاعتماديات**. كل مجلد يحتوي على جدول واحد أو مجموعة جداول مرتبطة.

---

## 📋 المجلدات حسب الترتيب

| #   | المجلد                              | الجداول                                                       | الاعتماديات                                        | التوثيق                                                    |
| --- | ----------------------------------- | ------------------------------------------------------------- | -------------------------------------------------- | ---------------------------------------------------------- |
| 1   | `01-exchange_rates`                 | `exchange_rates`                                              | -                                                  | -                                                          |
| 2   | `02_password_reset_tokens`          | `password_reset_tokens`                                       | -                                                  | -                                                          |
| 3   | `03_profiles_schema`                | `profiles`                                                    | `auth.users`                                       | -                                                          |
| 4   | `04_roles_permissions_system`       | `roles`, `permissions`, `user_roles`, `role_permissions`      | -                                                  | [README.md](./04_roles_permissions_system/README.md)       |
| 5   | `05_seller_subscription_plans`      | `seller_subscription_plans`                                   | `04_roles_permissions_system`                      | [README.md](./05_seller_subscription_plans/README.md)      |
| 6   | `06_delivery_subscription_plans`    | `delivery_subscription_plans`                                 | `04_roles_permissions_system`                      | [README.md](./06_delivery_subscription_plans/README.md)    |
| 7   | `07_sellers_table`                  | `sellers`                                                     | `auth.users`, `profiles`                           | [README.md](./07_sellers_table/README.md)                  |
| 8   | `08_delivery_partners`              | `delivery_partners`                                           | `auth.users`, `profiles`                           | [README.md](./08_delivery_partners/README.md)              |
| 9   | `09_delivery_partner_subscriptions` | `delivery_partner_subscriptions`, `delivery_upgrade_requests` | `delivery_partners`, `delivery_subscription_plans` | [README.md](./09_delivery_partner_subscriptions/README.md) |
| 10  | `10_seller_subscriptions`           | `seller_subscriptions`, `seller_upgrade_requests`             | `sellers`, `seller_subscription_plans`             | [README.md](./10_seller_subscriptions/README.md)           |

---

## 🚀 دليل التشغيل السريع

```bash
# 1. الإعدادات الأساسية
psql -f supabase/01-exchange_rates/exchange_rates.sql
psql -f supabase/02_password_reset_tokens/password_reset.sql
psql -f supabase/03_profiles_schema/profiles_schema.sql

# 2. نظام الأدوار والصلاحيات
psql -f supabase/04_roles_permissions_system/01_roles_permissions_system.sql

# 3. خطط الاشتراكات
psql -f supabase/05_seller_subscription_plans/01_seller_subscription_plans.sql
psql -f supabase/06_delivery_subscription_plans/01_delivery_subscription_plans.sql

# 4. الجداول الرئيسية
psql -f supabase/07_sellers_table/01_sellers_schema.sql
psql -f supabase/08_delivery_partners/01_delivery_partners_schema.sql

# 5. جداول الاشتراكات والترقية
psql -f supabase/09_delivery_partner_subscriptions/02_delivery_partner_subscriptions.sql
psql -f supabase/09_delivery_partner_subscriptions/03_delivery_upgrade_requests.sql
psql -f supabase/10_seller_subscriptions/02_seller_subscriptions.sql
psql -f supabase/10_seller_subscriptions/03_upgrade_requests.sql
```

---

## 📊 مخطط الاعتماديات

```
auth.users (Supabase Managed)
    │
    ├─→ profiles (03_profiles_schema)
    │
    ├─→ roles (04_roles_permissions_system)
    │       └─→ permissions (04_roles_permissions_system)
    │               └─→ role_permissions (04_roles_permissions_system)
    │
    ├─→ user_roles (04_roles_permissions_system)
    │
    ├─→ seller_subscription_plans (05_seller_subscription_plans)
    │
    ├─→ delivery_subscription_plans (06_delivery_subscription_plans)
    │
    ├─→ sellers (07_sellers_table)
    │       ├─→ seller_subscriptions (10_seller_subscriptions)
    │       └─→ seller_upgrade_requests (10_seller_subscriptions)
    │
    └─→ delivery_partners (08_delivery_partners)
            ├─→ delivery_partner_subscriptions (09_delivery_partner_subscriptions)
            └─→ delivery_upgrade_requests (09_delivery_partner_subscriptions)
```

---

## 📋 قائمة الجداول الكاملة

| #   | الجدول                           | المجلد                            | الوصف                        |
| --- | -------------------------------- | --------------------------------- | ---------------------------- |
| 1   | `exchange_rates`                 | 01-exchange_rates                 | أسعار صرف العملات            |
| 2   | `password_reset_tokens`          | 02_password_reset_tokens          | رموز إعادة تعيين كلمة المرور |
| 3   | `profiles`                       | 03_profiles_schema                | ملفات المستخدمين الشخصية     |
| 4   | `roles`                          | 04_roles_permissions_system       | أدوار المستخدمين             |
| 5   | `permissions`                    | 04_roles_permissions_system       | الصلاحيات                    |
| 6   | `user_roles`                     | 04_roles_permissions_system       | ربط المستخدمين بالأدوار      |
| 7   | `role_permissions`               | 04_roles_permissions_system       | ربط الأدوار بالصلاحيات       |
| 8   | `seller_subscription_plans`      | 05_seller_subscription_plans      | خطط اشتراكات الباعة          |
| 9   | `delivery_subscription_plans`    | 06_delivery_subscription_plans    | خطط اشتراكات التوصيل         |
| 10  | `sellers`                        | 07_sellers_table                  | الباعة والمتاجر              |
| 11  | `delivery_partners`              | 08_delivery_partners              | موظفي التوصيل                |
| 12  | `delivery_partner_subscriptions` | 09_delivery_partner_subscriptions | اشتراكات التوصيل الفعلية     |
| 13  | `delivery_upgrade_requests`      | 09_delivery_partner_subscriptions | طلبات ترقية التوصيل          |
| 14  | `seller_subscriptions`           | 10_seller_subscriptions           | اشتراكات الباعة الفعلية      |
| 15  | `seller_upgrade_requests`        | 10_seller_subscriptions           | طلبات ترقية الباعة           |

---

## 🔗 روابط التوثيق

| المجلد                              | التوثيق                                                    |
| ----------------------------------- | ---------------------------------------------------------- |
| `04_roles_permissions_system`       | [README.md](./04_roles_permissions_system/README.md)       |
| `05_seller_subscription_plans`      | [README.md](./05_seller_subscription_plans/README.md)      |
| `06_delivery_subscription_plans`    | [README.md](./06_delivery_subscription_plans/README.md)    |
| `07_sellers_table`                  | [README.md](./07_sellers_table/README.md)                  |
| `08_delivery_partners`              | [README.md](./08_delivery_partners/README.md)              |
| `09_delivery_partner_subscriptions` | [README.md](./09_delivery_partner_subscriptions/README.md) |
| `10_seller_subscriptions`           | [README.md](./10_seller_subscriptions/README.md)           |

---

**الإصدار:** 1.0  
**آخر تحديث:** 2026  
**المشروع:** Marketna E-Commerce Platform
