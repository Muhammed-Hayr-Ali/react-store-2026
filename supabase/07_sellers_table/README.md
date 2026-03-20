# 🏪 جدول الباعة (Sellers Table)

## 📋 نظرة عامة

هذا المجلد يحتوي على **جدول الباعة** فقط (معلومات المتاجر والبائعين).

**الترتيب:** 06  
**يعتمد على:** 03_profiles_schema (اختياري), 04_roles_permissions_system  
**يسبق:** 07_seller_subscriptions

---

## 📁 محتويات الملف

| الملف | الوصف |
|-------|-------|
| `01_sellers_schema.sql` | جدول الباعة + الفهارس + الدوال + سياسات الأمان |
| `README.md` | هذا الملف |

---

## 🚀 التثبيت

```bash
# 1. نظام الأدوار والصلاحيات
psql -f supabase/04_roles_permissions_system/01_roles_permissions_system.sql

# 2. خطط اشتراكات الباعة
psql -f supabase/04_seller_subscription_plans/01_seller_subscription_plans.sql

# 3. جدول الباعة (هذا الملف)
psql -f supabase/06_sellers_table/01_sellers_schema.sql

# 4. اشتراكات الباعة
psql -f supabase/07_seller_subscriptions/02_seller_subscriptions.sql
```

---

## 📊 هيكل الجدول

### جدول `sellers`

| العمود | النوع | الوصف |
|--------|-------|-------|
| `id` | UUID | المعرف الفريد للبائع |
| `user_id` | UUID | معرف المستخدم (FK → auth.users) |
| `profile_id` | UUID | معرف الملف الشخصي (FK → profiles) |
| `store_name` | TEXT | اسم المتجر |
| `store_slug` | TEXT | رابط المتجر الفريد |
| `store_description` | TEXT | وصف المتجر |
| `store_logo_url` | TEXT | رابط الشعار |
| `store_banner_url` | TEXT | رابط الغلاف |
| `phone` | TEXT | رقم الهاتف |
| `email` | TEXT | البريد الإلكتروني |
| `address` | JSONB | العنوان `{street, city, state, postal_code, country}` |
| `tax_number` | TEXT | الرقم الضريبي |
| `commercial_registration` | TEXT | الرقم التجاري |
| `account_status` | TEXT | الحالة: `pending`, `active`, `suspended`, `rejected` |
| `rejection_reason` | TEXT | سبب الرفض |
| `reviewed_by` | UUID | من راجع الطلب |
| `reviewed_at` | TIMESTAMPTZ | تاريخ المراجعة |
| `metadata` | JSONB | بيانات إضافية |

---

## 🔧 الدوال الرئيسية

| الدالة | الوصف |
|--------|-------|
| `create_seller(...)` | إنشاء سجل بائع جديد |
| `approve_seller(id)` | الموافقة على بائع (أدمن) |
| `reject_seller(id, reason)` | رفض بائع (أدمن) |
| `suspend_seller(id, reason)` | إيقاف بائع (أدمن) |
| `update_seller_store(...)` | تحديث معلومات المتجر |

---

## 💻 أمثلة الاستخدام

### إنشاء بائع جديد:

```sql
SELECT public.create_seller(
  p_store_name := 'متجر التقنية',
  p_store_description := 'أحدث المنتجات الإلكترونية',
  p_phone := '0501234567',
  p_email := 'tech@store.com',
  p_address := '{"street": "شارع التخصصي", "city": "الرياض"}'::jsonb,
  p_tax_number := '3001234567',
  p_commercial_registration := '1010101010'
);
```

### الموافقة على بائع:

```sql
SELECT public.approve_seller('seller-uuid-here');
```

### تحديث معلومات المتجر:

```sql
SELECT public.update_seller_store(
  p_seller_id := 'seller-uuid-here',
  p_store_name := 'متجر التقنية الجديد',
  p_store_description := 'وصف محدث',
  p_phone := '0559876543',
  p_store_logo_url := 'https://example.com/logo.png'
);
```

---

## 🔐 سياسات الأمان (RLS)

| السياسة | النوع | الشرط |
|---------|-------|-------|
| `sellers_read_own` | SELECT | البائع يقرأ بياناته فقط |
| `sellers_admin_read_all` | SELECT | الأدمن يقرأ الكل |
| `sellers_insert_own` | INSERT | المستخدم ينشئ بائع خاص به |
| `sellers_update_own` | UPDATE | البائع يحدث بياناته فقط |
| `sellers_admin_manage` | ALL | الأدمن فقط |

---

## 📊 حالات الحساب

| الحالة | الوصف | من يغيرها |
|--------|-------|----------|
| `pending` | بانتظار المراجعة | الافتراضي عند الإنشاء |
| `active` | مفعل ونشط | Admin (approve) |
| `suspended` | موقوف مؤقتاً | Admin (suspend) |
| `rejected` | مرفوض | Admin (reject) |

---

## ⚠️ ملاحظات هامة

1. **user_id فريد** - كل مستخدم يمكن أن يكون له بائع واحد فقط
2. **store_slug فريد** - يُنشأ تلقائياً من اسم المتجر
3. **الحالة الافتراضية** - `pending` حتى يوافق الأدمن
4. **profile_id اختياري** - يمكن أن يكون NULL

---

## 🔗 الملفات ذات الصلة

| الملف | الوصف |
|-------|-------|
| [04_roles_permissions_system](../04_roles_permissions_system/README.md) | نظام الأدوار |
| [04_seller_subscription_plans](../04_seller_subscription_plans/README.md) | خطط الاشتراكات |
| [07_seller_subscriptions](../07_seller_subscriptions/README.md) | اشتراكات الباعة |

---

**الإصدار:** 1.0  
**آخر تحديث:** 2026  
**المشروع:** Marketna E-Commerce Platform
