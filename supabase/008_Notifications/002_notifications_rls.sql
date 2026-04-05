-- =====================================================
-- 🔔 سياسات أمان الإشعارات - RLS Policies
-- =====================================================
-- ✅ المستخدم يرى فقط إشعاراته
-- ✅ لا يمكن لأي مستخدم تعديل أو حذف إشعارات غيره
-- =====================================================
DROP POLICY IF EXISTS "Users can view their own notifications" ON sys_notification;
DROP POLICY IF EXISTS "Users can update their own notifications" ON sys_notification;
DROP POLICY IF EXISTS "Users can delete their own notifications" ON sys_notification;
DROP POLICY IF EXISTS "Admins can view all notifications" ON sys_notification;

-- تمكين Row Level Security على جدول الإشعارات
ALTER TABLE sys_notification ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- 1️⃣ المستخدم يستطيع رؤية إشعاراته فقط
-- =====================================================

CREATE POLICY "Users can view their own notifications"
  ON sys_notification
  FOR SELECT
  USING (auth.uid() = recipient_id);

-- =====================================================
-- 2️⃣ المستخدم يستطيع تحديث إشعاراته فقط (تحديد كمقروء)
-- =====================================================

CREATE POLICY "Users can update their own notifications"
  ON sys_notification
  FOR UPDATE
  USING (auth.uid() = recipient_id)
  WITH CHECK (auth.uid() = recipient_id);

-- =====================================================
-- 3️⃣ المستخدم يستطيع حذف إشعاراته فقط
-- =====================================================

CREATE POLICY "Users can delete their own notifications"
  ON sys_notification
  FOR DELETE
  USING (auth.uid() = recipient_id);

-- =====================================================
-- 4️⃣ الدوال الآمنة (SECURITY DEFINER) يمكنها الإدخال
-- =====================================================
-- ✅ الدوال مثل create_notification تستخدم SECURITY DEFINER
--    لذا لا تحتاج policy للإدخال

-- =====================================================
-- 5️⃣ الأدوار الخاصة (Admin) - وصول كامل
-- =====================================================

--admins يمكنهم رؤية كل الإشعارات
-- ✅ السياسة تُنشأ دائماً - لن تطابق أي صفوف حتى يتم إنشاء دور admin
CREATE POLICY "Admins can view all notifications"
  ON sys_notification
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1
      FROM core_profile_role pr
      JOIN core_role r ON r.id = pr.role_id
      WHERE pr.profile_id = auth.uid()
        AND r.code = 'admin'
    )
  );

-- =====================================================
-- 6️⃣ Realtime - السماح بالاستماع للتغييرات
-- =====================================================

-- تمكين Realtime لجدول الإشعارات
ALTER PUBLICATION supabase_realtime ADD TABLE sys_notification;

-- =====================================================
-- ملاحظات أمان مهمة:
-- =====================================================
-- 1. ✅ المستخدم يرى فقط إشعاراته (recipient_id = auth.uid())
-- 2. ✅ لا يمكن تعديل إشعارات الغير
-- 3. ✅ الدوال الآمنة (SECURITY DEFINER) تنشئ الإشعارات
-- 4. ✅ Admins لديهم وصول كامل عبر policy خاص
-- 5. ✅ Realtime مفعل للإشعارات الجديدة
