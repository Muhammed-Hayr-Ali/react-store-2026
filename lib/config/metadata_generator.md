# استخدام مولد البيانات الجديد (Metadata Generator)

لقد قمت بإصلاح الخطأ في الملف التجريبي [/tmp/verify_metadata.ts](file:///tmp/verify_metadata.ts) بإضافة الاستيراد (Import) المفقود.

إليك كيفية استخدام [createMetadata](file:///d:/Next.JS%202026/application/lib/config/metadata_generator.ts#85-162) في مشروعك:

## كيفية الاستخدام في صفحات Next.js

لاستخدام المولد في أي صفحة (`page.tsx`) أو تخطيط (`layout.tsx`)، اتبع الخطوات التالية:

### 1. استيراد الدالة
قم باستيراد [createMetadata](file:///d:/Next.JS%202026/application/lib/config/metadata_generator.ts#85-162) من المسار المخصص له:
```typescript
import { createMetadata } from "@/lib/config/metadata_generator";
```

### 2. تعريف بيانات الميتا (Metadata)
قم بتصدير ثابت `metadata` باستخدام الدالة:

```typescript
export const metadata = createMetadata({
  title: "عنوان الصفحة",
  description: "وصف جذاب لمحركات البحث",
  path: "/اسم-المسار", // اختياري: لتعريف الرابط الكنسي (Canonical URL)
  keywords: ["كلمة", "دلالية"], // اختياري
});
```

## مثال كامل في صفحة (`page.tsx`)

```typescript
import { createMetadata } from "@/lib/config/metadata_generator";

export const metadata = createMetadata({
  title: "الرئيسية",
  description: "مرحباً بك في متجرنا الفاخر",
  path: "/",
});

export default function Page() {
  return (
    <main>
      <h1>محتوى الصفحة</h1>
    </main>
  );
}
```

## المميزات التي يوفرها المولد:
- **تلقائية العناوين**: يضيف اسم الموقع تلقائياً بجانب العنوان (مثلاً: `الرئيسية | اسم الموقع`).
- **تحسين محركات البحث (SEO)**: يضيف روابط Canonical ووسوم Open Graph و Twitter تلقائياً.
- **القيم الافتراضية**: يستخدم الوصف والكلمات الدلالية الافتراضية للموقع إذا لم يتم توفيرها.

---

# جعل الموقع قابلاً للتثبيت كتطبيق (PWA)

لجعل متصفح Chrome في Windows يظهر زر "التثبيت" (Install)، قمت بإضافة المتطلبات التالية:

### 1. ملف الـ Manifest
قمت بإنشاء ملف [app/manifest.ts](file:///d:/Next.JS%202026/application/app/manifest.ts) الذي يحتوي على:
- اسم التطبيق ووصفه.
- الأيقونات المطلوبة.
- وضع العرض (`standalone`) ليظهر كنافذة مستقلة بدون أشرطة المتصفح.

### 2. تحديث بيانات الميتا
قمت بتحديث [createMetadata](file:///d:/Next.JS%202026/application/lib/config/metadata_generator.ts#85-162) لدعم:
- `themeColor`: لتحديد لون شريط العنوان.
- `appleWebApp`: لدعم التثبيت على أجهزة iPhone/iPad.

## كيف تلاحظ فرق التثبيت؟

عند تشغيل الموقع في Chrome على Windows، ستلاحظ ظهور أيقونة "شاشة صغيرة مع سهم" في شريط العنوان (URL bar) بجانب النجمة. بالضغط عليها، يمكن للمستخدم تثبيت الموقع كـ App على جهازه.

> [!NOTE]
> لضمان ظهور زر التثبيت دائماً، يجب أن يعمل الموقع عبر رابط **HTTPS** (أو `localhost` للتطوير) وأن يتم توفير أيقونات واضحة بمقاسات 192x192 و 512x512 (لقد استخدمت [logo.png](file:///d:/Next.JS%202026/application/public/logo.png) كقاعدة لذلك).
