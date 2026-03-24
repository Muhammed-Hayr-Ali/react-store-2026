# 📬 نظام الإشعارات الفورية - Marketna E-Commerce

## 📋 نظرة عامة

نظام إشعارات فورية متكامل مبني باستخدام **Next.js 2026** و **Supabase Realtime**، يتيح للمستخدمين استقبال الإشعارات مباشرة وتحديث حالتها دون الحاجة لإعادة تحميل الصفحة.

---

## 🏗️ بنية النظام

### 1️⃣ قاعدة البيانات (Supabase)

**المسار:** `supabase/08_In-App Notifications/1_create_table.sql`

#### جدول `notifications`

| العمود       | النوع       | الوصف                                 |
| ------------ | ----------- | ------------------------------------- |
| `id`         | UUID        | المعرف الفريد للإشعار                 |
| `user_id`    | UUID        | معرف المستخدم (من auth.users)         |
| `title`      | TEXT        | عنوان الإشعار                         |
| `message`    | TEXT        | نص الإشعار                            |
| `type`       | TEXT        | نوع الإشعار: `info`, `order`, `promo` |
| `is_read`    | BOOLEAN     | حالة القراءة (مقروء/غير مقروء)        |
| `link`       | TEXT        | رابط اختياري عند النقر                |
| `created_at` | TIMESTAMPTZ | وقت الإنشاء                           |
| `updated_at` | TIMESTAMPTZ | وقت آخر تحديث                         |

#### الفهارس (Indexes)

```sql
notifications_user_id_idx      -- البحث حسب المستخدم
notifications_created_at_idx   -- الترتيب حسب التاريخ
notifications_is_read_idx      -- التصفية حسب حالة القراءة
notifications_type_idx         -- التصفية حسب النوع
```

#### سياسات الأمان (RLS Policies)

- ✅ **notifications_read_own**: قراءة إشعاراتك فقط
- ✅ **notifications_update_own**: تحديث إشعاراتك فقط (تحديد كمقروء)
- ✅ **notifications_insert_own**: إنشاء إشعارات لك فقط

---

### 2️⃣ Server Actions (Backend)

**المسار:** `lib/actions/notifications/notifications.ts`

#### الدوال المتاحة:

```typescript
// جلب آخر 20 إشعار للمستخدم
async function getNotifications(): Promise<Notification[]>

// تحديد إشعار واحد كمقروء
async function markNotificationAsRead(id: string): Promise<void>

// تحديد كل الإشعارات كمقروءة
async function markAllAsRead(): Promise<void>
```

---

### 3️⃣ مكونات الواجهة (Frontend Components)

**المسار:** `components/notifications/`

#### 📁 هيكل المجلد:

```
components/notifications/
├── README.md                   # 📖 التوثيق العربي الشامل
├── index.ts                    # 📦 تصدير جميع المكونات
├── types.ts                    # 🔷 تعريفات TypeScript
├── NotificationBell.tsx        # 🔔 المكون الرئيسي (Client)
├── NotificationBellServer.tsx  # 🖥️ غلاف Server Component
├── NotificationIcon.tsx        # 🛎️ أيقونة الجرس مع العداد
├── NotificationItem.tsx        # 📄 عنصر إشعار فردي
└── NotificationList.tsx        # 📋 قائمة الإشعارات

hooks/
└── useNotifications.ts         # ⚡ Custom Hook للإشعارات
```

#### 🔷 تعريف النوع (Type Definition):

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

## 🔄 آلية العمل

### 1. تدفق البيانات (Data Flow)

```
┌─────────────────────────────────────────────────────────────┐
│                    Server Component                          │
│  (NotificationBellServer.tsx)                                │
│  ┌──────────────────────────────────────────────────────┐   │
│  │ 1. جلب الإشعارات من Supabase                         │   │
│  │ 2. تمريرها كـ props لـ NotificationBell              │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                    Client Component                          │
│  (NotificationBell.tsx)                                      │
│  ┌──────────────────────────────────────────────────────┐   │
│  │ 1. استقبال الإشعارات الأولية                         │   │
│  │ 2. الاشتراك في Realtime Channel                      │   │
│  │ 3. تحديث الواجهة عند وصول إشعار جديد                │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

### 2. الاشتراك في Realtime

```typescript
useEffect(() => {
  const channel = supabase
    .channel("notifications-channel")
    .on(
      "postgres_changes",
      {
        event: "INSERT",
        schema: "public",
        table: "notifications",
      },
      (payload) => {
        const newNotification = payload.new as Notification
        setNotifications((prev) => [newNotification, ...prev])
      }
    )
    .subscribe()

  return () => {
    supabase.removeChannel(channel)
  }
}, [supabase])
```

### 3. تحديث حالة القراءة

```typescript
const handleMarkAsRead = async (id: string) => {
  // 1. استدعاء Server Action
  await markNotificationAsRead(id)

  // 2. تحديث الواجهة فوراً (Optimistic Update)
  setNotifications((prev) =>
    prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
  )
}
```

---

## 🚀 طريقة الاستخدام

### الطريقة 1: استخدام Server Component (موصى به - للأداء الأفضل)

```tsx
// app/layout.tsx أو أي Server Component
import { NotificationBellServer } from "@/components/notifications"

export default function Header() {
  return (
    <header>
      {/* مكونات أخرى */}
      <NotificationBellServer />
    </header>
  )
}
```

---

### الطريقة 2: استخدام Client Component مباشرة (بدون بيانات أولية)

```tsx
"use client"

import { NotificationBell } from "@/components/notifications"

export default function Header() {
  return (
    <header>
      <NotificationBell />
    </header>
  )
}
```

**ملاحظة:** المكون سيجلب الإشعارات تلقائياً باستخدام `useNotifications` hook

---

### الطريقة 3: استخدام Client Component مع بيانات أولية

```tsx
"use client"

import { NotificationBell } from "@/components/notifications"
import type { Notification } from "@/components/notifications"

export default function Header() {
  const initialNotifications: Notification[] = [
    // بيانات الإشعارات من Server Component
  ]

  return <NotificationBell initialNotifications={initialNotifications} />
}
```

---

### الطريقة 4: استخدام Hook مخصص (للتحكم الكامل)

```tsx
"use client"

import { useNotifications } from "@/components/notifications"

export default function CustomNotificationUI() {
  const {
    notifications,
    loading,
    unreadCount,
    markAsRead,
    markAllAsRead,
  } = useNotifications()

  if (loading) return <div>جاري التحميل...</div>

  return (
    <div>
      <span>الإشعارات: {unreadCount}</span>
      {notifications.map((notif) => (
        <div key={notif.id} onClick={() => markAsRead(notif.id)}>
          <h4>{notif.title}</h4>
          <p>{notif.message}</p>
        </div>
      ))}
    </div>
  )
}
```

---

### الطريقة 5: استخدام المكونات بشكل منفصل

```tsx
"use client"

import { NotificationIcon, NotificationList } from "@/components/notifications"
import { useNotifications } from "@/hooks/useNotifications"

export default function CustomNotificationUI() {
  const [isOpen, setIsOpen] = useState(false)
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications()

  return (
    <div>
      <NotificationIcon
        unreadCount={unreadCount}
        onClick={() => setIsOpen(!isOpen)}
      />
      {isOpen && (
        <NotificationList
          notifications={notifications}
          onMarkAsRead={markAsRead}
          onMarkAllAsRead={markAllAsRead}
        />
      )}
    </div>
  )
}
```

---

## 📡 إنشاء وإرسال الإشعارات

### الطريقة 1: مباشرة في Supabase Dashboard

```sql
INSERT INTO public.notifications (user_id, title, message, type)
VALUES
  ('uuid-here', 'عنوان الإشعار', 'نص الإشعار', 'info');
```

### الطريقة 2: عبر Edge Function

```typescript
// supabase/functions/send-notification/index.ts
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

serve(async (req) => {
  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  )

  const { user_id, title, message, type } = await req.json()

  await supabase.from("notifications").insert({
    user_id,
    title,
    message,
    type,
  })

  return new Response(JSON.stringify({ success: true }))
})
```

### الطريقة 3: عبر Database Trigger

```sql
-- مثال: إنشاء إشعار تلقائي عند طلب جديد
CREATE OR REPLACE FUNCTION create_order_notification()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.notifications (user_id, title, message, type)
  VALUES (
    NEW.user_id,
    'طلب جديد',
    'تم استلام طلبك بنجاح رقم: ' || NEW.id,
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

## 🎨 التخصيص والتصميم

### تعديل الألوان

```tsx
// NotificationIcon.tsx - تغيير لون العداد
<span className="bg-red-600" />  // أحمر
<span className="bg-blue-600" />  // أزرق
<span className="bg-green-600" /> // أخضر
```

### تعديل الصوت (اختياري)

```typescript
// NotificationBell.tsx
const newNotification = payload.new as Notification
setNotifications((prev) => [newNotification, ...prev])

// تشغيل صوت إشعار
new Audio('/notification-sound.mp3').play().catch(() => {})
```

### تعديل عدد الإشعارات المعروضة

```typescript
// lib/actions/notifications/notifications.ts
.limit(20)  // تغيير الرقم حسب الحاجة
```

---

## 🔐 الأمان والصلاحيات

### سياسات RLS المفصلة:

```sql
-- 1. قراءة الإشعارات الخاصة بالمستخدم فقط
CREATE POLICY "notifications_read_own"
  ON public.notifications FOR SELECT TO authenticated
  USING (user_id = auth.uid());

-- 2. تحديث الإشعارات (تحديد كمقروء)
CREATE POLICY "notifications_update_own"
  ON public.notifications FOR UPDATE TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- 3. إنشاء إشعارات (للاختبار أو عبر Triggers)
CREATE POLICY "notifications_insert_own"
  ON public.notifications FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());
```

### ⚠️ ملاحظات أمنية مهمة:

1. **لا تسمح** للمستخدمين العاديين بإنشاء إشعارات لأنفسهم في الإنتاج
2. استخدم **Service Role Key** فقط في Edge Functions
3. أنشئ الإشعارات عبر **Triggers** أو **Functions** موثوقة
4. فعّل **RLS** دائماً على جدول الإشعارات

---

## 🧪 الاختبار

### 1. اختبار الإدراج اليدوي:

```sql
-- استبدل uuid-here بمعرف المستخدم الحقيقي
INSERT INTO public.notifications (user_id, title, message, type)
VALUES
  ('uuid-here', 'إشعار تجريبي', 'هذا إشعار اختباري', 'info');
```

### 2. اختبار الواجهة:

1. سجل الدخول كمستخدم
2. انقر على أيقونة الجرس
3. تحقق من ظهور الإشعارات
4. انقر على إشعار لتحديده كمقروء
5. تحقق من اختفاء النقطة الزرقاء

### 3. اختبار Realtime:

1. افتح صفحتين في متصفحين مختلفين
2. في صفحة Admin، أنشئ إشعاراً جديداً
3. راقب الصفحة الأخرى - يجب أن يظهر الإشعار فوراً

---

## 🐛 استكشاف الأخطاء

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

1. تأكد من تفعيل **Replication** في Supabase Dashboard
2. تحقق من اسم القناة: `notifications-channel`
3. تأكد من صحة `schema` و `table`

### المشكلة: خطأ في الصلاحيات

**الحل:**

```sql
-- أعد إنشاء السياسات
DROP POLICY IF EXISTS "notifications_read_own" ON public.notifications;
-- ثم أعد إنشاءها من ملف SQL
```

---

## 📊 الإحصائيات والأداء

### الاستعلامات المحسّنة:

```sql
-- جلب الإشعارات غير المقروءة فقط
SELECT * FROM notifications
WHERE user_id = 'uuid' AND is_read = FALSE;

-- عد الإشعارات غير المقروءة
SELECT COUNT(*) FROM notifications
WHERE user_id = 'uuid' AND is_read = FALSE;
```

### الفهارس النشطة:

- ✅ `notifications_user_id_idx` - بحث سريع حسب المستخدم
- ✅ `notifications_created_at_idx` - ترتيب زمني فعال
- ✅ `notifications_is_read_idx` - تصفية سريعة للحالة
- ✅ `notifications_type_idx` - تصفية حسب النوع

---

## 📝 قائمة المهام (TODO)

- [ ] إضافة دعم الروابط في الإشعارات
- [ ] إضافة أنواع إشعارات مخصصة (order, promo, system)
- [ ] إضافة صوت إشعار مخصص
- [ ] إضافة خيار كتم الإشعارات
- [ ] إضافة إشعارات Push للمتصفح
- [ ] إضافة أرشيف للإشعارات القديمة
- [ ] إضافة إحصائيات للإشعارات المقروءة

---

## 💡 أمثلة عملية

### مثال 1: استخدام في صفحة رئيسية

```tsx
// app/dashboard/page.tsx
"use client"

import { NotificationBell } from "@/components/notifications"

export default function DashboardPage() {
  return (
    <div>
      <header>
        <NotificationBell />
      </header>
      <main>
        <h1>لوحة التحكم</h1>
      </main>
    </div>
  )
}
```

### مثال 2: استخدام مع تخصيص UI

```tsx
// components/custom-header.tsx
"use client"

import { useNotifications } from "@/components/notifications"

export function CustomHeader() {
  const { notifications, unreadCount, loading } = useNotifications()

  return (
    <header className="flex items-center justify-between p-4">
      <h1>متجرنا</h1>
      <div className="flex items-center gap-4">
        <span className="text-sm text-gray-600">
          {loading ? "..." : `${unreadCount} إشعارات جديدة`}
        </span>
      </div>
    </header>
  )
}
```

### مثال 3: استخدام في Layout عام

```tsx
// app/layout.tsx
import { NotificationBellServer } from "@/components/notifications"

export default function RootLayout({ children }) {
  return (
    <html lang="ar" dir="rtl">
      <body>
        <nav className="flex justify-between p-4">
          <div>الشعار</div>
          <NotificationBellServer />
        </nav>
        {children}
      </body>
    </html>
  )
}
```

---

## 📚 المراجع

- [Supabase Realtime Documentation](https://supabase.com/docs/guides/realtime)
- [Next.js Server Components](https://nextjs.org/docs/app/building-your-application/rendering/server-components)
- [Supabase Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)

---

## 👨‍💻 فريق التطوير

تم التطوير بواسطة: **Marketna E-Commerce Team**  
الإصدار: **1.0.0**  
التاريخ: **24 مارس 2026**

---

**⚠️ ملاحظة:** هذا النظام جاهز للإنتاج وي遵循 أفضل الممارسات في الأمان والأداء.
