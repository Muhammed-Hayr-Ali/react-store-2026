# 🔔 نظام الإشعارات الفورية - Real-Time Notifications

## 📋 نظرة عامة

نظام إشعارات متكامل يعتمد على **Supabase Realtime** لإرسال إشعارات فورية عند حدوث أحداث مهمة في التطبيق.

---

## 📁 ترتيب التنفيذ

```
1. ✅ 001_notifications_functions.sql  ← الدوال والإجراءات
2. ✅ 002_notifications_rls.sql        ← سياسات الأمان
3. ✅ 003_notifications_triggers.sql   ← المشغلات التلقائية
```

---

## 🔧 الدوال المتاحة

### 1. `create_notification` - إنشاء إشعار
```sql
SELECT create_notification(
  p_recipient_id := 'user-uuid',
  p_type := 'order_event',
  p_title_ar := 'تم تأكيد طلبك',
  p_title_en := 'Your order confirmed',
  p_content_ar := 'محتوى عربي',
  p_content_en := 'English content',
  p_action_url := '/dashboard/orders/123',
  p_data := '{"order_id": "123"}'::jsonb
);
```

### 2. `create_bulk_notifications` - إشعارات جماعية
```sql
SELECT create_bulk_notifications(
  p_recipient_ids := ARRAY['uuid1', 'uuid2'],
  p_type := 'promo',
  p_title_ar := 'عرض خاص!',
  p_content_ar := 'خصم 50% على جميع المنتجات'
);
```

### 3. `get_user_notifications` - جلب الإشعارات
```sql
SELECT * FROM get_user_notifications(
  p_user_id := 'user-uuid',
  p_page := 1,
  p_limit := 20,
  p_unread_only := false
);
```

### 4. `get_unread_count` - عدد غير المقروءة
```sql
SELECT get_unread_count('user-uuid');
```

### 5. `mark_notification_read` - تحديد كمقروء
```sql
SELECT mark_notification_read('notification-uuid', 'user-uuid');
```

### 6. `mark_all_notifications_read` - تحديد الكل كمقروء
```sql
SELECT mark_all_notifications_read('user-uuid');
```

### 7. `delete_notification` - حذف إشعار
```sql
SELECT delete_notification('notification-uuid', 'user-uuid');
```

### 8. `cleanup_old_notifications` - تنظيف الإشعارات القديمة
```sql
SELECT cleanup_old_notifications(
  p_days_old := 90,
  p_batch_size := 1000
);
```

---

## 🔔 الإشعارات التلقائية (Triggers)

| الحدث | الجدول | الإشعار |
|------|--------|---------|
| تغيير حالة الطلب | `trade_order` | للعميل |
| إنشاء تذكرة | `support_ticket` | للمشرف |
| رد على تذكرة | `ticket_message` | للطرف الآخر |
| إضافة تقييم | `social_review` | للبائع |
| تعيين سائق | `fleet_delivery` | للعميل |

---

## 🌐 Realtime Subscription

### في التطبيق (Client-Side)

```ts
import { createClient } from "@/lib/database/supabase/client";

const supabase = createClient();

// الاشتراك في إشعارات المستخدم
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
    (payload) => {
      console.log("إشعار جديد:", payload.new);
      // عرض إشعار toast
      toast.info(payload.new.title_ar);
    }
  )
  .subscribe();
```

---

## 🔒 الأمان

| السياسة | الوصف |
|---------|-------|
| `Users can view their own notifications` | المستخدم يرى فقط إشعاراته |
| `Users can update their own notifications` | المستخدم يحدّث إشعاراته فقط |
| `Users can delete their own notifications` | المستخدم يحذف إشعاراته فقط |
| `Admins can view all notifications` | المدير يرى كل الإشعارات |

---

## 📊 أنواع الإشعارات

| النوع | الوصف | مثال |
|------|-------|------|
| `order_event` | أحداث الطلبات | تأكيد، شحن، تسليم |
| `system_alert` | تنبيهات النظام | صيانة، تحديثات |
| `promo` | العروض والتخفيضات | خصم 50% |
| `review` | التقييمات | تقييم جديد على منتجك |
| `ticket` | تذاكر الدعم | رد على تذكرة |

---

## 🚀 الاستخدام في التطبيق

### Server Action - إنشاء إشعار
```ts
"use server";
import { createClient } from "@/lib/database/supabase/server";

export async function sendNotification(input: {
  userId: string;
  titleAr: string;
  contentAr: string;
}) {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("create_notification", {
    p_recipient_id: input.userId,
    p_type: "system_alert",
    p_title_ar: input.titleAr,
    p_content_ar: input.contentAr,
  });
}
```

### Client - الاستماع للإشعارات
```tsx
"use client";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/database/supabase/client";
import { toast } from "sonner";

export function useNotifications() {
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const supabase = createClient();

    const channel = supabase
      .channel("notifications")
      .on("postgres_changes", {
        event: "INSERT",
        schema: "public",
        table: "sys_notification",
        filter: `recipient_id=eq.${userId}`,
      }, (payload) => {
        toast.info(payload.new.title_ar);
        setUnreadCount(prev => prev + 1);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return { unreadCount };
}
```

---

## 🗑️ الصيانة

يتم تشغيل `cleanup_old_notifications` يومياً عبر Cron Job:

```sql
-- حذف الإشعارات المقروءة الأقدم من 90 يوم
SELECT cleanup_old_notifications(90, 5000);
```

---

## ✅ ملخص

| البند | الحالة |
|------|--------|
| دوال إنشاء الإشعارات | ✅ |
| دوال إدارة الإشعارات | ✅ |
| Realtime Subscription | ✅ |
| RLS Policies | ✅ |
| Triggers تلقائية | ✅ |
| إشعارات الطلبات | ✅ |
| إشعارات الدعم | ✅ |
| إشعارات التقييمات | ✅ |
| إشعارات التوصيل | ✅ |
| إشعارات جماعية | ✅ |
