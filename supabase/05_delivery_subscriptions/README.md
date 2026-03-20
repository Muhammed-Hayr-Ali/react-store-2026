# نظام اشتراكات موظفي التوصيل (Delivery Partner Subscription System)

## 📋 نظرة عامة

هذا المجلد يحتوي على نظام الاشتراكات الخاص بموظفي التوصيل لمنصة Marketna. تم فصل الخطط عن الاشتراكات الفعلية لتسهيل التثبيت.

---

## 📁 محتويات المجلد

| الملف                                   | الوصف                               | الترتيب | الاعتماديات                                            |
| --------------------------------------- | ----------------------------------- | ------- | ------------------------------------------------------ |
| `01_delivery_subscription_plans.sql`    | خطط الاشتراكات (Free, Silver, Gold) | **1**   | 04_roles_permissions_system                            |
| `02_delivery_partner_subscriptions.sql` | جدول اشتراكات التوصيل الفعليّة      | **3**   | 01_delivery_subscription_plans, جدول delivery_partners |
| `README.md`                             | هذا الملف                           | -       | -                                                      |

---

## 🚀 دليل التثبيت

### **الترتيب الكامل:**

```bash
# ============================================
# المرحلة 1: نظام الأدوار والصلاحيات
# ============================================
psql -f supabase/04_roles_permissions_system/01_roles_permissions_system.sql

# ============================================
# المرحلة 2: خطط الاشتراكات (فقط الخطط)
# ============================================
psql -f supabase/05_delivery_subscriptions/01_delivery_subscription_plans.sql

# ============================================
# المرحلة 3: جدول موظفي التوصيل (مستقبلاً)
# ============================================
# psql -f supabase/07_delivery_partners/01_delivery_partners_schema.sql

# ============================================
# المرحلة 4: اشتراكات التوصيل
# ============================================
psql -f supabase/05_delivery_subscriptions/02_delivery_partner_subscriptions.sql
```

---

## 📊 هيكلية النظام

```
┌──────────────────────────────────┐
│ delivery_subscription_plans      │  ← الخطط المتاحة (Free, Silver, Gold)
├──────────────────────────────────┤
│ id (PK)                          │
│ plan_type ('delivery_partner')   │
│ name (free/silver/gold)          │
│ price_usd                        │
│ max_orders_per_day               │
│ commission_rate                  │
│ features (JSONB)                 │
└───────────┬──────────────────────┘
            │ 1:N
            ▼
┌──────────────────────────────────┐
│ delivery_partner_subscriptions   │  ← اشتراكات السائقين الفعلية
├──────────────────────────────────┤
│ id (PK)                          │
│ delivery_partner_id (FK)         │
│ plan_id (FK)                     │
│ status                           │
│ orders_completed_this_month      │
│ total_earnings                   │
└───────────┬──────────────────────┘
            │ 1:1
            ▼
┌──────────────────────────────────┐
│ delivery_partners                │  ← جدول موظفي التوصيل
├──────────────────────────────────┤
│ id (PK)                          │
│ user_id (FK → auth.users)        │
│ vehicle_types                    │
│ account_status                   │
└──────────────────────────────────┘
```

---

## 📋 الخطط المتاحة

### 🆓 الخطة المجانية (Free)

| الميزة           | القيمة                 |
| ---------------- | ---------------------- |
| **السعر**        | $0 (مجاني)             |
| **الطلبات/يوم**  | **3 طلبات**            |
| **العمولة**      | **15%**                |
| **فترة التجربة** | 7 أيام                 |
| **الميزات**      | دعم أساسي، منطقة واحدة |

### 🥈 الخطة الفضية (Silver)

| الميزة           | القيمة                  |
| ---------------- | ----------------------- |
| **السعر**        | $19/شهر                 |
| **الطلبات/يوم**  | **10 طلبات**            |
| **العمولة**      | **10%**                 |
| **الميزات**      | دعم أولوي، منطقتي تغطية |
| **الأكثر شعبية** | ✅ نعم                  |

### 🥇 الخطة الذهبية (Gold)

| الميزة          | القيمة                               |
| --------------- | ------------------------------------ |
| **السعر**       | $49/شهر                              |
| **الطلبات/يوم** | **غير محدود**                        |
| **العمولة**     | **5%**                               |
| **الميزات**     | دعم 24/7، كل المناطق، أولوية الطلبات |

---

## 🔧 الدوال المتاحة

### في `02_delivery_partner_subscriptions.sql`:

| الدالة                                | الوصف                           | المعلمات                                               |
| ------------------------------------- | ------------------------------- | ------------------------------------------------------ |
| `get_delivery_partner_subscription()` | الحصول على اشتراك السائق الحالي | `p_partner_id` (اختياري)                               |
| `can_accept_order()`                  | التحقق من إمكانية قبول طلب جديد | `p_partner_id` (اختياري)                               |
| `create_delivery_subscription()`      | إنشاء اشتراك جديد               | `p_partner_id`, `p_plan_id`, `p_payment_provider`, ... |
| `cancel_delivery_subscription()`      | إلغاء الاشتراك                  | `p_subscription_id`                                    |
| `renew_delivery_subscription()`       | تجديد الاشتراك                  | `p_subscription_id`                                    |
| `update_delivery_partner_stats()`     | تحديث إحصائيات السائق           | `p_partner_id`                                         |

---

## 💻 أمثلة الاستخدام

### عرض الخطط المتاحة:

```sql
SELECT name, name_ar, price_usd, max_orders_per_day, commission_rate, features_ar
FROM public.delivery_subscription_plans
WHERE is_active = TRUE
  AND plan_type = 'delivery_partner'
ORDER BY sort_order;
```

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

### التحقق من حد الطلبات قبل القبول:

```sql
SELECT public.can_accept_order();
-- TRUE إذا كان يمكنه قبول طلب
-- FALSE إذا وصل للحد اليومي
```

### عرض اشتراك السائق الحالي:

```sql
SELECT * FROM public.get_delivery_partner_subscription();
```

### تجديد اشتراك:

```sql
SELECT public.renew_delivery_subscription(
  p_subscription_id := 'subscription-uuid-here'
);
```

### إلغاء اشتراك:

```sql
SELECT public.cancel_delivery_subscription(
  p_subscription_id := 'subscription-uuid-here'
);
```

### تحديث إحصائيات السائق:

```sql
SELECT public.update_delivery_partner_stats(
  p_partner_id := 'partner-uuid-here'
);
```

---

## 🔐 سياسات الأمان (RLS)

### جدول `delivery_subscription_plans`:

| السياسة                                    | النوع  | الشرط                                 |
| ------------------------------------------ | ------ | ------------------------------------- |
| `delivery_subscription_plans_public_read`  | SELECT | الخطط النشطة فقط (`is_active = TRUE`) |
| `delivery_subscription_plans_admin_manage` | ALL    | الأدمن فقط                            |

### جدول `delivery_partner_subscriptions`:

| السياسة                                       | النوع  | الشرط                     |
| --------------------------------------------- | ------ | ------------------------- |
| `delivery_partner_subscriptions_read_own`     | SELECT | السائق يقرأ اشتراكاته فقط |
| `delivery_partner_subscriptions_insert_own`   | INSERT | السائق ينشئ اشتراكه       |
| `delivery_partner_subscriptions_admin_manage` | ALL    | الأدمن فقط                |

---

## 📊 الفرق بين اشتراكات الباعة والتوصيل

| الجانب           | الباعة (Sellers) | التوصيل (Delivery)            |
| ---------------- | ---------------- | ----------------------------- |
| **الحد**         | عدد المنتجات     | عدد الطلبات/يوم               |
| **العمولة**      | لا توجد          | نسبة من كل طلب (%)            |
| **الأسعار**      | $29-$99/شهر      | $0-$49/شهر                    |
| **الميزات**      | إحصائيات، دعم    | مناطق التغطية، أولوية الطلبات |
| **فترة التجربة** | 14 يوم           | 7 أيام                        |

---

## 🔔 إشعارات قاعدة البيانات

### الاستماع لانتهاء الاشتراك:

```typescript
// في تطبيق Next.js
const channel = supabase.channel('delivery_subscription_expiring')
  .on('postgres_changes', {
    event: 'UPDATE',
    schema: 'public',
    table: 'delivery_partner_subscriptions'
  }, (payload) => {
    // إرسال بريد إلكتروني للسائق
    sendExpiryEmail(payload.new.delivery_partner_id)
  })
  .subscribe()
```

---

## 💳 التكامل مع Stripe

### إنشاء جلسة دفع:

```typescript
// app/api/create-checkout-session/route.ts
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

export async function POST(req: Request) {
  const { planId, partnerId } = await req.json()

  const session = await stripe.checkout.sessions.create({
    mode: 'subscription',
    line_items: [{ price: planId, quantity: 1 }],
    success_url: `${origin}/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${origin}/cancel`,
    metadata: { partnerId }
  })

  // إنشاء اشتراك في حالة الانتظار
  await supabase.rpc('create_delivery_subscription', {
    p_partner_id: partnerId,
    p_plan_id: planId,
    p_payment_provider: 'stripe',
    p_payment_intent_id: session.payment_intent,
    p_trial_days: 7
  })

  return Response.json({ url: session.url })
}
```

---

## ⚠️ ملاحظات هامة

1. **الترتيب مهم!**
   - `01_delivery_subscription_plans.sql` يُنفذ أولاً (لا يعتمد على جداول أخرى)
   - `02_delivery_partner_subscriptions.sql` يُنفذ بعد جدول `delivery_partners`

2. **الأسعار بالدولار:** جميع الأسعار بـ USD فقط

3. **الحد اليومي:** الخطة المجانية تسمح بـ **3 طلبات/يوم**

4. **العمولة:** نسبة من كل طلب تُخصم من أرباح السائق

5. **فترة التجربة:** 7 أيام للخطة المجانية

6. **التجديد التلقائي:** يتم عبر webhook من Stripe

7. **الإحصائيات:** يتم تحديثها عبر دالة `update_delivery_partner_stats`

---

## 🐛 استكشاف الأخطاء

### التحقق من الخطط:

```sql
SELECT name, name_ar, price_usd, max_orders_per_day, commission_rate, is_active
FROM public.delivery_subscription_plans
WHERE plan_type = 'delivery_partner';
```

### التحقق من الاشتراكات النشطة:

```sql
SELECT
  dps.id,
  dp.company_name,
  dsp.name as plan_name,
  dps.status,
  dps.end_date,
  dps.orders_completed_this_month
FROM public.delivery_partner_subscriptions dps
JOIN public.delivery_partners dp ON dp.id = dps.delivery_partner_id
JOIN public.delivery_subscription_plans dsp ON dsp.id = dps.plan_id
WHERE dps.status = 'active';
```

### مشكلة: جدول غير موجود

```sql
-- التحقق من الجداول
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_name LIKE '%subscription%'
ORDER BY table_name;
```

---

## 🔗 الملفات ذات الصلة

| الملف                                                                   | الوصف                         |
| ----------------------------------------------------------------------- | ----------------------------- |
| [04_roles_permissions_system](../04_roles_permissions_system/README.md) | نظام الأدوار والصلاحيات       |
| [04_seller_subscriptions](../04_seller_subscriptions/README.md)         | اشتراكات الباعة               |
| [07_delivery_partners](../07_delivery_partners/README.md)               | جدول موظفي التوصيل (مستقبلاً) |

---

**الإصدار:** 1.0  
**آخر تحديث:** 2026  
**المشروع:** Marketna E-Commerce Platform
