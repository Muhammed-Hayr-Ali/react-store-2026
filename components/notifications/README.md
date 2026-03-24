# 🔔 نظام الإشعارات - Marketna E-Commerce

## 📋 نظرة عامة

نظام إشعارات فورية متكامل مبني باستخدام **Next.js 2026** و **Supabase Realtime** و **shadcn/ui**، يتيح للمستخدمين استقبال الإشعارات مباشرة مع واجهة مستخدم احترافية.

---

## 🎨 المميزات

- ✅ **تصميم احترافي** باستخدام shadcn/ui
- ✅ **Realtime Updates** عبر Supabase Realtime
- ✅ **Responsive Design** متجاوب مع جميع الشاشات
- ✅ **Animations** حركات سلسة عند الفتح/الإغلاق
- ✅ **TypeScript** دعم كامل للأنواع
- ✅ **RTL Support** دعم اللغة العربية
- ✅ **Dark Mode** متوافق مع الوضع الداكن
- ✅ **Notification Icons** أيقونات ديناميكية حسب نوع الإشعار

---

## 🔔 أيقونات الإشعارات

يتم عرض أيقونة مختلفة حسب نوع الإشعار (`type`):

| النوع            | الأيقونة        | اللون   | مثال استخدام               |
| ---------------- | --------------- | ------- | -------------------------- |
| `order`          | 📦 Package      | أزرق    | طلب جديد، تحديث حالة الطلب |
| `promo`          | 🏷️ Tag          | أخضر    | عرض ترويجي، خصم خاص        |
| `sale`           | 🛒 ShoppingCart | برتقالي | عملية بيع، منتج جديد       |
| `analytics`      | 📈 TrendingUp   | بنفسجي  | تقارير، إحصائيات           |
| `info` (default) | 🔔 Bell         | رمادي   | إشعارات عامة، أخبار        |

### مثال إنشاء إشعارات:

```sql
-- إشعار طلب جديد (أيقونة صندوق)
INSERT INTO notifications (user_id, title, message, type)
VALUES ('uuid', 'طلب جديد', 'تم استلام طلبك رقم #123', 'order');

-- إشعار عرض ترويجي (أيقونة Tag)
INSERT INTO notifications (user_id, title, message, type)
VALUES ('uuid', 'عرض خاص', 'خصم 50% على جميع المنتجات', 'promo');

-- إشعار بيع (أيقونة عربة التسوق)
INSERT INTO notifications (user_id, title, message, type)
VALUES ('uuid', 'مبيعة جديدة', 'تم بيع منتجك', 'sale');

-- إشعار تقارير (أيقونة TrendingUp)
INSERT INTO notifications (user_id, title, message, type)
VALUES ('uuid', 'تقرير المبيعات', 'مبيعاتك ارتفعت 20%', 'analytics');

-- إشعار عام (أيقونة جرس)
INSERT INTO notifications (user_id, title, message, type)
VALUES ('uuid', 'مرحباً', 'هذا إشعار تجريبي', 'info');
```

## 🏗️ بنية النظام

### 1️⃣ قاعدة البيانات (Supabase)

**المسار:** `supabase/08_In-App Notifications/1_create_table.sql`

#### جدول `notifications`:

| العمود       | النوع       | الوصف                           |
| ------------ | ----------- | ------------------------------- |
| `id`         | UUID        | المعرف الفريد                   |
| `user_id`    | UUID        | معرف المستخدم                   |
| `title`      | TEXT        | عنوان الإشعار                   |
| `message`    | TEXT        | نص الإشعار                      |
| `type`       | TEXT        | النوع: `info`, `order`, `promo` |
| `is_read`    | BOOLEAN     | حالة القراءة                    |
| `link`       | TEXT        | رابط اختياري                    |
| `created_at` | TIMESTAMPTZ | وقت الإنشاء                     |
| `updated_at` | TIMESTAMPTZ | وقت التحديث                     |

---

### 2️⃣ Server Actions

**المسار:** `lib/actions/notifications/notifications.ts`

```typescript
// جلب الإشعارات
await getNotifications()

// تحديد إشعار كمقروء
await markNotificationAsRead(id)

// تحديد الكل كمقروء
await markAllAsRead()
```

---

### 3️⃣ المكونات (Components)

#### 📁 هيكل المجلد:

```
components/
├── notifications/
│   ├── NotificationBell.tsx        # المكون الرئيسي
│   ├── NotificationBellServer.tsx  # Server Component
│   ├── types.ts                    # تعريفات TypeScript
│   ├── index.ts                    # التصدير
│   └── README.md                   # التوثيق
└── ui/
    └── notification-dropdown.tsx   # مكونات shadcn UI
```

#### 🔷 تعريف النوع:

```typescript
export interface Notification {
  id: string
  user_id: string
  title: string
  message: string
  type: "info" | "order" | "promo" | string
  is_read: boolean
  link: string | null
  created_at: string
  updated_at: string
}
```

---

## 🚀 طريقة الاستخدام

### الطريقة 1: Server Component (موصى به)

```tsx
// app/layout.tsx أو أي Server Component
import { NotificationBellServer } from "@/components/notifications"

export default function Header() {
  return (
    <header>
      <NotificationBellServer />
    </header>
  )
}
```

**المميزات:**

- ✅ جلب البيانات مسبقاً على الخادم
- ✅ أداء أفضل (أقل JavaScript على العميل)
- ✅ SEO-friendly

---

### الطريقة 2: Client Component

```tsx
"use client"

import NotificationBell from "@/components/notifications/NotificationBell"

export default function Header() {
  return <NotificationBell />
}
```

**المميزات:**

- ✅ يعمل بدون بيانات أولية
- ✅ يجلب البيانات تلقائياً
- ✅ تحديثات Realtime فورية

---

### الطريقة 3: مع بيانات أولية

```tsx
import NotificationBell from "@/components/notifications/NotificationBell"
import type { Notification } from "@/components/notifications"

export default function Page() {
  const notifications: Notification[] = [...] // من API أو Server

  return <NotificationBell initialNotifications={notifications} />
}
```

---

## 📡 إنشاء الإشعارات

### الطريقة 1: SQL مباشر

```sql
INSERT INTO public.notifications (user_id, title, message, type)
VALUES
  ('uuid-here', 'عنوان الإشعار', 'نص الإشعار', 'info');
```

### الطريقة 2: عبر Edge Function

```typescript
// supabase/functions/send-notification/index.ts
const { data, error } = await supabase
  .from("notifications")
  .insert({
    user_id,
    title,
    message,
    type: "order"
  })
```

### الطريقة 3: Database Trigger

```sql
CREATE OR REPLACE FUNCTION create_order_notification()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.notifications (user_id, title, message, type)
  VALUES (
    NEW.user_id,
    'طلب جديد',
    'تم استلام طلبك رقم: ' || NEW.id,
    'order'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER order_notification_trigger
  AFTER INSERT ON orders
  FOR EACH ROW
  EXECUTE FUNCTION create_order_notification();
```

---

## 🎨 التخصيص

### تغيير الألوان

```tsx
// components/ui/notification-dropdown.tsx
// في NotificationTriggerIcon
className={cn(
  "relative inline-flex h-10 w-10 items-center justify-center rounded-full hover:bg-muted",
  className // مرر ألوان مخصصة من هنا
)}
```

### تغيير حجم القائمة

```tsx
// في NotificationDropdownContent
className={cn(
  "z-50 w-80 overflow-hidden rounded-lg", // غيّر w-80 إلى w-96 أو w-64
  className
)}
```

### تغيير عدد الإشعارات

```tsx
// في NotificationBell.tsx
.limit(20) // غيّر الرقم حسب الحاجة
```

---

## 🔐 الأمان

### سياسات RLS:

```sql
-- قراءة الإشعارات الخاصة بالمستخدم فقط
CREATE POLICY "notifications_read_own"
  ON public.notifications FOR SELECT TO authenticated
  USING (user_id = auth.uid());

-- تحديث الإشعارات (تحديد كمقروء)
CREATE POLICY "notifications_update_own"
  ON public.notifications FOR UPDATE TO authenticated
  USING (user_id = auth.uid());

-- إنشاء إشعارات (للاختبار)
CREATE POLICY "notifications_insert_own"
  ON public.notifications FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());
```

---

## 🧪 الاختبار

### اختبار الإدراج:

```sql
-- استبدل uuid-here بمعرف المستخدم
INSERT INTO public.notifications (user_id, title, message, type)
VALUES
  ('uuid-here', 'إشعار تجريبي', 'هذا إشعار اختباري', 'info');
```

### خطوات الاختبار:

1. ✅ سجل الدخول كمستخدم
2. ✅ انقر على أيقونة الجرس
3. ✅ تحقق من ظهور الإشعارات
4. ✅ انقر على إشعار لتحديده كمقروء
5. ✅ اختبر "تحديد الكل كمقروء"
6. ✅ اختبر التحديث الفوري (Realtime)

---

## 🐛 استكشاف الأخطاء

### المشكلة: القائمة لا تغلق عند النقر خارجها

**الحل:** تأكد من استخدام `NotificationDropdown` الذي يستخدم Radix UI Dropdown

### المشكلة: الإشعارات لا تظهر

**الحل:**

```sql
-- تحقق من سياسات RLS
SELECT * FROM pg_policies WHERE tablename = 'notifications';

-- تحقق من بيانات المستخدم
SELECT auth.uid();
```

### المشكلة: Realtime لا يعمل

**الحل:**

1. فعّل **Replication** في Supabase Dashboard
2. تأكد من اسم القناة: `notifications-channel`
3. تحقق من `schema` و `table`

---

## 📊 الأداء

### الفهارس النشطة:

```sql
CREATE INDEX notifications_user_id_idx ON notifications(user_id);
CREATE INDEX notifications_created_at_idx ON notifications(created_at DESC);
CREATE INDEX notifications_is_read_idx ON notifications(is_read);
CREATE INDEX notifications_type_idx ON notifications(type);
```

### التحسينات:

- ✅ **Lazy Loading** جلب البيانات عند الحاجة
- ✅ **Optimistic Updates** تحديث فوري للواجهة
- ✅ **Realtime Subscription** اتصال واحد فقط
- ✅ **Memoization** تجنب إعادة الحساب

---

## 💡 أمثلة عملية

### مثال 1: إشعار عند طلب جديد

```typescript
// app/api/orders/route.ts
await supabase.from("notifications").insert({
  user_id: order.user_id,
  title: "تم استلام طلبك",
  message: `رقم الطلب: ${order.id}`,
  type: "order",
  link: `/orders/${order.id}`
})
```

### مثال 2: إشعار عند عرض خاص

```typescript
await supabase.from("notifications").insert({
  user_id,
  title: "عرض خاص!",
  message: "خصم 50% على جميع المنتجات",
  type: "promo",
  link: "/promotions"
})
```

### مثال 3: إشعار نظام

```typescript
await supabase.from("notifications").insert({
  user_id,
  title: "صيانة مجدولة",
  message: "سيتم إيقاف الخدمة الساعة 2:00 صباحاً",
  type: "info"
})
```

---

## 📝 قائمة المهام

- [ ] إضافة دعم الروابط في الإشعارات
- [ ] إضافة أنواع إشعارات مخصصة
- [ ] إضافة صوت إشعار
- [ ] إضافة خيار كتم الإشعارات
- [ ] إضافة إشعارات Push
- [ ] إضافة أرشيف الإشعارات
- [ ] إضافة إحصائيات

---

## 📚 المراجع

- [shadcn/ui Documentation](https://ui.shadcn.com)
- [Radix UI Dropdown](https://www.radix-ui.com/primitives/docs/components/dropdown-menu)
- [Supabase Realtime](https://supabase.com/docs/guides/realtime)
- [Next.js Server Components](https://nextjs.org/docs/app/building-your-application/rendering/server-components)

---

**تم التطوير بواسطة:** Marketna E-Commerce Team  
**الإصدار:** 2.0.0  
**التاريخ:** 24 مارس 2026
