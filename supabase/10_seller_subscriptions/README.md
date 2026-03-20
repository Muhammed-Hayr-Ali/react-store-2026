# 💳 اشتراكات الباعة (Seller Subscriptions)

## 📋 نظرة عامة

هذا المجلد يحتوي على **جدول اشتراكات الباعة الفعلية** (العلاقة بين البائع والخطة).

**الترتيب:** 07  
**يعتمد على:** 04_seller_subscription_plans, 06_sellers_table  
**يسبق:** - (هذا آخر جدول في سلسلة الباعة)

---

## 📁 محتويات الملف

| الملف                         | الوصف                                    |
| ----------------------------- | ---------------------------------------- |
| `02_seller_subscriptions.sql` | جدول الاشتراكات + الدوال + سياسات الأمان |
| `README.md`                   | هذا الملف                                |

---

## 🚀 التثبيت

```bash
# الترتيب الصحيح:

# 1. نظام الأدوار والصلاحيات
psql -f supabase/04_roles_permissions_system/01_roles_permissions_system.sql

# 2. خطط اشتراكات الباعة
psql -f supabase/04_seller_subscription_plans/01_seller_subscription_plans.sql

# 3. جدول الباعة
psql -f supabase/06_sellers_table/01_sellers_schema.sql

# 4. اشتراكات الباعة (هذا الملف)
psql -f supabase/07_seller_subscriptions/02_seller_subscriptions.sql
```

---

## 📊 هيكل الجدول

### جدول `seller_subscriptions`

| العمود              | النوع       | الوصف                                                        |
| ------------------- | ----------- | ------------------------------------------------------------ |
| `id`                | UUID        | المعرف الفريد للاشتراك                                       |
| `seller_id`         | UUID        | معرف البائع (FK → sellers)                                   |
| `plan_id`           | UUID        | معرف الخطة (FK → seller_subscription_plans)                  |
| `status`            | TEXT        | الحالة: `active`, `expired`, `cancelled`, `pending`, `trial` |
| `start_date`        | TIMESTAMPTZ | تاريخ البدء                                                  |
| `end_date`          | TIMESTAMPTZ | تاريخ الانتهاء                                               |
| `trial_end_date`    | TIMESTAMPTZ | نهاية فترة التجربة                                           |
| `cancelled_at`      | TIMESTAMPTZ | تاريخ الإلغاء                                                |
| `payment_provider`  | TEXT        | مزود الدفع: `stripe`, `paypal`, `manual`                     |
| `payment_intent_id` | TEXT        | معرف عملية الدفع                                             |
| `last_payment_date` | TIMESTAMPTZ | آخر دفع                                                      |
| `next_billing_date` | TIMESTAMPTZ | تاريخ الفوترة القادم                                         |
| `amount_paid`       | DECIMAL     | المبلغ المدفوع                                               |
| `currency`          | TEXT        | العملة (USD)                                                 |
| `notes`             | TEXT        | ملاحظات                                                      |
| `metadata`          | JSONB       | بيانات إضافية                                                |

---

## 🔧 الدوال الرئيسية

| الدالة                         | الوصف                           | المعلمات                        |
| ------------------------------ | ------------------------------- | ------------------------------- |
| `get_seller_subscription()`    | الحصول على اشتراك البائع الحالي | `p_seller_id` (اختياري)         |
| `can_add_product()`            | التحقق من إمكانية إضافة منتج    | `p_seller_id` (اختياري)         |
| `create_seller_subscription()` | إنشاء اشتراك جديد               | `p_seller_id`, `p_plan_id`, ... |
| `cancel_seller_subscription()` | إلغاء الاشتراك                  | `p_subscription_id`             |
| `renew_seller_subscription()`  | تجديد الاشتراك                  | `p_subscription_id`             |

---

## 💻 أمثلة الاستخدام

### إنشاء اشتراك جديد:

```sql
SELECT public.create_seller_subscription(
  p_seller_id := 'seller-uuid-here',
  p_plan_id := (SELECT id FROM seller_subscription_plans WHERE name = 'silver'),
  p_payment_provider := 'stripe',
  p_payment_intent_id := 'pi_1234567890',
  p_amount_paid := 29.00,
  p_trial_days := 0
);
```

### التحقق من حد المنتجات:

```sql
SELECT public.can_add_product();
-- TRUE إذا كان يمكنه إضافة منتج
-- FALSE إذا وصل للحد الأقصى
```

### عرض الاشتراك الحالي:

```sql
SELECT * FROM public.get_seller_subscription();
```

### تجديد اشتراك:

```sql
SELECT public.renew_seller_subscription(
  p_subscription_id := 'subscription-uuid-here'
);
```

---

## 🔐 سياسات الأمان (RLS)

| السياسة                             | النوع  | الشرط                     |
| ----------------------------------- | ------ | ------------------------- |
| `seller_subscriptions_read_own`     | SELECT | البائع يقرأ اشتراكاته فقط |
| `seller_subscriptions_insert_own`   | INSERT | البائع ينشئ اشتراكه       |
| `seller_subscriptions_admin_manage` | ALL    | الأدمن فقط                |

---

## 📊 حالات الاشتراك

| الحالة      | الوصف          |
| ----------- | -------------- |
| `active`    | اشتراك نشط     |
| `expired`   | انتهت الصلاحية |
| `cancelled` | تم الإلغاء     |
| `pending`   | بانتظار الدفع  |
| `trial`     | فترة تجربة     |

---

## 🔄 سير عمل الاشتراك

```
1. البائع يختار خطة
   ↓
2. إنشاء اشتراك (status: pending)
   ↓
3. الدفع عبر Stripe/PayPal
   ↓
4. تفعيل الاشتراك (status: active)
   ↓
5. استخدام الخدمة (إضافة منتجات)
   ↓
6. تجديد أو إلغاء
```

---

## ⚠️ ملاحظات هامة

1. **يعتمد على جدول sellers** - يجب إنشاء جدول الباعة قبل هذا الملف
2. **seller_id فريد** - كل بائع يمكن أن يكون له اشتراك نشط واحد فقط
3. **plan_id** - يشير إلى جدول `seller_subscription_plans`
4. **التجديد التلقائي** - يتم عبر webhook من Stripe

---

## 🔗 الملفات ذات الصلة

| الملف                                                                     | الوصف          |
| ------------------------------------------------------------------------- | -------------- |
| [04_roles_permissions_system](../04_roles_permissions_system/README.md)   | نظام الأدوار   |
| [04_seller_subscription_plans](../04_seller_subscription_plans/README.md) | خطط الاشتراكات |
| [06_sellers_table](../06_sellers_table/README.md)                         | جدول الباعة    |

---

**الإصدار:** 1.0  
**آخر تحديث:** 2026  
**المشروع:** Marketna E-Commerce Platform
