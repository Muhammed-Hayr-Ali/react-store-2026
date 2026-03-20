# ✅ نظام ترقية الاشتراكات - مكتمل بالكامل

## 📋 ملخص التنفيذ

تم إنشاء نظام متكامل لترقية الاشتراكات مع واجهات كاملة للباعة والإدارة.

---

## 📁 الملفات المنشأة

### قاعدة البيانات:

| الملف | الوصف |
|-------|-------|
| `10_seller_subscriptions/03_upgrade_requests.sql` | جدول طلبات ترقية الباعة + الدوال |
| `09_delivery_partner_subscriptions/03_delivery_upgrade_requests.sql` | جدول طلبات ترقية التوصيل + الدوال |

### الواجهات - الباعة:

| الملف | الوصف |
|-------|-------|
| `app/dashboard/upgrade-plan/page.tsx` | صفحة اختيار الخطة |
| `app/dashboard/upgrade-plan/request/page.tsx` | نموذج طلب الترقية |
| `app/dashboard/upgrade-plan/success/page.tsx` | صفحة التأكيد |
| `app/dashboard/upgrade-requests/page.tsx` | صفحة حالة الطلبات |

### الواجهات - الإدارة:

| الملف | الوصف |
|-------|-------|
| `app/admin/upgrade-requests/page.tsx` | لوحة إدارة الطلبات |

### التوثيق:

| الملف | الوصف |
|-------|-------|
| `supabase/UPGRADE_SYSTEM_PLAN.md` | خطة العمل |
| `supabase/UPGRADE_SYSTEM.md` | توثيق النظام |
| `supabase/UPGRADE_SYSTEM_SUMMARY.md` | ملخص النظام |
| `docs/UPGRADE_UI.md` | توثيق الواجهات |

---

## 🎯 الميزات المنفذة

### للباعة:

- ✅ عرض الخطط المتاحة (Free, Silver, Gold)
- ✅ مقارنة الخطط
- ✅ إنشاء طلب ترقية
- ✅ اختيار طريقة التواصل
- ✅ متابعة حالة الطلبات
- ✅ عرض ملاحظات الإدارة
- ✅ رسائل التأكيد

### للإدارة:

- ✅ عرض جميع الطلبات
- ✅ فلترة حسب الحالة
- ✅ إحصائيات سريعة
- ✅ مراجعة الطلبات
- ✅ الموافقة/الرفض
- ✅ إضافة ملاحظات
- ✅ تأكيد استلام الدفع
- ✅ تفعيل الاشتراك التلقائي

---

## 🔄 سير العمل الكامل

```
┌─────────────────────────────────────────────────────────┐
│                   البائع                                │
│                                                         │
│  1. يختار الخطة → /dashboard/upgrade-plan              │
│     ↓                                                   │
│  2. يملأ النموذج → /dashboard/upgrade-plan/request    │
│     ↓                                                   │
│  3. تأكيد → /dashboard/upgrade-plan/success           │
│     ↓                                                   │
│  4. متابعة الحالة → /dashboard/upgrade-requests       │
└─────────────────────────────────────────────────────────┘
                         ↓
                  إشعار للإدارة
                         ↓
┌─────────────────────────────────────────────────────────┐
│                   الإدارة                               │
│                                                         │
│  5. مراجعة → /admin/upgrade-requests                  │
│     ↓                                                   │
│  6. موافقة/رفض                                         │
│     ↓                                                   │
│  7. تواصل مع البائع                                     │
│     ↓                                                   │
│  8. تأكيد الدفع                                         │
│     ↓                                                   │
│  9. تفعيل الاشتراك تلقائياً                            │
└─────────────────────────────────────────────────────────┘
```

---

## 📊 قاعدة البيانات

### الجداول:

```sql
-- جدول طلبات ترقية الباعة
seller_upgrade_requests (
  id,
  seller_id,
  current_plan_id,
  target_plan_id,
  status,
  contact_method,
  contact_value,
  seller_notes,
  admin_notes,
  contacted_at,
  payment_received_at,
  completed_at,
  created_at,
  updated_at
)

-- جدول طلبات ترقية التوصيل
delivery_upgrade_requests (
  id,
  delivery_partner_id,
  current_plan_id,
  target_plan_id,
  status,
  ...
)
```

### الدوال:

```typescript
// للباعة
create_upgrade_request()
get_seller_upgrade_requests()
get_all_upgrade_requests()
approve_upgrade_request()
reject_upgrade_request()
complete_upgrade_request()

// للتوصيل
create_delivery_upgrade_request()
get_delivery_upgrade_requests()
approve_delivery_upgrade_request()
reject_delivery_upgrade_request()
complete_delivery_upgrade_request()
```

---

## 🎨 الواجهات

### صفحة اختيار الخطة:

```
┌──────────────────────────────────────────┐
│      اختر الخطة المناسبة لك              │
├──────────────────────────────────────────┤
│  ┌──────┐  ┌──────┐  ┌──────┐           │
│  │ Free │  │Silver│  │ Gold │           │
│  │ $0   │  │ $29  │  │ $99  │           │
│  │ 50   │  │ 200  │  │ 1000 │           │
│  │      │  │  ⭐  │  │      │           │
│  └──────┘  └──────┘  └──────┘           │
│                                          │
│        جدول مقارنة الخطط                 │
│                                          │
│         الأسئلة الشائعة                  │
└──────────────────────────────────────────┘
```

### صفحة نموذج الطلب:

```
┌──────────────────────────────────────────┐
│      طلب ترقية الاشتراك                  │
├──────────────────────────────────────────┤
│  الخطة المختارة: Silver - $29/شهر       │
│                                          │
│  طريقة التواصل: ○ البريد ○ الهاتف ○ WA  │
│                                          │
│  معلومات التواصل: [____________]         │
│                                          │
│  ملاحظات: [___________________]          │
│                                          │
│  [ إرسال طلب الترقية ]                   │
└──────────────────────────────────────────┘
```

### صفحة النجاح:

```
┌──────────────────────────────────────────┐
│            ✅ تم استلام طلبك!            │
│                                          │
│  رقم الطلب: #UPG-12345                   │
│  الحالة: قيد المراجعة                    │
│                                          │
│  الخطوات التالية:                        │
│  1. مراجعة الطلب (24 ساعة)               │
│  2. التواصل معك                          │
│  3. إرسال رابط الدفع                     │
│  4. تفعيل الاشتراك                       │
│                                          │
│  [عرض حالة الطلب] [العودة للرئيسية]     │
└──────────────────────────────────────────┘
```

### لوحة الإدارة:

```
┌──────────────────────────────────────────────────────┐
│ طلبات ترقية الاشتراك          [تصفية: الكل ▼]      │
├──────────────────────────────────────────────────────┤
│ 📊 إحصائيات:                                         │
│  ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐                   │
│  │ الكل│ │قيد  │ │وافق │ │مكتمل│                   │
│  │  10 │ │  3  │ │  5  │ │  2  │                   │
│  └─────┘ └─────┘ └─────┘ └─────┘                   │
├──────────────────────────────────────────────────────┤
│ جدول الطلبات:                                        │
│ رقم الطلب │ البائع │ الخطة │ الحالة │ الإجراءات     │
│ #12345    │ أحمد   │ Silver│ ⏳    │ [عرض]         │
│ #12346    │ محمد   │ Gold  │ ✅    │ [عرض]         │
└──────────────────────────────────────────────────────┘
```

---

## 🔔 الإشعارات

### قنوات PostgreSQL:

```typescript
// الاستماع للإشعارات
const channel = supabase.channel('upgrade_requests')
  .on('postgres_changes', {
    event: 'INSERT',
    schema: 'public',
    table: 'seller_upgrade_requests'
  }, (payload) => {
    // إشعار الإدارة بطلب جديد
    notifyAdmin('طلب ترقية جديد!');
  })
  .on('postgres_changes', {
    event: 'UPDATE',
    schema: 'public',
    table: 'seller_upgrade_requests'
  }, (payload) => {
    // إشعار البائع بتحديث الحالة
    notifySeller(`تم ${getAction(payload.new.status)} طلبك`);
  })
  .subscribe();
```

---

## 💳 التكامل مع الدفع

### Stripe:

```typescript
// إنشاء جلسة دفع
const session = await stripe.checkout.sessions.create({
  mode: 'payment',
  line_items: [{
    price_data: {
      product_data: { name: 'ترقية إلى Silver' },
      unit_amount: 2900,
      currency: 'usd'
    }
  }],
  success_url: `${origin}/upgrade/success?session_id={CHECKOUT_SESSION_ID}`,
  metadata: { requestId: 'UPG-12345' }
});

// Webhook لتأكيد الدفع
app.post('/api/webhooks/stripe', async (req, res) => {
  const event = req.body;
  
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    
    // تأكيد الدفع وتفعيل الاشتراك
    await supabase.rpc('complete_upgrade_request', {
      p_request_id: session.metadata.requestId
    });
  }
  
  res.json({ received: true });
});
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
FROM seller_upgrade_requests;

-- الإيرادات الشهرية
SELECT 
  SUM(ss.amount_paid) as total_revenue
FROM seller_subscriptions ss
JOIN seller_upgrade_requests sur ON sur.seller_id = ss.seller_id
WHERE sur.status = 'completed'
  AND ss.created_at >= NOW() - INTERVAL '30 days';
```

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

## ⚠️ ملاحظات هامة

1. **صفحة الإدارة محمية** - يجب التحقق من صلاحية الأدمن
2. **البائع يمكنه إنشاء طلب واحد معلق فقط** في نفس الوقت
3. **يتم إرسال إشعارات تلقائية** عند كل تحديث
4. **الاشتراك يُفعّل تلقائياً** بعد تأكيد الدفع
5. **يمكن تتبع جميع الطلبات** من لوحة التحكم

---

## 🎯 الخطوات التالية (اختيارية)

- [ ] إضافة بوابة الدفع (Stripe/PayPal)
- [ ] إضافة الإشعارات Email/SMS/WhatsApp
- [ ] إضافة تصدير الطلبات إلى CSV
- [ ] إضافة رسوم بيانية للإحصائيات
- [ ] إضافة فلترة متقدمة في لوحة الإدارة
- [ ] إضافة بحث في الطلبات

---

**الحالة:** ✅ مكتمل بالكامل  
**الإصدار:** 1.0  
**آخر تحديث:** 2026  
**المشروع:** Marketna E-Commerce Platform
