# 🎯 نظام ترقية الاشتراكات - Marketna E-Commerce

## 📋 نظرة عامة

نظام متكامل يسمح للباعة وموظفي التوصيل بطلب ترقية اشتراكاتهم، مع إدارة كاملة من قبل الإدارة للمراجعة والتواصل والدفع والتفعيل.

---

## 🚀 دليل التشغيل السريع

### للباعة:

```bash
# 1. عرض الخطط المتاحة
SELECT name, name_ar, price_usd, max_products, features_ar
FROM seller_subscription_plans
WHERE is_active = TRUE AND plan_type = 'seller'
ORDER BY sort_order;

# 2. إنشاء طلب ترقية
SELECT public.create_upgrade_request(
  p_seller_id := 'seller-uuid-here',
  p_target_plan_id := (SELECT id FROM seller_subscription_plans WHERE name = 'silver'),
  p_contact_method := 'whatsapp',
  p_contact_value := '+966501234567',
  p_seller_notes := 'أرغب في ترقية اشتراكي'
);

# 3. عرض حالة الطلبات
SELECT * FROM public.get_seller_upgrade_requests();
```

### للإدارة:

```bash
# 1. عرض جميع طلبات الترقية
SELECT * FROM public.get_all_upgrade_requests();

# 2. عرض الطلبات المعلقة فقط
SELECT * FROM public.get_all_upgrade_requests('pending');

# 3. الموافقة على طلب
SELECT public.approve_upgrade_request(
  p_request_id := 'request-uuid-here',
  p_admin_notes := 'تمت الموافقة'
);

# 4. رفض طلب
SELECT public.reject_upgrade_request(
  p_request_id := 'request-uuid-here',
  p_admin_notes := 'السبب'
);

# 5. إكمال الترقية (بعد الدفع)
SELECT public.complete_upgrade_request(
  p_request_id := 'request-uuid-here'
);
```

---

## 📊 هيكلية النظام

### للباعة:

```
┌─────────────────────────┐
│ seller_subscription_    │
│ plans                   │ ← الخطط المتاحة
├─────────────────────────┤
│ id                      │
│ name (free/silver/gold) │
│ price_usd               │
│ max_products            │
└───────────┬─────────────┘
            │
            │ N:1
            ▼
┌─────────────────────────┐
│ seller_upgrade_         │
│ requests                │ ← طلبات الترقية
├─────────────────────────┤
│ id                      │
│ seller_id (FK)          │
│ current_plan_id (FK)    │
│ target_plan_id (FK)     │
│ status                  │
│ contact_method          │
│ admin_notes             │
└───────────┬─────────────┘
            │
            │ 1:1
            ▼
┌─────────────────────────┐
│ seller_subscriptions    │ ← الاشتراك الفعلي
├─────────────────────────┤
│ seller_id (FK)          │
│ plan_id (FK)            │
│ status                  │
└─────────────────────────┘
```

### لموظفي التوصيل:

نفس الهيكلية مع جداول `delivery_*`

---

## 🔄 سير العمل الكامل

### 1. البائع يختار الخطة

```typescript
// صفحة اختيار الخطة
const plans = [
  { name: 'Free', price: 0, products: 50 },
  { name: 'Silver', price: 29, products: 200 },
  { name: 'Gold', price: 99, products: 1000 }
];
```

### 2. إنشاء طلب الترقية

```typescript
// نموذج طلب الترقية
const upgradeRequest = {
  targetPlan: 'silver',
  contactMethod: 'whatsapp',
  contactValue: '+966501234567',
  notes: 'أرغب في ترقية اشتراكي'
};

// إرسال الطلب
const { data, error } = await supabase.rpc('create_upgrade_request', {
  p_seller_id: sellerId,
  p_target_plan_id: planId,
  p_contact_method: 'whatsapp',
  p_contact_value: '+966501234567',
  p_seller_notes: 'أرغب في ترقية اشتراكي'
});
```

### 3. رسالة التأكيد

```
┌─────────────────────────────────────────┐
│  ✅ تم استلام طلبك بنجاح!               │
├─────────────────────────────────────────┤
│  رقم الطلب: #UPG-12345                  │
│  الخطة المطلوبة: Silver                 │
│                                         │
│  📞 الإدارة ستتواصل معك خلال 24 ساعة    │
│     لترتيب عملية الدفع والتفعيل         │
│                                         │
│  [عرض حالة الطلب]                       │
└─────────────────────────────────────────┘
```

### 4. الإدارة تراجع الطلب

```typescript
// لوحة الإدارة
const requests = await supabase.rpc('get_all_upgrade_requests', {
  p_status: 'pending'
});

// الموافقة على طلب
await supabase.rpc('approve_upgrade_request', {
  p_request_id: requestId,
  p_admin_notes: 'تمت الموافقة. يرجى التواصل للدفع'
});
```

### 5. التواصل مع البائع

```typescript
// إرسال رسالة WhatsApp
await sendWhatsApp({
  to: '+966501234567',
  message: `
مرحباً! تم الموافقة على طلب ترقية اشتراكك.
رقم الطلب: #UPG-12345
الخطة: Silver ($29/شهر)

يرجى إتمام الدفع عبر الرابط:
https://marketna.com/pay/UPG-12345

شكراً لك!
`
});
```

### 6. البائع يدفع

```typescript
// صفحة الدفع
const payment = await stripe.paymentIntents.create({
  amount: 2900, // $29.00
  currency: 'usd',
  metadata: { requestId: 'UPG-12345' }
});
```

### 7. الإدارة تؤكد الدفع

```typescript
// بعد استلام الدفع
await supabase.rpc('complete_upgrade_request', {
  p_request_id: requestId
});
```

### 8. تفعيل الاشتراك

```sql
-- يتم تلقائياً عبر الدالة complete_upgrade_request
INSERT INTO seller_subscriptions (
  seller_id,
  plan_id,
  status,
  start_date,
  end_date
) VALUES (
  'seller-uuid',
  'silver-plan-uuid',
  'active',
  NOW(),
  NOW() + INTERVAL '1 month'
);
```

### 9. إشعار للبائع

```
┌─────────────────────────────────────────┐
│  🎉 تم تفعيل اشتراكك بنجاح!             │
├─────────────────────────────────────────┤
│  الخطة: Silver                          │
│  تاريخ البدء: 2026-01-15                │
│  تاريخ الانتهاء: 2026-02-15              │
│                                         │
│  عدد المنتجات المسموح: 200              │
│                                         │
│  [العودة للوحة التحكم]                  │
└─────────────────────────────────────────┘
```

---

## 📱 صفحات الواجهة

### 1. صفحة اختيار الخطة

**المسار:** `/dashboard/upgrade-plan`

```typescript
// components/upgrade/PlanCards.tsx
export function PlanCards() {
  const plans = [
    { name: 'Free', price: 0, products: 50, current: true },
    { name: 'Silver', price: 29, products: 200, popular: true },
    { name: 'Gold', price: 99, products: 1000 }
  ];

  return (
    <div className="grid grid-cols-3 gap-4">
      {plans.map(plan => (
        <PlanCard key={plan.name} plan={plan} />
      ))}
    </div>
  );
}
```

### 2. نموذج طلب الترقية

**المسار:** `/dashboard/upgrade-plan/request`

```typescript
// components/upgrade/UpgradeRequestForm.tsx
export function UpgradeRequestForm() {
  const [form, setForm] = useState({
    targetPlan: '',
    contactMethod: 'email',
    contactValue: '',
    notes: ''
  });

  const handleSubmit = async () => {
    const { error } = await supabase.rpc('create_upgrade_request', {
      p_seller_id: sellerId,
      p_target_plan_id: form.targetPlan,
      p_contact_method: form.contactMethod,
      p_contact_value: form.contactValue,
      p_seller_notes: form.notes
    });

    if (!error) {
      router.push('/dashboard/upgrade-plan/success');
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* حقول النموذج */}
    </form>
  );
}
```

### 3. صفحة النجاح

**المسار:** `/dashboard/upgrade-plan/success`

```typescript
// app/dashboard/upgrade-plan/success/page.tsx
export default function SuccessPage() {
  return (
    <div className="text-center">
      <CheckCircle className="w-16 h-16 text-green-500" />
      <h1 className="text-2xl font-bold mt-4">تم استلام طلبك بنجاح!</h1>
      <p className="text-gray-600 mt-2">
        الإدارة ستتواصل معك خلال 24 ساعة
      </p>
      <Link href="/dashboard/upgrade-requests">
        عرض حالة الطلب
      </Link>
    </div>
  );
}
```

### 4. صفحة حالة الطلبات

**المسار:** `/dashboard/upgrade-requests`

```typescript
// components/upgrade/UpgradeStatus.tsx
export function UpgradeStatus() {
  const { data: requests } = useSWR(
    '/api/upgrade-requests',
    () => supabase.rpc('get_seller_upgrade_requests')
  );

  return (
    <div>
      {requests?.map(request => (
        <UpgradeRequestCard key={request.request_id} request={request} />
      ))}
    </div>
  );
}
```

### 5. لوحة الإدارة

**المسار:** `/admin/upgrade-requests`

```typescript
// app/admin/upgrade-requests/page.tsx
export default function AdminUpgradeRequests() {
  const { data: requests } = useSWR(
    '/api/admin/upgrade-requests',
    () => supabase.rpc('get_all_upgrade_requests', { p_status: 'pending' })
  );

  const handleApprove = async (requestId: string) => {
    await supabase.rpc('approve_upgrade_request', {
      p_request_id: requestId,
      p_admin_notes: 'تمت الموافقة'
    });
  };

  const handleReject = async (requestId: string) => {
    await supabase.rpc('reject_upgrade_request', {
      p_request_id: requestId,
      p_admin_notes: 'مرفوض'
    });
  };

  const handleComplete = async (requestId: string) => {
    await supabase.rpc('complete_upgrade_request', {
      p_request_id: requestId
    });
  };

  return (
    <div>
      {requests?.map(request => (
        <UpgradeRequestRow
          key={request.request_id}
          request={request}
          onApprove={handleApprove}
          onReject={handleReject}
          onComplete={handleComplete}
        />
      ))}
    </div>
  );
}
```

---

## 🔔 نظام الإشعارات

### قنوات PostgreSQL:

```typescript
// الاستماع للإشعارات
useEffect(() => {
  const channel = supabase
    .channel('upgrade_requests')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'seller_upgrade_requests'
      },
      (payload) => {
        if (payload.eventType === 'INSERT') {
          // طلب جديد - إشعار الإدارة
          notifyAdmin('طلب ترقية جديد');
        } else if (payload.eventType === 'UPDATE') {
          // تحديث الحالة - إشعار البائع
          notifySeller(`تم ${getAction(payload.new.status)} طلبك`);
        }
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}, []);
```

---

## 📊 حالات الطلب

| الحالة | الوصف | من يغيرها |
|--------|-------|----------|
| `pending` | بانتظار المراجعة | البائع (عند الإنشاء) |
| `approved` | تمت الموافقة | الإدارة |
| `rejected` | تم الرفض | الإدارة |
| `completed` | تم الدفع والتفعيل | الإدارة |

---

## 💳 خيارات الدفع

### 1. Stripe (بطاقات الائتمان)

```typescript
const session = await stripe.checkout.sessions.create({
  mode: 'payment',
  line_items: [{
    price_data: {
      product_data: { name: 'ترقية إلى Silver' },
      unit_amount: 2900,
      currency: 'usd'
    },
    quantity: 1
  }],
  success_url: `${origin}/upgrade/success?session_id={CHECKOUT_SESSION_ID}`,
  cancel_url: `${origin}/upgrade/cancel`,
  metadata: { requestId: 'UPG-12345' }
});
```

### 2. PayPal

```typescript
const order = await paypalClient.orders.create({
  intent: 'CAPTURE',
  purchase_units: [{
    amount: { currency_code: 'USD', value: '29.00' },
    custom_id: 'UPG-12345'
  }]
});
```

### 3. تحويل بنكي

```
بيانات الحساب البنكي:
البنك: بنك الراجحي
رقم الحساب: SA00000000000000000000
الاسم: Marketna E-Commerce

يرجى إرسال إيصال التحويل إلى:
finance@marketna.com
```

---

## 📈 التقارير والإحصائيات

### للإدارة:

```sql
-- عدد طلبات الترقية حسب الحالة
SELECT status, COUNT(*) as count
FROM seller_upgrade_requests
GROUP BY status;

-- معدل التحويلات
SELECT 
  COUNT(*) FILTER (WHERE status = 'completed')::float / 
  COUNT(*) FILTER (WHERE status IN ('completed', 'rejected')) * 100 
  as conversion_rate
FROM seller_upgrade_requests;

-- الإيرادات من الترقيات
SELECT 
  SUM(ss.amount_paid) as total_revenue
FROM seller_subscriptions ss
JOIN seller_upgrade_requests sur ON sur.seller_id = ss.seller_id
WHERE sur.status = 'completed';
```

---

## 🔐 الأمان

### التحقق من الملكية:

```sql
-- البائع يمكنه إنشاء طلب لنفسه فقط
CREATE POLICY "seller_upgrade_requests_insert_own"
ON seller_upgrade_requests FOR INSERT
TO authenticated 
WITH CHECK (
  seller_id = (SELECT id FROM sellers WHERE user_id = auth.uid())
);
```

### صلاحيات الإدارة:

```sql
-- فقط الأدمن يمكنه الموافقة/الرفض
CREATE POLICY "seller_upgrade_requests_admin_update"
ON seller_upgrade_requests FOR UPDATE
TO authenticated 
USING (public.is_admin());
```

---

## ⚠️ ملاحظات هامة

1. **البائع يمكنه إنشاء طلب واحد معلق فقط** في نفس الوقت
2. **الإدارة تراجع الطلب خلال 24 ساعة**
3. **يتم إرسال رابط الدفع بعد الموافقة**
4. **الاشتراك يُفعّل تلقائياً بعد الدفع**
5. **يمكن تتبع حالة الطلب من لوحة التحكم**

---

**الإصدار:** 1.0  
**آخر تحديث:** 2026  
**المشروع:** Marketna E-Commerce Platform
