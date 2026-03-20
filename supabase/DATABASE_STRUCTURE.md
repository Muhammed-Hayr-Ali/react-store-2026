# 📚 توثيق هيكلية قاعدة البيانات

## 🎯 نظرة عامة على الهيكل

تم تنظيم قاعدة البيانات في **7 مراحل** مرتبة حسب الأولوية والاعتماديات.

---

## 📋 المراحل السبع

### المرحلة 1: الإعدادات الأساسية
**المجلدات:** `01-exchange_rates`, `02_password_reset_tokens`, `03_profiles_schema`

| الجدول | الوصف | الاعتماديات |
|--------|-------|-------------|
| `exchange_rates` | أسعار صرف العملات | - |
| `password_reset_tokens` | رموز إعادة تعيين كلمة المرور | - |
| `profiles` | ملفات المستخدمين الشخصية | `auth.users` |

**ملفات SQL:**
```bash
supabase/01-exchange_rates/exchange_rates.sql
supabase/02_password_reset_tokens/password_reset.sql
supabase/03_profiles_schema/profiles_schema.sql
```

---

### المرحلة 2: نظام الأدوار والصلاحيات
**المجلد:** `04_roles_permissions_system`

**الجداول:**
| الجدول | الوصف | الاعتماديات |
|--------|-------|-------------|
| `roles` | الأدوار (admin, seller, customer, etc.) | - |
| `permissions` | الصلاحيات (products:create, etc.) | - |
| `user_roles` | ربط المستخدمين بالأدوار | `auth.users`, `roles` |
| `role_permissions` | ربط الأدوار بالصلاحيات | `roles`, `permissions` |

**ملف SQL:**
```bash
supabase/04_roles_permissions_system/01_roles_permissions_system.sql
```

**الدوال الرئيسية:**
- `has_role(role_name)` - التحقق من دور المستخدم
- `has_permission(permission_name)` - التحقق من الصلاحية
- `is_admin()` - التحقق من أن المستخدم مدير
- `get_user_roles()` - الحصول على أدوار المستخدم
- `get_user_permissions()` - الحصول على صلاحيات المستخدم

---

### المرحلة 3: خطط الاشتراكات
**المجلدات:** `04_seller_subscriptions`, `05_delivery_subscriptions`

#### 3أ. خطط اشتراكات الباعة
| الجدول | الوصف | الاعتماديات |
|--------|-------|-------------|
| `seller_subscription_plans` | خطط الباعة (Free, Silver, Gold) | - |

**ملف SQL:**
```bash
supabase/04_seller_subscriptions/01_seller_subscription_plans.sql
```

#### 3ب. خطط اشتراكات التوصيل
| الجدول | الوصف | الاعتماديات |
|--------|-------|-------------|
| `delivery_subscription_plans` | خطط التوصيل (Free, Silver, Gold) | - |

**ملف SQL:**
```bash
supabase/05_delivery_subscriptions/01_delivery_subscription_plans.sql
```

---

### المرحلة 4: الجداول الرئيسية
**المجلد:** `06_sellers`

| الجدول | الوصف | الاعتماديات |
|--------|-------|-------------|
| `sellers` | الباعة والمتاجر | `auth.users`, `profiles` (اختياري) |

**ملف SQL:**
```bash
supabase/06_sellers/01_sellers_schema.sql
```

**الدوال الرئيسية:**
- `create_seller(...)` - إنشاء سجل بائع جديد
- `approve_seller(id)` - الموافقة على بائع
- `reject_seller(id, reason)` - رفض بائع
- `suspend_seller(id, reason)` - إيقاف بائع
- `update_seller_store(...)` - تحديث معلومات المتجر

---

### المرحلة 5: جداول الاشتراكات
**المجلدات:** `04_seller_subscriptions`, `05_delivery_subscriptions`

#### 5أ. اشتراكات الباعة
| الجدول | الوصف | الاعتماديات |
|--------|-------|-------------|
| `seller_subscriptions` | اشتراكات الباعة الفعلية | `sellers`, `seller_subscription_plans` |

**ملف SQL:**
```bash
supabase/04_seller_subscriptions/02_seller_subscriptions.sql
```

#### 5ب. اشتراكات التوصيل
| الجدول | الوصف | الاعتماديات |
|--------|-------|-------------|
| `delivery_partner_subscriptions` | اشتراكات التوصيل الفعلية | `delivery_partners`, `delivery_subscription_plans` |

**ملف SQL:**
```bash
supabase/05_delivery_subscriptions/02_delivery_partner_subscriptions.sql
```

---

## 📊 مخطط الاعتماديات الكامل

```
auth.users (Supabase Managed)
    │
    ├─→ profiles (03_profiles_schema)
    │
    ├─→ user_roles (04_roles_permissions_system)
    │       └─→ roles (04_roles_permissions_system)
    │
    ├─→ sellers (06_sellers)
    │       └─→ seller_subscriptions (04_seller_subscriptions/02)
    │               └─→ seller_subscription_plans (04_seller_subscriptions/01)
    │
    └─→ delivery_partners (مستقبلاً)
            └─→ delivery_partner_subscriptions (05_delivery_subscriptions/02)
                    └─→ delivery_subscription_plans (05_delivery_subscriptions/01)


auth.users
    │
    └─→ roles (04_roles_permissions_system)
            └─→ permissions (04_roles_permissions_system)
                    └─→ role_permissions (04_roles_permissions_system)
```

---

## 🚀 دليل التثبيت السريع

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
# المرحلة 3: خطط الاشتراكات
# ============================================
psql -f supabase/04_seller_subscriptions/01_seller_subscription_plans.sql
psql -f supabase/05_delivery_subscriptions/01_delivery_subscription_plans.sql

# ============================================
# المرحلة 4: الجداول الرئيسية
# ============================================
psql -f supabase/06_sellers/01_sellers_schema.sql

# ============================================
# المرحلة 5: جداول الاشتراكات
# ============================================
psql -f supabase/04_seller_subscriptions/02_seller_subscriptions.sql
# psql -f supabase/05_delivery_subscriptions/02_delivery_partner_subscriptions.sql
```

---

## 📋 قائمة الجداول الكاملة

| # | الجدول | المجلد | الوصف |
|---|--------|--------|-------|
| 1 | `exchange_rates` | 01-exchange_rates | أسعار صرف العملات |
| 2 | `password_reset_tokens` | 02_password_reset_tokens | رموز إعادة تعيين كلمة المرور |
| 3 | `profiles` | 03_profiles_schema | ملفات المستخدمين الشخصية |
| 4 | `roles` | 04_roles_permissions_system | أدوار المستخدمين |
| 5 | `permissions` | 04_roles_permissions_system | الصلاحيات |
| 6 | `user_roles` | 04_roles_permissions_system | ربط المستخدمين بالأدوار |
| 7 | `role_permissions` | 04_roles_permissions_system | ربط الأدوار بالصلاحيات |
| 8 | `seller_subscription_plans` | 04_seller_subscriptions | خطط اشتراكات الباعة |
| 9 | `delivery_subscription_plans` | 05_delivery_subscriptions | خطط اشتراكات التوصيل |
| 10 | `sellers` | 06_sellers | الباعة والمتاجر |
| 11 | `seller_subscriptions` | 04_seller_subscriptions | اشتراكات الباعة الفعلية |
| 12 | `delivery_partner_subscriptions` | 05_delivery_subscriptions | اشتراكات التوصيل الفعلية |

---

## 🔗 روابط التوثيق

| المجلد | التوثيق |
|--------|---------|
| `04_roles_permissions_system` | [README.md](./04_roles_permissions_system/README.md) |
| `04_seller_subscriptions` | [README.md](./04_seller_subscriptions/README.md) |
| `05_delivery_subscriptions` | [README.md](./05_delivery_subscriptions/README.md) |
| `06_sellers` | [README.md](./06_sellers/README.md) |

---

**الإصدار:** 1.0  
**آخر تحديث:** 2026  
**المشروع:** Marketna E-Commerce Platform
