# نظام اشتراكات الباعة (Seller Subscription System)

## 📋 نظرة عامة

هذا الملف يحتوي على نظام الاشتراكات لمنصة Marketna. يُستخدم لإدارة خطط الاشتراك المختلفة وحدود المنتجات لكل بائع.

**ملاحظة:** هذا الملف منفصل عن جدول الباعة ويجب تشغيله **قبل** ملف الباعة.

---

## 📁 محتويات الملف

1. [جدول خطط الاشتراكات](#1-جدول-خطط-الاشتراكات-subscription_plans)
2. [جدول اشتراكات الباعة](#2-جدول-اشتراكات-الباعة-seller_subscriptions)
3. [الخطط الافتراضية](#3-الخطط-الافتراضية)
4. [دوال إدارة الاشتراكات](#4-دوال-إدارة-الاشتراكات)
5. [سياسات الأمان](#5-سياسات-الأمان)
6. [أمثلة الاستخدام](#6-أمثلة-الاستخدام)

---

## 🚀 التثبيت

```bash
# 1. نظام الأدوار والصلاحيات (مطلوب أولاً)
psql -f supabase/04_roles_permissions_system/01_roles_permissions_system.sql

# 2. نظام الاشتراكات (هذا الملف)
psql -f supabase/04_subscriptions/01_subscription_plans.sql

# 3. جدول الباعة (يأتي لاحقاً)
psql -f supabase/05_sellers/01_sellers_schema.sql
```

---

## 1. جدول خطط الاشتراكات (subscription_plans)

### هيكل الجدول

| العمود                   | النوع   | الوصف                                         |
| ------------------------ | ------- | --------------------------------------------- |
| `id`                     | UUID    | المعرف الفريد للخطة                           |
| `name`                   | TEXT    | اسم الخطة بالإنجليزية (free, silver, gold)    |
| `name_ar`                | TEXT    | اسم الخطة بالعربية                            |
| `description`            | TEXT    | وصف الخطة                                     |
| `description_ar`         | TEXT    | الوصف بالعربية                                |
| `price_usd`              | DECIMAL | **السعر بالدولار**                            |
| `price_sar`              | DECIMAL | السعر بالريال (محسوب تلقائياً: USD × 3.75)    |
| `max_products`           | INTEGER | **الحد الأقصى للمنتجات**                      |
| `max_categories`         | INTEGER | الحد الأقصى للأقسام (NULL = غير محدود)        |
| `max_images_per_product` | INTEGER | الحد الأقصى للصور لكل منتج                    |
| `features`               | JSONB   | قائمة الميزات بالإنجليزية                     |
| `features_ar`            | JSONB   | الميزات بالعربية                              |
| `is_active`              | BOOLEAN | هل الخطة متاحة للتسجيل؟                       |
| `is_popular`             | BOOLEAN | هل هي الخطة الأكثر شعبية؟                     |
| `sort_order`             | INTEGER | ترتيب العرض                                   |
| `billing_period`         | TEXT    | فترة الفوترة: `monthly`, `yearly`, `lifetime` |
| `trial_days`             | INTEGER | أيام التجربة المجانية                         |

---

## 2. جدول اشتراكات الباعة (seller_subscriptions)

### هيكل الجدول

| العمود              | النوع       | الوصف                                                        |
| ------------------- | ----------- | ------------------------------------------------------------ |
| `id`                | UUID        | المعرف الفريد للاشتراك                                       |
| `seller_id`         | UUID        | معرف البائع (FK → sellers)                                   |
| `plan_id`           | UUID        | معرف الخطة (FK → subscription_plans)                         |
| `status`            | TEXT        | الحالة: `active`, `expired`, `cancelled`, `pending`, `trial` |
| `start_date`        | TIMESTAMPTZ | تاريخ البدء                                                  |
| `end_date`          | TIMESTAMPTZ | تاريخ الانتهاء                                               |
| `trial_end_date`    | TIMESTAMPTZ | نهاية فترة التجربة                                           |
| `cancelled_at`      | TIMESTAMPTZ | تاريخ الإلغاء                                                |
| `payment_provider`  | TEXT        | مزود الدفع: `stripe`, `paypal`, `manual`                     |
| `payment_intent_id` | TEXT        | معرف عملية الدفع                                             |
| `amount_paid`       | DECIMAL     | المبلغ المدفوع                                               |
| `currency`          | TEXT        | العملة (USD)                                                 |

---

## 3. الخطط الافتراضية

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
| **السعر**        | $29/شهر (~108 ريال)                   |
| **عدد المنتجات** | **200 منتج**                          |
| **الميزات**      | إحصائيات متقدمة، دعم أولوي، نطاق مخصص |
| **الأكثر شعبية** | ✅ نعم                                |

### 🥇 الخطة الذهبية (Gold)

| الميزة           | القيمة                                          |
| ---------------- | ----------------------------------------------- |
| **السعر**        | $99/شهر (~371 ريال)                             |
| **عدد المنتجات** | **1000 منتج**                                   |
| **الميزات**      | إحصائيات كاملة، دعم 24/7، وصول API، علامة بيضاء |

---

## 4. دوال إدارة الاشتراكات

### 4.1 `get_seller_subscription(p_seller_id UUID)`

**الوصف:** الحصول على اشتراك البائع الحالي.

**الإرجاع:**
| العمود | النوع | الوصف |
|--------|-------|-------|
| `subscription_id` | UUID | معرف الاشتراك |
| `plan_name` | TEXT | اسم الخطة |
| `price_usd` | DECIMAL | السعر |
| `max_products` | INTEGER | الحد الأقصى للمنتجات |
| `products_count` | BIGINT | عدد المنتجات الحالية |

**مثال:**

```sql
SELECT * FROM public.get_seller_subscription();
```

---

### 4.2 `can_add_product(p_seller_id UUID)`

**الوصف:** التحقق مما إذا كان البائع يمكنه إضافة منتج جديد.

**الإرجاع:** `BOOLEAN`

**مثال:**

```sql
SELECT public.can_add_product();
-- TRUE إذا كان يمكنه إضافة منتج
-- FALSE إذا وصل للحد الأقصى
```

**الاستخدام في RLS:**

```sql
-- سياسة منع إضافة منتجات بعد الوصول للحد
CREATE POLICY "check_product_limit" ON public.products
FOR INSERT TO authenticated
WITH CHECK (public.can_add_product());
```

---

### 4.3 `create_seller_subscription(...)`

**الوصف:** إنشاء اشتراك جديد للبائع.

**المعلمات:**
| المعامل | النوع | الوصف |
|---------|-------|-------|
| `p_seller_id` | UUID | معرف البائع |
| `p_plan_id` | UUID | معرف الخطة |
| `p_payment_provider` | TEXT | مزود الدفع (stripe, paypal, manual) |
| `p_payment_intent_id` | TEXT | معرف عملية الدفع |
| `p_amount_paid` | DECIMAL | المبلغ المدفوع |
| `p_trial_days` | INTEGER | أيام التجربة المجانية |

**مثال:**

```sql
-- اشتراك فضي مع دفع عبر Stripe
SELECT public.create_seller_subscription(
  'seller-uuid-here',
  (SELECT id FROM subscription_plans WHERE name = 'silver'),
  'stripe',
  'pi_1234567890',
  29.00,
  0
);
```

---

### 4.4 `cancel_seller_subscription(p_subscription_id UUID)`

**الوصف:** إلغاء اشتراك البائع.

**مثال:**

```sql
SELECT public.cancel_seller_subscription('subscription-uuid-here');
```

---

### 4.5 `renew_seller_subscription(p_subscription_id UUID)`

**الوصف:** تجديد اشتراك البائع.

**مثال:**

```sql
SELECT public.renew_seller_subscription('subscription-uuid-here');
```

---

## 5. سياسات الأمان

### جدول `subscription_plans`

| السياسة                           | النوع  | الشرط            |
| --------------------------------- | ------ | ---------------- |
| `subscription_plans_public_read`  | SELECT | الخطط النشطة فقط |
| `subscription_plans_admin_manage` | ALL    | الأدمن فقط       |

### جدول `seller_subscriptions`

| السياسة                             | النوع  | الشرط                 |
| ----------------------------------- | ------ | --------------------- |
| `seller_subscriptions_read_own`     | SELECT | البائع يقرأ اشتراكاته |
| `seller_subscriptions_insert_own`   | INSERT | البائع ينشئ اشتراكه   |
| `seller_subscriptions_admin_manage` | ALL    | الأدمن فقط            |

---

## 6. أمثلة الاستخدام

### 6.1 عرض الخطط المتاحة

```sql
SELECT
  name,
  name_ar,
  price_usd,
  price_sar,
  max_products,
  features_ar,
  is_popular
FROM public.subscription_plans
WHERE is_active = TRUE
ORDER BY sort_order;
```

### 6.2 التحقق من حد المنتجات قبل الإضافة

```typescript
// Next.js Server Action
export async function createProduct(formData: FormData) {
  const supabase = createClient()

  // التحقق من الحد
  const { data: canAdd } = await supabase
    .rpc('can_add_product')
    .single()

  if (!canAdd) {
    return { error: 'وصلت للحد الأقصى للمنتجات. قم بالترقية لزيادة الحد.' }
  }

  // إنشاء المنتج...
}
```

### 6.3 عرض اشتراك البائع الحالي

```typescript
// React Component
export async function SubscriptionStatus() {
  const { data: subscription } = await supabase
    .rpc('get_seller_subscription')
    .single()

  return (
    <div>
      <h3>خطتك الحالية: {subscription.plan_name_ar}</h3>
      <p>المنتجات: {subscription.products_count} / {subscription.max_products}</p>
      <ProgressBar
        value={subscription.products_count}
        max={subscription.max_products}
      />
    </div>
  )
}
```

### 6.4 ترقية الخطة

```typescript
// Server Action للترقية
export async function upgradePlan(planId: string) {
  const supabase = createClient()

  // إنشاء عملية دفع في Stripe
  const session = await stripe.checkout.sessions.create({
    mode: 'subscription',
    line_items: [{ price: planId, quantity: 1 }],
    success_url: `${origin}/success`,
    cancel_url: `${origin}/cancel`,
  })

  // إنشاء الاشتراك (بانتظار الدفع)
  await supabase.rpc('create_seller_subscription', {
    p_seller_id: sellerId,
    p_plan_id: planId,
    p_payment_provider: 'stripe',
    p_payment_intent_id: session.payment_intent,
    p_amount_paid: 0, // سيتم التحديث بعد الدفع
  })

  return { url: session.url }
}
```

### 6.5 webhook لاستقبال الدفع من Stripe

```typescript
// app/api/webhooks/stripe/route.ts
export async function POST(req: Request) {
  const event = stripe.webhooks.constructEvent(...)

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object

    // تجديد الاشتراك
    await supabase.rpc('renew_seller_subscription', {
      p_subscription_id: session.metadata.subscription_id
    })
  }

  return new Response('OK')
}
```

---

## 📊 مخطط العلاقات (ERD)

```
┌─────────────────────────┐
│   subscription_plans    │
├─────────────────────────┤
│ id (PK)                 │
│ name                    │
│ price_usd               │
│ max_products            │
│ billing_period          │
└───────────┬─────────────┘
            │ 1:N
            ▼
┌─────────────────────────┐
│  seller_subscriptions   │
├─────────────────────────┤
│ id (PK)                 │
│ seller_id (FK)          │───→ sellers
│ plan_id (FK)            │───→ subscription_plans
│ status                  │
│ start_date              │
│ end_date                │
└─────────────────────────┘
```

---

## 💳 التكامل مع بوابات الدفع

### Stripe (موصى به)

```typescript
// lib/stripe.ts
import Stripe from 'stripe'

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
})

// إنشاء أسعار Stripe
await stripe.prices.create({
  product: 'prod_xxx',
  unit_amount: 2900, // $29.00
  currency: 'usd',
  recurring: { interval: 'month' }
})
```

### PayPal

```typescript
// إنشاء طلب دفع PayPal
const order = await paypalClient.orders.create({
  intent: 'CAPTURE',
  purchase_units: [{
    amount: { currency_code: 'USD', value: '29.00' }
  }]
})
```

---

## 🔔 إشعارات الاشتراكات

### إشعار انتهاء الاشتراك

```typescript
// الاستماع لإشعارات الانتهاء
supabase.channel('subscription_expiring')
  .on('postgres_changes', {
    event: '*',
    schema: 'public',
    table: 'seller_subscriptions'
  }, (payload) => {
    // إرسال بريد إلكتروني للبائع
    sendExpiryEmail(payload.new.seller_id)
  })
  .subscribe()
```

---

## ⚠️ ملاحظات هامة

1. **الأسعار بالدولار:** جميع الأسعار بـ USD مع حساب تلقائي بـ SAR
2. **الحد الافتراضي:** الخطة المجانية تسمح بـ **50 منتج**
3. **التجديد التلقائي:** يتم عبر webhook من بوابة الدفع
4. **فترة التجربة:** يمكن تحديد أيام تجربة لكل خطة
5. **إلغاء الاشتراك:** يبقى فعالاً حتى نهاية الفترة المدفوعة

---

## 🚀 الخطوات التالية

1. ✅ تثبيت ملف `02_subscription_plans.sql`
2. ⏳ ربط مع Stripe أو PayPal
3. ⏳ إنشاء واجهة اختيار الخطط
4. ⏳ إضافة سياسة RLS للمنتجات للتحقق من الحد

---

**الإصدار:** 1.0  
**آخر تحديث:** 2026  
**المشروع:** Marketna E-Commerce Platform
