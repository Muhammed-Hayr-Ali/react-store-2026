-- =====================================================
-- 🔔 نظام الإشعارات الفورية - Real-Time Notifications
-- =====================================================
-- 📋 هذا الملف يحتوي على:
--    1. دوال إنشاء الإشعارات
--    2. دوال إدارة الإشعارات (قراءة، تحديد كمقروء، حذف)
--    3. دالة جلب الإشعارات غير المقروءة
--    4. Realtime Channels
--    5. RLS Policies
--    6. Triggers للإشعارات التلقائية
-- =====================================================
-- 📝 ترتيب الملفات:
--    1. ✅ 001_notifications_functions.sql  ← هذا الملف
--    2. ✅ 002_notifications_rls.sql         ← سياسات الأمان
--    3. ✅ 003_notifications_triggers.sql    ← المشغلات التلقائية
-- =====================================================

-- =====================================================
-- 1️⃣ دالة إنشاء إشعار جديد
-- =====================================================

CREATE OR REPLACE FUNCTION create_notification(
  p_recipient_id uuid,
  p_type notify_type,
  p_title_ar text,
  p_title_en text DEFAULT NULL,
  p_content_ar text DEFAULT '',
  p_content_en text DEFAULT NULL,
  p_action_url text DEFAULT NULL,
  p_data jsonb DEFAULT '{}'
) RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_notification_id uuid;
BEGIN
  INSERT INTO sys_notification (
    recipient_id,
    type,
    title_ar,
    title_en,
    content_ar,
    content_en,
    action_url,
    data
  ) VALUES (
    p_recipient_id,
    p_type,
    p_title_ar,
    p_title_en,
    p_content_ar,
    p_content_en,
    p_action_url,
    p_data
  ) RETURNING id INTO v_notification_id;

  RETURN v_notification_id;
END;
$$;

-- =====================================================
-- 2️⃣ دالة إنشاء إشعارات متعددة (للمديرين)
-- =====================================================

CREATE OR REPLACE FUNCTION create_bulk_notifications(
  p_recipient_ids uuid[],
  p_type notify_type,
  p_title_ar text,
  p_title_en text DEFAULT NULL,
  p_content_ar text DEFAULT '',
  p_content_en text DEFAULT NULL,
  p_action_url text DEFAULT NULL,
  p_data jsonb DEFAULT '{}'
) RETURNS int
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_count int;
BEGIN
  INSERT INTO sys_notification (
    recipient_id,
    type,
    title_ar,
    title_en,
    content_ar,
    content_en,
    action_url,
    data
  )
  SELECT
    unnest(p_recipient_ids),
    p_type,
    p_title_ar,
    p_title_en,
    p_content_ar,
    p_content_en,
    p_action_url,
    p_data;

  GET DIAGNOSTICS v_count = ROW_COUNT;
  RETURN v_count;
END;
$$;

-- =====================================================
-- 3️⃣ دالة جلب إشعارات المستخدم (مع Pagination)
-- =====================================================

CREATE OR REPLACE FUNCTION get_user_notifications(
  p_user_id uuid,
  p_page int DEFAULT 1,
  p_limit int DEFAULT 20,
  p_unread_only boolean DEFAULT false
) RETURNS TABLE (
  id uuid,
  type notify_type,
  title_ar text,
  title_en text,
  content_ar text,
  content_en text,
  action_url text,
  data jsonb,
  is_read boolean,
  created_at timestamptz
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT
    n.id,
    n.type,
    n.title_ar,
    n.title_en,
    n.content_ar,
    n.content_en,
    n.action_url,
    n.data,
    n.is_read,
    n.created_at
  FROM sys_notification n
  WHERE n.recipient_id = p_user_id
    AND (p_unread_only = false OR n.is_read = false)
  ORDER BY n.created_at DESC
  LIMIT p_limit
  OFFSET (p_page - 1) * p_limit;
END;
$$;

-- =====================================================
-- 4️⃣ دالة عدد الإشعارات غير المقروءة
-- =====================================================

CREATE OR REPLACE FUNCTION get_unread_count(
  p_user_id uuid
) RETURNS bigint
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COUNT(*)::bigint
  FROM sys_notification
  WHERE recipient_id = p_user_id
    AND is_read = false;
$$;

-- =====================================================
-- 5️⃣ دالة تحديد إشعار كمقروء
-- =====================================================

CREATE OR REPLACE FUNCTION mark_notification_read(
  p_notification_id uuid,
  p_user_id uuid
) RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_updated boolean;
BEGIN
  UPDATE sys_notification
  SET is_read = true,
      updated_at = now()
  WHERE id = p_notification_id
    AND recipient_id = p_user_id
    AND is_read = false;

  GET DIAGNOSTICS v_updated = ROW_COUNT;
  RETURN v_updated > 0;
END;
$$;

-- =====================================================
-- 6️⃣ دالة تحديد كل الإشعارات كمقروءة
-- =====================================================

CREATE OR REPLACE FUNCTION mark_all_notifications_read(
  p_user_id uuid
) RETURNS int
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_count int;
BEGIN
  UPDATE sys_notification
  SET is_read = true,
      updated_at = now()
  WHERE recipient_id = p_user_id
    AND is_read = false;

  GET DIAGNOSTICS v_count = ROW_COUNT;
  RETURN v_count;
END;
$$;

-- =====================================================
-- 7️⃣ دالة حذف إشعار
-- =====================================================

CREATE OR REPLACE FUNCTION delete_notification(
  p_notification_id uuid,
  p_user_id uuid
) RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_deleted boolean;
BEGIN
  DELETE FROM sys_notification
  WHERE id = p_notification_id
    AND recipient_id = p_user_id;

  GET DIAGNOSTICS v_deleted = ROW_COUNT;
  RETURN v_deleted > 0;
END;
$$;

-- =====================================================
-- 8️⃣ دالة حذف الإشعارات القديمة (تنظيف)
-- ⚠️ متاحة للمشرفين فقط (admin role)
-- =====================================================

CREATE OR REPLACE FUNCTION cleanup_old_notifications(
  p_days_old int DEFAULT 90,
  p_batch_size int DEFAULT 1000
) RETURNS int
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_count int;
  v_cutoff timestamptz;
BEGIN
  -- التحقق من صلاحية المدير
  IF NOT EXISTS (
    SELECT 1
    FROM core_profile_role pr
    JOIN core_role r ON r.id = pr.role_id
    WHERE pr.profile_id = auth.uid()
      AND r.code = 'admin'
  ) THEN
    RAISE EXCEPTION 'Permission denied: admin role required';
  END IF;

  v_cutoff := now() - (p_days_old || ' days')::interval;

  DELETE FROM sys_notification
  WHERE id IN (
    SELECT id
    FROM sys_notification
    WHERE created_at < v_cutoff
      AND is_read = true
    LIMIT p_batch_size
  );

  GET DIAGNOSTICS v_count = ROW_COUNT;
  RETURN v_count;
END;
$$;

-- =====================================================
-- 9️⃣ دالة جلب الإشعارات الجديدة (لـ Realtime)
-- =====================================================

CREATE OR REPLACE FUNCTION get_new_notifications_since(
  p_user_id uuid,
  p_since timestamptz
) RETURNS TABLE (
  id uuid,
  type notify_type,
  title_ar text,
  title_en text,
  content_ar text,
  content_en text,
  action_url text,
  data jsonb,
  is_read boolean,
  created_at timestamptz
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    n.id,
    n.type,
    n.title_ar,
    n.title_en,
    n.content_ar,
    n.content_en,
    n.action_url,
    n.data,
    n.is_read,
    n.created_at
  FROM sys_notification n
  WHERE n.recipient_id = p_user_id
    AND n.created_at > p_since
  ORDER BY n.created_at DESC;
$$;

-- =====================================================
-- 🔟 دالة إنشاء إشعار عند طلب جديد
-- =====================================================

CREATE OR REPLACE FUNCTION notify_new_order(
  p_customer_id uuid,
  p_order_id uuid,
  p_order_number text
) RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- إشعار للعميل
  PERFORM create_notification(
    p_recipient_id := p_customer_id,
    p_type := 'order_event',
    p_title_ar := 'تم تأكيد طلبك',
    p_title_en := 'Your order has been confirmed',
    p_content_ar := 'تم استلام طلبك رقم ' || p_order_number || ' بنجاح',
    p_content_en := 'Your order ' || p_order_number || ' has been received successfully',
    p_action_url := '/dashboard/orders/' || p_order_id,
    p_data := jsonb_build_object('order_id', p_order_id, 'order_number', p_order_number)
  );
END;
$$;

-- =====================================================
-- 1️⃣1️⃣ دالة إنشاء إشعار عند رسالة دعم جديدة
-- =====================================================

CREATE OR REPLACE FUNCTION notify_new_ticket_message(
  p_ticket_id uuid,
  p_reporter_id uuid,
  p_assigned_to uuid,
  p_sender_id uuid,
  p_ticket_number text
) RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_recipient_id uuid;
BEGIN
  -- إذا كان المرسل هو العميل، أرسل للمشرف
  IF p_sender_id = p_reporter_id AND p_assigned_to IS NOT NULL THEN
    v_recipient_id := p_assigned_to;
  -- إذا كان المرسل هو المشرف، أرسل للعميل
  ELSIF p_sender_id = p_assigned_to THEN
    v_recipient_id := p_reporter_id;
  ELSE
    RETURN;
  END IF;

  PERFORM create_notification(
    p_recipient_id := v_recipient_id,
    p_type := 'ticket',
    p_title_ar := 'رسالة جديدة في التذكرة',
    p_title_en := 'New message in ticket',
    p_content_ar := 'تم إرسال رسالة جديدة في التذكرة رقم ' || p_ticket_number,
    p_content_en := 'New message sent in ticket ' || p_ticket_number,
    p_action_url := '/dashboard/support/' || p_ticket_id,
    p_data := jsonb_build_object('ticket_id', p_ticket_id, 'ticket_number', p_ticket_number)
  );
END;
$$;

COMMENT ON FUNCTION create_notification IS '🔔 إنشاء إشعار جديد لمستخدم معين';
COMMENT ON FUNCTION create_bulk_notifications IS '📢 إنشاء إشعارات متعددة (للمديرين)';
COMMENT ON FUNCTION get_user_notifications IS '📋 جلب إشعارات المستخدم مع Pagination';
COMMENT ON FUNCTION get_unread_count IS '🔢 عدد الإشعارات غير المقروءة';
COMMENT ON FUNCTION mark_notification_read IS '✅ تحديد إشعار كمقروء';
COMMENT ON FUNCTION mark_all_notifications_read IS '✅ تحديد كل الإشعارات كمقروءة';
COMMENT ON FUNCTION delete_notification IS '🗑️ حذف إشعار';
COMMENT ON FUNCTION cleanup_old_notifications IS '🧹 حذف الإشعارات القديمة المقروءة';
COMMENT ON FUNCTION get_new_notifications_since IS '🔄 جلب الإشعارات الجديدة منذ وقت معين (Realtime)';
COMMENT ON FUNCTION notify_new_order IS '🛒 إشعار عند طلب جديد';
COMMENT ON FUNCTION notify_new_ticket_message IS '💬 إشعار عند رسالة دعم جديدة';
