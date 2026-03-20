# 📋 خطة عمل: نظام ترقية الاشتراكات

## 🎯 الهدف

إنشاء نظام متكامل يسمح للباعة وموظفي التوصيل بطلب ترقية اشتراكاتهم، مع إرسال طلب للإدارة للمراجعة والتواصل للدفع والتفعيل.

---

## 📊 المراحل

### المرحلة 1: قاعدة البيانات

#### 1.1 إنشاء جدول طلبات الترقية

**الملف:** `10_seller_subscriptions/03_upgrade_requests.sql`

**الجدول:** `seller_upgrade_requests`

| العمود | النوع | الوصف |
|--------|-------|-------|
| `id` | UUID | معرف الطلب |
| `seller_id` | UUID | معرف البائع |
| `current_plan_id` | UUID | الخطة الحالية |
| `target_plan_id` | UUID | الخطة المطلوبة |
| `status` | TEXT | `pending`, `approved`, `rejected`, `completed` |
| `admin_notes` | TEXT | ملاحظات الإدارة |
| `contacted_at` | TIMESTAMPTZ | تاريخ التواصل |
| `payment_received_at` | TIMESTAMPTZ | تاريخ استلام الدفع |
| `completed_at` | TIMESTAMPTZ | تاريخ الإكمال |
| `created_at` | TIMESTAMPTZ | تاريخ الإنشاء |

**نفس الشيء للتوصيل:** `delivery_upgrade_requests`

---

#### 1.2 دوال إدارة طلبات الترقية

```sql
-- دالة إنشاء طلب ترقية
create_upgrade_request(
  p_seller_id UUID,
  p_target_plan_id UUID,
  p_notes TEXT
)

-- دالة الموافقة على طلب الترقية
approve_upgrade_request(
  p_request_id UUID,
  p_admin_notes TEXT
)

-- دالة رفض طلب الترقية
reject_upgrade_request(
  p_request_id UUID,
  p_admin_notes TEXT
)

-- دالة إكمال الترقية (بعد الدفع)
complete_upgrade_request(
  p_request_id UUID
)
```

---

### المرحلة 2: واجهة المستخدم (Frontend)

#### 2.1 صفحة اختيار الخطة

**المسار:** `/dashboard/upgrade-plan`

**المكونات:**
1. **بطاقات الخطط** - عرض الخطط المتاحة (Free, Silver, Gold)
2. **مقارنة الخطط** - جدول مقارنة الميزات
3. **نموذج طلب الترقية** - اختيار الخطة وإرسال الطلب

#### 2.2 نموذج طلب الترقية

```typescript
interface UpgradeRequestForm {
  targetPlan: 'free' | 'silver' | 'gold';
  notes?: string;
  contactMethod: 'email' | 'phone' | 'whatsapp';
  contactValue: string;
}
```

#### 2.3 صفحة حالة الطلب

**المسار:** `/dashboard/upgrade-requests`

**المعلومات المعروضة:**
- حالة الطلب (Pending, Approved, Rejected, Completed)
- الخطة الحالية والمستهدفة
- ملاحظات الإدارة
- تاريخ التواصل
- حالة الدفع

---

### المرحلة 3: لوحة الإدارة (Admin Dashboard)

#### 3.1 صفحة طلبات الترقية

**المسار:** `/admin/upgrade-requests`

**الميزات:**
- عرض جميع طلبات الترقية
- فلترة حسب الحالة
- عرض تفاصيل الطلب
- الموافقة/الرفض
- تسجيل ملاحظات التواصل
- تأكيد استلام الدفع

#### 3.2 إجراءات الإدارة

```typescript
interface AdminActions {
  // مراجعة الطلب
  reviewRequest(requestId: string, notes: string);
  
  // الموافقة المبدئية
  approveRequest(requestId: string, notes: string);
  
  // رفض الطلب
  rejectRequest(requestId: string, reason: string);
  
  // تأكيد استلام الدفع وتفعيل الاشتراك
  confirmPaymentAndActivate(requestId: string);
}
```

---

### المرحلة 4: نظام الإشعارات

#### 4.1 إشعارات قاعدة البيانات

```sql
-- قناة للإشعارات
CREATE CHANNEL upgrade_request_created;
CREATE CHANNEL upgrade_request_approved;
CREATE CHANNEL upgrade_request_rejected;
CREATE CHANNEL upgrade_request_completed;
```

#### 4.2 أنواع الإشعارات

| الحدث | للمستلم | الطريقة |
|-------|---------|---------|
| طلب ترقية جديد | الإدارة | Email + Dashboard |
| تم مراجعة الطلب | المستخدم | Email + SMS |
| تم الموافقة | المستخدم | Email + SMS + WhatsApp |
| تم الرفض | المستخدم | Email + SMS |
| تم الدفع والتفعيل | المستخدم | Email + SMS + Dashboard |

---

### المرحلة 5: التكامل مع بوابات الدفع

#### 5.1 خيارات الدفع

1. **Stripe** - بطاقات الائتمان
2. **PayPal** - PayPal
3. **تحويل بنكي** - للحسابات الكبيرة
4. **مدى/APPLE Pay** - للسعودية

#### 5.2 سير عمل الدفع

```
1. الإدارة توافق على الطلب
   ↓
2. إرسال رابط الدفع للمستخدم
   ↓
3. المستخدم يدفع عبر الرابط
   ↓
4. تأكيد الدفع تلقائياً (Webhook)
   ↓
5. تفعيل الاشتراك تلقائياً
```

---

## 🔄 سير العمل الكامل

### للباعة (Sellers):

```
1. البائع يدخل صفحة الترقية
   ↓
2. يختار الخطة (Silver أو Gold)
   ↓
3. يملأ نموذج الطلب:
   - الخطة المطلوبة
   - طريقة التواصل المفضلة
   - ملاحظات إضافية
   ↓
4. إرسال الطلب
   ↓
5. ظهور رسالة تأكيد:
   "تم استلام طلبك بنجاح!
   الإدارة ستتواصل معك خلال 24 ساعة
   لترتيب عملية الدفع والتفعيل"
   ↓
6. الإدارة تراجع الطلب
   ↓
7. الإدارة تتواصل مع البائع
   ↓
8. البائع يدفع
   ↓
9. الإدارة تؤكد الدفع
   ↓
10. تفعيل الاشتراك تلقائياً
   ↓
11. إشعار للبائع: "تم تفعيل اشتراكك!"
```

### لموظفي التوصيل (Delivery Partners):

نفس السير العمل مع تخصيص حقول إضافية:
- عدد الطلبات اليومية المطلوبة
- مناطق التغطية
- نوع المركبة

---

## 📱 صفحات الواجهة

### 1. صفحة اختيار الخطة
```
/dashboard/upgrade-plan
├── عرض الخطط الحالية
├── مقارنة الميزات
└── زر "طلب الترقية"
```

### 2. صفحة نموذج الطلب
```
/dashboard/upgrade-plan/request
├── اختيار الخطة المستهدفة
├── طريقة التواصل المفضلة
├── معلومات التواصل
├── ملاحظات إضافية
└── زر "إرسال الطلب"
```

### 3. صفحة حالة الطلب
```
/dashboard/upgrade-requests
├── قائمة الطلبات
├── حالة كل طلب
├── تفاصيل الطلب
└── رسائل الإدارة
```

### 4. لوحة الإدارة
```
/admin/upgrade-requests
├── جميع الطلبات
├── فلترة حسب الحالة
├── مراجعة الطلب
├── الموافقة/الرفض
└── تأكيد الدفع
```

---

## 🗂️ هيكل الملفات المقترح

```
app/
├── dashboard/
│   ├── upgrade-plan/
│   │   ├── page.tsx          # صفحة اختيار الخطة
│   │   ├── request/
│   │   │   └── page.tsx      # نموذج الطلب
│   │   └── success/
│   │       └── page.tsx      # صفحة التأكيد
│   └── upgrade-requests/
│       └── page.tsx          # حالة الطلبات
├── admin/
│   └── upgrade-requests/
│       ├── page.tsx          # قائمة الطلبات
│       └── [id]/
│           └── page.tsx      # تفاصيل الطلب
components/
├── upgrade/
│   ├── PlanCards.tsx         # بطاقات الخطط
│   ├── PlanComparison.tsx    # جدول المقارنة
│   ├── UpgradeRequestForm.tsx # نموذج الطلب
│   └── UpgradeStatus.tsx     # حالة الطلب
lib/
├── upgrade-requests.ts       # دوال إدارة الطلبات
└── notifications.ts          # نظام الإشعارات
```

---

## 🔧 الملفات المطلوبة

### قاعدة البيانات:

| الملف | الوصف |
|-------|-------|
| `10_seller_subscriptions/03_upgrade_requests.sql` | جدول طلبات ترقية الباعة |
| `09_delivery_partner_subscriptions/03_delivery_upgrade_requests.sql` | جدول طلبات ترقية التوصيل |

### الواجهة:

| الملف | الوصف |
|-------|-------|
| `app/dashboard/upgrade-plan/page.tsx` | صفحة اختيار الخطة |
| `app/dashboard/upgrade-plan/request/page.tsx` | نموذج الطلب |
| `app/dashboard/upgrade-requests/page.tsx` | حالة الطلبات |
| `app/admin/upgrade-requests/page.tsx` | لوحة الإدارة |

### المكونات:

| الملف | الوصف |
|-------|-------|
| `components/upgrade/PlanCards.tsx` | بطاقات الخطط |
| `components/upgrade/PlanComparison.tsx` | جدول المقارنة |
| `components/upgrade/UpgradeRequestForm.tsx` | نموذج الطلب |
| `components/upgrade/UpgradeStatus.tsx` | حالة الطلب |

---

## 📊 قاعدة البيانات - التفاصيل

### جدول طلبات ترقية الباعة:

```sql
CREATE TABLE seller_upgrade_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  seller_id UUID NOT NULL REFERENCES sellers(id),
  current_plan_id UUID REFERENCES seller_subscription_plans(id),
  target_plan_id UUID NOT NULL REFERENCES seller_subscription_plans(id),
  status TEXT DEFAULT 'pending' 
    CHECK (status = ANY (ARRAY['pending', 'approved', 'rejected', 'completed'])),
  contact_method TEXT,
  contact_value TEXT,
  admin_notes TEXT,
  contacted_at TIMESTAMPTZ,
  payment_received_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### جدول طلبات ترقية التوصيل:

```sql
CREATE TABLE delivery_upgrade_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  delivery_partner_id UUID NOT NULL REFERENCES delivery_partners(id),
  current_plan_id UUID REFERENCES delivery_subscription_plans(id),
  target_plan_id UUID NOT NULL REFERENCES delivery_subscription_plans(id),
  status TEXT DEFAULT 'pending' 
    CHECK (status = ANY (ARRAY['pending', 'approved', 'rejected', 'completed'])),
  contact_method TEXT,
  contact_value TEXT,
  admin_notes TEXT,
  contacted_at TIMESTAMPTZ,
  payment_received_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

## 🎨 تصميم واجهة المستخدم

### 1. بطاقات الخطط:

```
┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐
│     Free        │  │    Silver ⭐    │  │     Gold        │
│     $0          │  │    $29/شهر      │  │    $99/شهر      │
│                 │  │                 │  │                 │
│ ✓ 50 منتج       │  │ ✓ 200 منتج      │  │ ✓ 1000 منتج     │
│ ✓ دعم أساسي     │  │ ✓ دعم أولوي     │  │ ✓ دعم 24/7      │
│                 │  │ ✓ إحصائيات      │  │ ✓ API           │
│                 │  │                 │  │ ✓ White Label   │
│                 │  │                 │  │                 │
│ [الخطة الحالية] │  │ [طلب الترقية]   │  │ [طلب الترقية]   │
└─────────────────┘  └─────────────────┘  └─────────────────┘
```

### 2. نموذج الطلب:

```
┌─────────────────────────────────────────┐
│  طلب ترقية الاشتراك                     │
├─────────────────────────────────────────┤
│  الخطة المطلوبة: [Silver ▼]             │
│                                         │
│  طريقة التواصل المفضلة:                 │
│  ○ البريد الإلكتروني                    │
│  ○ الهاتف                               │
│  ○ WhatsApp                             │
│                                         │
│  معلومات التواصل:                       │
│  [_______________________________]       │
│                                         │
│  ملاحظات إضافية (اختياري):              │
│  [_______________________________]       │
│  [_______________________________]       │
│                                         │
│  [ إرسال الطلب ]                        │
└─────────────────────────────────────────┘
```

### 3. رسالة التأكيد:

```
┌─────────────────────────────────────────┐
│  ✅ تم استلام طلبك بنجاح!               │
├─────────────────────────────────────────┤
│                                         │
│  رقم الطلب: #UPG-12345                  │
│  الخطة المطلوبة: Silver                 │
│                                         │
│  📞 الإدارة ستتواصل معك خلال 24 ساعة    │
│     لترتيب عملية الدفع والتفعيل         │
│                                         │
│  يمكنك متابعة حالة الطلب من:            │
│  [عرض حالة الطلب]                       │
│                                         │
│  [ العودة للوحة التحكم ]                │
└─────────────────────────────────────────┘
```

---

## 📈 مؤشرات الأداء

| المؤشر | الهدف |
|--------|-------|
| وقت معالجة الطلب | < 24 ساعة |
| نسبة الموافقة | > 80% |
| وقت التفعيل بعد الدفع | < 1 ساعة |
| رضا المستخدمين | > 4.5/5 |

---

## 🔐 الأمان

1. **التحقق من الملكية:** البائع يطلب فقط لنفسه
2. **صلاحيات الإدارة:** فقط الأدمن يراجع الطلبات
3. **تشفير البيانات:** معلومات التواصل مشفرة
4. **سجل التدقيق:** تسجيل جميع الإجراءات

---

## 🚀 خطة التنفيذ

### الأسبوع 1: قاعدة البيانات
- [ ] إنشاء جداول طلبات الترقية
- [ ] إنشاء الدوال
- [ ] إنشاء سياسات RLS
- [ ] إنشاء الإشعارات

### الأسبوع 2: الواجهة
- [ ] صفحة اختيار الخطة
- [ ] نموذج الطلب
- [ ] صفحة حالة الطلب
- [ ] رسائل التأكيد

### الأسبوع 3: لوحة الإدارة
- [ ] قائمة الطلبات
- [ ] صفحة التفاصيل
- [ ] إجراءات الموافقة/الرفض
- [ ] تأكيد الدفع

### الأسبوع 4: الاختبار
- [ ] اختبار شامل
- [ ] إصلاح الأخطاء
- [ ] تحسين الأداء
- [ ] التوثيق

---

**آخر تحديث:** 2026  
**الحالة:** جاهز للتنفيذ  
**المشروع:** Marketna E-Commerce Platform
