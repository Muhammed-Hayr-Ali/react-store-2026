# نظام اشتراكات موظفي التوصيل (Delivery Partner Subscription System)

## 📋 نظرة عامة

هذا الملف يحتوي على نظام الاشتراكات الخاص بموظفي التوصيل لمنصة Marketna. يُستخدم لإدارة خطط الاشتراك المختلفة وحدود الطلبات لكل سائق.

---

## 📁 محتويات الملف

1. [جدول خطط اشتراكات التوصيل](#1-جدول-خطط-اشتراكات-التوصيل-delivery_subscription_plans)
2. [جدول اشتراكات التوصيل](#2-جدول-اشتراكات-التوصيل-delivery_partner_subscriptions)
3. [الخطط الافتراضية](#3-الخطط-الافتراضية)
4. [دوال إدارة اشتراكات التوصيل](#4-دوال-إدارة-اشتراكات-التوصيل)
5. [سياسات الأمان](#5-سياسات-الأمان)
6. [أمثلة الاستخدام](#6-أمثلة-الاستخدام)

---

## 🚀 التثبيت

```bash
# الترتيب الصحيح للتثبيت:

# 1. نظام الأدوار والصلاحيات
psql -f supabase/04_roles_permissions_system/01_roles_permissions_system.sql

# 2. اشتراكات الباعة (اختياري - ملف منفصل)
psql -f supabase/04_seller_subscriptions/01_seller_subscription_plans.sql

# 3. اشتراكات التوصيل (هذا الملف)
psql -f supabase/05_delivery_subscriptions/01_delivery_subscription_plans.sql

# 4. جدول موظفي التوصيل
psql -f supabase/06_delivery_partners/01_delivery_partners_schema.sql
```

---

## 1. جدول خطط اشتراكات التوصيل (delivery_subscription_plans)

### هيكل الجدول

| العمود | النوع | الوصف |
|--------|-------|-------|
| `id` | UUID | المعرف الفريد للخطة |
| `plan_type` | TEXT | نوع الخطة: `delivery_partner` |
| `name` | TEXT | اسم الخطة بالإنجليزية (free, silver, gold) |
| `name_ar` | TEXT | اسم الخطة بالعربية |
| `description` | TEXT | وصف الخطة |
| `description_ar` | TEXT | الوصف بالعربية |
| `price_usd` | DECIMAL | **السعر بالدولار** |
| `max_orders_per_day` | INTEGER | **الحد الأقصى للطلبات يومياً** |
| `max_orders_per_month` | INTEGER | الحد الأقصى للطلبات شهرياً |
| `commission_rate` | DECIMAL | **نسبة العمولة (%)** |
| `max_coverage_zones` | INTEGER | الحد الأقصى لمناطق التغطية |
| `priority_delivery` | BOOLEAN | أولوية الحصول على الطلبات |
| `features` | JSONB | قائمة الميزات بالإنجليزية |
| `features_ar` | JSONB | الميزات بالعربية |
| `is_active` | BOOLEAN | هل الخطة متاحة للتسجيل؟ |
| `is_popular` | BOOLEAN | هل هي الخطة الأكثر شعبية؟ |
| `billing_period` | TEXT | فترة الفوترة: `monthly`, `yearly`, `lifetime` |
| `trial_days` | INTEGER | أيام التجربة المجانية |

---

## 2. جدول اشتراكات التوصيل (delivery_partner_subscriptions)

### هيكل الجدول

| العمود | النوع | الوصف |
|--------|-------|-------|
| `id` | UUID | المعرف الفريد للاشتراك |
| `delivery_partner_id` | UUID | معرف موظف التوصيل (FK → delivery_partners) |
| `plan_id` | UUID | معرف الخطة (FK → delivery_subscription_plans) |
| `status` | TEXT | الحالة: `active`, `expired`, `cancelled`, `pending`, `trial` |
| `start_date` | TIMESTAMPTZ | تاريخ البدء |
| `end_date` | TIMESTAMPTZ | تاريخ الانتهاء |
| `trial_end_date` | TIMESTAMPTZ | نهاية فترة التجربة |
| `payment_provider` | TEXT | مزود الدفع: `stripe`, `paypal`, `manual` |
| `amount_paid` | DECIMAL | المبلغ المدفوع |
| `orders_completed_this_month` | INTEGER | عدد الطلبات المكتملة هذا الشهر |
| `total_earnings` | DECIMAL | إجمالي الأرباح |

---

## 3. الخطط الافتراضية

### 🆓 الخطة المجانية (Free)

| الميزة | القيمة |
|--------|-------|
| **السعر** | $0 (مجاني) |
| **الطلبات/يوم** | **3 طلبات** |
| **العمولة** | **15%** |
| **فترة التجربة** | 7 أيام |
| **الميزات** | دعم أساسي، منطقة واحدة |

### 🥈 الخطة الفضية (Silver)

| الميزة | القيمة |
|--------|-------|
| **السعر** | $19/شهر |
| **الطلبات/يوم** | **10 طلبات** |
| **العمولة** | **10%** |
| **الميزات** | دعم أولوي، منطقتي تغطية |
| **الأكثر شعبية** | ✅ نعم |

### 🥇 الخطة الذهبية (Gold)

| الميزة | القيمة |
|--------|-------|
| **السعر** | $49/شهر |
| **الطلبات/يوم** | **غير محدود** |
| **العمولة** | **5%** |
| **الميزات** | دعم 24/7، كل المناطق، أولوية الطلبات |

---

## 4. دوال إدارة اشتراكات التوصيل

### 4.1 `get_delivery_partner_subscription()`

**الوصف:** الحصول على اشتراك السائق الحالي.

**مثال:**
```sql
SELECT * FROM public.get_delivery_partner_subscription();
```

---

### 4.2 `can_accept_order()`

**الوصف:** التحقق مما إذا كان السائق يمكنه قبول طلب جديد.

**مثال:**
```sql
SELECT public.can_accept_order();
-- TRUE إذا كان يمكنه قبول طلب
-- FALSE إذا وصل للحد اليومي
```

---

### 4.3 `create_delivery_subscription(...)`

**الوصف:** إنشاء اشتراك جديد للسائق.

**مثال:**
```sql
SELECT public.create_delivery_subscription(
  'partner-uuid-here',
  (SELECT id FROM delivery_subscription_plans WHERE name = 'silver'),
  'stripe',
  'pi_1234567890',
  19.00,
  0
);
```

---

### 4.4 `cancel_delivery_subscription(p_subscription_id UUID)`

**الوصف:** إلغاء اشتراك السائق.

**مثال:**
```sql
SELECT public.cancel_delivery_subscription('subscription-uuid-here');
```

---

### 4.5 `renew_delivery_subscription(p_subscription_id UUID)`

**الوصف:** تجديد اشتراك السائق.

**مثال:**
```sql
SELECT public.renew_delivery_subscription('subscription-uuid-here');
```

---

### 4.6 `update_delivery_partner_stats(p_partner_id UUID)`

**الوصف:** تحديث إحصائيات السائق الشهرية.

**مثال:**
```sql
SELECT public.update_delivery_partner_stats('partner-uuid-here');
```

---

## 5. سياسات الأمان

### جدول `delivery_subscription_plans`

| السياسة | النوع | الشرط |
|---------|-------|-------|
| `delivery_subscription_plans_public_read` | SELECT | الخطط النشطة فقط |
| `delivery_subscription_plans_admin_manage` | ALL | الأدمن فقط |

### جدول `delivery_partner_subscriptions`

| السياسة | النوع | الشرط |
|---------|-------|-------|
| `delivery_partner_subscriptions_read_own` | SELECT | السائق يقرأ اشتراكاته |
| `delivery_partner_subscriptions_insert_own` | INSERT | السائق ينشئ اشتراكه |
| `delivery_partner_subscriptions_admin_manage` | ALL | الأدمن فقط |

---

## 6. أمثلة الاستخدام

### 6.1 عرض الخطط المتاحة

```sql
SELECT 
  name,
  name_ar,
  price_usd,
  max_orders_per_day,
  commission_rate,
  features_ar,
  is_popular
FROM public.delivery_subscription_plans
WHERE is_active = TRUE
ORDER BY sort_order;
```

### 6.2 التحقق من حد الطلبات قبل القبول

```typescript
// Next.js Server Action
export async function acceptOrder(orderId: string) {
  const supabase = createClient()
  
  // التحقق من الحد
  const { data: canAccept } = await supabase
    .rpc('can_accept_order')
    .single()
  
  if (!canAccept) {
    return { error: 'وصلت للحد اليومي للطلبات. قم بالترقية لزيادة الحد.' }
  }
  
  // قبول الطلب...
}
```

### 6.3 عرض اشتراك السائق الحالي

```typescript
// React Component
export async function DeliverySubscriptionStatus() {
  const { data: subscription } = await supabase
    .rpc('get_delivery_partner_subscription')
    .single()
  
  return (
    <div>
      <h3>خطتك الحالية: {subscription.plan_name_ar}</h3>
      <p>الطلبات اليوم: {subscription.orders_completed_this_month} / {subscription.max_orders_per_day}</p>
      <p>العمولة: {subscription.commission_rate}%</p>
      <ProgressBar 
        value={subscription.orders_completed_this_month} 
        max={subscription.max_orders_per_day} 
      />
    </div>
  )
}
```

---

## 📊 مخطط العلاقات (ERD)

```
┌─────────────────────────────┐
│ delivery_subscription_plans │
├─────────────────────────────┤
│ id (PK)                     │
│ plan_type                   │
│ name (free/silver/gold)     │
│ price_usd                   │
│ max_orders_per_day          │
│ commission_rate             │
└───────────┬─────────────────┘
            │ 1:N
            ▼
┌─────────────────────────────┐
│ delivery_partner_subscript. │
├─────────────────────────────┤
│ id (PK)                     │
│ delivery_partner_id (FK)    │───→ delivery_partners
│ plan_id (FK)                │───→ delivery_subscription_plans
│ status                      │
│ orders_completed_this_month │
│ total_earnings              │
└─────────────────────────────┘
```

---

## 💳 الفرق بين اشتراكات الباعة والتوصيل

| الجانب | الباعة (Sellers) | التوصيل (Delivery) |
|--------|------------------|---------------------|
| **الحد** | عدد المنتجات | عدد الطلبات/يوم |
| **العمولة** | لا توجد | نسبة من كل طلب (%) |
| **الأسعار** | $29-$99/شهر | $0-$49/شهر |
| **الميزات** | إحصائيات، دعم | مناطق التغطية، أولوية |

---

## 🔔 إشعارات الاشتراكات

### إشعار انتهاء الاشتراك

```typescript
// الاستماع لإشعارات الانتهاء
supabase.channel('delivery_subscription_expiring')
  .on('postgres_changes', {
    event: '*',
    schema: 'public',
    table: 'delivery_partner_subscriptions'
  }, (payload) => {
    // إرسال بريد إلكتروني للسائق
    sendExpiryEmail(payload.new.delivery_partner_id)
  })
  .subscribe()
```

---

## ⚠️ ملاحظات هامة

1. **الأسعار بالدولار:** جميع الأسعار بـ USD فقط
2. **الحد اليومي:** الخطة المجانية تسمح بـ **3 طلبات/يوم**
3. **العمولة:** نسبة من كل طلب تُخصم من أرباح السائق
4. **التجديد التلقائي:** يتم عبر webhook من بوابة الدفع
5. **فترة التجربة:** 7 أيام للخطة المجانية
6. **الإحصائيات:** يتم تحديثها تلقائياً عبر دالة `update_delivery_partner_stats`

---

## 🔗 الملفات ذات الصلة

| الملف | الوصف |
|-------|-------|
| [04_roles_permissions_system](../04_roles_permissions_system/README.md) | نظام الأدوار والصلاحيات |
| [04_seller_subscriptions](../04_seller_subscriptions/README.md) | اشتراكات الباعة |

---

**الإصدار:** 1.0  
**آخر تحديث:** 2026  
**المشروع:** Marketna E-Commerce Platform
