# ✅ هيكل الملفات النهائي - Marketna

## 📋 الهيكل الصحيح

```
app/
├── [locale]/                    ✅ المجلد الصحيح
│   ├── (auth)/                  ← صفحات المصادقة
│   │   ├── signin/
│   │   ├── signup/
│   │   └── forgot-password/
│   ├── (mfa)/                   ← المصادقة الثنائية
│   ├── (site)/                  ← الصفحات العامة
│   ├── admin/                   ✅ الإدارة
│   │   └── upgrade-requests/
│   ├── dashboard/               ✅ لوحة التحكم
│   │   └── upgrade/
│   │       ├── page.tsx
│   │       ├── seller-form/
│   │       ├── seller-plans/
│   │       ├── delivery-form/
│   │       ├── delivery-plans/
│   │       ├── success/
│   │       └── status/
│   ├── privacy/
│   ├── terms/
│   └── layout.tsx
├── api/                         ← API routes
├── lib/
│   └── app-routes.ts            ← جميع الروابط
└── components/
    └── auth/
        ├── sign-in-form.tsx
        └── forgot-password-form.tsx
```

---

## ✅ الملفات المحذوفة (خاطئة)

```
❌ app/admin/                    (موجود في app/[locale]/admin)
❌ app/dashboard/                (موجود في app/[locale]/dashboard)
```

---

## ✅ الملفات الصحيحة

### **الإدارة:**
```
✅ app/[locale]/admin/upgrade-requests/page.tsx
```

### **الترقية:**
```
✅ app/[locale]/dashboard/upgrade/page.tsx
✅ app/[locale]/dashboard/upgrade/seller-form/page.tsx
✅ app/[locale]/dashboard/upgrade/seller-plans/page.tsx
✅ app/[locale]/dashboard/upgrade/delivery-form/page.tsx
✅ app/[locale]/dashboard/upgrade/delivery-plans/page.tsx
✅ app/[locale]/dashboard/upgrade/success/page.tsx
✅ app/[locale]/dashboard/upgrade/status/page.tsx
```

---

## 🔗 الروابط الصحيحة

### **محلياً:**
```
✅ http://localhost:3000/en/dashboard/upgrade
✅ http://localhost:3000/en/admin/upgrade-requests
```

### **على Vercel:**
```
✅ https://marketna.vercel.app/en/dashboard/upgrade
✅ https://marketna.vercel.app/en/admin/upgrade-requests
```

### **بالعربية:**
```
✅ http://localhost:3000/ar/dashboard/upgrade
✅ https://marketna.vercel.app/ar/dashboard/upgrade
```

---

## 🎯 الاستخدام

### **في المكونات:**
```typescript
import { appRouter } from '@/lib/app-routes'

<Link href={appRouter.upgrade}>ترقية</Link>
router.push(appRouter.adminUpgradeRequests)
```

### **مع الترجمة:**
```typescript
import { getRoute } from '@/lib/app-routes'
import { useLocale } from 'next-intl'

const locale = useLocale()
<Link href={getRoute('upgrade', locale)}>
  {locale === 'ar' ? 'ترقية' : 'Upgrade'}
</Link>
```

---

## 📊 جميع الروابط

```typescript
// lib/app-routes.ts

// المصادقة
appRouter.signIn           // /en/auth/signin
appRouter.forgotPassword   // /en/auth/forgot-password

// لوحة التحكم
appRouter.dashboard        // /en/dashboard
appRouter.upgrade          // /en/dashboard/upgrade

// الترقية
appRouter.upgradeSellerForm    // /en/dashboard/upgrade/seller-form
appRouter.upgradeSellerPlans   // /en/dashboard/upgrade/seller-plans
appRouter.upgradeStatus        // /en/dashboard/upgrade/status

// الإدارة
appRouter.adminUpgradeRequests  // /en/admin/upgrade-requests
```

---

## ✅ التحقق من الصحة

### **1. هيكل الملفات:**
```bash
# تحقق من وجود المجلدات
ls app/[locale]/dashboard/upgrade
ls app/[locale]/admin/upgrade-requests
```

### **2. تحقق من عدم وجود مجلدات خاطئة:**
```bash
# يجب أن تكون محذوفة
ls app/admin          # ❌ يجب ألا يوجد
ls app/dashboard      # ❌ يجب ألا يوجد
```

### **3. اختبار الروابط:**
```bash
npm run dev

# افتح المتصفح
http://localhost:3000/en/dashboard/upgrade
http://localhost:3000/en/admin/upgrade-requests
```

---

## 🎯 الاختبار النهائي

### **1. محلياً:**
```bash
npm run dev

# افتح
http://localhost:3000/en/dashboard/upgrade
```

### **2. على Vercel:**
```bash
git add .
git commit -m "fix: Move all pages to [locale]"
git push

# افتح
https://marketna.vercel.app/en/dashboard/upgrade
```

---

## ⚠️ ملاحظات هامة

### **1. ✅ استخدم المسارات الصحيحة:**
```typescript
// ✅ صحيح
app/[locale]/dashboard/upgrade/page.tsx

// ❌ خطأ
app/dashboard/upgrade/page.tsx
```

### **2. ✅ استخدم `appRouter`:**
```typescript
// ✅ صحيح
router.push(appRouter.upgrade)

// ❌ خطأ
router.push("/dashboard/upgrade")
```

### **3. ✅ دعم اللغتين:**
```typescript
// ✅ صحيح
/en/dashboard/upgrade
/ar/dashboard/upgrade

// ❌ خطأ
/dashboard/upgrade  (بدون locale)
```

---

## 📝 الخلاصة

| العنصر | الحالة |
|--------|--------|
| `app/[locale]/dashboard/upgrade` | ✅ صحيح |
| `app/[locale]/admin/upgrade-requests` | ✅ صحيح |
| `app/dashboard` | ❌ محذوف |
| `app/admin` | ❌ محذوف |
| استخدام `appRouter` | ✅ في جميع الملفات |

---

**الحالة:** ✅ مكتمل  
**الإصدار:** 3.0  
**آخر تحديث:** 2026  
**المشروع:** Marketna E-Commerce Platform
