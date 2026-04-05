# 🔔 مكون جرس الإشعارات - Notification Bell

## 📋 نظرة عامة

مكون React متكامل لعرض وإدارة الإشعارات الفورية في التطبيق.

---

## 📁 البنية

```
components/notifications/
├── notification-bell.tsx      ← المكون الرئيسي (الزر + Popover)
├── notification-item.tsx      ← مكون عنصر الإشعار الفردي
└── index.ts                   ← تصدير مركزي
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
┌─────────────────────────────────────┐
│  الإشعارات (3)  [✓ تحديد الكل] [🗑️] │
├─────────────────────────────────────┤
│  [اليوم (2)] [هذا الأسبوع] [السابق] │
├─────────────────────────────────────┤
│  🔵 إشعار 1                         │
│  🔵 إشعار 2                         │
│  ⚪ إشعار 3 (مقروء)                 │
└─────────────────────────────────────┘
```

### 3. عنصر الإشعار
```
┌─────────────────────────────────────┐
│  🛒   عنوان الإشعار        منذ ساعة  │
│       وصف الإشعار هنا...             │
│                              🔵      │
└─────────────────────────────────────┘
```

---

## 🔧 الاستخدام

### أساسي
```tsx
import { NotificationBell } from "@/components/notifications";

<NotificationBell userId={user.id} />
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

| الوظيفة | الوصف |
|---------|-------|
| **Realtime** | يستمع للإشعارات الجديدة عبر Supabase Realtime |
| **تحديد كمقروء** | نقر على الإشعار → `mark_notification_read` |
| **تحديد الكل** | زر `mark_all_notifications_read` |
| **حذف المقروءة** | حذف الإشعارات المقروءة فقط |
| **تبويبات زمنية** | اليوم / هذا الأسبوع / السابق |
| **عداد ديناميكي** | يتحدث تلقائياً عند وصول إشعار جديد |

---

## 🎨 ألوان الأيقونات حسب النوع

| النوع | الأيقونة | اللون |
|------|---------|-------|
| `order_event` | 🛒 ShoppingCart | أزرق |
| `system_alert` | ⚠️ AlertTriangle | أصفر غامق |
| `promo` | 🏷️ Tag | أخضر |
| `review` | ⭐ Star | أصفر |
| `ticket` | 💬 MessageSquare | بنفسجي |

---

## 📊 التبويبات الزمنية

| التبويب | الفترة | مثال |
|---------|--------|------|
| **اليوم** | من بداية اليوم | منذ 30 دقيقة |
| **هذا الأسبوع** | آخر 7 أيام | منذ 3 أيام |
| **السابق** | أقدم من 7 أيام | منذ أسبوعين |

---

## 🔌 Props

| الخاصية | النوع | مطلوب | الوصف |
|---------|-------|-------|-------|
| `userId` | `string` | ✅ | معرّف المستخدم |

---

## 🔄 Realtime

```tsx
// داخل notification-bell.tsx
const channel = supabase
  .channel("notifications")
  .on("postgres_changes", {
    event: "INSERT",
    schema: "public",
    table: "sys_notification",
    filter: `recipient_id=eq.${userId}`,
  }, (payload) => {
    // إشعار جديد!
    setNotifications(prev => [payload.new, ...prev]);
    setUnreadCount(prev => prev + 1);
  })
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
<PopoverContent className="w-[500px] p-0">
```

### تغيير عدد الإشعارات المعروضة
```tsx
// في notification-bell.tsx
const { data } = await supabase.rpc("get_user_notifications", {
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

## 📝 ملاحظات

1. **الأداء**: يتم تحميل الإشعارات عند فتح Popover فقط
2. **التحديث**: Realtime يعمل تلقائياً
3. **اللغة**: يدعم العربية بالكامل مع `date-fns/locale/ar`
4. **الوضع الداكن**: متوافق بالكامل مع `dark:` classes
