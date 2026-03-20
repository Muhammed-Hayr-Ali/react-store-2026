# ✅ نظام ترقية الاشتراكات - مكتمل

## 📋 ملخص التنفيذ

تم إنشاء نظام متكامل لترقية الاشتراكات للباعة وموظفي التوصيل.

---

## 📁 الملفات الجديدة

### قاعدة البيانات:

| الملف | الوصف | المجلد |
|-------|-------|--------|
| `03_upgrade_requests.sql` | جدول طلبات ترقية الباعة + الدوال | `10_seller_subscriptions/` |
| `03_delivery_upgrade_requests.sql` | جدول طلبات ترقية التوصيل + الدوال | `09_delivery_partner_subscriptions/` |

### التوثيق:

| الملف | الوصف |
|-------|-------|
| `UPGRADE_SYSTEM_PLAN.md` | خطة العمل الكاملة |
| `UPGRADE_SYSTEM.md` | توثيق النظام الشامل |
| `DATABASE_STATUS.md` | حالة قاعدة البيانات |

---

## 🚀 التشغيل

```bash
# للباعة
psql -f supabase/10_seller_subscriptions/03_upgrade_requests.sql

# للتوصيل
psql -f supabase/09_delivery_partner_subscriptions/03_delivery_upgrade_requests.sql
```

---

## 📊 الجداول الجديدة

### 1. `seller_upgrade_requests`

| العمود | النوع | الوصف |
|--------|-------|-------|
| `id` | UUID | معرف الطلب |
| `seller_id` | UUID | معرف البائع |
| `current_plan_id` | UUID | الخطة الحالية |
| `target_plan_id` | UUID | الخطة المطلوبة |
| `status` | TEXT | `pending`, `approved`, `rejected`, `completed` |
| `contact_method` | TEXT | `email`, `phone`, `whatsapp` |
| `contact_value` | TEXT | معلومات التواصل |
| `seller_notes` | TEXT | ملاحظات البائع |
| `admin_notes` | TEXT | ملاحظات الإدارة |
| `contacted_at` | TIMESTAMPTZ | تاريخ التواصل |
| `payment_received_at` | TIMESTAMPTZ | تاريخ استلام الدفع |
| `completed_at` | TIMESTAMPTZ | تاريخ الإكمال |

### 2. `delivery_upgrade_requests`

نفس الهيكلية مع `delivery_partner_id`

---

## 🔧 الدوال الجديدة

### للباعة:

| الدالة | الوصف |
|--------|-------|
| `create_upgrade_request()` | إنشاء طلب ترقية جديد |
| `get_seller_upgrade_requests()` | الحصول على طلبات البائع |
| `get_all_upgrade_requests()` | الحصول على جميع الطلبات (أدمن) |
| `approve_upgrade_request()` | الموافقة على الترقية (أدمن) |
| `reject_upgrade_request()` | رفض الترقية (أدمن) |
| `complete_upgrade_request()` | إكمال الترقية بعد الدفع (أدمن) |

### للتوصيل:

| الدالة | الوصف |
|--------|-------|
| `create_delivery_upgrade_request()` | إنشاء طلب ترقية جديد |
| `get_delivery_upgrade_requests()` | الحصول على طلبات السائق |
| `approve_delivery_upgrade_request()` | الموافقة على الترقية (أدمن) |
| `reject_delivery_upgrade_request()` | رفض الترقية (أدمن) |
| `complete_delivery_upgrade_request()` | إكمال الترقية بعد الدفع (أدمن) |

---

## 🔄 سير العمل

```
1. المستخدم يختار الخطة
   ↓
2. ينشئ طلب ترقية
   ↓
3. إشعار للإدارة
   ↓
4. الإدارة تراجع الطلب
   ↓
5. الإدارة تتواصل مع المستخدم
   ↓
6. المستخدم يدفع
   ↓
7. الإدارة تؤكد الدفع
   ↓
8. تفعيل الاشتراك تلقائياً
   ↓
9. إشعار للمستخدم
```

---

## 📱 الصفحات المطلوبة

### للمستخدمين:

| الصفحة | المسار | الوصف |
|--------|--------|-------|
| اختيار الخطة | `/dashboard/upgrade-plan` | عرض الخطط المتاحة |
| نموذج الطلب | `/dashboard/upgrade-plan/request` | إنشاء طلب ترقية |
| النجاح | `/dashboard/upgrade-plan/success` | رسالة تأكيد |
| حالة الطلبات | `/dashboard/upgrade-requests` | تتبع الطلبات |

### للإدارة:

| الصفحة | المسار | الوصف |
|--------|--------|-------|
| قائمة الطلبات | `/admin/upgrade-requests` | جميع الطلبات |
| التفاصيل | `/admin/upgrade-requests/[id]` | تفاصيل الطلب |

---

## 🔔 الإشعارات

### قنوات PostgreSQL:

```typescript
const channels = [
  'upgrade_request_created',    // طلب جديد
  'upgrade_request_approved',   // تمت الموافقة
  'upgrade_request_rejected',   // تم الرفض
  'upgrade_completed'           // تم التفعيل
];
```

---

## 💳 خيارات الدفع

1. **Stripe** - بطاقات الائتمان
2. **PayPal** - PayPal
3. **تحويل بنكي** - للحسابات الكبيرة
4. **مدى/Apple Pay** - للسعودية

---

## 📊 حالات الطلب

| الحالة | الوصف | من يغيرها |
|--------|-------|----------|
| `pending` | بانتظار المراجعة | البائع/السائق |
| `approved` | تمت الموافقة | الإدارة |
| `rejected` | تم الرفض | الإدارة |
| `completed` | تم الدفع والتفعيل | الإدارة |

---

## 🔐 الأمان

### سياسات RLS:

```sql
-- البائع يقرأ طلباته فقط
CREATE POLICY "seller_upgrade_requests_read_own"
ON seller_upgrade_requests FOR SELECT
TO authenticated USING (
  seller_id = (SELECT id FROM sellers WHERE user_id = auth.uid())
  OR public.is_admin()
);

-- البائع ينشئ طلب لنفسه فقط
CREATE POLICY "seller_upgrade_requests_insert_own"
ON seller_upgrade_requests FOR INSERT
TO authenticated WITH CHECK (
  seller_id = (SELECT id FROM sellers WHERE user_id = auth.uid())
);

-- الإدارة فقط تحدث
CREATE POLICY "seller_upgrade_requests_admin_update"
ON seller_upgrade_requests FOR UPDATE
TO authenticated USING (public.is_admin());
```

---

## 📈 التقارير

### للإدارة:

```sql
-- عدد الطلبات حسب الحالة
SELECT status, COUNT(*) as count
FROM seller_upgrade_requests
GROUP BY status;

-- معدل التحويلات
SELECT 
  COUNT(*) FILTER (WHERE status = 'completed')::float / 
  COUNT(*) * 100 as conversion_rate
FROM seller_upgrade_requests
WHERE created_at >= NOW() - INTERVAL '30 days';

-- الإيرادات
SELECT SUM(amount_paid) as total_revenue
FROM seller_subscriptions
WHERE created_at >= NOW() - INTERVAL '30 days';
```

---

## ⚠️ ملاحظات هامة

1. **البائع يمكنه إنشاء طلب واحد معلق فقط** في نفس الوقت
2. **الإدارة تراجع الطلب خلال 24 ساعة**
3. **يتم إرسال رابط الدفع بعد الموافقة**
4. **الاشتراك يُفعّل تلقائياً بعد الدفع**
5. **يمكن تتبع حالة الطلب من لوحة التحكم**

---

## 🎯 الخطوات التالية

### 1. واجهة المستخدم

- [ ] صفحة اختيار الخطة
- [ ] نموذج طلب الترقية
- [ ] صفحة النجاح
- [ ] صفحة حالة الطلبات

### 2. لوحة الإدارة

- [ ] قائمة الطلبات
- [ ] صفحة التفاصيل
- [ ] إجراءات الموافقة/الرفض
- [ ] تأكيد الدفع

### 3. التكامل مع الدفع

- [ ] Stripe integration
- [ ] PayPal integration
- [ ] Webhooks للدفع التلقائي

### 4. الإشعارات

- [ ] Email notifications
- [ ] SMS notifications
- [ ] WhatsApp notifications
- [ ] Dashboard notifications

---

## 📞 الدعم

لأي استفسارات:
- 📧 البريد: support@marketna.com
- 📚 التوثيق: [UPGRADE_SYSTEM.md](./UPGRADE_SYSTEM.md)

---

**الحالة:** ✅ مكتمل  
**الإصدار:** 1.0  
**آخر تحديث:** 2026  
**المشروع:** Marketna E-Commerce Platform
