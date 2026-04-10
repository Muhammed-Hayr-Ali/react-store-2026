# 🔄 دوال المشغلات الآلية (Trigger Functions)

## 📋 جدول المحتويات

1. [ما هي المشغلات الآلية؟](#ما-هي-المشغلات-الآلية)
2. [ترتيب التنفيذ](#ترتيب-التنفيذ)
3. [ملخص الملفات والدوال](#ملخص-الملفات-والدوال)
4. [دوال المزامنة](#1-دوال-المزامنة-profile-sync)
5. [دوال الطوابع الزمنية](#2-دوال-الطوابع-الزمنية-timestamps)
6. [دوال البروفايل](#3-دوال-البروفايل-user-profile)
7. [دوال المراقبة والتنظيف](#4-دوال-المراقبة-والتنظيف)
8. [قائمة الـ Triggers](#قائمة-الـ-triggers-18-trigger)
9. [أمثلة عملية](#أمثلة-عملية)

---

## ما هي المشغلات الآلية؟

المشغلات الآلية (Triggers) هي دوال SQL تُنفذ **تلقائياً** عند حدوث حدث معين على جدول (INSERT, UPDATE, DELETE).

### ⚡ الاستخدام في هذا المشروع:

| النوع                | الوصف                                                      |
| -------------------- | ---------------------------------------------------------- |
| 🔐 **Profile Sync**  | مزامنة `auth.users` مع `core_profile` تلقائياً عند التسجيل |
| ⏰ **Timestamps**    | تحديث `updated_at` تلقائياً عند تعديل أي صف                |
| 👤 **Profile Fetch** | جلب بيانات المستخدم الكاملة للـ Auth Provider              |
| 🧹 **Cleanup**       | تنظيف البروفايلات غير المتزامنة                            |

---

## ترتيب التنفيذ

```
1️⃣ 001_Schema/001_schema.sql              ← إنشاء الجداول
2️⃣ 002_Utility Functions/...sql            ← الدوال المساعدة
3️⃣ 003_RLS Policies/...sql                 ← سياسات الأمان
4️⃣ 004_Seed Data/001_role_seed.sql         ← بيانات الأدوار
5️⃣ 005_Trigger Functions/000_...sql        ← المشغلات الآلية ← أنت هنا
6️⃣ 005_Trigger Functions/001_...sql        ← دوال البروفايل
```

---

## ملخص الملفات والدوال

| الملف                       | عدد الدوال | عدد الـ Triggers | الوصف                                 |
| --------------------------- | ---------- | ---------------- | ------------------------------------- |
| `000_trigger_functions.sql` | 7 دوال     | 18 Trigger       | المزامنة، الطوابع الزمنية، التنظيف    |
| `001_get_user_profile.sql`  | 2 دوال     | 0                | جلب بيانات المستخدم للـ Auth Provider |
| `002_create_test_user.sql`  | -          | 0                | مستخدمين اختباريين (تطوير فقط)        |
| **المجموع**                 | **9 دوال** | **18 Trigger**   |                                       |

---

## 1️⃣ دوال المزامنة (Profile Sync)

### `sync_profile_data()`

**الغاية:** مزامنة `auth.users` مع `core_profile` تلقائياً

| الخاصية               | القيمة                                    |
| --------------------- | ----------------------------------------- |
| **المدخلات**          | لا يوجد (تُستدعى عبر Trigger)             |
| **المخرجات**          | `trigger`                                 |
| **اللغة**             | PL/pgSQL                                  |
| **الأمان**            | SECURITY DEFINER                          |
| **الجداول المستخدمة** | `auth.users`, `core_profile`, `core_role` |

**متى تُنفذ؟**

- عند `INSERT` على `auth.users`
- عند `UPDATE` لـ `email` أو `raw_user_meta_data`

**ما تفعله:**

1. ✅ تُنشئ أو تُحدث `core_profile`
2. ✅ تعين دور `customer` تلقائياً للمستخدم الجديد
3. ✅ تستخدم `ON CONFLICT DO UPDATE` للأمان

**الكود:**

```sql
CREATE TRIGGER on_auth_user_created
  AFTER INSERT OR UPDATE OF email, raw_user_meta_data
  ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.sync_profile_data();
```

---

## 2️⃣ دوال الطوابع الزمنية (Timestamps)

### `update_updated_at_column()`

**الغاية:** تحديث حقل `updated_at` تلقائياً عند أي تعديل

| الخاصية      | القيمة                        |
| ------------ | ----------------------------- |
| **المدخلات** | لا يوجد (تُستدعى عبر Trigger) |
| **المخرجات** | `trigger`                     |
| **اللغة**    | PL/pgSQL                      |

**الكود:**

```sql
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;
```

### `update_exchange_rate_timestamp()`

**الغاية:** تحديث `last_updated_at` لجدول أسعار الصرف (لأن اسم الحقل مختلف)

---

## 3️⃣ دوال البروفايل (User Profile)

### `get_user_full_profile()`

**الغاية:** إرجاع بيانات المستخدم الكاملة كـ JSON للـ Auth Provider

| الخاصية               | القيمة                                           |
| --------------------- | ------------------------------------------------ |
| **المدخلات**          | لا يوجد                                          |
| **المخرجات**          | `jsonb`                                          |
| **الجداول المستخدمة** | `core_profile`, `core_role`, `core_profile_role` |

**النتيجة:**

```json
{
  "profile": {
    "id": "uuid",
    "email": "user@test.com",
    "full_name": "أحمد محمد",
    "avatar_url": "...",
    "phone_number": "...",
    "created_at": "2026-04-08T..."
  },
  "roles": [
    {
      "code": "customer",
      "description": "تصفح وشراء",
      "permissions": ["products:read", "orders:create", ...]
    }
  ],
  "permissions": ["products:read", "orders:create", ...]
}
```

**الاستخدام في Next.js:**

```typescript
const { data } = await supabase.rpc("get_user_full_profile");
// تُستخدم في AuthProvider لتخزين حالة المستخدم
```

---

### `get_user_profile_with_roles()`

**الغاية:** إرجاع البروفايل مع الأدوار كجدول SQL

---

## 4️⃣ دوال المراقبة والتنظيف

### `check_profile_sync_status()`

**الغاية:** التحقق من حالة مزامنة `auth.users` مع `core_profile`

**النتيجة:**

```
 user_id | email | profile_exists | sync_status | last_synced
---------|-------|----------------|-------------|----------------
 uuid-1  | ...   | true           | SYNCED      | 2026-04-08...
 uuid-2  | ...   | false          | NOT_SYNCED  | null
```

---

### `cleanup_unsynced_profiles()`

**الغاية:** تنظيف البروفايلات غير المتزامنة (حذف ناعم)

**ما تفعله:**

1. ✅ تضع `deleted_at` للبروفايلات اليتيمة (بدل الحذف النهائي)
2. ✅ تُنشئ بروفايلات للمستخدمين المفقودين
3. ✅ ترجع عدد المحذوفات والمنشآت

---

## قائمة الـ Triggers (18 Trigger)

### ✅ Core Module (5)

| الجدول                | الـ Trigger                             | الحقل        |
| --------------------- | --------------------------------------- | ------------ |
| `core_profile`        | `update_core_profile_updated_at`        | `updated_at` |
| `core_role`           | `update_core_role_updated_at`           | `updated_at` |
| `core_profile_role`   | `update_core_profile_role_updated_at`   | `updated_at` |
| `core_address`        | `update_core_address_updated_at`        | `updated_at` |
| `auth_password_reset` | `update_auth_password_reset_updated_at` | `updated_at` |

### ✅ Store Module (5)

| الجدول            | الـ Trigger                         | الحقل        |
| ----------------- | ----------------------------------- | ------------ |
| `store_settings`  | `update_store_settings_updated_at`  | `updated_at` |
| `store_category`  | `update_store_category_updated_at`  | `updated_at` |
| `store_product`   | `update_store_product_updated_at`   | `updated_at` |
| `product_image`   | `update_product_image_updated_at`   | `updated_at` |
| `product_variant` | `update_product_variant_updated_at` | `updated_at` |

### ✅ Exchange Rates (1)

| الجدول           | الـ Trigger                        | الحقل             |
| ---------------- | ---------------------------------- | ----------------- |
| `exchange_rates` | `update_exchange_rates_updated_at` | `last_updated_at` |

### ✅ Trade Module (2)

| الجدول                 | الـ Trigger                              | الحقل        |
| ---------------------- | ---------------------------------------- | ------------ |
| `trade_order`          | `update_trade_order_updated_at`          | `updated_at` |
| `trade_order_delivery` | `update_trade_order_delivery_updated_at` | `updated_at` |

### ✅ Support Module (2)

| الجدول           | الـ Trigger                        | الحقل        |
| ---------------- | ---------------------------------- | ------------ |
| `support_ticket` | `update_support_ticket_updated_at` | `updated_at` |
| `ticket_message` | `update_ticket_message_updated_at` | `updated_at` |

### ✅ System Module (3)

| الجدول             | الـ Trigger                          | الحقل        |
| ------------------ | ------------------------------------ | ------------ |
| `sys_notification` | `update_sys_notification_updated_at` | `updated_at` |
| `system_error_log` | `update_system_error_log_updated_at` | `updated_at` |
| `auth.users`       | `on_auth_user_created`               | Profile Sync |

### ❌ جداول بدون Trigger (لا تحتوي `updated_at`)

- `trade_order_item`
- `social_review`
- `customer_favorite`

---

## أمثلة عملية

### مثال 1: تسجيل مستخدم جديد

```sql
-- عندما يسجل المستخدم عبر Supabase Auth
-- يتم تشغيل on_auth_user_created تلقائياً
-- النتيجة: يُنشأ core_profile + يُمنح دور customer
```

### مثال 2: تحديث منتج

```sql
UPDATE store_product SET price_base = 100 WHERE id = 'uuid';
-- Trigger يُحدث updated_at تلقائياً
-- النتيجة: updated_at = NOW()
```

### مثال 3: جلب بيانات المستخدم

```sql
SELECT public.get_user_full_profile();
-- يُستخدم في Next.js Auth Provider
-- يرجع JSON كامل بالأدوار والصلاحيات
```

### مثال 4: التحقق من المزامنة

```sql
SELECT * FROM public.check_profile_sync_status();
-- يُظهر حالة مزامنة جميع المستخدمين
```

---

## ⚡ التحسينات المطبقة

| التحسين                         | الوصف                                    |
| ------------------------------- | ---------------------------------------- |
| ✅ إضافة Triggers جديدة         | `store_settings`, `trade_order_delivery` |
| ✅ دالة مخصصة لـ exchange_rates | `last_updated_at` بدلاً من `updated_at`  |
| ✅ معالجة الأخطاء               | استخدام `NULLIF` و `COALESCE`            |
| ✅ توثيق شامل                   | كل دالة و Trigger موثقة                  |

---

**📅 آخر تحديث:** 2026-04-08  
**📦 الإصدار:** 1.0.0  
**🔧 إجمالي الدوال:** 9 دوال  
**⚡ إجمالي الـ Triggers:** 18 Trigger  
**✅ المطابقة:** 100% مع الجداول الجديدة
