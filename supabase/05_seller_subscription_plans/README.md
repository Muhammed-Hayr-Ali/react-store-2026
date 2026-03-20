# 🏪 خطط اشتراكات الباعة (Seller Subscription Plans)

## 📋 نظرة عامة

هذا المجلد يحتوي على **خطط الاشتراكات** الخاصة بالباعة فقط (Free, Silver, Gold).

**الترتيب:** 04  
**يعتمد على:** 04_roles_permissions_system  
**يسبق:** 06_sellers_table, 07_seller_subscriptions

---

## 📁 محتويات الملف

| الملف                              | الوصف                                     |
| ---------------------------------- | ----------------------------------------- |
| `01_seller_subscription_plans.sql` | جدول خطط الاشتراكات + البيانات الافتراضية |
| `README.md`                        | هذا الملف                                 |

---

## 🚀 التثبيت

```bash
# يُنفذ بعد نظام الأدوار والصلاحيات
psql -f supabase/04_roles_permissions_system/01_roles_permissions_system.sql

# ثم خطط الاشتراكات (هذا الملف)
psql -f supabase/04_seller_subscription_plans/01_seller_subscription_plans.sql

# ثم جدول الباعة
psql -f supabase/06_sellers_table/01_sellers_schema.sql

# ثم اشتراكات الباعة
psql -f supabase/07_seller_subscriptions/02_seller_subscriptions.sql
```

---

## 📊 هيكل الجدول

### جدول `seller_subscription_plans`

| العمود           | النوع   | الوصف                                         |
| ---------------- | ------- | --------------------------------------------- |
| `id`             | UUID    | المعرف الفريد                                 |
| `plan_type`      | TEXT    | نوع الخطة: `seller` أو `delivery_partner`     |
| `name`           | TEXT    | اسم الخطة: `free`, `silver`, `gold`           |
| `name_ar`        | TEXT    | الاسم بالعربية                                |
| `price_usd`      | DECIMAL | السعر بالدولار                                |
| `max_products`   | INTEGER | الحد الأقصى للمنتجات                          |
| `features`       | JSONB   | الميزات (بالإنجليزية)                         |
| `features_ar`    | JSONB   | الميزات (بالعربية)                            |
| `is_active`      | BOOLEAN | هل الخطة نشطة؟                                |
| `is_popular`     | BOOLEAN | هل هي الأكثر شعبية؟                           |
| `billing_period` | TEXT    | فترة الفوترة: `monthly`, `yearly`, `lifetime` |
| `trial_days`     | INTEGER | أيام التجربة المجانية                         |

---

## 📋 الخطط الافتراضية

| الخطة      | السعر   | المنتجات  | التجربة |
| ---------- | ------- | --------- | ------- |
| **Free**   | $0      | 50 منتج   | 14 يوم  |
| **Silver** | $29/شهر | 200 منتج  | -       |
| **Gold**   | $99/شهر | 1000 منتج | -       |

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

### الحصول على خطة معينة:

```sql
SELECT * FROM seller_subscription_plans
WHERE name = 'silver' AND plan_type = 'seller';
```

---

## 🔐 سياسات الأمان (RLS)

| السياسة                                  | النوع  | الشرط            |
| ---------------------------------------- | ------ | ---------------- |
| `seller_subscription_plans_public_read`  | SELECT | الخطط النشطة فقط |
| `seller_subscription_plans_admin_manage` | ALL    | الأدمن فقط       |

---

## ⚠️ ملاحظات هامة

1. **لا يعتمد على جدول sellers** - يمكن تشغيل هذا الملف قبل جدول الباعة
2. **الأسعار بالدولار** - جميع الأسعار بـ USD
3. **plan_type** - يُميز بين خطط الباعة (`seller`) وخطط التوصيل (`delivery_partner`)

---

## 🔗 الملفات ذات الصلة

| الملف                                                                   | الوصف           |
| ----------------------------------------------------------------------- | --------------- |
| [04_roles_permissions_system](../04_roles_permissions_system/README.md) | نظام الأدوار    |
| [06_sellers_table](../06_sellers_table/README.md)                       | جدول الباعة     |
| [07_seller_subscriptions](../07_seller_subscriptions/README.md)         | اشتراكات الباعة |

---

**الإصدار:** 1.0  
**آخر تحديث:** 2026  
**المشروع:** Marketna E-Commerce Platform
