# نظام اشتراكات الباعة (Seller Subscription System)

## 📋 نظرة عامة

هذا المجلد يحتوي على نظام الاشتراكات الخاص بالباعة لمنصة Marketna.

---

## 📁 محتويات المجلد

| الملف                              | الوصف                                            |
| ---------------------------------- | ------------------------------------------------ |
| `01_seller_subscription_plans.sql` | **جدول خطط الاشتراكات** (يُنفذ أولاً)            |
| `02_seller_subscriptions.sql`      | **جدول اشتراكات الباعة** (يُنفذ بعد جدول الباعة) |
| `README.md`                        | هذا الملف                                        |

---

## 🚀 دليل التثبيت

### **الترتيب الصحيح:**

```bash
# 1. نظام الأدوار والصلاحيات
psql -f supabase/04_roles_permissions_system/01_roles_permissions_system.sql

# 2. خطط الاشتراكات (فقط الخطط)
psql -f supabase/04_seller_subscriptions/01_seller_subscription_plans.sql

# 3. جدول الباعة
psql -f supabase/06_sellers/01_sellers_schema.sql

# 4. اشتراكات الباعة (بعد إنشاء جدول الباعة)
psql -f supabase/04_seller_subscriptions/02_seller_subscriptions.sql
```

---

## 📊 هيكلية النظام

```
┌──────────────────────────────┐
│ seller_subscription_plans    │  ← الخطط المتاحة (Free, Silver, Gold)
├──────────────────────────────┤
│ id (PK)                      │
│ plan_type ('seller')         │
│ name (free/silver/gold)      │
│ price_usd                    │
│ max_products                 │
└───────────┬──────────────────┘
            │ 1:N
            ▼
┌──────────────────────────────┐
│ seller_subscriptions         │  ← اشتراكات الباعة الفعلية
├──────────────────────────────┤
│ id (PK)                      │
│ seller_id (FK → sellers)     │
│ plan_id (FK)                 │
│ status                       │
│ start_date, end_date         │
└───────────┬──────────────────┘
            │ 1:1
            ▼
┌──────────────────────────────┐
│ sellers                      │  ← جدول الباعة
├──────────────────────────────┤
│ id (PK)                      │
│ user_id (FK → auth.users)    │
│ store_name                   │
│ account_status               │
└──────────────────────────────┘
```

---

## 📋 الخطط المتاحة

| الخطة      | السعر (USD) | عدد المنتجات  | الميزات                               |
| ---------- | ----------- | ------------- | ------------------------------------- |
| **Free**   | $0          | **50 منتج**   | لوحة تحكم أساسية، دعم عبر البريد      |
| **Silver** | $29/شهر     | **200 منتج**  | إحصائيات متقدمة، دعم أولوي، نطاق مخصص |
| **Gold**   | $99/شهر     | **1000 منتج** | إحصائيات كاملة، دعم 24/7، وصول API    |

---

## 🔧 الدوال المتاحة

### في `02_seller_subscriptions.sql`:

| الدالة                         | الوصف                             |
| ------------------------------ | --------------------------------- |
| `get_seller_subscription()`    | الحصول على اشتراك البائع الحالي   |
| `can_add_product()`            | التحقق من إمكانية إضافة منتج جديد |
| `create_seller_subscription()` | إنشاء اشتراك جديد                 |
| `cancel_seller_subscription()` | إلغاء الاشتراك                    |
| `renew_seller_subscription()`  | تجديد الاشتراك                    |

---

## 💻 أمثلة الاستخدام

### عرض الخطط المتاحة:

```sql
SELECT name, name_ar, price_usd, max_products, features_ar
FROM public.seller_subscription_plans
WHERE is_active = TRUE
ORDER BY sort_order;
```

### إنشاء اشتراك جديد:

```sql
SELECT public.create_seller_subscription(
  'seller-uuid-here',
  (SELECT id FROM seller_subscription_plans WHERE name = 'silver'),
  'stripe',
  'pi_1234567890',
  29.00,
  0
);
```

### التحقق من حد المنتجات:

```sql
SELECT public.can_add_product();
-- TRUE إذا كان يمكنه إضافة منتج
```

---

## ⚠️ ملاحظات هامة

1. **الترتيب مهم!** يجب إنشاء جدول `sellers` قبل `seller_subscriptions`
2. **خطط فقط أولاً:** ملف `01_seller_subscription_plans.sql` يمكن تشغيله قبل جدول الباعة
3. **الأسعار بالدولار:** جميع الأسعار بـ USD فقط
4. **الحد الافتراضي:** الخطة المجانية تسمح بـ **50 منتج**

---

**الإصدار:** 1.0  
**آخر تحديث:** 2026  
**المشروع:** Marketna E-Commerce Platform
