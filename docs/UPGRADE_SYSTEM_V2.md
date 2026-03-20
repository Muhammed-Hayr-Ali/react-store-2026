# 🎯 نظام ترقية الحساب - Marketna

## 📋 نظرة عامة

نظام متكامل يسمح للمستخدمين بترقية حساباتهم إلى **بائع** أو **موظف توصيل** مع اختيار خطة اشتراك وموافقة الإدارة.

---

## 🔄 سير العمل الكامل

### للباعة:

```
1. المستخدم → /dashboard/upgrade
   ↓ (يختار "بائع")
2. /dashboard/upgrade/seller-form
   ↓ (يدخل معلومات المتجر)
3. /dashboard/upgrade/seller-plans
   ↓ (يختار خطة الاشتراك)
4. /dashboard/upgrade/success
   ↓ (انتظار موافقة الإدارة)
5. الإدارة تراجع وتوافق
   ↓
6. تفعيل الحساب والبائع يبدأ البيع
```

### لموظفي التوصيل:

```
1. المستخدم → /dashboard/upgrade
   ↓ (يختار "موظف توصيل")
2. /dashboard/upgrade/delivery-form
   ↓ (يدخل معلومات التوصيل)
3. /dashboard/upgrade/delivery-plans
   ↓ (يختار خطة الاشتراك)
4. /dashboard/upgrade/success
   ↓ (انتظار موافقة الإدارة)
5. الإدارة تراجع وتوافق
   ↓
6. تفعيل الحساب والسائق يبدأ العمل
```

---

## 📁 هيكل الصفحات

```
app/dashboard/upgrade/
├── page.tsx                    # اختيار نوع الحساب (بائع/توصيل)
├── seller-form/
│   └── page.tsx                # معلومات البائع
├── seller-plans/
│   └── page.tsx                # اختيار خطة البائع
├── delivery-form/
│   └── page.tsx                # معلومات التوصيل
├── delivery-plans/
│   └── page.tsx                # اختيار خطة التوصيل
├── success/
│   └── page.tsx                # صفحة النجاح
└── status/
    └── page.tsx                # حالة الطلبات
```

---

## 🗂️ قاعدة البيانات

### الجداول المستخدمة:

```sql
-- الباعة
sellers (
  id,
  user_id,
  store_name,
  account_status,  -- 'pending', 'active', 'suspended', 'rejected'
  ...
)

-- موظفي التوصيل
delivery_partners (
  id,
  user_id,
  company_name,
  account_status,  -- 'pending', 'active', 'suspended', 'rejected'
  ...
)

-- طلبات الترقية
seller_upgrade_requests (
  id,
  seller_id,
  target_plan_id,
  status,  -- 'pending', 'approved', 'rejected', 'completed'
  ...
)

-- خطط الاشتراك
seller_subscription_plans (
  id,
  name,  -- 'free', 'silver', 'gold'
  price_usd,
  max_products,
  ...
)
```

---

## 🔧 الدوال المستخدمة

```sql
-- إنشاء طلب ترقية
SELECT public.create_upgrade_request(
  p_seller_id,
  p_target_plan_id,
  p_contact_method,
  p_contact_value,
  p_seller_notes
);

-- الموافقة على طلب
SELECT public.approve_upgrade_request(
  p_request_id,
  p_admin_notes
);

-- رفض طلب
SELECT public.reject_upgrade_request(
  p_request_id,
  p_admin_notes
);

-- إكمال الترقية
SELECT public.complete_upgrade_request(
  p_request_id
);
```

---

## 🎨 الصفحات

### 1. صفحة اختيار النوع

**المسار:** `/dashboard/upgrade`

**المحتوى:**
- بطاقتين: "بائع" و "موظف توصيل"
- ميزات كل نوع
- زر اختيار

---

### 2. نموذج البائع

**المسار:** `/dashboard/upgrade/seller-form`

**الحقول:**
- اسم المتجر *
- وصف المتجر
- رقم الهاتف *
- البريد الإلكتروني *
- الرقم الضريبي
- الرقم التجاري
- المدينة *
- الشارع

**بعد الإرسال:**
- يتم إنشاء سجل في `sellers`
- `account_status = 'pending'`
- الانتقال لصفحة الخطط

---

### 3. صفحة الخطط

**المسار:** `/dashboard/upgrade/seller-plans`

**المحتوى:**
- 3 بطاقات (Free, Silver, Gold)
- الأسعار والميزات
- زر اختيار الخطة

**بعد الاختيار:**
- يتم إنشاء طلب ترقية
- الانتقال لصفحة النجاح

---

### 4. صفحة النجاح

**المسار:** `/dashboard/upgrade/success`

**المحتوى:**
- رسالة تأكيد
- الخطوات التالية
- رابط لمتابعة الحالة

---

### 5. صفحة حالة الطلبات

**المسار:** `/dashboard/upgrade/status`

**المحتوى:**
- قائمة جميع الطلبات
- حالة كل طلب
- ملاحظات الإدارة

---

## 👥 أدوار المستخدمين

### المستخدم العادي:
- ✅ اختيار نوع الحساب
- ✅ إدخال المعلومات
- ✅ اختيار خطة الاشتراك
- ✅ عرض حالة الطلبات

### الإدارة:
- ✅ عرض جميع الطلبات
- ✅ الموافقة على الطلبات
- ✅ رفض الطلبات
- ✅ إضافة ملاحظات
- ✅ تأكيد الدفع
- ✅ تفعيل الحسابات

---

## 📊 حالات الطلب

| الحالة | الوصف | من يغيرها |
|--------|-------|----------|
| `pending` | بانتظار المراجعة | المستخدم (عند الإنشاء) |
| `approved` | تمت الموافقة | الإدارة |
| `rejected` | تم الرفض | الإدارة |
| `completed` | تم الدفع والتفعيل | الإدارة |

---

## 🧪 الاختبار

### 1. اختبار مستخدم جديد:

```sql
-- 1. إنشاء بائع اختبار
INSERT INTO sellers (
  user_id,
  store_name,
  store_slug,
  account_status
) VALUES (
  '3e3a7862-ebfb-48e8-8727-a29b77c36978',
  'متجر الاختبار',
  'متجر-الاختبار',
  'pending'
);

-- 2. إنشاء طلب ترقية
SELECT public.create_upgrade_request(
  (SELECT id FROM sellers WHERE user_id = '3e3a7862-ebfb-48e8-8727-a29b77c36978'),
  (SELECT id FROM seller_subscription_plans WHERE name = 'silver'),
  'email',
  'm.thelord963@gmail.com',
  'طلب اختبار'
);

-- 3. عرض الطلب
SELECT * FROM seller_upgrade_requests
WHERE seller_id = (SELECT id FROM sellers WHERE user_id = '3e3a7862-ebfb-48e8-8727-a29b77c36978');
```

### 2. اختبار الإدارة:

```sql
-- الموافقة
SELECT public.approve_upgrade_request(
  (SELECT id FROM seller_upgrade_requests ORDER BY created_at DESC LIMIT 1),
  'تمت الموافقة للاختبار'
);

-- الإكمال
SELECT public.complete_upgrade_request(
  (SELECT id FROM seller_upgrade_requests ORDER BY created_at DESC LIMIT 1)
);
```

---

## 🔗 الروابط

| الصفحة | المسار |
|--------|--------|
| اختيار النوع | `/dashboard/upgrade` |
| معلومات البائع | `/dashboard/upgrade/seller-form` |
| خطط البائع | `/dashboard/upgrade/seller-plans` |
| معلومات التوصيل | `/dashboard/upgrade/delivery-form` |
| خطط التوصيل | `/dashboard/upgrade/delivery-plans` |
| النجاح | `/dashboard/upgrade/success` |
| حالة الطلبات | `/dashboard/upgrade/status` |
| لوحة الإدارة | `/admin/upgrade-requests` |

---

## ⚠️ ملاحظات هامة

1. **account_status = 'pending'** حتى توافق الإدارة
2. **لا يمكن البيع** حتى يتم التفعيل
3. **الإدارة فقط** يمكنها الموافقة
4. **بعد الموافقة** يُرسل رابط الدفع
5. **بعد الدفع** يُفعّل الحساب

---

**الإصدار:** 2.0  
**آخر تحديث:** 2026  
**المشروع:** Marketna E-Commerce Platform
