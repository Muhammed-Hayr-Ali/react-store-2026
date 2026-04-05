# 🔔 مكون جرس الإشعارات - Notification Bell

## 📋 نظرة عامة

مكون React متكامل لعرض وإدارة الإشعارات الفورية في التطبيق.

---

## 📁 البنية

```
components/notifications/
├── notification-bell.tsx      ← المكون الرئيسي (الزر + Popover + Dropdown)
├── notification-item.tsx      ← مكون عنصر الإشعار الفردي
├── index.ts                   ← تصدير مركزي
└── README.md                  ← هذا الملف
```

---

## 🎨 التصميم

### 1. زر الجرس

- **المظهر**: زر شفاف (`variant="ghost"`)
- **الأيقونة**: `Bell` من lucide-react
- **العداد**: فقاعة حمراء أعلى الزر
  - `0` → مخفية
  - `1-9` → الرقم
  - `10+` → `9+`

### 2. نافذة Popover

```
┌──────────────────────────────┐
│  الإشعارات (3)         [ ⋮ ]│
├──────────────────────────────┤
│ [اليوم(2)][هذا الأسبوع][سابق] │  ← تصميم shadcn افتراضي
├──────────────────────────────┤
│  🔵 إشعار 1                  │
│  🔵 إشعار 2                  │
│  ⚪ إشعار 3 (مقروء)          │
└──────────────────────────────┘
```

### 3. القائمة المنسدلة (Dropdown Menu)

```
┌─────────────────────┐
│ ✓ جعل الكل مقروء    │
│ 🗑️ حذف المقروء      │
├─────────────────────┤
│ 🗑️ حذف الكل         │  ← أحمر
└─────────────────────┘
```

### 4. عنصر الإشعار

```
┌──────────────────────────────┐
│  🛒   عنوان الإشعار   منذ ساعة │
│       وصف الإشعار هنا...      │
│                          🔵   │  ← نقطة غير مقروء
└──────────────────────────────┘
```

---

## 🔧 الاستخدام

### أساسي

```tsx
import { NotificationBell } from "@/components/notifications";

<NotificationBell userId={user.id} />;
```

### في شريط التنقل

```tsx
<header className="flex items-center gap-4">
  <ThemeToggle />
  <NotificationBell userId={user.id} />
  <UserAvatar />
</header>
```

---

## 🎯 الوظائف

| الوظيفة               | الوصف                    | الطريقة                           |
| --------------------- | ------------------------ | --------------------------------- |
| **Realtime**          | يستمع للإشعارات الجديدة  | `supabase.channel()`              |
| **تحديد كمقروء**      | نقر على الإشعار          | حذف مباشر من الجدول               |
| **جعل الكل مقروء**    | القائمة المنسدلة         | `mark_all_notifications_read` RPC |
| **حذف المقروء**       | القائمة المنسدلة         | حذف متوازي بـ `Promise.all`       |
| **حذف الكل**          | القائمة المنسدلة (أحمر)  | حذف متوازي لكل الإشعارات          |
| **تبويبات زمنية**     | اليوم / الأسبوع / السابق | تصنيف تلقائي                      |
| **العداد الديناميكي** | يتحدث تلقائياً           | Realtime + fetch                  |
| **التنقل عند النقر**  | يفتح `action_url`        | `router.push()`                   |

---

## 🎨 ألوان الأيقونات حسب النوع

| النوع          | الأيقونة         | اللون     |
| -------------- | ---------------- | --------- |
| `order_event`  | 🛒 ShoppingCart  | أزرق      |
| `system_alert` | ⚠️ AlertTriangle | أصفر غامق |
| `promo`        | 🏷️ Tag           | أخضر      |
| `review`       | ⭐ Star          | أصفر      |
| `ticket`       | 💬 MessageSquare | بنفسجي    |

---

## 📊 التبويبات الزمنية

| التبويب         | الفترة         | مثال         |
| --------------- | -------------- | ------------ |
| **اليوم**       | من منتصف الليل | منذ 30 دقيقة |
| **هذا الأسبوع** | آخر 7 أيام     | منذ 3 أيام   |
| **السابق**      | أقدم من 7 أيام | منذ أسبوعين  |

---

## 🔌 Props

| الخاصية  | النوع    | مطلوب | الوصف          |
| -------- | -------- | ----- | -------------- |
| `userId` | `string` | ✅    | معرّف المستخدم |

---

## 🔄 Realtime

```tsx
// داخل notification-bell.tsx
const channel = supabase
  .channel("notifications")
  .on(
    "postgres_changes",
    {
      event: "INSERT",
      schema: "public",
      table: "sys_notification",
      filter: `recipient_id=eq.${userId}`,
    },
    (payload: { new: Record<string, unknown> }) => {
      // إشعار جديد!
      setNotifications((prev) => [newNotification, ...prev]);
      setUnreadCount((prev) => prev + 1);
    },
  )
  .subscribe();
```

---

## ♿ إمكانية الوصول

- ✅ أزرار قابلة للوصول بلوحة المفاتيح
- ✅ `aria-label` على الأزرار
- ✅ ألوان متباينة للقراءة
- ✅ دعم RTL كامل

---

## 🛠️ التخصيص

### تغيير حجم Popover

```tsx
<PopoverContent className="w-125 p-0">
```

### تغيير عدد الإشعارات المعروضة

```tsx
// في fetchNotifications
const { data } = await rpc("get_user_notifications", {
  p_page: 1,
  p_limit: 100, // ← تغيير العدد
});
```

### إضافة نوع إشعار جديد

```tsx
// في notification-item.tsx
const notificationConfig = {
  // ...
  custom_type: {
    icon: CustomIcon,
    color: "text-custom-600",
    bgColor: "bg-custom-100 dark:bg-custom-900/30",
  },
};
```

---

## 🔐 الأمان

| البند             | الطريقة                                        |
| ----------------- | ---------------------------------------------- |
| **عرض الإشعارات** | RLS Policy: `recipient_id = auth.uid()`        |
| **حذف الإشعارات** | حذف مباشر من الجدول + RLS Policy               |
| **RPC محمية**     | `mark_all_notifications_read` requires user_id |

---

## ⚡ الأداء

| البند                      | التحسين                               |
| -------------------------- | ------------------------------------- |
| **جلب البيانات**           | `Promise.all` للإشعارات + العدد معاً  |
| **حذف متعدد**              | `Promise.all` متوازي بدلاً من متتالي  |
| **Realtime**               | اشتراك واحد مع deduplication          |
| **تصنيف الإشعارات**        | `useMemo` خارج effect                 |
| **تجنب cascading renders** | `handleOpenChange` بدلاً من useEffect |
| **إدارة الحالة**           | `useMemo` لـ `supabase` و `rpc`       |

---

## 📝 ملاحظات

1. **الحذف**: يستخدم حذف مباشر من `sys_notification` بدلاً من RPC لتجنب مشاكل النشر
2. **التصنيف الزمني**: يعتمد على وقت المتصفح المحلي
3. **Realtime**: يتجنب التكرار بفحص `id` قبل الإضافة
4. **اللغة**: يدعم العربية بالكامل مع `date-fns/locale/ar`
5. **الوضع الداكن**: متوافق بالكامل مع `dark:` classes
