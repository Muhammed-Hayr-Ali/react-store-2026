# 📱 توثيق واجهات نظام ترقية الاشتراكات

## 📋 نظرة عامة

تم إنشاء واجهات كاملة لنظام ترقية الاشتراكات للباعة، مع لوحة إدارة لمراجعة الطلبات.

---

## 🗂️ هيكل الملفات

```
app/
├── dashboard/
│   ├── upgrade-plan/
│   │   ├── page.tsx          # صفحة اختيار الخطة
│   │   ├── request/
│   │   │   └── page.tsx      # نموذج طلب الترقية
│   │   └── success/
│   │       └── page.tsx      # صفحة التأكيد
│   └── upgrade-requests/
│       └── page.tsx          # صفحة حالة الطلبات
└── admin/
    └── upgrade-requests/
        └── page.tsx          # لوحة إدارة الطلبات
```

---

## 📱 الصفحات

### 1. صفحة اختيار الخطة

**المسار:** `/dashboard/upgrade-plan`

**المكونات:**
- بطاقات الخطط (Free, Silver, Gold)
- جدول مقارنة الخطط
- قسم الأسئلة الشائعة

**الميزات:**
- عرض الخطط المتاحة مع الأسعار
- تمييز الخطة الحالية
- تمييز الخطة الأكثر شعبية
- زر "طلب الترقية" لكل خطة

**الدوال المستخدمة:**
```typescript
// تحميل الخطط من قاعدة البيانات
supabase.from('seller_subscription_plans').select('*')
  .eq('plan_type', 'seller')
  .eq('is_active', true)
  .order('sort_order')

// إنشاء طلب ترقية مبدئي
supabase.rpc('create_upgrade_request', {
  p_seller_id,
  p_target_plan_id,
  p_contact_method,
  p_contact_value,
  p_seller_notes
})
```

---

### 2. صفحة نموذج طلب الترقية

**المسار:** `/dashboard/upgrade-plan/request`

**المكونات:**
- معلومات الخطة المختارة
- اختيار طريقة التواصل (Email, Phone, WhatsApp)
- حقل معلومات التواصل
- حقل الملاحظات الإضافية
- رسالة توضيحية للخطوات التالية

**الميزات:**
- عرض معلومات الخطة المختارة
- اختيار طريقة التواصل المفضلة
- التحقق من صحة البيانات
- إنشاء طلب الترقية في قاعدة البيانات

**الدوال المستخدمة:**
```typescript
// إنشاء طلب الترقية الكامل
supabase.rpc('create_upgrade_request', {
  p_seller_id,
  p_target_plan_id,
  p_contact_method: 'email|phone|whatsapp',
  p_contact_value,
  p_seller_notes
})
```

---

### 3. صفحة النجاح

**المسار:** `/dashboard/upgrade-plan/success`

**المكونات:**
- أيقونة النجاح
- رقم الطلب
- الخطوات التالية
- معلومات التواصل مع الدعم
- أزرار التنقل

**الميزات:**
- عرض رسالة تأكيد
- عرض رقم الطلب
- شرح الخطوات التالية
- روابط لصفحات ذات صلة

---

### 4. صفحة حالة الطلبات

**المسار:** `/dashboard/upgrade-requests`

**المكونات:**
- قائمة طلبات الترقية
- حالة كل طلب (Badge ملون)
- معلومات التواصل
- ملاحظات الإدارة
- حالة الدفع

**الميزات:**
- عرض جميع طلبات الترقية
- تصفية حسب الحالة
- عرض تفاصيل كل طلب
- متابعة حالة الدفع

**الدوال المستخدمة:**
```typescript
// الحصول على طلبات البائع
supabase.rpc('get_seller_upgrade_requests')
```

---

### 5. لوحة إدارة الطلبات

**المسار:** `/admin/upgrade-requests`

**المكونات:**
- إحصائيات الطلبات (Cards)
- جدول الطلبات مع فلترة
- نافذة تفاصيل الطلب
- إجراءات الإدارة (موافقة، رفض، تأكيد دفع)

**الميزات:**
- عرض جميع الطلبات
- فلترة حسب الحالة
- إحصائيات سريعة
- مراجعة الطلبات
- الموافقة/الرفض
- تأكيد استلام الدفع
- إضافة ملاحظات

**الدوال المستخدمة:**
```typescript
// الحصول على جميع الطلبات
supabase.rpc('get_all_upgrade_requests', { p_status })

// الموافقة على طلب
supabase.rpc('approve_upgrade_request', {
  p_request_id,
  p_admin_notes
})

// رفض طلب
supabase.rpc('reject_upgrade_request', {
  p_request_id,
  p_admin_notes
})

// إكمال الترقية
supabase.rpc('complete_upgrade_request', {
  p_request_id
})
```

---

## 🎨 المكونات المستخدمة

### مكونات UI:

| المكون | الاستخدام |
|--------|----------|
| `Card` | بطاقات الخطط، الطلبات، الإحصائيات |
| `Button` | الأزرار المختلفة |
| `Badge` | عرض حالة الطلب |
| `Input` | حقول الإدخال |
| `Label` | تسميات الحقول |
| `Textarea` | الملاحظات |
| `RadioGroup` | اختيار طريقة التواصل |
| `Select` | الفلترة |
| `Table` | جدول الطلبات (للإدارة) |
| `Dialog` | نافذة التفاصيل (للإدارة) |

### الأيقونات:

| الأيقونة | الاستخدام |
|----------|----------|
| `CheckCircle` | النجاح، المكتمل |
| `XCircle` | الرفض |
| `Clock` | قيد المراجعة |
| `AlertCircle` | تنبيه |
| `DollarSign` | الدفع |
| `MessageSquare` | الملاحظات |
| `ArrowLeft` | الرجوع |

---

## 🔄 تدفق المستخدم

### للبائع:

```
1. /dashboard/upgrade-plan
   ↓ (اختيار خطة)
2. /dashboard/upgrade-plan/request
   ↓ (ملء النموذج)
3. /dashboard/upgrade-plan/success
   ↓
4. /dashboard/upgrade-requests (لمتابعة الحالة)
```

### للإدارة:

```
1. /admin/upgrade-requests
   ↓ (عرض الطلبات)
2. عرض تفاصيل الطلب
   ↓ (مراجعة)
3. الموافقة/الرفض
   ↓ (بعد الدفع)
4. تأكيد استلام الدفع
```

---

## 📊 حالات الطلب

| الحالة | اللون | الوصف |
|--------|-------|-------|
| `pending` | أصفر | قيد المراجعة |
| `approved` | أزرق | تمت الموافقة |
| `rejected` | أحمر | تم الرفض |
| `completed` | أخضر | مكتمل (تم الدفع) |

---

## 🔧 التحقق من البيانات

### في نموذج طلب الترقية:

```typescript
// التحقق من طريقة التواصل
if (formData.contactMethod === 'email') {
  // التحقق من صحة البريد
  if (!isValidEmail(formData.contactValue)) {
    alert('البريد الإلكتروني غير صالح');
    return;
  }
}

// التحقق من رقم الهاتف
if (formData.contactMethod === 'phone' || formData.contactMethod === 'whatsapp') {
  // التحقق من صحة الرقم
  if (!isValidPhone(formData.contactValue)) {
    alert('رقم الهاتف غير صالح');
    return;
  }
}
```

---

## 🎯 التحسينات المستقبلية

### 1. التكامل مع الدفع:

```typescript
// إضافة زر دفع في صفحة حالة الطلب
const handlePayment = async () => {
  const { data } = await supabase.functions.invoke('create-payment', {
    body: { requestId: selectedRequest.request_id }
  });
  
  // توجيه لبوابة الدفع
  window.location.href = data.paymentUrl;
};
```

### 2. الإشعارات:

```typescript
// الاستماع للإشعارات
useEffect(() => {
  const channel = supabase.channel('upgrade_requests')
    .on('postgres_changes', {
      event: '*',
      schema: 'public',
      table: 'seller_upgrade_requests'
    }, (payload) => {
      // عرض إشعار
      toast.success('تم تحديث حالة طلبك');
    })
    .subscribe();
    
  return () => supabase.removeChannel(channel);
}, []);
```

### 3. التصدير:

```typescript
// تصدير الطلبات إلى CSV
const exportToCSV = () => {
  const csv = requests.map(r => [
    r.request_id,
    r.seller_name,
    r.store_name,
    r.target_plan_name,
    r.status
  ].join(','));
  
  // تحميل الملف
  download(csv, 'upgrade-requests.csv');
};
```

---

## ⚠️ ملاحظات هامة

1. **الصلاحيات:** صفحة الإدارة محمية ولا يمكن الوصول إليها إلا للأدمن
2. **التحقق:** يتم التحقق من صحة البيانات قبل الإرسال
3. **التحميل:** عرض حالة التحميل أثناء العمليات
4. **الأخطاء:** عرض رسائل خطأ واضحة
5. **التجاوب:** الواجهات متجاوبة مع جميع الأحجام

---

**الإصدار:** 1.0  
**آخر تحديث:** 2026  
**المشروع:** Marketna E-Commerce Platform
