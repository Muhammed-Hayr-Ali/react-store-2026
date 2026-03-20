# نظام اشتراكات الباعة (Seller Subscription System)

## 📋 نظرة عامة

هذا المجلد يحتوي على نظام الاشتراكات الخاص بالباعة لمنصة Marketna. تم فصل الخطط عن الاشتراكات الفعلية لتسهيل التثبيت.

---

## 📁 محتويات المجلد

| الملف                              | الوصف                               | الترتيب | الاعتماديات                              |
| ---------------------------------- | ----------------------------------- | ------- | ---------------------------------------- |
| `01_seller_subscription_plans.sql` | خطط الاشتراكات (Free, Silver, Gold) | **1**   | 04_roles_permissions_system              |
| `02_seller_subscriptions.sql`      | جدول اشتراكات الباعة الفعليّة       | **3**   | 01_seller_subscription_plans, 06_sellers |
| `README.md`                        | هذا الملف                           | -       | -                                        |

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
psql -f supabase/04_seller_subscriptions/01_seller_subscription_plans.sql

# ============================================
# المرحلة 3: جدول الباعة
# ============================================
psql -f supabase/06_sellers/01_sellers_schema.sql

# ============================================
# المرحلة 4: اشتراكات الباعة
# ============================================
psql -f supabase/04_seller_subscriptions/02_seller_subscriptions.sql
```

---

## 📊 هيكلية النظام

```
┌──────────────────────────────────┐
│ seller_subscription_plans        │  ← الخطط المتاحة (Free, Silver, Gold)
├──────────────────────────────────┤
│ id (PK)                          │
│ plan_type ('seller')             │
│ name (free/silver/gold)          │
│ price_usd                        │
│ max_products                     │
│ features (JSONB)                 │
└───────────┬──────────────────────┘
            │ 1:N
            ▼
┌──────────────────────────────────┐
│ seller_subscriptions             │  ← اشتراكات الباعة الفعلية
├──────────────────────────────────┤
│ id (PK)                          │
│ seller_id (FK → sellers)         │
│ plan_id (FK → seller_subscription_plans)
│ status                           │
│ start_date, end_date             │
│ payment_provider                 │
│ amount_paid                      │
└───────────┬──────────────────────┘
            │ 1:1
            ▼
┌──────────────────────────────────┐
│ sellers                          │  ← جدول الباعة
├──────────────────────────────────┤
│ id (PK)                          │
│ user_id (FK → auth.users)        │
│ store_name                       │
│ account_status                   │
└──────────────────────────────────┘
```

---

## 📋 الخطط المتاحة

### 🆓 الخطة المجانية (Free)

| الميزة           | القيمة                           |
| ---------------- | -------------------------------- |
| **السعر**        | $0 (مجاني)                       |
| **عدد المنتجات** | **50 منتج**                      |
| **فترة التجربة** | 14 يوم                           |
| **الميزات**      | لوحة تحكم أساسية، دعم عبر البريد |

### 🥈 الخطة الفضية (Silver)

| الميزة           | القيمة                                |
| ---------------- | ------------------------------------- |
| **السعر**        | $29/شهر                               |
| **عدد المنتجات** | **200 منتج**                          |
| **الميزات**      | إحصائيات متقدمة، دعم أولوي، نطاق مخصص |
| **الأكثر شعبية** | ✅ نعم                                |

### 🥇 الخطة الذهبية (Gold)

| الميزة           | القيمة                                          |
| ---------------- | ----------------------------------------------- |
| **السعر**        | $99/شهر                                         |
| **عدد المنتجات** | **1000 منتج**                                   |
| **الميزات**      | إحصائيات كاملة، دعم 24/7، وصول API، علامة بيضاء |

---

## 🔧 الدوال المتاحة

### في `02_seller_subscriptions.sql`:

| الدالة                         | الوصف                             | المعلمات                                              |
| ------------------------------ | --------------------------------- | ----------------------------------------------------- |
| `get_seller_subscription()`    | الحصول على اشتراك البائع الحالي   | `p_seller_id` (اختياري)                               |
| `can_add_product()`            | التحقق من إمكانية إضافة منتج جديد | `p_seller_id` (اختياري)                               |
| `create_seller_subscription()` | إنشاء اشتراك جديد                 | `p_seller_id`, `p_plan_id`, `p_payment_provider`, ... |
| `cancel_seller_subscription()` | إلغاء الاشتراك                    | `p_subscription_id`                                   |
| `renew_seller_subscription()`  | تجديد الاشتراك                    | `p_subscription_id`                                   |

---

## 💻 أمثلة الاستخدام

### عرض الخطط المتاحة:

```sql
SELECT name, name_ar, price_usd, max_products, features_ar
FROM public.seller_subscription_plans
WHERE is_active = TRUE
  AND plan_type = 'seller'
ORDER BY sort_order;
```

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

### التحقق من حد المنتجات قبل الإضافة:

```sql
SELECT public.can_add_product();
-- TRUE إذا كان يمكنه إضافة منتج
-- FALSE إذا وصل للحد الأقصى
```

### عرض اشتراك البائع الحالي:

```sql
SELECT * FROM public.get_seller_subscription();
```

### تجديد اشتراك:

```sql
SELECT public.renew_seller_subscription(
  p_subscription_id := 'subscription-uuid-here'
);
```

### إلغاء اشتراك:

```sql
SELECT public.cancel_seller_subscription(
  p_subscription_id := 'subscription-uuid-here'
);
```

---

## 🔐 سياسات الأمان (RLS)

### جدول `seller_subscription_plans`:

| السياسة                                  | النوع  | الشرط                                 |
| ---------------------------------------- | ------ | ------------------------------------- |
| `seller_subscription_plans_public_read`  | SELECT | الخطط النشطة فقط (`is_active = TRUE`) |
| `seller_subscription_plans_admin_manage` | ALL    | الأدمن فقط                            |

### جدول `seller_subscriptions`:

| السياسة                             | النوع  | الشرط                     |
| ----------------------------------- | ------ | ------------------------- |
| `seller_subscriptions_read_own`     | SELECT | البائع يقرأ اشتراكاته فقط |
| `seller_subscriptions_insert_own`   | INSERT | البائع ينشئ اشتراكه       |
| `seller_subscriptions_admin_manage` | ALL    | الأدمن فقط                |

---

## 🔔 إشعارات قاعدة البيانات

### الاستماع لانتهاء الاشتراك:

```typescript
// في تطبيق Next.js
const channel = supabase.channel('seller_subscription_expiring')
  .on('postgres_changes', {
    event: 'UPDATE',
    schema: 'public',
    table: 'seller_subscriptions',
    filter: `end_date=lt.${sevenDaysFromNow}`
  }, (payload) => {
    // إرسال بريد إلكتروني للبائع
    sendExpiryEmail(payload.new.seller_id)
  })
  .subscribe()
```

---

## 📊 التكامل مع Stripe

### إنشاء جلسة دفع:

```typescript
// app/api/create-checkout-session/route.ts
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

export async function POST(req: Request) {
  const { planId, sellerId } = await req.json()

  const session = await stripe.checkout.sessions.create({
    mode: 'subscription',
    line_items: [{ price: planId, quantity: 1 }],
    success_url: `${origin}/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${origin}/cancel`,
    metadata: { sellerId }
  })

  // إنشاء اشتراك في حالة الانتظار
  await supabase.rpc('create_seller_subscription', {
    p_seller_id: sellerId,
    p_plan_id: planId,
    p_payment_provider: 'stripe',
    p_payment_intent_id: session.payment_intent,
    p_trial_days: 14
  })

  return Response.json({ url: session.url })
}
```

### webhook لاستكمال الدفع:

```typescript
// app/api/webhooks/stripe/route.ts
export async function POST(req: Request) {
  const event = stripe.webhooks.constructEvent(...)

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object

    // تفعيل الاشتراك
    await supabase.rpc('renew_seller_subscription', {
      p_subscription_id: session.metadata.subscriptionId
    })
  }

  return new Response('OK')
}
```

---

## ⚠️ ملاحظات هامة

1. **الترتيب مهم!**
   - `01_seller_subscription_plans.sql` يُنفذ أولاً (لا يعتمد على جداول أخرى)
   - `02_seller_subscriptions.sql` يُنفذ بعد جدول `sellers`

2. **الأسعار بالدولار:** جميع الأسعار بـ USD فقط

3. **الحد الافتراضي:** الخطة المجانية تسمح بـ **50 منتج**

4. **فترة التجربة:** 14 يوم للخطة المجانية

5. **التجديد التلقائي:** يتم عبر webhook من Stripe

6. **إلغاء الاشتراك:** يبقى فعالاً حتى نهاية الفترة المدفوعة

---

## 🐛 استكشاف الأخطاء

### التحقق من الخطط:

```sql
SELECT name, name_ar, price_usd, max_products, is_active
FROM public.seller_subscription_plans
WHERE plan_type = 'seller';
```

### التحقق من الاشتراكات النشطة:

```sql
SELECT
  ss.id,
  s.store_name,
  sp.name as plan_name,
  ss.status,
  ss.end_date
FROM public.seller_subscriptions ss
JOIN public.sellers s ON s.id = ss.seller_id
JOIN public.seller_subscription_plans sp ON sp.id = ss.plan_id
WHERE ss.status = 'active';
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

| الملف                                                                   | الوصف                   |
| ----------------------------------------------------------------------- | ----------------------- |
| [04_roles_permissions_system](../04_roles_permissions_system/README.md) | نظام الأدوار والصلاحيات |
| [06_sellers](../06_sellers/README.md)                                   | جدول الباعة             |
| [05_delivery_subscriptions](../05_delivery_subscriptions/README.md)     | اشتراكات التوصيل        |

---

**الإصدار:** 1.0  
**آخر تحديث:** 2026  
**المشروع:** Marketna E-Commerce Platform
