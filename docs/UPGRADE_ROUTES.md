# 🔗 روابط نظام الترقية - Marketna

## 📋 الروابط الصحيحة (مع locale)

بما أن التطبيق يستخدم **التوطين (i18n)**، جميع الروابط يجب أن تبدأ بـ `/en/` أو `/ar/`.

---

## ✅ الروابط الصحيحة

### للباعة:

| الصفحة | الرابط |
|--------|--------|
| اختيار النوع | `/en/dashboard/upgrade` |
| معلومات البائع | `/en/dashboard/upgrade/seller-form` |
| خطط البائع | `/en/dashboard/upgrade/seller-plans` |
| النجاح | `/en/dashboard/upgrade/success?type=seller` |
| حالة الطلبات | `/en/dashboard/upgrade/status` |

### لموظفي التوصيل:

| الصفحة | الرابط |
|--------|--------|
| اختيار النوع | `/en/dashboard/upgrade` |
| معلومات التوصيل | `/en/dashboard/upgrade/delivery-form` |
| خطط التوصيل | `/en/dashboard/upgrade/delivery-plans` |
| النجاح | `/en/dashboard/upgrade/success?type=delivery` |
| حالة الطلبات | `/en/dashboard/upgrade/status` |

### للإدارة:

| الصفحة | الرابط |
|--------|--------|
| لوحة الإدارة | `/en/admin/upgrade-requests` |

---

## 🚀 كيفية الاستخدام

### 1. الولوج للنظام:

```
# افتح المتصفح
https://marketna.vercel.app/en/dashboard/upgrade
```

### 2. اختبار سير العمل:

```
1. https://marketna.vercel.app/en/dashboard/upgrade
   ↓ اختر "بائع"

2. https://marketna.vercel.app/en/dashboard/upgrade/seller-form
   ↓ املأ المعلومات

3. https://marketna.vercel.app/en/dashboard/upgrade/seller-plans
   ↓ اختر خطة

4. https://marketna.vercel.app/en/dashboard/upgrade/success?type=seller
   ↓ تأكيد

5. https://marketna.vercel.app/en/dashboard/upgrade/status
   ↓ متابعة الحالة
```

### 3. لوحة الإدارة:

```
https://marketna.vercel.app/en/admin/upgrade-requests
```

---

## ⚠️ ملاحظات هامة

### 1. الروابط الخاطئة (404):

```
❌ /dashboard/upgrade
❌ /dashboard/upgrade/seller-form
❌ /admin/upgrade-requests
```

### 2. الروابط الصحيحة:

```
✅ /en/dashboard/upgrade
✅ /en/dashboard/upgrade/seller-form
✅ /en/admin/upgrade-requests
```

### 3. اللغة العربية:

إذا أردت استخدام العربية:

```
/ar/dashboard/upgrade
/ar/dashboard/upgrade/seller-form
/ar/admin/upgrade-requests
```

---

## 🔧 اختبار محلي

```bash
# شغّل التطبيق
npm run dev

# افتح المتصفح
http://localhost:3000/en/dashboard/upgrade
```

---

## 📊 هيكل الملفات

```
app/
├── [locale]/
│   ├── dashboard/
│   │   └── upgrade/
│   │       ├── page.tsx
│   │       ├── seller-form/page.tsx
│   │       ├── seller-plans/page.tsx
│   │       ├── delivery-form/page.tsx
│   │       ├── delivery-plans/page.tsx
│   │       ├── success/page.tsx
│   │       └── status/page.tsx
│   └── admin/
│       └── upgrade-requests/page.tsx
```

---

## 🎯 اختبار سريع

### 1. افتح:
```
https://marketna.vercel.app/en/dashboard/upgrade
```

### 2. يجب أن ترى:
- بطاقتين: "بائع" و "موظف توصيل"
- أزرار الاختيار

### 3. إذا ظهر 404:
- تأكد من وجود `/en/` في البداية
- امسح كاش المتصفح (Ctrl+Shift+Delete)
- جرّب التصفح المتخفي

---

**آخر تحديث:** 2026  
**المشروع:** Marketna E-Commerce Platform
