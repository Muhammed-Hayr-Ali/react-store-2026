# 📘 المرجع الشامل لتعريفات TypeScript ومخططات Zod
**(Master Types & Schemas Reference - v2.0)**

هذا الملف هو التطبيق البرمجي المباشر لـ **"القاموس الموحد لأسماء الأعمدة"**، مدعوماً بالقرارات المعمارية المعتمدة للفريق. يوضح هذا الدليل كيف يجب أن تُكتب وتُدار واجهات TypeScript ومخططات التحقق Zod.

---

## 🎯 المبادئ والقرارات المعمارية (Architectural Decisions)

### 1. نطاق تطبيق حالة الأحرف (snake_case Scope)
التزاماً بقانون التطابق التام (1:1 Mapping Law):
* **✅ إلزامي (snake_case) في:** نماذج البيانات (Data Models/Types)، استجابات الـ API، جداول قاعدة البيانات، مخططات Zod، وحقول React Hook Form.
* **❌ ممنوع (يُستخدم camelCase بدلاً منه) في:** مكونات React (Components & Props)، خصائص HTML الأصلية (`onClick`, `className`)، ومتغيرات الحالة المحلية (Local State).

### 2. أتمتة توليد الأنواع (Automated Type Generation)
* **يُمنع** كتابة واجهات TypeScript (Interfaces) للجداول يدوياً لتجنب الأخطاء البشرية.
* **يجب** استخدام أمر Supabase لتوليد الأنواع الأساسية:
  ```bash
  npm run supabase:types # supabase gen types typescript --local > types/database.ts
  ```
* يتم بناء مخططات Zod فوق هذه الأنواع المولدة تلقائياً.

### 3. مركزية الثوابت (Centralized Enums)
* جميع الـ Union Types (مثل `EntityStatus`) تُعرّف في ملف مركزي واحد `constants/enums.ts`.
* **يُمنع** إعادة تعريفها داخل كل Schema منفرداً.

### 4. الفلترة والتطبيق (Application Layer Filtering)
* **يُعامل حقل `deleted_at` معاملة `is_active`** من ناحية سياسات RLS. لا يتم إخفاء السجلات المحذوفة عبر RLS.
* الفلترة تتم على مستوى التطبيق (Application Layer) في دوال الـ Queries:
  ```typescript
  // ✅ الفلترة الصحيحة على مستوى التطبيق
  const activeRecords = await supabase.from('todos').select('*').is('deleted_at', null);
  ```

---

## 🏗️ أمثلة المخططات بعد التعديلات المعمارية (Schemas Examples)

### 1. المعرفات والعلاقات (Identifiers & Keys)
```typescript
// Zod (schemas.ts)
id: z.string().uuid("المعرف غير صالح"),
parent_id: z.string().uuid().nullable().optional(),
user_id: z.string().uuid(),
slug: z.string()
  .trim()
  .min(3)
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "الصيغة غير صالحة للرابط (Slug)"),
```

### 2. النصوص والتوطين (Text & Localization)
*يجب تحويل النصوص الفارغة `""` إلى `null` في Zod لتطابق قاعدة البيانات.*
```typescript
// Zod (schemas.ts)
name: z.string().trim().min(2),
title: z.string().trim().min(3),
name_ar: z.string().trim().nullable().optional()
  .transform(val => (!val || val === "" ? null : val)),
description: z.string().nullable().optional()
  .transform(val => (!val || val === "" ? null : val)),
```

### 3. الحالات والمنطق التشغيلي (Status & Booleans)
*تُستورد الحالات من الملف المركزي `constants/enums.ts`.*
```typescript
// types.ts أو enums.ts
import { STATUSES } from "@/constants/enums";

// Zod (schemas.ts)
status: z.enum(STATUSES, { required_error: "الحالة مطلوبة" }),
is_active: z.boolean({ required_error: "حالة التفعيل مطلوبة" }),
is_published: z.boolean(),
```

### 4. الأرقام والتسعير (Numbers & Pricing)
*يُستخدم `z.coerce.number()` لضمان تحويل المدخلات القادمة من الـ Forms أو الـ URLs إلى أرقام صحيحة تلقائياً.*
```typescript
// Zod (schemas.ts)
sort_order: z.coerce.number().int().min(0, "الترتيب يجب أن يكون 0 أو أكبر"),
price: z.coerce.number().min(0, "السعر لا يمكن أن يكون سالباً"),
discount_price: z.coerce.number().min(0).nullable().optional(),
quantity: z.coerce.number().int().min(1),
```

### 5. الوسائط والمرفقات (Media & Attachments)
```typescript
// Zod (schemas.ts)
image_url: z.string().url("رابط الصورة غير صالح").nullable().optional()
  .transform(val => (!val || val === "" ? null : val)),
attachment_url: z.string().url().nullable().optional(),
```

### 6. التواريخ والطوابع الزمنية (Dates & Timestamps)
```typescript
// Zod (schemas.ts)
created_at: z.string().datetime(),
deleted_at: z.string().datetime().nullable().optional(),
due_date: z.string().datetime().nullable().optional()
  .transform(val => (!val || val === "" ? null : val)),
```

### 7. الـ SEO والبيانات المتقدمة (SEO & JSON) - [مُحدث ✨]
**يُمنع استخدام `any` إطلاقاً. يتم استخدام `unknown` للحفاظ على قوة نظام التحقق.**

#### TypeScript (types/database.ts - مُوَلّد آلياً)
```typescript
metadata: Record<string, unknown> | null;
settings: Record<string, unknown>;
tags: string[];
```

#### Zod (`schemas.ts`)
```typescript
meta_title: z.string().max(60).nullable().optional(),
meta_description: z.string().max(160).nullable().optional(),
// ✅ استخدام z.unknown() بدلاً من z.any()
metadata: z.record(z.string(), z.unknown()).nullable().optional(),
settings: z.record(z.string(), z.unknown()).default({}), 
tags: z.array(z.string()).default([]),
```

---

## 💡 قواعد هامة جداً (Best Practices & Enforcement):

1. **لا للـ Defaults الخفية:** تجنب استخدام `.default()` في Zod للحقول الأساسية (مثل `is_active`)، يجب أن يُجبر المطور/المستخدم على إرسال القيمة صراحة.
2. **استخدام Coerce للأرقام:** النماذج (Forms) في HTML ترسل الأرقام كنصوص، لذا استخدم `z.coerce.number()` دائماً لتفادي أخطاء النوع (Type Mismatch).
3. **تطبيق قواعد Linter:** تأكد من تفعيل قواعد ESLint الآتية في المشروع لمنع الانحراف عن المعمارية:
   * `@typescript-eslint/no-explicit-any`: لمنع استخدام `any`.
   * إعداد قواعد تسمية (Naming Conventions) لضمان استخدام `snake_case` في النماذج والمخططات.