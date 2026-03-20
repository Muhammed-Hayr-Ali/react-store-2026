# نظام أسعار صرف العملات (Exchange Rates System)

## 📋 نظرة عامة

نظام متكامل لإدارة أسعار صرف العملات في منصة Marketna للتجارة الإلكترونية. يتم تحديث الأسعار **تلقائياً كل ساعة** عبر Cron Job من مصدر خارجي موثوق.

**الملف:** `supabase/exchange_rates/exchange_rates.sql`

---

## 📁 محتويات الملف

1. [جدول أسعار الصرف](#1-جدول-أسعار-الصرف)
2. [الفهرسة](#2-الفهرسة)
3. [سياسات الأمان (RLS)](#3-سياسات-الأمان-row-level-security)
4. [الدوال المساعدة](#4-الدوال-المساعدة)
5. [العرض المبسط](#5-العرض-المبسط)
6. [التكامل مع Cron Job](#6-التكامل-مع-cron-job)
7. [أمثلة الاستخدام](#7-أمثلة-الاستخدام)

---

## 1. جدول أسعار الصرف

### `exchange_rates`

يخزن أسعار صرف العملات محدثة تلقائياً.

### 1.1 بنية الجدول

| العمود            | النوع          | القيود              | الوصف                   |
| ----------------- | -------------- | ------------------- | ----------------------- |
| `id`              | UUID           | PRIMARY KEY         | المعرف الفريد           |
| `currency_code`   | TEXT           | NOT NULL, UNIQUE    | رمز العملة (ISO 4217)   |
| `rate_from_usd`   | NUMERIC(18, 6) | NOT NULL, CHECK > 0 | سعر الصرف مقابل الدولار |
| `last_updated_at` | TIMESTAMPTZ    | NOT NULL            | آخر تحديث               |
| `created_at`      | TIMESTAMPTZ    | DEFAULT NOW()       | تاريخ الإنشاء           |

### 1.2 القيود

| القيد                    | الوصف                           |
| ------------------------ | ------------------------------- |
| `currency_code_unique`   | كل رمز عملة يجب أن يكون فريداً  |
| `rate_from_usd_positive` | سعر الصرف يجب أن يكون أكبر من 0 |

### 1.3 العملات المدعومة

| الرمز | العملة       | الدولة              |
| ----- | ------------ | ------------------- |
| `USD` | دولار أمريكي | 🇺🇸 الولايات المتحدة |
| `SAR` | ريال سعودي   | 🇸🇦 السعودية         |
| `EGP` | جنيه مصري    | 🇪🇬 مصر              |
| `TRY` | ليرة تركية   | 🇹🇷 تركيا            |
| `EUR` | يورو         | 🇪🇺 الاتحاد الأوروبي |
| `AED` | درهم إماراتي | 🇦🇪 الإمارات         |
| `SYP` | ليرة سورية   | 🇸🇾 سوريا            |

---

## 2. الفهرسة

تم إنشاء فهرسين لتحسين الأداء:

| الفهرس                             | العمود                 | الغرض                      |
| ---------------------------------- | ---------------------- | -------------------------- |
| `idx_exchange_rates_currency_code` | `currency_code`        | البحث السريع عن عملة معينة |
| `idx_exchange_rates_last_updated`  | `last_updated_at DESC` | ترتيب حسب آخر تحديث        |

---

## 3. سياسات الأمان (Row Level Security)

### 3.1 تفعيل RLS

```sql
ALTER TABLE exchange_rates ENABLE ROW LEVEL SECURITY;
```

### 3.2 سياسة القراءة العامة

```sql
CREATE POLICY "exchange_rates_public_read"
  ON exchange_rates FOR SELECT
  TO authenticated, anon
  USING (true);
```

**الوصف:** يسمح **لأي شخص** (حتى غير المصادقين) بقراءة أسعار الصرف.

### 3.3 سياسة الكتابة للمسؤولين

```sql
CREATE POLICY "exchange_rates_service_write"
  ON exchange_rates FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);
```

**الوصف:** يسمح فقط لـ **Service Role** بالتعديل (Cron Job يستخدم هذا المفتاح).

### 3.4 مصفوفة الوصول

| المستخدم      | CREATE | READ | UPDATE | DELETE |
| ------------- | ------ | ---- | ------ | ------ |
| Anonymous     | ❌     | ✅   | ❌     | ❌     |
| Authenticated | ❌     | ✅   | ❌     | ❌     |
| Service Role  | ✅     | ✅   | ✅     | ✅     |

---

## 4. الدوال المساعدة

### `get_exchange_rate(target_currency TEXT)`

**الوصف:** دالة مساعدة لجلب سعر صرف عملة معينة مقابل الدولار.

**التوقيع:**

```sql
CREATE FUNCTION get_exchange_rate(target_currency TEXT)
RETURNS NUMERIC(18, 6)
```

**المعلمات:**
| المعامل | النوع | الوصف |
|---------|-------|-------|
| `target_currency` | TEXT | رمز العملة (مثلاً: 'SAR', 'EGP') |

**الإرجاع:** `NUMERIC(18, 6)` - سعر الصرف

**مثال:**

```sql
SELECT get_exchange_rate('SAR');
-- النتيجة: 3.750000
```

**في TypeScript:**

```typescript
const { data } = await supabase
  .rpc('get_exchange_rate', { target_currency: 'SAR' })
  .single();

console.log(`1 USD = ${data} SAR`);
```

---

## 5. العرض المبسط

### `exchange_rates_summary`

**الوصف:** عرض مبسط لأسعار العملات مع حالة التحديث.

**التعريف:**

```sql
CREATE VIEW exchange_rates_summary AS
SELECT
  currency_code,
  rate_from_usd,
  last_updated_at,
  CASE
    WHEN last_updated_at > NOW() - INTERVAL '1 hour' THEN 'current'
    WHEN last_updated_at > NOW() - INTERVAL '24 hours' THEN 'recent'
    ELSE 'stale'
  END as status
FROM exchange_rates
ORDER BY currency_code;
```

**حالة التحديث:**

| الحالة    | المعنى | المدة           |
| --------- | ------ | --------------- |
| `current` | محدث   | آخر ساعة        |
| `recent`  | حديث   | آخر 24 ساعة     |
| `stale`   | قديم   | أكثر من 24 ساعة |

**مثال:**

```sql
SELECT * FROM exchange_rates_summary;

-- النتيجة:
-- currency_code | rate_from_usd | last_updated_at | status
-- USD           | 1.000000      | 2026-03-18...   | current
-- SAR           | 3.750000      | 2026-03-18...   | current
-- EGP           | 30.900000     | 2026-03-17...   | recent
-- TRY           | 29.500000     | 2026-03-15...   | stale
```

---

## 6. التكامل مع Cron Job

### 6.1 مصدر البيانات

**API:** `https://v6.exchangerate-api.com/v6/{KEY}/latest/USD`

**التكرار:** كل ساعة

---

### 6.2 Vercel Cron Configuration

**الملف:** `vercel.json`

```json
{
  "crons": [
    {
      "path": "/api/cron/update-rates",
      "schedule": "0 * * * *"
    }
  ]
}
```

**الجدول:** كل ساعة عند الدقيقة 0

| الحقل        | القيمة | الوصف         |
| ------------ | ------ | ------------- |
| Minute       | 0      | عند الدقيقة 0 |
| Hour         | \*     | كل ساعة       |
| Day of Month | \*     | كل يوم        |
| Month        | \*     | كل شهر        |
| Day of Week  | \*     | كل يوم أسبوع  |

---

### 6.3 API Route للتحديث

**المسار:** `/api/cron/update-rates`

```typescript
import { createClient } from "@supabase/supabase-js"
import { NextResponse } from "next/server"

export async function GET(request: Request) {
  // التحقق من أن الطلب من Cron
  const authHeader = request.headers.get("authorization")
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new NextResponse("Unauthorized", { status: 401 })
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  try {
    // جلب الأسعار من API الخارجي
    const response = await fetch(
      `https://v6.exchangerate-api.com/v6/${process.env.EXCHANGE_RATE_API_KEY}/latest/USD`
    )
    const data = await response.json()

    if (data.result !== 'success') {
      throw new Error('Failed to fetch exchange rates')
    }

    const rates = data.conversion_rates
    const updatedAt = new Date().toISOString()

    // تحديث كل عملة
    for (const [currency, rate] of Object.entries(rates)) {
      await supabase.from('exchange_rates').upsert({
        currency_code: currency,
        rate_from_usd: rate,
        last_updated_at: updatedAt,
      }, {
        onConflict: 'currency_code'
      })
    }

    return NextResponse.json({
      success: true,
      message: "Exchange rates updated successfully",
      count: Object.keys(rates).length,
    })
  } catch (error) {
    console.error("Update failed:", error)
    return NextResponse.json(
      { success: false, error: "Update failed" },
      { status: 500 }
    )
  }
}
```

---

## 7. أمثلة الاستخدام

### 7.1 في SQL

```sql
-- جلب جميع الأسعار
SELECT * FROM exchange_rates ORDER BY currency_code;

-- جلب سعر صرف معين
SELECT get_exchange_rate('SAR');

-- عرض ملخص الأسعار
SELECT * FROM exchange_rates_summary;

-- معرفة عمر آخر تحديث (بالدقائق)
SELECT
  currency_code,
  last_updated_at,
  EXTRACT(EPOCH FROM (NOW() - last_updated_at)) / 60 as minutes_ago
FROM exchange_rates
ORDER BY currency_code;

-- تحويل مبلغ من USD إلى عملة أخرى
SELECT
  100 * rate_from_usd as total
FROM exchange_rates
WHERE currency_code = 'SAR';
-- النتيجة: 375.000000 (100 دولار = 375 ريال)
```

---

### 7.2 في Next.js / TypeScript

#### الحصول على سعر صرف

```typescript
// lib/exchange-rates.ts
import { createClient } from '@/lib/supabase/client'

export async function getExchangeRate(currency: string) {
  const supabase = createBrowserClient()

  const { data, error } = await supabase
    .rpc('get_exchange_rate', { target_currency: currency })
    .single()

  if (error) throw error

  return data
}

// الاستخدام
const sarRate = await getExchangeRate('SAR')
console.log(`1 USD = ${sarRate} SAR`)
```

---

#### تحويل عملة

```typescript
// lib/currency-converter.ts
import { getExchangeRate } from './exchange-rates'

export async function convertCurrency(
  amount: number,
  fromCurrency: string,
  toCurrency: string
) {
  // جلب سعر الصرف للعملتين
  const [fromRate, toRate] = await Promise.all([
    getExchangeRate(fromCurrency),
    getExchangeRate(toCurrency)
  ])

  // التحويل عبر USD
  const amountInUSD = amount / fromRate
  const convertedAmount = amountInUSD * toRate

  return convertedAmount
}

// الاستخدام
const result = await convertCurrency(100, 'USD', 'SAR')
console.log(`100 USD = ${result} SAR`) // 375 SAR
```

---

#### عرض حالة التحديث

```typescript
// components/ExchangeRateStatus.tsx
import { createClient } from '@/lib/supabase/client'

export async function ExchangeRateStatus() {
  const supabase = createBrowserClient()

  const { data: rates } = await supabase
    .from('exchange_rates_summary')
    .select('*')

  return (
    <div>
      <h2>أسعار الصرف</h2>
      <table>
        <thead>
          <tr>
            <th>العملة</th>
            <th>السعر</th>
            <th>الحالة</th>
          </tr>
        </thead>
        <tbody>
          {rates?.map((rate) => (
            <tr key={rate.currency_code}>
              <td>{rate.currency_code}</td>
              <td>{rate.rate_from_usd}</td>
              <td>
                <StatusBadge status={rate.status} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function StatusBadge({ status }: { status: string }) {
  const colors = {
    current: 'bg-green-100 text-green-800',
    recent: 'bg-yellow-100 text-yellow-800',
    stale: 'bg-red-100 text-red-800',
  }

  const labels = {
    current: 'محدث',
    recent: 'حديث',
    stale: 'قديم',
  }

  return (
    <span className={`px-2 py-1 rounded text-xs ${colors[status]}`}>
      {labels[status]}
    </span>
  )
}
```

---

#### مبدل العملات (Client Component)

```typescript
// components/CurrencyConverter.tsx
'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

export function CurrencyConverter() {
  const [amount, setAmount] = useState(1)
  const [fromCurrency, setFromCurrency] = useState('USD')
  const [toCurrency, setToCurrency] = useState('SAR')
  const [result, setResult] = useState<number | null>(null)
  const [rates, setRates] = useState<any[]>([])

  useEffect(() => {
    loadRates()
  }, [])

  async function loadRates() {
    const supabase = createBrowserClient()
    const { data } = await supabase
      .from('exchange_rates')
      .select('currency_code, rate_from_usd')

    if (data) setRates(data)
  }

  async function convert() {
    const supabase = createBrowserClient()

    const fromRate = rates.find(r => r.currency_code === fromCurrency)?.rate_from_usd
    const toRate = rates.find(r => r.currency_code === toCurrency)?.rate_from_usd

    if (!fromRate || !toRate) return

    const amountInUSD = amount / fromRate
    const convertedAmount = amountInUSD * toRate

    setResult(convertedAmount)
  }

  return (
    <div className="p-4 border rounded">
      <h3 className="text-lg font-bold mb-4">محول العملات</h3>

      <div className="space-y-3">
        <input
          type="number"
          value={amount}
          onChange={(e) => setAmount(Number(e.target.value))}
          className="w-full p-2 border rounded"
          placeholder="المبلغ"
        />

        <select
          value={fromCurrency}
          onChange={(e) => setFromCurrency(e.target.value)}
          className="w-full p-2 border rounded"
        >
          {rates.map((rate) => (
            <option key={rate.currency_code} value={rate.currency_code}>
              {rate.currency_code}
            </option>
          ))}
        </select>

        <div className="text-center">⬇️</div>

        <select
          value={toCurrency}
          onChange={(e) => setToCurrency(e.target.value)}
          className="w-full p-2 border rounded"
        >
          {rates.map((rate) => (
            <option key={rate.currency_code} value={rate.currency_code}>
              {rate.currency_code}
            </option>
          ))}
        </select>

        <button
          onClick={convert}
          className="w-full bg-primary text-primary-foreground p-2 rounded"
        >
          تحويل
        </button>

        {result && (
          <div className="text-center text-2xl font-bold">
            {result.toFixed(2)} {toCurrency}
          </div>
        )}
      </div>
    </div>
  )
}
```

---

## 📊 مخطط التدفق

```
┌─────────────────────────────────────────────────────────────┐
│                  Exchange Rates Update Flow                  │
└─────────────────────────────────────────────────────────────┘

1. Vercel Cron (كل ساعة)
   │
   ▼
2. /api/cron/update-rates
   │
   ▼
3. التحقق من CRON_SECRET
   │
   ▼
4. استدعاء ExchangeRateAPI
   │
   ▼
5. جلب الأسعار (USD قاعدة)
   │
   ▼
6. تحديث قاعدة البيانات (upsert)
   │
   ▼
7. exchange_rates.last_updated_at = NOW()

┌─────────────────────────────────────────────────────────────┐
│                  Currency Conversion Flow                    │
└─────────────────────────────────────────────────────────────┘

1. المستخدم يدخل: 100 USD → SAR
   │
   ▼
2. جلب rate_from_usd لـ USD (1.0)
   │
   ▼
3. جلب rate_from_usd لـ SAR (3.75)
   │
   ▼
4. الحساب:
   - amountInUSD = 100 / 1.0 = 100
   - convertedAmount = 100 * 3.75 = 375
   │
   ▼
5. النتيجة: 375 SAR
```

---

## 🔐 أفضل الممارسات الأمنية

### 1. حماية API Key

```typescript
// ❌ خطأ - لا تضع المفتاح في الكود
const apiKey = 'sk-xxx-xxx-xxx'

// ✅ صحيح - استخدم متغير بيئي
const apiKey = process.env.EXCHANGE_RATE_API_KEY
```

### 2. استخدام Service Role للـ Cron

```typescript
// ✅ صحيح - Cron يستخدم Service Role
const supabase = createClient(
  url,
  process.env.SUPABASE_SERVICE_ROLE_KEY! // يتجاوز RLS
)
```

### 3. التحقق من CRON_SECRET

```typescript
// ✅ صحيح - تحقق من أن الطلب من Cron
const authHeader = request.headers.get("authorization")
if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
  return new NextResponse("Unauthorized", { status: 401 })
}
```

---

## ⚠️ ملاحظات هامة

1. **التحديث التلقائي:** الأسعار تُحدَّث كل ساعة تلقائياً عبر Cron Job
2. **العملة الأساسية:** جميع الأسعار مخزنة مقابل الدولار الأمريكي (USD)
3. **الدقة:** الأسعار مخزنة بـ 6 خانات عشرية (`NUMERIC(18, 6)`)
4. **RLS:** القراءة عامة، الكتابة فقط لـ Service Role
5. **حالة التحديث:** استخدم `exchange_rates_summary` لمعرفة إذا كانت الأسعار حديثة

---

## 🚀 الترقية والصيانة

### إضافة عملة جديدة

```sql
-- إضافة يدوية (للاختبار)
INSERT INTO exchange_rates (currency_code, rate_from_usd, last_updated_at)
VALUES ('GBP', 0.790000, NOW())
ON CONFLICT (currency_code) DO UPDATE
SET rate_from_usd = EXCLUDED.rate_from_usd,
    last_updated_at = EXCLUDED.last_updated_at;
```

### تغيير تردد التحديث

```json
// vercel.json
{
  "crons": [
    {
      "path": "/api/cron/update-rates",
      // كل 30 دقيقة
      "schedule": "*/30 * * * *"
    }
  ]
}
```

### جداول شائعة لـ Cron

| التعبير        | الوصف                  |
| -------------- | ---------------------- |
| `0 * * * *`    | كل ساعة                |
| `*/30 * * * *` | كل 30 دقيقة            |
| `0 */2 * * *`  | كل ساعتين              |
| `0 0 * * *`    | يومياً عند منتصف الليل |

---

## 📞 الدعم

لأي استفسارات أو مشاكل تقنية، يرجى التواصل مع فريق التطوير.

---

**الإصدار:** 1.0  
**آخر تحديث:** 2026  
**المشروع:** Marketna E-Commerce Platform  
**مصدر البيانات:** ExchangeRate-API
