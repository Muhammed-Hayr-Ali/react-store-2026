-- =====================================================
-- 🔔 مشغلات الإشعارات التلقائية - Auto Notification Triggers
-- =====================================================
-- ✅ يُرسل إشعارات تلقائياً عند:
--    1. تغيير حالة الطلب
--    2. إنشاء تذكرة دعم جديدة
--    3. رد على تذكرة
--    4. إضافة تقييم جديد
-- =====================================================

-- =====================================================
-- 1️⃣ إشعار عند تغيير حالة الطلب
-- =====================================================

CREATE OR REPLACE FUNCTION trigger_notify_order_status_change()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_status_text text;
  v_title_ar text;
  v_title_en text;
  v_content_ar text;
  v_content_en text;
BEGIN
  -- فقط إذا تغيرت الحالة
  IF OLD.status IS DISTINCT FROM NEW.status THEN
    -- تحديد النص حسب الحالة
    CASE NEW.status
      WHEN 'confirmed' THEN
        v_title_ar := 'تم تأكيد طلبك';
        v_title_en := 'Your order has been confirmed';
        v_content_ar := 'تم تأكيد طلبك رقم ' || NEW.order_number;
        v_content_en := 'Your order ' || NEW.order_number || ' has been confirmed';
      WHEN 'processing' THEN
        v_title_ar := 'طلبك قيد المعالجة';
        v_title_en := 'Your order is being processed';
        v_content_ar := 'جاري معالجة طلبك رقم ' || NEW.order_number;
        v_content_en := 'Your order ' || NEW.order_number || ' is being processed';
      WHEN 'shipping' THEN
        v_title_ar := 'طلبك في الطريق';
        v_title_en := 'Your order is on the way';
        v_content_ar := 'تم شحن طلبك رقم ' || NEW.order_number;
        v_content_en := 'Your order ' || NEW.order_number || ' has been shipped';
      WHEN 'delivered' THEN
        v_title_ar := 'تم تسليم طلبك';
        v_title_en := 'Your order has been delivered';
        v_content_ar := 'تم تسليم طلبك رقم ' || NEW.order_number || ' بنجاح';
        v_content_en := 'Your order ' || NEW.order_number || ' has been delivered successfully';
      WHEN 'cancelled' THEN
        v_title_ar := 'تم إلغاء طلبك';
        v_title_en := 'Your order has been cancelled';
        v_content_ar := 'تم إلغاء طلبك رقم ' || NEW.order_number;
        v_content_en := 'Your order ' || NEW.order_number || ' has been cancelled';
      ELSE
        RETURN NEW;
    END CASE;

    -- إنشاء الإشعار
    PERFORM create_notification(
      p_recipient_id := NEW.customer_id,
      p_type := 'order_event',
      p_title_ar := v_title_ar,
      p_title_en := v_title_en,
      p_content_ar := v_content_ar,
      p_content_en := v_content_en,
      p_action_url := '/dashboard/orders/' || NEW.id,
      p_data := jsonb_build_object(
        'order_id', NEW.id,
        'order_number', NEW.order_number,
        'status', NEW.status
      )
    );
  END IF;

  RETURN NEW;
END;
$$;

CREATE TRIGGER on_order_status_change
  AFTER UPDATE ON trade_order
  FOR EACH ROW
  EXECUTE FUNCTION trigger_notify_order_status_change();

-- =====================================================
-- 2️⃣ إشعار عند إنشاء تذكرة دعم جديدة
-- =====================================================

CREATE OR REPLACE FUNCTION trigger_notify_new_ticket()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- إشعار للمشرف (إذا تم تعيينه)
  IF NEW.assigned_to IS NOT NULL THEN
    PERFORM create_notification(
      p_recipient_id := NEW.assigned_to,
      p_type := 'ticket',
      p_title_ar := 'تذكرة جديدة مُعدة لك',
      p_title_en := 'New ticket assigned to you',
      p_content_ar := 'تم تعيين تذكرة رقم ' || NEW.ticket_number || ' لك',
      p_content_en := 'Ticket ' || NEW.ticket_number || ' has been assigned to you',
      p_action_url := '/dashboard/support/' || NEW.id,
      p_data := jsonb_build_object(
        'ticket_id', NEW.id,
        'ticket_number', NEW.ticket_number,
        'priority', NEW.priority
      )
    );
  END IF;

  RETURN NEW;
END;
$$;

CREATE TRIGGER on_new_ticket
  AFTER INSERT ON support_ticket
  FOR EACH ROW
  EXECUTE FUNCTION trigger_notify_new_ticket();

-- =====================================================
-- 3️⃣ إشعار عند رد على تذكرة
-- =====================================================

CREATE OR REPLACE FUNCTION trigger_notify_ticket_message()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_ticket RECORD;
BEGIN
  SELECT * INTO v_ticket FROM support_ticket WHERE id = NEW.ticket_id;

  IF FOUND THEN
    -- استدعاء دالة الإشعار
    PERFORM notify_new_ticket_message(
      p_ticket_id := NEW.ticket_id,
      p_reporter_id := v_ticket.reporter_id,
      p_assigned_to := v_ticket.assigned_to,
      p_sender_id := NEW.sender_id,
      p_ticket_number := v_ticket.ticket_number
    );
  END IF;

  RETURN NEW;
END;
$$;

CREATE TRIGGER on_new_ticket_message
  AFTER INSERT ON ticket_message
  FOR EACH ROW
  EXECUTE FUNCTION trigger_notify_ticket_message();

-- =====================================================
-- 4️⃣ إشعار عند إضافة تقييم جديد
-- =====================================================

CREATE OR REPLACE FUNCTION trigger_notify_new_review()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_product RECORD;
  v_title_ar text;
  v_content_ar text;
BEGIN
  -- إذا كان التقييم لمنتج
  IF NEW.product_id IS NOT NULL THEN
    SELECT * INTO v_product FROM store_product WHERE id = NEW.product_id;

    IF FOUND THEN
      v_title_ar := 'تقييم جديد على منتجك';
      v_content_ar := 'حصل منتجك "' || v_product.name_ar || '" على تقييم ' || NEW.rating || '/5';

      PERFORM create_notification(
        p_recipient_id := v_product.vendor_id,
        p_type := 'review',
        p_title_ar := v_title_ar,
        p_title_en := 'New review on your product',
        p_content_ar := v_content_ar,
        p_content_en := 'Your product "' || COALESCE(v_product.name_en, v_product.name_ar) || '" received a ' || NEW.rating || '/5 rating',
        p_action_url := '/dashboard/products/' || NEW.product_id || '/reviews',
        p_data := jsonb_build_object(
          'product_id', NEW.product_id,
          'vendor_id', NEW.vendor_id,
          'rating', NEW.rating,
          'review_id', NEW.id
        )
      );
    END IF;
  -- إذا كان التقييم لبائع
  ELSIF NEW.vendor_id IS NOT NULL THEN
    PERFORM create_notification(
      p_recipient_id := NEW.vendor_id,
      p_type := 'review',
      p_title_ar := 'تقييم جديد لمتجرك',
      p_title_en := 'New review for your store',
      p_content_ar := 'حصل متجرك على تقييم ' || NEW.rating || '/5',
      p_content_en := 'Your store received a ' || NEW.rating || '/5 rating',
      p_action_url := '/dashboard/reviews',
      p_data := jsonb_build_object(
        'vendor_id', NEW.vendor_id,
        'rating', NEW.rating,
        'review_id', NEW.id
      )
    );
  END IF;

  RETURN NEW;
END;
$$;

CREATE TRIGGER on_new_review
  AFTER INSERT ON social_review
  FOR EACH ROW
  EXECUTE FUNCTION trigger_notify_new_review();

-- =====================================================
-- 5️⃣ إشعار عند إنشاء طلب توصيل جديد
-- =====================================================

CREATE OR REPLACE FUNCTION trigger_notify_delivery_assigned()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_order RECORD;
  v_driver_profile RECORD;
BEGIN
  -- فقط عند تعيين سائق
  IF NEW.driver_id IS NOT NULL AND OLD.driver_id IS NULL THEN
    SELECT * INTO v_order FROM trade_order WHERE id = NEW.order_id;

    IF FOUND THEN
      -- إشعار للعميل
      PERFORM create_notification(
        p_recipient_id := v_order.customer_id,
        p_type := 'order_event',
        p_title_ar := 'تم تعيين سائق لطلبك',
        p_title_en := 'Driver assigned to your order',
        p_content_ar := 'تم تعيين سائق لطلبك رقم ' || v_order.order_number,
        p_content_en := 'A driver has been assigned to your order ' || v_order.order_number,
        p_action_url := '/dashboard/orders/' || NEW.order_id,
        p_data := jsonb_build_object(
          'order_id', NEW.order_id,
          'order_number', v_order.order_number,
          'driver_id', NEW.driver_id
        )
      );
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

CREATE TRIGGER on_delivery_assigned
  AFTER UPDATE ON fleet_delivery
  FOR EACH ROW
  EXECUTE FUNCTION trigger_notify_delivery_assigned();

COMMENT ON FUNCTION trigger_notify_order_status_change IS '🛒 إشعار عند تغيير حالة الطلب';
COMMENT ON FUNCTION trigger_notify_new_ticket IS '🎫 إشعار عند إنشاء تذكرة جديدة';
COMMENT ON FUNCTION trigger_notify_ticket_message IS '💬 إشعار عند رد على تذكرة';
COMMENT ON FUNCTION trigger_notify_new_review IS '⭐ إشعار عند إضافة تقييم';
COMMENT ON FUNCTION trigger_notify_delivery_assigned IS '🚚 إشعار عند تعيين سائق للتوصيل';
