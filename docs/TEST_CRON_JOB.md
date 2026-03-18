# اختبار Cron Job للتنظيف التلقائي

## 📋 نظرة عامة

دليل اختبار مهمة التنظيف التلقائي لرموز إعادة تعيين كلمة المرور.

**الملف:** `app/api/cron/cleanup-tokens/route.ts`

---

## 🧪 الاختبار اليدوي

### 1. التشغيل المحلي

**الخطوة 1:** تشغيل السيرفر محلياً

```bash
npm run dev
```

**الخطوة 2:** اختبار الـ endpoint

```bash
# PowerShell
curl -H "Authorization: Bearer marketna_cron_secret_2026_change_this_in_production" http://localhost:3000/api/cron/cleanup-tokens

# CMD
curl -H "Authorization: Bearer marketna_cron_secret_2026_change_this_in_production" http://localhost:3000/api/cron/cleanup-tokens
```

---

### 2. النتائج المتوقعة

#### ✅ نجاح

```json
{
  "success": true,
  "message": "Cleanup completed successfully",
  "deleted_count": 0,
  "timestamp": "2026-03-18T12:00:00.000Z"
}
```

**HTTP Status:** `200 OK`

---

#### ❌ CRON_SECRET غير موجود

```json
{
  "success": false,
  "error": "CRON_SECRET not configured"
}
```

**HTTP Status:** `500`

**الحل:**
```bash
# أضف في .env.local
CRON_SECRET=marketna_cron_secret_2026_change_this_in_production
```

---

#### ❌ Unauthorized

```json
{
  "success": false,
  "error": "Unauthorized - Invalid CRON_SECRET"
}
```

**HTTP Status:** `401`

**الحل:**
```bash
# تحقق من CRON_SECRET في .env.local
# يجب أن يطابق القيمة في الطلب
```

---

#### ❌ Supabase credentials غير موجودة

```json
{
  "success": false,
  "error": "Supabase credentials not configured"
}
```

**HTTP Status:** `500`

**الحل:**
```bash
# أضف في .env.local
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

---

#### ❌ الدالة غير موجودة في قاعدة البيانات

```json
{
  "success": false,
  "error": "relation \"password_reset_tokens\" does not exist"
}
```

**HTTP Status:** `500`

**الحل:**
```sql
-- في Supabase Dashboard → SQL Editor
-- شغّل هذا الملف:
supabase/sql/password_reset_system.sql
```

---

## 🔍 استكشاف الأخطاء

### المشكلة: 404 Not Found

**الأسباب المحتملة:**

1. **السيرفر غير مشغّل**
   ```bash
   npm run dev
   ```

2. **المسار خاطئ**
   ```bash
   # الصحيح
   http://localhost:3000/api/cron/cleanup-tokens
   
   # ❌ خطأ
   http://localhost:3000/api/cleanup-tokens
   http://localhost:3000/cron/cleanup-tokens
   ```

3. **الـ route غير موجود**
   ```
   تحقق من:
   app/api/cron/cleanup-tokens/route.ts
   ```

---

### المشكلة: 500 Internal Server Error

**التحقق:**

1. **Console Output:**
   ```
   انظر إلى الرسائل في Console
   ```

2. **المتغيرات البيئية:**
   ```bash
   # تحقق من .env.local
   CRON_SECRET=...
   NEXT_PUBLIC_SUPABASE_URL=...
   SUPABASE_SERVICE_ROLE_KEY=...
   ```

3. **قاعدة البيانات:**
   ```sql
   -- التحقق من وجود الدالة
   SELECT routine_name 
   FROM information_schema.routines 
   WHERE routine_name = 'cleanup_expired_reset_tokens';
   
   -- إذا كانت النتيجة 0، شغّل:
   supabase/sql/password_reset_system.sql
   ```

---

### المشكلة: 401 Unauthorized

**السبب:** `CRON_SECRET` غير متطابق

**الحل:**

```bash
# 1. تحقق من .env.local
CRON_SECRET=marketna_cron_secret_2026_change_this_in_production

# 2. استخدم نفس القيمة في الطلب
curl -H "Authorization: Bearer marketna_cron_secret_2026_change_this_in_production" ...
```

---

## 📊 Console Output

### نجاح

```
🧹 Starting cleanup of expired tokens...
✅ Cleanup completed. Deleted 0 tokens.
```

### فشل

```
❌ CRON_SECRET is not configured
```

أو

```
❌ Cleanup failed: [error details]
```

---

## 🚀 النشر على Vercel

### 1. إضافة المتغيرات البيئية

**Vercel Dashboard → Settings → Environment Variables:**

| Name | Value | Environments |
|------|-------|--------------|
| `CRON_SECRET` | `your-secret-key` | ✅ Production |
| `NEXT_PUBLIC_SUPABASE_URL` | `https://...` | ✅ Production |
| `SUPABASE_SERVICE_ROLE_KEY` | `eyJ...` | ✅ Production |

---

### 2. التحقق من vercel.json

```json
{
  "crons": [
    {
      "path": "/api/cron/cleanup-tokens",
      "schedule": "0 2 * * *"
    }
  ]
}
```

**يجب أن يكون في جذر المشروع!**

---

### 3. اختبار على Vercel

```bash
curl -H "Authorization: Bearer YOUR_CRON_SECRET" \
  https://marketna.vercel.app/api/cron/cleanup-tokens
```

---

### 4. التحقق من Vercel Dashboard

**Vercel Dashboard → Your Project → Analytics → Cron Jobs**

يجب أن ترى:
- ✅ `cleanup-tokens` في القائمة
- 🕐 الجدول: `0 2 * * *`
- 📊 آخر تنفيذ

---

## 📋 قائمة التحقق

### قبل الاختبار

```
□ 1. CRON_SECRET في .env.local ✅
□ 2. NEXT_PUBLIC_SUPABASE_URL في .env.local ✅
□ 3. SUPABASE_SERVICE_ROLE_KEY في .env.local ✅
□ 4. دالة cleanup_expired_reset_tokens() في قاعدة البيانات ✅
□ 5. السيرفر مشغّل (npm run dev) ✅
```

### بعد الاختبار

```
□ 1. الاستجابة 200 OK ✅
□ 2. success: true ✅
□ 3. deleted_count: رقم (حتى لو 0) ✅
□ 4. timestamp: موجود ✅
□ 5. لا أخطاء في Console ✅
```

---

## 🎯 الخطوات التالية

### 1. اختبار محلياً

```bash
curl -H "Authorization: Bearer marketna_cron_secret_2026_change_this_in_production" \
  http://localhost:3000/api/cron/cleanup-tokens
```

### 2. إضافة المتغيرات إلى Vercel

```
Settings → Environment Variables → Add New
```

### 3. النشر

```bash
git push
```

### 4. اختبار على Vercel

```bash
curl -H "Authorization: Bearer YOUR_CRON_SECRET" \
  https://marketna.vercel.app/api/cron/cleanup-tokens
```

### 5. التحقق من الجدولة

```
Vercel Dashboard → Analytics → Cron Jobs
```

---

**الإصدار:** 1.0  
**آخر تحديث:** 2026  
**المشروع:** Marketna E-Commerce Platform
