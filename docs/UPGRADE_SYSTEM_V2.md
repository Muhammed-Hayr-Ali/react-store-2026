# 🔄 نظام ترقية الحسابات - Marketna

## 📋 نظرة عامة

تم تطوير نظام ترقية الحسابات لربط **اختيار الخطة** مع **تقديم الطلب** في خطوة واحدة، بحيث:

1. ✅ يختار المستخدم الخطة أثناء تقديم الطلب
2. ✅ يتم إنشاء حساب البائع/التوصيل
3. ✅ يتم إنشاء طلب ترقية مرتبط بالخطة المختارة
4. ✅ عند موافقة الإدارة، يتم:
   - تفعيل الحساب
   - تحديد نوع الخطة
   - حساب تاريخ الانتهاء تلقائياً

---

## 🎯 سير العمل الجديد

### **لللباعة:**

```
1. المستخدم يدخل معلومات المتجر
   ↓
2. يختار خطة الاشتراك (Free/Silver/Gold)
   ↓
3. يضغط "حفظ ومتابعة"
   ↓
4. يتم إنشاء:
   - حساب البائع (status: pending)
   - طلب ترقية (status: pending, plan_id: selected)
   ↓
5. الإدارة تراجع الطلب
   ↓
6. الإدارة توافق
   ↓
7. يتم تفعيل:
   - حساب البائع (status: active)
   - الاشتراك (plan: selected, end_date: calculated)
```

### **لموظفي التوصيل:**

```
1. المستخدم يدخل معلومات التوصيل
   ↓
2. يختار خطة الاشتراك (Free/Silver/Gold)
   ↓
3. يضغط "حفظ ومتابعة"
   ↓
4. يتم إنشاء:
   - حساب التوصيل (status: pending)
   - طلب ترقية (status: pending, plan_id: selected)
   ↓
5. الإدارة تراجع الطلب
   ↓
6. الإدارة توافق
   ↓
7. يتم تفعيل:
   - حساب التوصيل (status: active)
   - الاشتراك (plan: selected, end_date: calculated)
```

---

## 📁 هيكل الملفات

```
app/[locale]/dashboard/upgrade/
├── seller-form/
│   └── page.tsx          ← نموذج البائع + اختيار الخطة
├── delivery-form/
│   └── page.tsx          ← نموذج التوصيل + اختيار الخطة (قريباً)
└── success/
    └── page.tsx          ← صفحة النجاح
```

---

## 🔧 الدوال المستخدمة

### **1. إنشاء بائع:**

```typescript
import { createSeller } from "@/lib/actions/sellers/createSeller"

const result = await createSeller({
  store_name: "My Store",
  phone: "0501234567",
  email: "store@example.com",
  city: "Riyadh",
  // ...
})

if (result.success) {
  console.log("Seller created:", result.sellerId)
}
```

### **2. إنشاء طلب ترقية:**

```typescript
import { createUpgradeRequest } from "@/lib/actions/subscriptions/createUpgradeRequest"

const result = await createUpgradeRequest({
  sellerId: "seller-uuid",
  planId: "plan-uuid",  // الخطة المختارة
  contactMethod: "email",
  contactValue: "store@example.com",
  notes: "Upgrade request",
})

if (result.success) {
  console.log("Upgrade request created")
}
```

---

## 📊 قاعدة البيانات

### **جداول مستخدمة:**

```sql
-- الباعة
sellers (
  id,
  user_id,
  store_name,
  account_status,  -- pending → active
  ...
)

-- خطط الاشتراك
seller_subscription_plans (
  id,
  name,            -- free/silver/gold
  price_usd,
  max_products,
  billing_period,  -- monthly/yearly
  ...
)

-- طلبات الترقية
seller_upgrade_requests (
  id,
  seller_id,
  target_plan_id,  -- الخطة المختارة
  status,          -- pending → approved → completed
  ...
)

-- الاشتراكات
seller_subscriptions (
  seller_id,
  plan_id,         -- الخطة المعتمدة
  status,          -- active
  start_date,
  end_date,        -- محسوب تلقائياً
  ...
)
```

---

## 🎨 واجهة المستخدم

### **صفحة البائع:**

```
┌────────────────────────────────────────────┐
│  Store Information          Select Plan    │
├────────────────────────────────────────────┤
│  [Form Fields]              ○ Free ($0)   │
│  - Store Name               ● Silver ($29)│
│  - Description              ○ Gold ($99)  │
│  - Phone                    ─────────────  │
│  - Email                    ✓ 200 products│
│  - Tax Number               ✓ Analytics   │
│  - City                     ✓ Priority    │
│  - Street                                  │
│                                            │
│  [Save & Continue]                         │
└────────────────────────────────────────────┘
```

### **الميزات:**

- ✅ اختيار الخطة على الجانب
- ✅ تحديد الخطة الافتراضية (الأولى)
- ✅ عرض ميزات كل خطة
- ✅ تأكيد الاختيار قبل الإرسال

---

## 🔐 صلاحيات الإدارة

### **عند الموافقة على الطلب:**

```typescript
// في admin/upgrade-requests.tsx

const handleApprove = async () => {
  // 1. الموافقة على الطلب
  await approveUpgradeRequest({
    requestId: selectedRequest.request_id,
    adminNotes: "Approved",
  })

  // 2. تفعيل حساب البائع
  // (يتم تلقائياً عبر دالة completeUpgradeRequest)

  // 3. إنشاء الاشتراك
  // - plan_id: من الطلب
  // - start_date: الآن
  // - end_date: حسب billing_period
}
```

---

## 📝 ملاحظات هامة

### **1. اختيار الخطة إلزامي:**

```typescript
if (!selectedPlan) {
  alert("Please select a plan")
  return
}
```

### **2. تاريخ الانتهاء يُحسب تلقائياً:**

```typescript
// في completeUpgradeRequest
const plan = await getPlan(planId)

const endDate = plan.billing_period === 'yearly'
  ? NOW() + INTERVAL '1 year'
  : NOW() + INTERVAL '1 month'
```

### **3. الحالة تتغير تلقائياً:**

```
pending → approved → completed
   ↓         ↓          ↓
inactive  pending    active
```

---

## 🚀 الخطوات التالية

### **1. تطبيق نفس النمط على التوصيل:**

```typescript
// app/[locale]/dashboard/upgrade/delivery-form/page.tsx
// (نفس الهيكل مع نموذج التوصيل)
```

### **2. إضافة صفحة عرض الطلبات:**

```typescript
// app/[locale]/dashboard/upgrade/requests/page.tsx
// عرض جميع طلبات الترقية للمستخدم
```

### **3. إضافة إشعارات:**

```typescript
// عند الموافقة على الطلب
// عند رفض الطلب
// عند قرب انتهاء الاشتراك
```

---

## ✅ التحقق من الصحة

### **قبل الإرسال:**

```typescript
// ✅ التحقق من اختيار الخطة
if (!selectedPlan) {
  alert("Please select a plan")
  return
}

// ✅ التحقق من صحة البيانات
if (!formData.store_name || !formData.email) {
  alert("Please fill all required fields")
  return
}
```

### **بعد الإرسال:**

```typescript
// ✅ التحقق من إنشاء البائع
if (!sellerResult.success) {
  alert("Failed to create seller")
  return
}

// ✅ التحقق من إنشاء الطلب
if (!upgradeResult.success) {
  alert("Failed to create upgrade request")
  return
}
```

---

**آخر تحديث:** 2026  
**المشروع:** Marketna E-Commerce Platform
