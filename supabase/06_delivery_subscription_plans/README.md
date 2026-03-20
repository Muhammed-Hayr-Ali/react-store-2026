# 🚴 خطط اشتراكات التوصيل (Delivery Subscription Plans)

## 📋 نظرة عامة

هذا المجلد يحتوي على **خطط اشتراكات موظفي التوصيل** فقط (Free, Silver, Gold).

**الترتيب:** 05  
**يعتمد على:** 04_roles_permissions_system  
**يسبق:** 07_delivery_partners (مستقبلاً), 08_delivery_partner_subscriptions (مستقبلاً)

---

## 📁 محتويات الملف

| الملف                                | الوصف                                     |
| ------------------------------------ | ----------------------------------------- |
| `01_delivery_subscription_plans.sql` | جدول خطط الاشتراكات + البيانات الافتراضية |
| `README.md`                          | هذا الملف                                 |

---

## 🚀 التثبيت

```bash
# يُنفذ بعد نظام الأدوار والصلاحيات
psql -f supabase/04_roles_permissions_system/01_roles_permissions_system.sql

# ثم خطط اشتراكات التوصيل (هذا الملف)
psql -f supabase/05_delivery_subscription_plans/01_delivery_subscription_plans.sql

# ثم جدول موظفي التوصيل (مستقبلاً)
# psql -f supabase/07_delivery_partners/01_delivery_partners_schema.sql

# ثم اشتراكات التوصيل (مستقبلاً)
# psql -f supabase/08_delivery_partner_subscriptions/02_delivery_partner_subscriptions.sql
```

---

## 📊 هيكل الجدول

### جدول `delivery_subscription_plans`

| العمود               | النوع   | الوصف                               |
| -------------------- | ------- | ----------------------------------- |
| `id`                 | UUID    | المعرف الفريد                       |
| `plan_type`          | TEXT    | نوع الخطة: `delivery_partner`       |
| `name`               | TEXT    | اسم الخطة: `free`, `silver`, `gold` |
| `name_ar`            | TEXT    | الاسم بالعربية                      |
| `price_usd`          | DECIMAL | السعر بالدولار                      |
| `max_orders_per_day` | INTEGER | الحد الأقصى للطلبات يومياً          |
| `commission_rate`    | DECIMAL | نسبة العمولة (%)                    |
| `max_coverage_zones` | INTEGER | الحد الأقصى لمناطق التغطية          |
| `priority_delivery`  | BOOLEAN | أولوية الحصول على الطلبات           |
| `features`           | JSONB   | الميزات (بالإنجليزية)               |
| `features_ar`        | JSONB   | الميزات (بالعربية)                  |
| `is_active`          | BOOLEAN | هل الخطة نشطة؟                      |
| `is_popular`         | BOOLEAN | هل هي الأكثر شعبية؟                 |
| `billing_period`     | TEXT    | فترة الفوترة                        |
| `trial_days`         | INTEGER | أيام التجربة المجانية               |

---

## 📋 الخطط الافتراضية

| الخطة      | السعر   | الطلبات/يوم | العمولة | التجربة |
| ---------- | ------- | ----------- | ------- | ------- |
| **Free**   | $0      | 3 طلبات     | 15%     | 7 أيام  |
| **Silver** | $19/شهر | 10 طلبات    | 10%     | -       |
| **Gold**   | $49/شهر | غير محدود   | 5%      | -       |

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

---

## 🔐 سياسات الأمان (RLS)

| السياسة                                    | النوع  | الشرط            |
| ------------------------------------------ | ------ | ---------------- |
| `delivery_subscription_plans_public_read`  | SELECT | الخطط النشطة فقط |
| `delivery_subscription_plans_admin_manage` | ALL    | الأدمن فقط       |

---

## ⚠️ ملاحظات هامة

1. **لا يعتمد على جدول delivery_partners** - يمكن تشغيل هذا الملف قبل جدول التوصيل
2. **الأسعار بالدولار** - جميع الأسعار بـ USD
3. **commission_rate** - نسبة العمولة التي تُخصم من كل طلب

---

## 🔗 الملفات ذات الصلة

| الملف                                                                     | الوصف               |
| ------------------------------------------------------------------------- | ------------------- |
| [04_roles_permissions_system](../04_roles_permissions_system/README.md)   | نظام الأدوار        |
| [04_seller_subscription_plans](../04_seller_subscription_plans/README.md) | خطط اشتراكات الباعة |

---

**الإصدار:** 1.0  
**آخر تحديث:** 2026  
**المشروع:** Marketna E-Commerce Platform
