# 💳 اشتراكات الباعة (Seller Subscriptions)

## 📋 نظرة عامة

هذا المجلد يحتوي على نظام اشتراكات الباعة الكامل:

- جدول الاشتراكات الفعلية
- جدول طلبات الترقية
- دوال الإدارة
- سياسات الأمان

**الترتيب:** 10  
**يعتمد على:** 05_seller_subscription_plans, 07_sellers_table  
**يسبق:** -

---

## 📁 محتويات المجلد

| الملف                         | الوصف                         | الترتيب |
| ----------------------------- | ----------------------------- | ------- |
| `02_seller_subscriptions.sql` | جدول اشتراكات الباعة + الدوال | 1       |
| `03_upgrade_requests.sql`     | جدول طلبات الترقية + الدوال   | 2       |
| `README.md`                   | هذا الملف                     | -       |

---

## 🚀 التثبيت

```bash
# الترتيب الصحيح:

# 1. خطط اشتراكات الباعة
psql -f supabase/05_seller_subscription_plans/01_seller_subscription_plans.sql

# 2. جدول الباعة
psql -f supabase/07_sellers_table/01_sellers_schema.sql

# 3. اشتراكات الباعة (هذا الملف)
psql -f supabase/10_seller_subscriptions/02_seller_subscriptions.sql

# 4. طلبات الترقية
psql -f supabase/10_seller_subscriptions/03_upgrade_requests.sql
```

---

## 📊 الجداول

### 1. جدول `seller_subscriptions`

| العمود             | النوع       | الوصف          |
| ------------------ | ----------- | -------------- |
| `id`               | UUID        | المعرف الفريد  |
| `seller_id`        | UUID        | معرف البائع    |
| `plan_id`          | UUID        | معرف الخطة     |
| `status`           | TEXT        | الحالة         |
| `start_date`       | TIMESTAMPTZ | تاريخ البدء    |
| `end_date`         | TIMESTAMPTZ | تاريخ الانتهاء |
| `payment_provider` | TEXT        | مزود الدفع     |
| `amount_paid`      | DECIMAL     | المبلغ المدفوع |

### 2. جدول `seller_upgrade_requests`

| العمود                | النوع       | الوصف                                          |
| --------------------- | ----------- | ---------------------------------------------- |
| `id`                  | UUID        | معرف الطلب                                     |
| `seller_id`           | UUID        | معرف البائع                                    |
| `current_plan_id`     | UUID        | الخطة الحالية                                  |
| `target_plan_id`      | UUID        | الخطة المطلوبة                                 |
| `status`              | TEXT        | `pending`, `approved`, `rejected`, `completed` |
| `contact_method`      | TEXT        | `email`, `phone`, `whatsapp`                   |
| `contact_value`       | TEXT        | معلومات التواصل                                |
| `seller_notes`        | TEXT        | ملاحظات البائع                                 |
| `admin_notes`         | TEXT        | ملاحظات الإدارة                                |
| `contacted_at`        | TIMESTAMPTZ | تاريخ التواصل                                  |
| `payment_received_at` | TIMESTAMPTZ | تاريخ استلام الدفع                             |
| `completed_at`        | TIMESTAMPTZ | تاريخ الإكمال                                  |

---

## 🔧 الدوال الرئيسية

### للباعة:

| الدالة                         | الوصف                      |
| ------------------------------ | -------------------------- |
| `get_seller_subscription()`    | الحصول على الاشتراك الحالي |
| `can_add_product()`            | التحقق من حد المنتجات      |
| `create_seller_subscription()` | إنشاء اشتراك جديد          |
| `cancel_seller_subscription()` | إلغاء الاشتراك             |
| `renew_seller_subscription()`  | تجديد الاشتراك             |

### لطلبات الترقية:

| الدالة                          | الوصف                          |
| ------------------------------- | ------------------------------ |
| `create_upgrade_request()`      | إنشاء طلب ترقية جديد           |
| `get_seller_upgrade_requests()` | الحصول على طلبات الترقية       |
| `approve_upgrade_request()`     | الموافقة على الترقية (أدمن)    |
| `reject_upgrade_request()`      | رفض الترقية (أدمن)             |
| `complete_upgrade_request()`    | إكمال الترقية بعد الدفع (أدمن) |
| `get_all_upgrade_requests()`    | عرض جميع الطلبات (أدمن)        |

---

## 💻 أمثلة الاستخدام

### إنشاء طلب ترقية:

```sql
SELECT public.create_upgrade_request(
  p_seller_id := 'seller-uuid-here',
  p_target_plan_id := (SELECT id FROM seller_subscription_plans WHERE name = 'silver'),
  p_contact_method := 'whatsapp',
  p_contact_value := '+966501234567',
  p_seller_notes := 'أرغب في ترقية اشتراكي إلى الخطة الفضية'
);
```

### عرض طلبات الترقية للبائع:

```sql
SELECT * FROM public.get_seller_upgrade_requests();
```

### الإدارة - عرض جميع الطلبات:

```sql
-- عرض جميع الطلبات
SELECT * FROM public.get_all_upgrade_requests();

-- عرض الطلبات المعلقة فقط
SELECT * FROM public.get_all_upgrade_requests('pending');
```

### الإدارة - الموافقة على طلب:

```sql
SELECT public.approve_upgrade_request(
  p_request_id := 'request-uuid-here',
  p_admin_notes := 'تمت الموافقة. يرجى التواصل مع البائع لترتيب الدفع'
);
```

### الإدارة - إكمال الترقية بعد الدفع:

```sql
SELECT public.complete_upgrade_request(
  p_request_id := 'request-uuid-here'
);
```

---

## 🔄 سير عمل الترقية

```
1. البائع يختار الخطة
   ↓
2. ينشئ طلب ترقية
   ↓
3. إشعار للإدارة
   ↓
4. الإدارة تراجع الطلب
   ↓
5. الإدارة تتواصل مع البائع
   ↓
6. البائع يدفع
   ↓
7. الإدارة تؤكد الدفع
   ↓
8. تفعيل الاشتراك تلقائياً
   ↓
9. إشعار للبائع
```

---

## 🔐 سياسات الأمان

### جدول `seller_subscriptions`:

| السياسة                             | النوع  | الشرط                 |
| ----------------------------------- | ------ | --------------------- |
| `seller_subscriptions_read_own`     | SELECT | البائع يقرأ اشتراكاته |
| `seller_subscriptions_insert_own`   | INSERT | البائع ينشئ اشتراكه   |
| `seller_subscriptions_admin_manage` | ALL    | الأدمن فقط            |

### جدول `seller_upgrade_requests`:

| السياسة                                | النوع  | الشرط              |
| -------------------------------------- | ------ | ------------------ |
| `seller_upgrade_requests_read_own`     | SELECT | البائع يقرأ طلباته |
| `seller_upgrade_requests_insert_own`   | INSERT | البائع ينشئ طلبه   |
| `seller_upgrade_requests_admin_update` | UPDATE | الأدمن فقط         |
| `seller_upgrade_requests_admin_manage` | ALL    | الأدمن فقط         |

---

## 🔔 إشعارات قاعدة البيانات

### القنوات:

```typescript
// الاستماع للإشعارات
const channel = supabase.channel('upgrade_requests')
  .on('postgres_changes', {
    event: '*',
    schema: 'public',
    table: 'seller_upgrade_requests'
  }, (payload) => {
    console.log('Notification:', payload);
  })
  .subscribe();
```

### أنواع الإشعارات:

| القناة                     | الحدث            |
| -------------------------- | ---------------- |
| `upgrade_request_created`  | إنشاء طلب جديد   |
| `upgrade_request_approved` | الموافقة على طلب |
| `upgrade_request_rejected` | رفض طلب          |
| `upgrade_completed`        | إكمال الترقية    |

---

## ⚠️ ملاحظات هامة

1. **البائع يمكنه إنشاء طلب واحد معلق فقط** في نفس الوقت
2. **الإدارة فقط** يمكنها الموافقة/الرفض/الإكمال
3. **يتم إرسال إشعارات** للإدارة عند إنشاء طلب جديد
4. **يتم تفعيل الاشتراك تلقائياً** عند إكمال الترقية
5. **جميع الأسعار بالدولار** (USD)

---

## 🔗 الملفات ذات الصلة

| الملف                                                                               | الوصف            |
| ----------------------------------------------------------------------------------- | ---------------- |
| [05_seller_subscription_plans](../05_seller_subscription_plans/README.md)           | خطط الاشتراكات   |
| [07_sellers_table](../07_sellers_table/README.md)                                   | جدول الباعة      |
| [09_delivery_partner_subscriptions](../09_delivery_partner_subscriptions/README.md) | اشتراكات التوصيل |

---

**الإصدار:** 1.0  
**آخر تحديث:** 2026  
**المشروع:** Marketna E-Commerce Platform
