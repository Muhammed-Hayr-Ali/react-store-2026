# دليل حماية المسارات (Route Protection Guide)

يشرح هذا الدليل الخطوات العملية والآلية المتبعة لحماية المسارات داخل المشروع باستخدام **`lib/middleware/role-guard.ts`** بالتكامل مع **Supabase** و **`next-intl`**.

---

## 1. الفكرة الأساسية لحماية المسار

تتم حماية مسارات التطبيق في الـ Middleware قبل وصول المستخدم إلى الصفحة، بالاعتماد على:
1. **المسار المطلوب (`pathname`):** استخراج مسار الصفحة الصافي بعد عزل رمز اللغة (مثل `/ar` أو `/en`).
2. **حالة التوثيق (`user`):** هل المستخدم مسجل دخول أم زائر؟
3. **الدور الممنوح للمستخدم (`Roles`):** استعلام جدول `user_roles` والتأكد من مطابقة دور المستخدم للأدوار المسموحة في القاعدة.

---

## 2. خطوات إضافة مسار محمي جديد

لحماية أي صفحة جديدة (مثلاً: `/dashboard/orders` أو `/dashboard/settings`)، تتبع الخطوات التالية داخل ملف `lib/middleware/role-guard.ts`:

### الخطوة الأولى: فتح ملف `role-guard.ts`
توجه إلى المصفوفة المسؤولة عن القواعد: `PROTECTED_ROUTE_RULES`.

### الخطوة الثانية: إضافة كائن القاعدة
أضف كائناً يحدد:
* `prefix`: بداية المسار المراد حمايته.
* `allowedRoles`: الأدوار المسموح لها بالدخول (من الثابت `ROLES`).
* `fallbackPath`: المسار البديل الذي يتم توجيه المستخدم إليه في حال عدم امتلاك الدور.

```typescript
// lib/middleware/role-guard.ts

const PROTECTED_ROUTE_RULES: RouteRule[] = [
  // 1. مسار الصلاحيات (أدمن فقط)
  {
    prefix: "/dashboard/roles",
    allowedRoles: [ROLES.ADMIN],
    fallbackPath: "/dashboard",
  },

  // 2. مسار إداري جديد (مثال: الطلبات متاحة للأدمن والمشرف)
  {
    prefix: "/dashboard/orders",
    allowedRoles: [ROLES.ADMIN, ROLES.MODERATOR],
    fallbackPath: "/dashboard",
  },

  // 3. مسار إعدادات متقدمة (مثال: أدمن فقط)
  {
    prefix: "/dashboard/settings",
    allowedRoles: [ROLES.ADMIN],
    fallbackPath: "/dashboard",
  },

  // 4. القاعدة العامة لكامل لوحة التحكم (توضع دائماً في النهاية)
  {
    prefix: "/dashboard",
    allowedRoles: [ROLES.ADMIN, ROLES.MODERATOR],
    fallbackPath: "/",
  },
]