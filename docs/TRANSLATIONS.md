# 📚 ملفات الترجمة - Marketna

## 📋 الهيكل

```
messages/
├── en/
│   ├── common.json
│   ├── auth.json
│   ├── dashboard.json
│   └── admin.json          ✅ جديد
└── ar/
    ├── common.json
    ├── auth.json
    ├── dashboard.json
    └── admin.json          ✅ جديد
```

---

## 🔑 مفاتيح الترجمة المتاحة

### **الإدارة (admin.json):**

```typescript
// الإنجليزية
{
  "AdminUpgradeRequests": {
    "title": "Upgrade Requests",
    "description": "Manage and review subscription upgrade requests",
    "statusPending": "Pending",
    "statusApproved": "Approved",
    // ...
  }
}

// العربية
{
  "AdminUpgradeRequests": {
    "title": "طلبات الترقية",
    "description": "إدارة ومراجعة طلبات ترقية الاشتراكات",
    "statusPending": "قيد المراجعة",
    "statusApproved": "تمت الموافقة",
    // ...
  }
}
```

---

## 🎯 كيفية الاستخدام

### **1. في المكونات:**

```typescript
import { useTranslations } from "next-intl"

export default function MyComponent() {
  const t = useTranslations("AdminUpgradeRequests")
  
  return (
    <div>
      <h1>{t("title")}</h1>
      <p>{t("description")}</p>
    </div>
  )
}
```

### **2. مع القيم الديناميكية:**

```typescript
// في ملف الترجمة
{
  "status": "الحالة: {status}"
}

// في المكون
t("status", { status: request.status })
```

### **3. القوائم:**

```typescript
// في ملف الترجمة
{
  "statuses": {
    "pending": "قيد المراجعة",
    "approved": "تمت الموافقة",
    "rejected": "مرفوض",
    "completed": "مكتمل"
  }
}

// في المكون
t(`statuses.${request.status}`)
```

---

## 📊 جميع المفاتيح

### **الصفحة الرئيسية:**
- `title` - العنوان
- `description` - الوصف
- `filterByStatus` - تصفية حسب الحالة
- `filterAll` - الكل

### **الحالات:**
- `statusPending` - قيد المراجعة
- `statusApproved` - تمت الموافقة
- `statusRejected` - مرفوض
- `statusCompleted` - مكتمل

### **الإحصائيات:**
- `statTotal` - المجموع
- `statPending` - قيد المراجعة
- `statApproved` - تمت الموافقة
- `statCompleted` - مكتمل

### **الجدول:**
- `requestsList` - قائمة الطلبات
- `tableRequestId` - رقم الطلب
- `tableSeller` - البائع
- `tableStore` - المتجر
- `tableUpgrade` - الترقية
- `tablePrice` - السعر
- `tableContact` - التواصل
- `tableStatus` - الحالة
- `tableDate` - التاريخ
- `tableActions` - الإجراءات

### **التفاصيل:**
- `dialogTitle` - عنوان النافذة
- `seller` - البائع
- `store` - المتجر
- `upgradeFrom` - الترقية من
- `upgradeTo` - الترقية إلى
- `monthlyPrice` - السعر الشهري
- `contactMethod` - طريقة التواصل
- `sellerNotes` - ملاحظات البائع
- `adminNotes` - ملاحظات الإدارة

### **الإجراءات:**
- `approve` - الموافقة
- `reject` - رفض
- `confirmPayment` - تأكيد الدفع
- `confirmPaymentButton` - تأكيد الدفع وتفعيل الاشتراك

### **الأخطاء:**
- `errorApproving` - خطأ في الموافقة
- `errorRejecting` - خطأ في الرفض
- `errorCompleting` - خطأ في الإكمال

---

## 🌍 إضافة لغة جديدة

### **1. أنشئ المجلد:**
```bash
messages/fr/admin.json
```

### **2. أضف الترجمة:**
```json
{
  "AdminUpgradeRequests": {
    "title": "Demandes de mise à niveau",
    "description": "Gérer et examiner les demandes",
    // ...
  }
}
```

### **3. أضف اللغة إلى config:**
```typescript
// next-intl.config.ts
export default defineConfig({
  locales: ['en', 'ar', 'fr']
})
```

---

## ✅ أفضل الممارسات

### **1. ✅ استخدم المفاتيح الوصفية:**
```typescript
// ✅ صحيح
t("statusPending")

// ❌ خطأ
t("pending")  // غامض جداً
```

### **2. ✅ نظّم الملفات حسب الصفحة:**
```
messages/
├── admin.json      ← صفحات الإدارة
├── dashboard.json  ← لوحة التحكم
├── auth.json       ← المصادقة
└── common.json     ← العناصر المشتركة
```

### **3. ✅ استخدم القيم الافتراضية:**
```typescript
t("title", { defaultValue: "Default Title" })
```

### **4. ✅ تجنب النصوص الثابتة:**
```typescript
// ❌ خطأ
<h1>Upgrade Requests</h1>

// ✅ صحيح
<h1>{t("title")}</h1>
```

---

## 🔧 اختبار الترجمة

### **1. محلياً:**
```bash
npm run dev

# الإنجليزية
http://localhost:3000/en/admin/upgrade-requests

# العربية
http://localhost:3000/ar/admin/upgrade-requests
```

### **2. تحقق من جميع النصوص:**
- [ ] العنوان
- [ ] الأزرار
- [ ] الحالات
- [ ] رسائل الخطأ
- [ ] النماذج

---

## 📝 ملاحظات هامة

### **1. التحديثات:**
- عند إضافة نص جديد، أضفه لملفات الترجمة
- لا تستخدم النصوص الثابتة في الكود

### **2. التنسيق:**
- استخدم `camelCase` للمفاتيح
- اجعل المفاتيح وصفية وواضحة

### **3. اللغة الافتراضية:**
- الإنجليزية هي الافتراضية
- العربية من اليمين لليسار (RTL)

---

**آخر تحديث:** 2026  
**المشروع:** Marketna E-Commerce Platform
