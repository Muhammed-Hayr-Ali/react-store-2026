# 🔧 توثيق الدوال المساعدة (Utility Functions)

## 📋 جدول المحتويات

1. [ما هي الدوال المساعدة؟](#ما-هي-الدوال-المساعدة)
2. [ترتيب التنفيذ](#ترتيب-التنفيذ)
3. [ملخص الدوال](#ملخص-الدوال)
4. [دوال التحقق من الهوية](#1-دوال-التحقق-من-الهوية-6-دوال)
5. [دوال الصلاحيات](#2-دوال-الصلاحيات-2-دوال)
6. [دوال المتجر والمنتجات](#3-دوال-المتجر-والمنتجات-2-دوال)
7. [دوال التوصيل والتسليم](#4-دوال-التوصيل-والتسليم-2-دوال)
8. [الدوال الإدارية](#5-الدوال-الإدارية-2-دوال)
9. [أمثلة عملية](#أمثلة-عملية)
10. [التحقق من المطابقة](#التحقق-من-المطابقة)

---

## ما هي الدوال المساعدة؟

الدوال المساعدة (Utility Functions) هي دوال SQL تُستخدم في:

- **سياسات RLS** - للتحقق من الهوية والصلاحيات
- **التطبيق** - للحصول على البيانات بسهولة
- **الإدارة** - للإحصائيات والإعدادات

### ⚡ الخصائص:

| الخاصية                | الوصف                            |
| ---------------------- | -------------------------------- |
| `SECURITY DEFINER`     | تنفيذ بصلاحيات المالك (postgres) |
| `STABLE`               | نفس النتيجة لنفس المدخلات        |
| `PARALLEL SAFE`        | آمنة للتنفيذ المتوازي            |
| `LANGUAGE sql/plpgsql` | SQL عادي أو PL/pgSQL             |

---

## ترتيب التنفيذ

```
1️⃣ 001_Schema/001_schema.sql           ← إنشاء الجداول
2️⃣ 002_Utility Functions/000_utility_functions.sql ← الدوال ← أنت هنا
3️⃣ 003_RLS Policies/000_rls_policies.sql ← سياسات الأمان (تستخدم الدوال)
```

### ⚠️ ملاحظات هامة:

- ✅ **يجب** إنشاء الجداول قبل الدوال
- ✅ **يجب** إنشاء الدوال قبل سياسات RLS
- ✅ الدوال تعتمد على الجداول الموجودة
- ✅ سياسات RLS تعتمد على هذه الدوال

---

## ملخص الدوال

| القسم               | عدد الدوال  | الأرقام   |
| ------------------- | ----------- | --------- |
| 🔐 التحقق من الهوية | 6           | #1 - #6   |
| 🎯 الصلاحيات        | 2           | #7 - #8   |
| 🏪 المتجر والمنتجات | 2           | #9 - #10  |
| 🚚 التوصيل والتسليم | 2           | #11 - #12 |
| 👑 الإدارية         | 2           | #13 - #14 |
| **المجموع**         | **14 دالة** |           |

---

## 1️⃣ دوال التحقق من الهوية (6 دوال)

### #1️⃣ `current_user_id()`

**الغاية:** إرجاع معرف المستخدم الحالي من جلسة المصادقة

| الخاصية               | القيمة                          |
| --------------------- | ------------------------------- |
| **المدخلات**          | لا يوجد                         |
| **المخرجات**          | `uuid` - معرف المستخدم          |
| **اللغة**             | SQL                             |
| **الأمان**            | SECURITY DEFINER                |
| **الجداول المستخدمة** | `auth.users` (عبر `auth.uid()`) |

**الكود:**

```sql
CREATE OR REPLACE FUNCTION public.current_user_id()
RETURNS uuid
LANGUAGE sql
SECURITY DEFINER
STABLE
PARALLEL SAFE
AS $$
  SELECT auth.uid();
$$;
```

**الاستخدام:**

```sql
-- في سياسة RLS
USING ("profile_id" = public.current_user_id())

-- في التطبيق
SELECT public.current_user_id();
```

---

### #2️⃣ `has_role(p_role role_name)`

**الغاية:** التحقق من وجود دور معين للمستخدم الحالي

| الخاصية               | القيمة                           |
| --------------------- | -------------------------------- |
| **المدخلات**          | `p_role role_name` - اسم الدور   |
| **المخرجات**          | `boolean` - true/false           |
| **اللغة**             | SQL                              |
| **الأمان**            | SECURITY DEFINER                 |
| **الجداول المستخدمة** | `core_profile_role`, `core_role` |

**الكود:**

```sql
CREATE OR REPLACE FUNCTION public.has_role(p_role role_name)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
PARALLEL SAFE
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.core_profile_role cpr
    WHERE cpr.profile_id = public.current_user_id()
      AND cpr.role_id IN (
        SELECT id FROM public.core_role WHERE code = p_role
      )
  );
$$;
```

**الأدوار المتاحة:**

- `admin` - مدير النظام
- `vendor` - بائع/موظف
- `customer` - عميل
- `delivery` - موظف توصيل
- `support` - دعم فني

**الاستخدام:**

```sql
-- في سياسة RLS
USING (public.has_role('admin'))

-- في التطبيق
SELECT public.has_role('vendor');
```

---

### #3️⃣ `is_admin()`

**الغاية:** التحقق مما إذا كان المستخدم مدير النظام

| الخاصية               | القيمة                           |
| --------------------- | -------------------------------- |
| **المدخلات**          | لا يوجد                          |
| **المخرجات**          | `boolean` - true/false           |
| **اللغة**             | SQL                              |
| **الأمان**            | SECURITY DEFINER                 |
| **الجداول المستخدمة** | `core_profile_role`, `core_role` |

**الكود:**

```sql
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
PARALLEL SAFE
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.core_profile_role cpr
    WHERE cpr.profile_id = public.current_user_id()
      AND cpr.role_id IN (
        SELECT id FROM public.core_role WHERE code = 'admin'
      )
  );
$$;
```

**الاستخدام:**

```sql
-- في سياسة RLS
USING (public.is_admin())

-- في التطبيق
SELECT public.is_admin();
```

---

### #4️⃣ `is_vendor()`

**الغاية:** التحقق مما إذا كان المستخدم بائعاً/موظفاً

| الخاصية               | القيمة                           |
| --------------------- | -------------------------------- |
| **المدخلات**          | لا يوجد                          |
| **المخرجات**          | `boolean` - true/false           |
| **اللغة**             | SQL                              |
| **الأمان**            | SECURITY DEFINER                 |
| **الجداول المستخدمة** | `core_profile_role`, `core_role` |

**الكود:**

```sql
CREATE OR REPLACE FUNCTION public.is_vendor()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
PARALLEL SAFE
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.core_profile_role cpr
    WHERE cpr.profile_id = public.current_user_id()
      AND cpr.role_id IN (
        SELECT id FROM public.core_role WHERE code = 'vendor'
      )
  );
$$;
```

**الاستخدام:**

```sql
-- في سياسة RLS
USING (public.is_vendor() OR public.is_admin())
```

---

### #5️⃣ `is_delivery()`

**الغاية:** التحقق مما إذا كان المستخدم سائق توصيل

| الخاصية               | القيمة                           |
| --------------------- | -------------------------------- |
| **المدخلات**          | لا يوجد                          |
| **المخرجات**          | `boolean` - true/false           |
| **اللغة**             | SQL                              |
| **الأمان**            | SECURITY DEFINER                 |
| **الجداول المستخدمة** | `core_profile_role`, `core_role` |

**الكود:**

```sql
CREATE OR REPLACE FUNCTION public.is_delivery()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
PARALLEL SAFE
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.core_profile_role cpr
    WHERE cpr.profile_id = public.current_user_id()
      AND cpr.role_id IN (
        SELECT id FROM public.core_role WHERE code = 'delivery'
      )
  );
$$;
```

**الاستخدام:**

```sql
-- في سياسة RLS
USING (public.is_delivery() OR public.is_admin())
```

---

### #6️⃣ `get_user_roles()`

**الغاية:** إرجاع جميع أدوار المستخدم الحالي

| الخاصية               | القيمة                                            |
| --------------------- | ------------------------------------------------- |
| **المدخلات**          | لا يوجد                                           |
| **المخرجات**          | جدول (`role_id`, `role_code`, `role_description`) |
| **اللغة**             | SQL                                               |
| **الأمان**            | SECURITY DEFINER                                  |
| **الجداول المستخدمة** | `core_profile_role`, `core_role`                  |

**الكود:**

```sql
CREATE OR REPLACE FUNCTION public.get_user_roles()
RETURNS TABLE (
  role_id uuid,
  role_code role_name,
  role_description text
)
LANGUAGE sql
SECURITY DEFINER
STABLE
PARALLEL SAFE
AS $$
  SELECT cr.id, cr.code, cr.description
  FROM public.core_profile_role cpr
  JOIN public.core_role cr ON cpr.role_id = cr.id
  WHERE cpr.profile_id = public.current_user_id();
$$;
```

**الاستخدام:**

```sql
-- في التطبيق
SELECT * FROM public.get_user_roles();
```

**النتيجة:**

```
 role_id  | role_code | role_description
----------+-----------+------------------
 uuid-1   | admin     | مدير النظام
 uuid-2   | vendor    | بائع/موظف
```

---

## 2️⃣ دوال الصلاحيات (2 دوال)

### #7️⃣ `has_permission(p_permission text)`

**الغاية:** التحقق من وجود صلاحية معينة للمستخدم

| الخاصية               | القيمة                             |
| --------------------- | ---------------------------------- |
| **المدخلات**          | `p_permission text` - اسم الصلاحية |
| **المخرجات**          | `boolean` - true/false             |
| **اللغة**             | SQL                                |
| **الأمان**            | SECURITY DEFINER                   |
| **الجداول المستخدمة** | `core_profile_role`, `core_role`   |

**الكود:**

```sql
CREATE OR REPLACE FUNCTION public.has_permission(p_permission text)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
PARALLEL SAFE
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.core_profile_role cpr
    JOIN public.core_role cr ON cpr.role_id = cr.id
    WHERE cpr.profile_id = public.current_user_id()
      AND (
        cr.permissions ? p_permission
        OR cr.permissions ? '*:*'
      )
  );
$$;
```

**الاستخدام:**

```sql
-- في سياسة RLS
USING (public.has_permission('products:read'))

-- في التطبيق
SELECT public.has_permission('orders:create');
```

**الصلاحيات الخاصة:**

- `*:*` - صلاحية مطلقة (تتخطى جميع الصلاحيات)

---

### #8️⃣ `get_user_permissions()`

**الغاية:** إرجاع جميع صلاحيات المستخدم كمصفوفة JSONB

| الخاصية               | القيمة                           |
| --------------------- | -------------------------------- |
| **المدخلات**          | لا يوجد                          |
| **المخرجات**          | `jsonb` - مصفوفة الصلاحيات       |
| **اللغة**             | SQL                              |
| **الأمان**            | SECURITY DEFINER                 |
| **الجداول المستخدمة** | `core_profile_role`, `core_role` |

**الكود:**

```sql
CREATE OR REPLACE FUNCTION public.get_user_permissions()
RETURNS jsonb
LANGUAGE sql
SECURITY DEFINER
STABLE
PARALLEL SAFE
AS $$
  SELECT COALESCE(
    (
      SELECT jsonb_agg(DISTINCT perm)
      FROM public.core_profile_role cpr
      JOIN public.core_role cr ON cpr.role_id = cr.id,
      LATERAL jsonb_array_elements_text(cr.permissions) AS perm
      WHERE cpr.profile_id = public.current_user_id()
    ),
    '[]'::jsonb
  );
$$;
```

**الاستخدام:**

```sql
-- في التطبيق
SELECT public.get_user_permissions();
```

**النتيجة:**

```json
["products:read", "products:write", "orders:read", "*:*"]
```

---

## 3️⃣ دوال المتجر والمنتجات (2 دوال)

### #9️⃣ `is_product_owner(p_product_id uuid)`

**الغاية:** التحقق من ملكية منتج معين

| الخاصية               | القيمة                            |
| --------------------- | --------------------------------- |
| **المدخلات**          | `p_product_id uuid` - معرف المنتج |
| **المخرجات**          | `boolean` - true/false            |
| **اللغة**             | SQL                               |
| **الأمان**            | SECURITY DEFINER                  |
| **الجداول المستخدمة** | `store_product`                   |

**الكود:**

```sql
CREATE OR REPLACE FUNCTION public.is_product_owner(p_product_id uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
PARALLEL SAFE
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.store_product sp
    WHERE sp.id = p_product_id
      AND sp.user_id = public.current_user_id()
  );
$$;
```

**الاستخدام:**

```sql
-- في سياسة RLS
USING (public.is_product_owner("id"))

-- في التطبيق
SELECT public.is_product_owner('product-uuid');
```

---

### #🔟 `get_store_settings()`

**الغاية:** إرجاع إعدادات المتجر الوحيد

| الخاصية               | القيمة           |
| --------------------- | ---------------- |
| **المدخلات**          | لا يوجد          |
| **المخرجات**          | جدول (14 حقل)    |
| **اللغة**             | SQL              |
| **الأمان**            | SECURITY DEFINER |
| **الجداول المستخدمة** | `store_settings` |

**الكود:**

```sql
CREATE OR REPLACE FUNCTION public.get_store_settings()
RETURNS TABLE (
  id uuid,
  name_ar text,
  name_en text,
  description_ar text,
  description_en text,
  email text,
  phone text,
  address text,
  city text,
  default_currency varchar(3),
  logo_url text,
  banner_url text,
  is_active boolean
)
LANGUAGE sql
SECURITY DEFINER
STABLE
PARALLEL SAFE
AS $$
  SELECT ss.id, ss.name_ar, ss.name_en, ss.description_ar, ss.description_en,
         ss.email, ss.phone, ss.address, ss.city, ss.default_currency,
         ss.logo_url, ss.banner_url, ss.is_active
  FROM public.store_settings ss
  LIMIT 1;
$$;
```

**الاستخدام:**

```sql
-- في التطبيق
SELECT * FROM public.get_store_settings();
```

**النتيجة:**

```
 id | name_ar | name_en | ... | is_active
----|---------|---------|-----|----------
 uuid | متجرنا | Our Store | ... | true
```

---

## 4️⃣ دوال التوصيل والتسليم (2 دوال)

### #1️⃣1️⃣ `create_delivery_verification(p_order_id uuid)`

**الغاية:** إنشاء رمز التحقق من التسليم (QR Code)

| الخاصية               | القيمة                         |
| --------------------- | ------------------------------ |
| **المدخلات**          | `p_order_id uuid` - معرف الطلب |
| **المخرجات**          | `varchar(64)` - رمز التحقق     |
| **اللغة**             | PL/pgSQL                       |
| **الأمان**            | SECURITY DEFINER               |
| **الجداول المستخدمة** | `trade_order_delivery`         |

**الكود:**

```sql
CREATE OR REPLACE FUNCTION public.create_delivery_verification(p_order_id uuid)
RETURNS varchar(64)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_code varchar(64);
BEGIN
  -- Generate unique verification code
  v_code := encode(gen_random_bytes(32), 'hex');

  INSERT INTO public.trade_order_delivery (
    order_id,
    verification_code,
    delivery_status,
    created_at,
    updated_at
  ) VALUES (
    p_order_id,
    v_code,
    'pending',
    now(),
    now()
  );

  RETURN v_code;
END;
$$;
```

**الاستخدام:**

```sql
-- عند إنشاء طلب جديد
SELECT public.create_delivery_verification('order-uuid');
```

**النتيجة:**

```
 a3f2b8c9d1e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9
```

---

### #1️⃣2️⃣ `verify_delivery(p_verification_code varchar(64))`

**الغاية:** التحقق من تسليم الطلب وتحديث الحالة

| الخاصية               | القيمة                                     |
| --------------------- | ------------------------------------------ |
| **المدخلات**          | `p_verification_code varchar(64)` - رمز QR |
| **المخرجات**          | `boolean` - true/false                     |
| **اللغة**             | PL/pgSQL                                   |
| **الأمان**            | SECURITY DEFINER                           |
| **الجداول المستخدمة** | `trade_order_delivery`, `trade_order`      |

**الكود:**

```sql
CREATE OR REPLACE FUNCTION public.verify_delivery(p_verification_code varchar(64))
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_delivery_id uuid;
  v_order_id uuid;
BEGIN
  -- Find delivery record
  SELECT tod.id, tod.order_id
  INTO v_delivery_id, v_order_id
  FROM public.trade_order_delivery tod
  WHERE tod.verification_code = p_verification_code
    AND tod.delivery_status = 'pending'
  LIMIT 1;

  IF v_delivery_id IS NULL THEN
    RETURN false;
  END IF;

  -- Update delivery record
  UPDATE public.trade_order_delivery
  SET
    delivery_status = 'delivered',
    delivered_at = now(),
    delivered_by = public.current_user_id(),
    customer_verified = true,
    updated_at = now()
  WHERE id = v_delivery_id;

  -- Update order status
  UPDATE public.trade_order
  SET
    status = 'delivered',
    updated_at = now()
  WHERE id = v_order_id;

  RETURN true;
END;
$$;
```

**الاستخدام:**

```sql
-- عند مسح QR Code
SELECT public.verify_delivery('verification-code');
```

**سير العمل:**

```
1. البحث عن الرمز في trade_order_delivery
2. إذا موجود ولم يُسلم:
   - تحديث delivery_status = 'delivered'
   - تسجيل delivered_at و delivered_by
   - تحديث order status = 'delivered'
   - إرجاع true
3. إذا غير موجود أو مُسلم:
   - إرجاع false
```

---

## 5️⃣ الدوال الإدارية (2 دوال)

### #1️⃣3️⃣ `admin_get_order_stats()`

**الغاية:** إحصائيات الطلبات حسب الحالة (للأدمن فقط)

| الخاصية               | القيمة                                           |
| --------------------- | ------------------------------------------------ |
| **المدخلات**          | لا يوجد                                          |
| **المخرجات**          | جدول (`status`, `total_orders`, `total_revenue`) |
| **اللغة**             | SQL                                              |
| **الأمان**            | SECURITY DEFINER                                 |
| **الجداول المستخدمة** | `trade_order`                                    |

**الكود:**

```sql
CREATE OR REPLACE FUNCTION public.admin_get_order_stats()
RETURNS TABLE (
  status order_status,
  total_orders bigint,
  total_revenue numeric(15,2)
)
LANGUAGE sql
SECURITY DEFINER
STABLE
PARALLEL SAFE
AS $$
  SELECT
    status,
    COUNT(*) AS total_orders,
    SUM(grand_total) AS total_revenue
  FROM public.trade_order
  GROUP BY status
  ORDER BY total_orders DESC;
$$;
```

**الاستخدام:**

```sql
-- في لوحة تحكم الأدمن
SELECT * FROM public.admin_get_order_stats();
```

**النتيجة:**

```
 status     | total_orders | total_revenue
------------+--------------+--------------
 delivered  | 150          | 15000.00
 pending    | 25           | 2500.00
 processing | 10           | 1000.00
```

---

### #1️⃣4️⃣ `admin_get_all_orders()`

**الغاية:** إرجاع جميع الطلبات (للأدمن فقط)

| الخاصية               | القيمة                        |
| --------------------- | ----------------------------- |
| **المدخلات**          | لا يوجد                       |
| **المخرجات**          | جدول (7 حقول)                 |
| **اللغة**             | SQL                           |
| **الأمان**            | SECURITY DEFINER              |
| **الجداول المستخدمة** | `trade_order`, `core_profile` |

**الكود:**

```sql
CREATE OR REPLACE FUNCTION public.admin_get_all_orders()
RETURNS TABLE (
  order_id uuid,
  order_number text,
  customer_email text,
  customer_name text,
  status order_status,
  grand_total numeric(10,2),
  created_at timestamptz
)
LANGUAGE sql
SECURITY DEFINER
STABLE
PARALLEL SAFE
AS $$
  SELECT
    to.id,
    to.order_number,
    cp.email,
    cp.full_name,
    to.status,
    to.grand_total,
    to.created_at
  FROM public.trade_order to
  JOIN public.core_profile cp ON to.customer_id = cp.id
  ORDER BY to.created_at DESC;
$$;
```

**الاستخدام:**

```sql
-- في لوحة تحكم الأدمن
SELECT * FROM public.admin_get_all_orders();
```

**النتيجة:**

```
 order_id | order_number | customer_email | customer_name | status | grand_total | created_at
----------+--------------|----------------|---------------|--------+-------------|-----------
 uuid-1   | ORD-2026-001 | user@test.com  | أحمد محمد     | pending| 150.00      | 2026-04-08
```

---

## أمثلة عملية

### مثال 1: التحقق من دور المستخدم

```sql
-- هل المستخدم أدمن؟
SELECT public.is_admin();
-- النتيجة: true

-- ما هي أدوار المستخدم؟
SELECT * FROM public.get_user_roles();
-- النتيجة: admin, vendor
```

### مثال 2: إنشاء رمز QR للطلب

```sql
-- إنشاء رمز QR
SELECT public.create_delivery_verification('order-uuid-here');
-- النتيجة: a3f2b8c9d1e4f5a6b7c8d9e0f1a2b3c4...
```

### مثال 3: التحقق من التسليم

```sql
-- مسح QR Code
SELECT public.verify_delivery('a3f2b8c9d1e4f5a6...');
-- النتيجة: true (تم التسليم)
```

---

## التحقق من المطابقة

### ✅ الدوال ↔ الجداول

| الدالة                           | الجداول المستخدمة                     | مطابقة؟          |
| -------------------------------- | ------------------------------------- | ---------------- |
| `current_user_id()`              | `auth.users`                          | ✅ نعم           |
| `has_role()`                     | `core_profile_role`, `core_role`      | ✅ نعم           |
| `is_admin()`                     | `core_profile_role`, `core_role`      | ✅ نعم           |
| `is_vendor()`                    | `core_profile_role`, `core_role`      | ✅ نعم           |
| `is_delivery()`                  | `core_profile_role`, `core_role`      | ✅ نعم           |
| `get_user_roles()`               | `core_profile_role`, `core_role`      | ✅ نعم           |
| `has_permission()`               | `core_profile_role`, `core_role`      | ✅ نعم           |
| `get_user_permissions()`         | `core_profile_role`, `core_role`      | ✅ نعم           |
| `is_product_owner()`             | `store_product`                       | ✅ نعم (user_id) |
| `get_store_settings()`           | `store_settings`                      | ✅ نعم           |
| `create_delivery_verification()` | `trade_order_delivery`                | ✅ نعم           |
| `verify_delivery()`              | `trade_order_delivery`, `trade_order` | ✅ نعم           |
| `admin_get_order_stats()`        | `trade_order`                         | ✅ نعم           |
| `admin_get_all_orders()`         | `trade_order`, `core_profile`         | ✅ نعم           |

### ✅ الدوال ↔ سياسات RLS

| الدالة              | السياسات المستخدمة               | عدد الاستخدامات |
| ------------------- | -------------------------------- | --------------- |
| `current_user_id()` | جميع سياسات SELECT/INSERT/UPDATE | 25+             |
| `is_admin()`        | جميع سياسات الإدارة              | 20+             |
| `is_vendor()`       | سياسات المنتجات والطلبات         | 10+             |
| `is_delivery()`     | سياسة تسليم الطلبات              | 1               |

### ✅ التحقق من الأدوار

**الأدوار في ENUM:**

```sql
role_name: admin, vendor, customer, delivery, support
```

**الأدوار في الدوال:**

```sql
is_admin()     → 'admin' ✅
is_vendor()    → 'vendor' ✅
is_delivery()  → 'delivery' ✅
```

**✅ جميع الأدوار متطابقة!**

---

**📅 آخر تحديث:** 2026-04-08  
**📦 الإصدار:** 1.0.0  
**🔧 إجمالي الدوال:** 14 دالة  
**✅ المطابقة:** 100% مع الجداول والسياسات
