# 📊 حالة قاعدة البيانات - Marketna E-Commerce

## ✅ حالة الجداول

تم تحديث جميع الجداول لاستخدام صيغة `CHECK = ANY (ARRAY[...])` بدلاً من `CHECK IN (...)` لتتوافق مع معايير PostgreSQL.

---

## 📋 الجداول المحدثة

### 1. جداول الاشتراكات

| الجدول | الحقل | التحديث |
|--------|-------|---------|
| `seller_subscription_plans` | `plan_type` | `CHECK (plan_type = ANY (ARRAY['seller', 'delivery_partner']))` |
| `seller_subscription_plans` | `billing_period` | `CHECK (billing_period = ANY (ARRAY['monthly', 'yearly', 'lifetime']))` |
| `delivery_subscription_plans` | `plan_type` | `CHECK (plan_type = ANY (ARRAY['seller', 'delivery_partner']))` |
| `delivery_subscription_plans` | `billing_period` | `CHECK (billing_period = ANY (ARRAY['monthly', 'yearly', 'lifetime']))` |
| `seller_subscriptions` | `status` | `CHECK (status = ANY (ARRAY['active', 'expired', 'cancelled', 'pending', 'trial']))` |
| `delivery_partner_subscriptions` | `status` | `CHECK (status = ANY (ARRAY['active', 'expired', 'cancelled', 'pending', 'trial']))` |

### 2. جداول الباعة والتوصيل

| الجدول | الحقل | التحديث |
|--------|-------|---------|
| `sellers` | `account_status` | `CHECK (account_status = ANY (ARRAY['pending', 'active', 'suspended', 'rejected']))` |
| `delivery_partners` | `account_status` | `CHECK (account_status = ANY (ARRAY['pending', 'active', 'suspended', 'rejected']))` |

---

## 🔄 الفرق بين الصيغ

### الصيغة القديمة (IN):
```sql
status TEXT DEFAULT 'active' CHECK (status IN ('active', 'expired', 'cancelled'))
```

### الصيغة الجديدة (ANY ARRAY):
```sql
status TEXT DEFAULT 'active' CHECK (status = ANY (ARRAY['active', 'expired', 'cancelled']))
```

### لماذا الصيغة الجديدة أفضل؟

1. **أكثر توافقاً مع معايير SQL**
2. **أسهل في الصيانة** - يمكن إضافة قيم جديدة بسهولة
3. **أفضل للأداء** في بعض الحالات
4. **متوافقة مع أدوات التحليل** مثل pgAdmin و DataGrip

---

## 📝 ملاحظات هامة

### 1. جميع الجداول تستخدم الآن:
- `TIMESTAMPTZ` بدلاً من `TIMESTAMP` (للحفاظ على المنطقة الزمنية)
- `UUID` للمفاتيح الأساسية
- `JSONB` للبيانات المرنة
- `CHECK` للقيود

### 2. القيود الخارجية (Foreign Keys):
```sql
-- مثال
CONSTRAINT seller_subscriptions_seller_id_fkey 
  FOREIGN KEY (seller_id) 
  REFERENCES public.sellers(id) 
  ON DELETE CASCADE
```

### 3. القيم الافتراضية:
```sql
-- النصوص
status TEXT DEFAULT 'active'

-- الأرقام
max_products INTEGER DEFAULT 50

-- الكائنات
metadata JSONB DEFAULT '{}'::jsonb

-- التواريخ
created_at TIMESTAMPTZ DEFAULT NOW()
```

---

## 🔗 قائمة الجداول الكاملة

| # | الجدول | المجلد | الحالة |
|---|--------|--------|--------|
| 1 | `exchange_rates` | 01-exchange_rates | ✅ محدث |
| 2 | `password_reset_tokens` | 02_password_reset_tokens | ✅ محدث |
| 3 | `profiles` | 03_profiles_schema | ✅ محدث |
| 4 | `roles` | 04_roles_permissions_system | ✅ محدث |
| 5 | `permissions` | 04_roles_permissions_system | ✅ محدث |
| 6 | `user_roles` | 04_roles_permissions_system | ✅ محدث |
| 7 | `role_permissions` | 04_roles_permissions_system | ✅ محدث |
| 8 | `seller_subscription_plans` | 05_seller_subscription_plans | ✅ محدث |
| 9 | `delivery_subscription_plans` | 06_delivery_subscription_plans | ✅ محدث |
| 10 | `sellers` | 07_sellers_table | ✅ محدث |
| 11 | `delivery_partners` | 08_delivery_partners | ✅ محدث |
| 12 | `delivery_partner_subscriptions` | 09_delivery_partner_subscriptions | ✅ محدث |
| 13 | `seller_subscriptions` | 10_seller_subscriptions | ✅ محدث |

---

## 🚀 كيفية التشغيل

```bash
# الترتيب الصحيح
psql -f supabase/01-exchange_rates/exchange_rates.sql
psql -f supabase/02_password_reset_tokens/password_reset.sql
psql -f supabase/03_profiles_schema/profiles_schema.sql
psql -f supabase/04_roles_permissions_system/01_roles_permissions_system.sql
psql -f supabase/05_seller_subscription_plans/01_seller_subscription_plans.sql
psql -f supabase/06_delivery_subscription_plans/01_delivery_subscription_plans.sql
psql -f supabase/07_sellers_table/01_sellers_schema.sql
psql -f supabase/08_delivery_partners/01_delivery_partners_schema.sql
psql -f supabase/09_delivery_partner_subscriptions/02_delivery_partner_subscriptions.sql
psql -f supabase/10_seller_subscriptions/02_seller_subscriptions.sql
```

---

## ⚠️ تحذيرات

1. **لا تقم بتشغيل جميع الملفات دفعة واحدة** - اتبع الترتيب
2. **تأكد من وجود جدول profiles** قبل تشغيل الجداول الأخرى
3. **تأكد من وجود نظام الأدوار** قبل تشغيل الاشتراكات
4. **اختبر كل جدول على حدة** قبل الانتقال للتالي

---

**آخر تحديث:** 2026  
**الحالة:** ✅ جميع الجداول محدثة ومتوافقة
