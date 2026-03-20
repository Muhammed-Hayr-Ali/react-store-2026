# 💳 اشتراكات موظفي التوصيل (Delivery Partner Subscriptions)

## 📋 نظرة عامة

هذا المجلد يحتوي على **جدول اشتراكات موظفي التوصيل الفعلية** (العلاقة بين السائق والخطة).

**الترتيب:** 08  
**يعتمد على:** 05_delivery_subscription_plans, 07_delivery_partners  
**يسبق:** 09_seller_subscriptions

---

## 📁 محتويات الملف

| الملف | الوصف |
|-------|-------|
| `02_delivery_partner_subscriptions.sql` | جدول الاشتراكات + الدوال + سياسات الأمان |
| `README.md` | هذا الملف |

---

## 🚀 التثبيت

```bash
# الترتيب الصحيح:

# 1. نظام الأدوار والصلاحيات
psql -f supabase/04_roles_permissions_system/01_roles_permissions_system.sql

# 2. خطط اشتراكات التوصيل
psql -f supabase/05_delivery_subscription_plans/01_delivery_subscription_plans.sql

# 3. جدول موظفي التوصيل
psql -f supabase/07_delivery_partners/01_delivery_partners_schema.sql

# 4. اشتراكات التوصيل (هذا الملف)
psql -f supabase/08_delivery_partner_subscriptions/02_delivery_partner_subscriptions.sql

# 5. اشتراكات الباعة
psql -f supabase/09_seller_subscriptions/02_seller_subscriptions.sql
```

---

## 📊 هيكل الجدول

### جدول `delivery_partner_subscriptions`

| العمود | النوع | الوصف |
|--------|-------|-------|
| `id` | UUID | المعرف الفريد للاشتراك |
| `delivery_partner_id` | UUID | معرف السائق (FK → delivery_partners) |
| `plan_id` | UUID | معرف الخطة (FK → delivery_subscription_plans) |
| `status` | TEXT | الحالة: `active`, `expired`, `cancelled`, `pending`, `trial` |
| `start_date` | TIMESTAMPTZ | تاريخ البدء |
| `end_date` | TIMESTAMPTZ | تاريخ الانتهاء |
| `trial_end_date` | TIMESTAMPTZ | نهاية فترة التجربة |
| `cancelled_at` | TIMESTAMPTZ | تاريخ الإلغاء |
| `payment_provider` | TEXT | مزود الدفع: `stripe`, `paypal`, `manual` |
| `payment_intent_id` | TEXT | معرف عملية الدفع |
| `last_payment_date` | TIMESTAMPTZ | آخر دفع |
| `next_billing_date` | TIMESTAMPTZ | تاريخ الفوترة القادم |
| `amount_paid` | DECIMAL | المبلغ المدفوع |
| `currency` | TEXT | العملة (USD) |
| `orders_completed_this_month` | INTEGER | عدد الطلبات المكتملة هذا الشهر |
| `total_earnings` | DECIMAL | إجمالي الأرباح |
| `notes` | TEXT | ملاحظات |
| `metadata` | JSONB | بيانات إضافية |

---

## 🔧 الدوال الرئيسية

| الدالة | الوصف | المعلمات |
|--------|-------|----------|
| `get_delivery_partner_subscription()` | الحصول على اشتراك السائق الحالي | `p_partner_id` (اختياري) |
| `can_accept_order()` | التحقق من إمكانية قبول طلب جديد | `p_partner_id` (اختياري) |
| `create_delivery_subscription()` | إنشاء اشتراك جديد | `p_partner_id`, `p_plan_id`, ... |
| `cancel_delivery_subscription()` | إلغاء الاشتراك | `p_subscription_id` |
| `renew_delivery_subscription()` | تجديد الاشتراك | `p_subscription_id` |
| `update_delivery_partner_stats()` | تحديث إحصائيات السائق | `p_partner_id` |

---

## 💻 أمثلة الاستخدام

### إنشاء اشتراك جديد:

```sql
SELECT public.create_delivery_subscription(
  p_partner_id := 'partner-uuid-here',
  p_plan_id := (SELECT id FROM delivery_subscription_plans WHERE name = 'silver'),
  p_payment_provider := 'stripe',
  p_payment_intent_id := 'pi_1234567890',
  p_amount_paid := 19.00,
  p_trial_days := 7
);
```

### التحقق من حد الطلبات:

```sql
SELECT public.can_accept_order();
-- TRUE إذا كان يمكنه قبول طلب
-- FALSE إذا وصل للحد اليومي
```

### عرض الاشتراك الحالي:

```sql
SELECT * FROM public.get_delivery_partner_subscription();
```

### تجديد اشتراك:

```sql
SELECT public.renew_delivery_subscription(
  p_subscription_id := 'subscription-uuid-here'
);
```

### تحديث الإحصائيات:

```sql
SELECT public.update_delivery_partner_stats(
  p_partner_id := 'partner-uuid-here'
);
```

---

## 🔐 سياسات الأمان (RLS)

| السياسة | النوع | الشرط |
|---------|-------|-------|
| `delivery_partner_subscriptions_read_own` | SELECT | السائق يقرأ اشتراكاته فقط |
| `delivery_partner_subscriptions_insert_own` | INSERT | السائق ينشئ اشتراكه |
| `delivery_partner_subscriptions_admin_manage` | ALL | الأدمن فقط |

---

## 📊 حالات الاشتراك

| الحالة | الوصف |
|--------|-------|
| `active` | اشتراك نشط |
| `expired` | انتهت الصلاحية |
| `cancelled` | تم الإلغاء |
| `pending` | بانتظار الدفع |
| `trial` | فترة تجربة |

---

## 🔄 سير عمل الاشتراك

```
1. السائق يختار خطة
   ↓
2. إنشاء اشتراك (status: pending)
   ↓
3. الدفع عبر Stripe/PayPal
   ↓
4. تفعيل الاشتراك (status: active)
   ↓
5. قبول الطلبات (can_accept_order)
   ↓
6. تحديث الإحصائيات (update_delivery_partner_stats)
   ↓
7. تجديد أو إلغاء
```

---

## ⚠️ ملاحظات هامة

1. **يعتمد على جدول delivery_partners** - يجب إنشاء جدول موظفي التوصيل قبل هذا الملف
2. **delivery_partner_id فريد** - كل سائق يمكن أن يكون له اشتراك نشط واحد فقط
3. **plan_id** - يشير إلى جدول `delivery_subscription_plans`
4. **التجديد التلقائي** - يتم عبر webhook من Stripe
5. **الإحصائيات** - يتم تحديثها عبر دالة `update_delivery_partner_stats`

---

## 🔗 الملفات ذات الصلة

| الملف | الوصف |
|-------|-------|
| [04_roles_permissions_system](../04_roles_permissions_system/README.md) | نظام الأدوار |
| [05_delivery_subscription_plans](../05_delivery_subscription_plans/README.md) | خطط اشتراكات التوصيل |
| [07_delivery_partners](../07_delivery_partners/README.md) | جدول موظفي التوصيل |
| [09_seller_subscriptions](../09_seller_subscriptions/README.md) | اشتراكات الباعة |

---

**الإصدار:** 1.0  
**آخر تحديث:** 2026  
**المشروع:** Marketna E-Commerce Platform
