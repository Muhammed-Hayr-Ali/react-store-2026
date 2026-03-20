# جدول الباعة (Sellers Table)

## 📋 نظرة عامة

هذا الملف يحتوي على جدول الباعة (Sellers/Vendors) لمنصة Marketna للتجارة الإلكترونية. يُستخدم لتخزين معلومات المتاجر والبائعين المسجلين في المنصة.

**ملاحظة:** هذا الملف يعتمد على نظام الاشتراكات ويجب تشغيله **بعد** ملف الاشتراكات.

---

## 📁 محتويات الملف

1. [جدول الباعة](#1-جدول-الباعة-sellersvendors)
2. [الفهرسة](#2-الفهرسة-indexing)
3. [دوال إدارة الباعة](#3-دوال-إدارة-الباعة-management-functions)
4. [سياسات الأمان](#4-سياسات-الأمان-row-level-security)
5. [مشغلات التحديث التلقائي](#5-مشغلات-التحديث-التلقائي-auto-update-triggers)
6. [إشعارات قاعدة البيانات](#6-إشعارات-قاعدة-البيانات-database-notifications)
7. [أمثلة الاستخدام](#7-أمثلة-الاستخدام)

---

## 🚀 التثبيت

```bash
# الترتيب الصحيح للتثبيت:

# 1. نظام الأدوار والصلاحيات
psql -f supabase/04_roles_permissions_system/01_roles_permissions_system.sql

# 2. نظام الاشتراكات
psql -f supabase/04_subscriptions/01_subscription_plans.sql

# 3. جدول الباعة (هذا الملف)
psql -f supabase/05_sellers/01_sellers_schema.sql
```

---

## 1. جدول الباعة (Sellers/Vendors)

### هيكل الجدول

| العمود                    | النوع       | القيود                  | الوصف                                                      |
| ------------------------- | ----------- | ----------------------- | ---------------------------------------------------------- |
| `id`                      | UUID        | PRIMARY KEY             | المعرف الفريد للبائع                                       |
| `user_id`                 | UUID        | UNIQUE, FK → auth.users | معرف المستخدم المرتبط بالبائع                              |
| `profile_id`              | UUID        | FK → profiles           | معرف الملف الشخصي (اختياري)                                |
| `store_name`              | TEXT        | NOT NULL                | اسم المتجر                                                 |
| `store_slug`              | TEXT        | UNIQUE                  | رابط المتجر الفريد (URL-friendly)                          |
| `store_description`       | TEXT        |                         | وصف المتجر                                                 |
| `store_logo_url`          | TEXT        |                         | رابط شعار المتجر                                           |
| `store_banner_url`        | TEXT        |                         | رابط صورة الغلاف للمتجر                                    |
| `phone`                   | TEXT        |                         | رقم هاتف المتجر                                            |
| `email`                   | TEXT        |                         | البريد الإلكتروني للمتجر                                   |
| `address`                 | JSONB       |                         | عنوان المتجر `{street, city, state, postal_code, country}` |
| `tax_number`              | TEXT        |                         | الرقم الضريبي                                              |
| `commercial_registration` | TEXT        |                         | الرقم التجاري                                              |
| `account_status`          | TEXT        | CHECK                   | حالة الحساب: `pending`, `active`, `suspended`, `rejected`  |
| `rejection_reason`        | TEXT        |                         | سبب رفض طلب البائع                                         |
| `reviewed_by`             | UUID        | FK → auth.users         | من راجع الطلب                                              |
| `reviewed_at`             | TIMESTAMPTZ |                         | تاريخ المراجعة                                             |
| `metadata`                | JSONB       | DEFAULT '{}'            | بيانات إضافية                                              |
| `created_at`              | TIMESTAMPTZ | DEFAULT NOW()           | تاريخ الإنشاء                                              |
| `updated_at`              | TIMESTAMPTZ | DEFAULT NOW()           | تاريخ آخر تحديث                                            |

### حالات حساب البائع

| الحالة      | الوصف            | من يغيرها             |
| ----------- | ---------------- | --------------------- |
| `pending`   | بانتظار المراجعة | الافتراضي عند الإنشاء |
| `active`    | مفعل ونشط        | Admin (approve)       |
| `suspended` | موقوف مؤقتاً     | Admin (suspend)       |
| `rejected`  | مرفوض            | Admin (reject)        |

### مثال JSONB للعنوان

```json
{
  "street": "شارع الملك فهد",
  "city": "الرياض",
  "state": "منطقة الرياض",
  "postal_code": "12345",
  "country": "السعودية"
}
```

---

## 2. الفهرسة (Indexing)

تم إنشاء الفهارس التالية لتحسين الأداء:

| الفهرس                | الأعمدة          | النوع         | الوصف                     |
| --------------------- | ---------------- | ------------- | ------------------------- |
| `idx_sellers_user_id` | `user_id`        | B-Tree        | البحث عن طريق user_id     |
| `idx_sellers_status`  | `account_status` | B-Tree        | فلترة الباعة حسب الحالة   |
| `idx_sellers_slug`    | `store_slug`     | B-Tree        | البحث عن طريق store_slug  |
| `idx_sellers_search`  | `store_name`     | GIN (Trigram) | البحث النصي في اسم المتجر |

### استخدام البحث النصي

```sql
-- البحث عن متجر بالاسم
SELECT * FROM public.sellers
WHERE store_name ILIKE '%متجر%';

-- بحث أكثر دقة باستخدام pg_trgm
SELECT * FROM public.sellers
WHERE store_name % 'متجر'
ORDER BY similarity(store_name, 'متجر') DESC;
```

---

## 3. دوال إدارة الباعة (Management Functions)

### 3.1 `create_seller(...)`

**الوصف:** إنشاء سجل بائع جديد.

**المعلمات:**
| المعامل | النوع | الوصف |
|---------|-------|-------|
| `p_store_name` | TEXT | اسم المتجر (مطلوب) |
| `p_store_description` | TEXT | وصف المتجر (اختياري) |
| `p_phone` | TEXT | رقم الهاتف (اختياري) |
| `p_email` | TEXT | البريد الإلكتروني (اختياري) |
| `p_address` | JSONB | العنوان (اختياري) |
| `p_tax_number` | TEXT | الرقم الضريبي (اختياري) |
| `p_commercial_registration` | TEXT | الرقم التجاري (اختياري) |

**الإرجاع:** `UUID` - معرف البائع الجديد

**مثال:**

```sql
SELECT public.create_seller(
  'متجر الأناقة',
  'متجر متخصص في الملابس الفاخرة',
  '0501234567',
  'store@example.com',
  '{"street": "شارع الملك فهد", "city": "الرياض"}'::jsonb,
  '123456789',
  '1010101010'
);
```

**ملاحظات:**

- الحالة الافتراضية: `pending`
- `store_slug` يُنشأ تلقائياً من اسم المتجر
- يُسمح ببائع واحد فقط لكل مستخدم

---

### 3.2 `approve_seller(p_seller_id UUID)`

**الوصف:** الموافقة على بائع وتفعيل حسابه.

**المعلمات:**
| المعامل | النوع | الوصف |
|---------|-------|-------|
| `p_seller_id` | UUID | معرف البائع |

**الإرجاع:** `BOOLEAN`

**الشروط:**

- يتطلب صلاحية `admin`

**مثال:**

```sql
SELECT public.approve_seller('seller-uuid-here');
```

---

### 3.3 `reject_seller(p_seller_id UUID, p_reason TEXT)`

**الوصف:** رفض بائع مع تحديد السبب.

**المعلمات:**
| المعامل | النوع | الوصف |
|---------|-------|-------|
| `p_seller_id` | UUID | معرف البائع |
| `p_reason` | TEXT | سبب الرفض |

**الإرجاع:** `BOOLEAN`

**الشروط:**

- يتطلب صلاحية `admin`

**مثال:**

```sql
SELECT public.reject_seller(
  'seller-uuid-here',
  'الوثائق المقدمة غير مكتملة'
);
```

---

### 3.4 `suspend_seller(p_seller_id UUID, p_reason TEXT DEFAULT NULL)`

**الوصف:** إيقاف بائع مؤقتاً.

**المعلمات:**
| المعامل | النوع | الوصف |
|---------|-------|-------|
| `p_seller_id` | UUID | معرف البائع |
| `p_reason` | TEXT | سبب الإيقاف (اختياري) |

**الإرجاع:** `BOOLEAN`

**الشروط:**

- يتطلب صلاحية `admin`

**مثال:**

```sql
SELECT public.suspend_seller(
  'seller-uuid-here',
  'شكوى من العملاء'
);
```

---

### 3.5 `update_seller_store(...)`

**الوصف:** تحديث معلومات المتجر.

**المعلمات:**
| المعامل | النوع | الوصف |
|---------|-------|-------|
| `p_seller_id` | UUID | معرف البائع |
| `p_store_name` | TEXT | اسم المتجر (اختياري) |
| `p_store_description` | TEXT | وصف المتجر (اختياري) |
| `p_phone` | TEXT | رقم الهاتف (اختياري) |
| `p_email` | TEXT | البريد الإلكتروني (اختياري) |
| `p_address` | JSONB | العنوان (اختياري) |
| `p_store_logo_url` | TEXT | رابط الشعار (اختياري) |
| `p_store_banner_url` | TEXT | رابط الغلاف (اختياري) |

**الإرجاع:** `BOOLEAN`

**الشروط:**

- البائع يمكنه تحديث متجره فقط
- الأدمن يمكنه تحديث أي متجر

**مثال:**

```sql
SELECT public.update_seller_store(
  'seller-uuid-here',
  'متجر الأناقة الجديد',
  'وصف محدث للمتجر',
  NULL,
  'newemail@example.com',
  NULL,
  'https://example.com/logo.png',
  NULL
);
```

---

## 4. سياسات الأمان (Row Level Security)

### جدول: `public.sellers`

| السياسة                  | النوع  | الشرط                  | الوصف                     |
| ------------------------ | ------ | ---------------------- | ------------------------- |
| `sellers_read_own`       | SELECT | `user_id = auth.uid()` | البائع يقرأ بياناته فقط   |
| `sellers_admin_read_all` | SELECT | `public.is_admin()`    | الأدمن يقرأ جميع الباعة   |
| `sellers_insert_own`     | INSERT | `user_id = auth.uid()` | المستخدم ينشئ بائع خاص به |
| `sellers_update_own`     | UPDATE | `user_id = auth.uid()` | البائع يحدث بياناته فقط   |
| `sellers_admin_delete`   | DELETE | `public.is_admin()`    | الأدمن فقط يحذف           |
| `sellers_admin_manage`   | ALL    | `public.is_admin()`    | الإدارة الكاملة للأدمن    |

### مثال: سياسة مخصصة للقراءة العامة

```sql
-- السماح للجميع بقراءة الباعة المفعلين
DROP POLICY IF EXISTS "sellers_public_read_active" ON public.sellers;
CREATE POLICY "sellers_public_read_active" ON public.sellers FOR SELECT
  TO authenticated USING (account_status = 'active');
```

---

## 5. مشغلات التحديث التلقائي (Auto Update Triggers)

### `update_sellers_updated_at`

**الوصف:** يحدث `updated_at` تلقائياً عند أي تحديث.

**الجدول:** `public.sellers`

**الدالة:** `update_updated_at_column()`

---

## 6. إشعارات قاعدة البيانات (Database Notifications)

### `seller_status_change_trigger`

**الوصف:** يُرسل إشعار عند تغيير حالة البائع.

**القناة:** `seller_status_changed`

**البيانات المرسلة:**

```json
{
  "seller_id": "uuid",
  "user_id": "uuid",
  "old_status": "pending",
  "new_status": "active",
  "rejection_reason": null
}
```

### الاستماع للإشعارات في Supabase Client

```typescript
const channel = supabase.channel('seller_status_changed')
  .on(
    'postgres_changes',
    {
      event: 'UPDATE',
      schema: 'public',
      table: 'sellers'
    },
    (payload) => {
      console.log('Seller status changed:', payload.new);
    }
  )
  .subscribe();
```

---

## 7. أمثلة الاستخدام

### 7.1 إنشاء بائع جديد

```sql
-- إنشاء بائع جديد
SELECT public.create_seller(
  'متجر التقنية',
  'أحدث المنتجات الإلكترونية',
  '0501234567',
  'tech@store.com',
  '{"street": "شارع التخصصي", "city": "الرياض", "postal_code": "12345"}'::jsonb,
  '3001234567',
  '1010101010'
);
```

### 7.2 مراجعة بائع (للأدمن)

```sql
-- الموافقة على بائع
SELECT public.approve_seller('seller-uuid');

-- أو رفض بائع
SELECT public.reject_seller('seller-uuid', 'الوثائق غير واضحة');

-- أو إيقاف بائع
SELECT public.suspend_seller('seller-uuid', 'تحقيق في شكوى');
```

### 7.3 تحديث معلومات المتجر

```sql
-- البائع يحدث معلومات متجره
SELECT public.update_seller_store(
  'seller-uuid',
  NULL,  -- لا تغيير في الاسم
  'وصف محدث للمتجر',
  '0559876543',  -- تحديث الهاتف
  NULL,  -- لا تغيير في الإيميل
  NULL,  -- لا تغيير في العنوان
  'https://cdn.example.com/logo.png',
  'https://cdn.example.com/banner.jpg'
);
```

### 7.4 البحث عن الباعة

```sql
-- البحث بالاسم
SELECT * FROM public.sellers
WHERE store_name ILIKE '%متجر%';

-- فلترة حسب الحالة
SELECT * FROM public.sellers
WHERE account_status = 'active';

-- البحث المتقدم باستخدام pg_trgm
SELECT *, similarity(store_name, 'مكتبة') AS score
FROM public.sellers
WHERE store_name % 'مكتبة'
ORDER BY score DESC;
```

### 7.5 في Next.js

```typescript
// app/actions/create-seller.ts
'use server'

import { createClient } from '@/lib/supabase/server'

export async function createSeller(formData: FormData) {
  const supabase = createClient()

  const { data, error } = await supabase.rpc('create_seller', {
    p_store_name: formData.get('store_name'),
    p_store_description: formData.get('store_description'),
    p_phone: formData.get('phone'),
    p_email: formData.get('email'),
    p_address: JSON.parse(formData.get('address') as string),
    p_tax_number: formData.get('tax_number'),
    p_commercial_registration: formData.get('commercial_registration')
  })

  if (error) throw error
  return data
}
```

---

## 🔐 أفضل الممارسات الأمنية

### 1. التحقق من حالة البائع قبل العمليات

```sql
-- في سياسات RLS للمنتجات
CREATE POLICY "active_sellers_only" ON public.products
FOR INSERT TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.sellers
    WHERE user_id = auth.uid()
    AND account_status = 'active'
  )
);
```

### 2. استخدام المعرفات الفريدة (UUID)

دائمًا استخدم UUID للمعرفات لتجنب التخمين:

```sql
-- ✅ صحيح
WHERE id = 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'

-- ❌ خطأ (قابل للتخمين)
WHERE id = 123
```

### 3. تخزين البيانات الحساسة في JSONB

```sql
-- ✅ أفضل للعناوين
address JSONB -- {street, city, postal_code}

-- ❌ أقل مرونة
street TEXT, city TEXT, postal_code TEXT
```

---

## 📊 مخطط العلاقات (ERD)

```
┌──────────────────────┐         ┌─────────────────┐
│     auth.users       │         │    profiles     │
├──────────────────────┤         ├─────────────────┤
│ id (PK)              │◄───────┤ id (PK)         │
│ email                │    1:1  │ user_id (FK)   │
└──────────┬───────────┘         └─────────────────┘
           │
           │ 1:1
           ▼
┌──────────────────────┐
│      sellers         │
├──────────────────────┤
│ id (PK)              │
│ user_id (FK→users)   │
│ profile_id (FK)      │
│ store_name           │
│ store_slug           │
│ account_status       │
│ ...                  │
└──────────────────────┘
           │
           │ 1:1
           ▼
┌──────────────────────┐
│ seller_subscriptions │ (في ملف الاشتراكات)
├──────────────────────┤
│ plan_id (FK)         │
│ status               │
│ max_products         │
│ ...                  │
└──────────────────────┘
           │
           │ 1:N
           ▼
┌──────────────────────┐
│      products        │
├──────────────────────┤
│ id (PK)              │
│ vendor_id (FK)       │
│ ...                  │
└──────────────────────┘
```

---

## 🔗 الملفات ذات الصلة

| الملف                                                                   | الوصف                   |
| ----------------------------------------------------------------------- | ----------------------- |
| [04_roles_permissions_system](../04_roles_permissions_system/README.md) | نظام الأدوار والصلاحيات |
| [04_subscriptions](../04_subscriptions/README.md)                       | نظام الاشتراكات والخطط  |

---

## 🚀 الترقية والصيانة

### إضافة عمود جديد

```sql
-- إضافة عمود تقييم المتجر
ALTER TABLE public.sellers
ADD COLUMN rating DECIMAL(3,2) DEFAULT 0.00;

-- إضافة عمول عدد المنتجات
ALTER TABLE public.sellers
ADD COLUMN total_products INTEGER DEFAULT 0;
```

### تحديث البيانات الموجودة

```sql
-- تحديث جميع store_slug القديمة
UPDATE public.sellers
SET store_slug = LOWER(REGEXP_REPLACE(store_name, '[^a-zA-Z0-9]+', '-', 'g'))
WHERE store_slug IS NULL;
```

---

## ⚠️ ملاحظات هامة

1. **الاعتماديات:** هذا الملف يعتمد على:
   - `04_roles_permissions_system.sql` (الأدوار والصلاحيات)
   - `04_subscriptions.sql` (الاشتراكات)

2. **جدول profiles:** اختياري، إذا لم يكن موجوداً احذف `profile_id`

3. **store_slug:** يُنشأ تلقائياً من اسم المتجر، لكن يمكن تعديله يدوياً

4. **الموافقة التلقائية:** لتفعيل الموافقة التلقائية، عدل دالة `create_seller`:

   ```sql
   account_status = 'active'  -- بدلاً من 'pending'
   ```

5. **الأداء:** استخدم الفهارس وأنشئ فهارس إضافية حسب الحاجة

---

## 📞 الدعم

لأي استفسارات أو مشاكل تقنية، يرجى التواصل مع فريق التطوير.

---

**الإصدار:** 1.0  
**آخر تحديث:** 2026  
**المشروع:** Marketna E-Commerce Platform  
**الملفات السابقة:** `supabase/04_roles_permissions_system/01_roles_permissions_system.sql`
