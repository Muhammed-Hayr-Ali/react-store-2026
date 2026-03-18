# نظام مهام Cron التلقائية (Cron Jobs System)

## 📋 نظرة عامة

نظام مهام تلقائية مجدولة لتنظيف الرموز القديمة وتحديث أسعار الصرف في منصة Marketna.

---

## 📁 الملفات

| الملف | الوصف |
|-------|-------|
| `app/api/cron/cleanup-tokens/route.ts` | تنظيف رموز إعادة التعيين |
| `app/api/cron/update-rates/route.ts` | تحديث أسعار الصرف |
| `vercel.json` | إعدادات الجدولة |

---

## 🕐 الجدول الزمني

### 1. تنظيف الرموز (`cleanup-tokens`)

**الوقت:** يومياً عند 02:00 UTC (05:00 بتوقيت سوريا)

**الدالة:** `cleanup_expired_reset_tokens()`

**العملية:**
- حذف الرموز المنتهية منذ >30 يوم
- حذف الرموز المستخدمة منذ >7 أيام

---

### 2. تحديث الأسعار (`update-rates`)

**الوقت:** يومياً عند 02:10 UTC (05:10 بتوقيت سوريا)

**الدالة:** تحديث جدول `exchange_rates`

**العملية:**
- جلب الأسعار من ExchangeRate-API
- تحديث جميع العملات

---

## 🔧 الإعدادات

### 1. المتغيرات البيئية

**الملف:** `.env.local`

```env
# Secret لحماية مهام Cron
CRON_SECRET=your-secret-key-here
```

⚠️ **مهم:** غيّر `CRON_SECRET` في الإنتاج!

---

### 2. Vercel Cron Configuration

**الملف:** `vercel.json`

```json
{
  "crons": [
    {
      "path": "/api/cron/cleanup-tokens",
      "schedule": "0 2 * * *"
    },
    {
      "path": "/api/cron/update-rates",
      "schedule": "10 2 * * *"
    }
  ]
}
```

---

## 📝 صيغة Cron

```
┌───────────── الدقيقة (0 - 59)
│ ┌───────────── الساعة (0 - 23) بتوقيت UTC
│ │ ┌───────────── يوم الشهر (1 - 31)
│ │ │ ┌───────────── الشهر (1 - 12)
│ │ │ │ ┌───────────── يوم الأسبوع (0 - 6) حيث 0 = الأحد
│ │ │ │ │
* * * * *
```

### أمثلة شائعة

| التعبير | الوصف |
|---------|-------|
| `0 2 * * *` | يومياً 02:00 UTC |
| `0 */6 * * *` | كل 6 ساعات |
| `0 * * * *` | كل ساعة |
| `*/30 * * * *` | كل 30 دقيقة |
| `0 0 * * 0` | أسبوعياً يوم الأحد |
| `0 0 1 * *` | شهرياً يوم 1 |

---

## 🧪 الاختبار

### اختبار يدوي

```bash
# اختبار cleanup-tokens
curl -H "Authorization: Bearer your-cron-secret" \
  http://localhost:3000/api/cron/cleanup-tokens

# اختبار update-rates
curl -H "Authorization: Bearer your-cron-secret" \
  http://localhost:3000/api/cron/update-rates
```

### التحقق من السجلات

**في Vercel Dashboard:**

1. اذهب إلى **Project** → **Cron**
2. انقر على المهمة المطلوبة
3. اعرض **Execution History**

---

## 🔐 الأمان

### 1. Authorization Header

```typescript
const authHeader = request.headers.get("authorization")
if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
  return new NextResponse("Unauthorized", { status: 401 })
}
```

### 2. Service Role Key

```typescript
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY! // يتجاوز RLS
)
```

---

## 📊 المخرجات

### نجاح

```json
{
  "success": true,
  "message": "Cleanup completed",
  "deleted_count": 42
}
```

### فشل

```json
{
  "success": false,
  "error": "Cleanup failed"
}
```

---

## ⚠️ استكشاف الأخطاء

### المشكلة: 401 Unauthorized

**السبب:** `CRON_SECRET` غير متطابق

**الحل:**
```bash
# تحقق من .env.local
echo $CRON_SECRET

# تحقق من Vercel Environment Variables
# Settings → Environment Variables → CRON_SECRET
```

---

### المشكلة: 500 Internal Server Error

**الأسباب:**
1. ❌ الدالة غير موجودة في قاعدة البيانات
2. ❌ `SUPABASE_SERVICE_ROLE_KEY` غير صحيح
3. ❌ خطأ في الدالة نفسها

**الحل:**
```sql
-- التحقق من وجود الدالة
SELECT routine_name
FROM information_schema.routines
WHERE routine_name = 'cleanup_expired_reset_tokens';

-- إذا لم تكن موجودة، شغّل:
-- supabase/sql/password_reset_system.sql
```

---

### المشكلة: المهمة لا تعمل

**التحقق:**

1. **Vercel Plan:**
   - Hobby: 1 Cron Job فقط
   - Pro: 10 Cron Jobs
   - Enterprise: غير محدود

2. **Cron Configuration:**
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

3. **Environment Variables:**
   - `CRON_SECRET` في Vercel
   - `SUPABASE_SERVICE_ROLE_KEY` في Vercel

---

## 📚 الملفات المرتبطة

| الملف | الوصف |
|-------|-------|
| `supabase/sql/password_reset_system.sql` | دالة cleanup_expired_reset_tokens |
| `supabase/exchange_rates/exchange_rates.sql` | جدول أسعار الصرف |
| `lib/actions/email/actions/send-reset-email.ts` | إرسال البريد |

---

## 🎯 أفضل الممارسات

### 1. استخدم أوقات هادئة

```json
{
  "schedule": "0 2 * * *"  // 02:00 UTC (أقل استخدام)
}
```

### 2. أضف Delay بين المهام

```json
{
  "crons": [
    {
      "path": "/api/cron/cleanup-tokens",
      "schedule": "0 2 * * *"    // 02:00
    },
    {
      "path": "/api/cron/update-rates",
      "schedule": "10 2 * * *"   // 02:10 (بعد 10 دقائق)
    }
  ]
}
```

### 3. Log الأخطاء

```typescript
try {
  const { data } = await supabase.rpc('cleanup_expired_reset_tokens')
  console.log(`Deleted ${data} tokens`)
} catch (error) {
  console.error("Cleanup failed:", error)
  throw error
}
```

### 4. اختبر يدوياً

```bash
# قبل النشر، اختبر محلياً
curl -H "Authorization: Bearer test" \
  http://localhost:3000/api/cron/cleanup-tokens
```

---

## 📊 المراقبة

### Vercel Dashboard

1. **Analytics** → **Cron Jobs**
2. اعرض:
   - ✅ Successful executions
   - ❌ Failed executions
   - ⏱️ Average duration

### Supabase Dashboard

1. **Database** → **Tables**
2. تحقق من:
   - `password_reset_tokens` count
   - `exchange_rates.last_updated_at`

---

**الإصدار:** 1.0  
**آخر تحديث:** 2026  
**المشروع:** Marketna E-Commerce Platform
