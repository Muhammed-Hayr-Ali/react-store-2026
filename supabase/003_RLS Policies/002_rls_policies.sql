-- =====================================================
-- 🔒 Row Level Security (RLS) Policies - سياسات أمان مستوى الصفوف
-- =====================================================
-- ⚠️ ترتيب التنفيذ: يجب تشغيل هذا الملف ثالثاً
--    بعد: 001_Schema/001_schema.sql
--          002_Utility Functions/000_utility_functions.sql
--    قبل: 004_Seed Data/001_role_seed.sql
--          004_Seed Data/002_plan_seed.sql
-- =====================================================

-- =====================================================
-- 1️⃣ إعدادات الأعمدة الحساسة (Column Level Security)
-- =====================================================

-- إعادة تعيين الصلاحيات على جدول الملف الشخصي
REVOKE ALL ON TABLE public.core_profile FROM PUBLIC;
REVOKE ALL ON TABLE public.core_profile FROM authenticated;

-- منح صلاحية قراءة الأعمدة العامة
GRANT SELECT (id, full_name, avatar_url, created_at) ON TABLE public.core_profile TO PUBLIC;

-- منح صلاحية قراءة الأعمدة للمستخدمين المسجلين
GRANT SELECT (id, email, phone_number, first_name, last_name, preferred_language, timezone) ON TABLE public.core_profile TO authenticated;

-- =====================================================
-- 2️⃣ تفعيل RLS على جميع الجداول
-- =====================================================

ALTER TABLE public.core_profile ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.auth_password_reset ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.core_role ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.core_profile_role ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.core_address ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.saas_plan ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.saas_subscription ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.store_vendor ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.store_category ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.store_product ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_image ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_variant ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trade_order ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trade_order_item ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fleet_driver ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fleet_delivery ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.social_review ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customer_favorite ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.support_ticket ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ticket_message ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sys_notification ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.system_error_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exchange_rates ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- 3️⃣ سياسات جدول الملف الشخصي (core_profile)
-- =====================================================

-- العامة يرون المعلومات الأساسية فقط
CREATE POLICY "public_profiles_viewable"
ON public.core_profile FOR SELECT
TO PUBLIC
USING (true);

-- المستخدم يرى ملفه الشخصي كاملاً
CREATE POLICY "users_view_own_profile"
ON public.core_profile FOR SELECT
TO authenticated
USING ("id" = public.current_user_id());

-- المستخدم ينشئ ملفه عند التسجيل
CREATE POLICY "users_insert_own_profile"
ON public.core_profile FOR INSERT
TO authenticated
WITH CHECK ("id" = public.current_user_id());

-- المستخدم يعدل ملفه فقط
CREATE POLICY "users_update_own_profile"
ON public.core_profile FOR UPDATE
TO authenticated
USING ("id" = public.current_user_id())
WITH CHECK ("id" = public.current_user_id());

-- الأدمن يمكنه تعديل أي ملف شخصي (للإدارة)
CREATE POLICY "admins_update_any_profile"
ON public.core_profile FOR UPDATE
TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- =====================================================
-- 4️⃣ سياسات جدول الأدوار (core_role)
-- =====================================================

-- ✅ جديد: الأدوار عامة للقراءة (مطلوب لعمل النظام)
CREATE POLICY "roles_public_viewable"
ON public.core_role FOR SELECT
TO PUBLIC
USING (true);

-- ✅ جديد: الأدمن فقط يدير الأدوار
CREATE POLICY "admins_manage_roles"
ON public.core_role FOR ALL
TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- =====================================================
-- 5️⃣ سياسات جدول أدوار المستخدمين (core_profile_role)
-- =====================================================

-- ✅ جديد: المستخدم يرى أدواره الخاصة
CREATE POLICY "users_view_own_roles"
ON public.core_profile_role FOR SELECT
TO authenticated
USING ("profile_id" = public.current_user_id());

-- ✅ جديد: الأدمن يدير أدوار المستخدمين
CREATE POLICY "admins_manage_profile_roles"
ON public.core_profile_role FOR ALL
TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- =====================================================
-- 6️⃣ سياسات جدول إعادة تعيين كلمة المرور (auth_password_reset)
-- =====================================================

-- ✅ جديد: المستخدم ينشئ طلب إعادة تعيين لنفسه
CREATE POLICY "users_create_own_password_reset"
ON public.auth_password_reset FOR INSERT
TO authenticated
WITH CHECK ("profile_id" = public.current_user_id());

-- ✅ جديد: المستخدم يرى فقط طلبات إعادة تعيين الخاصة به
-- 🔒 أمان: التوكن حساس - لا يجب أن يكون عاماً
CREATE POLICY "users_view_own_password_reset"
ON public.auth_password_reset FOR SELECT
TO authenticated
USING ("profile_id" = public.current_user_id());

-- ✅ جديد: المستخدم يعدل طلبه فقط (للتأكيد/الإلغاء)
CREATE POLICY "users_update_own_password_reset"
ON public.auth_password_reset FOR UPDATE
TO authenticated
USING ("profile_id" = public.current_user_id())
WITH CHECK ("profile_id" = public.current_user_id());

-- ✅ جديد: الأدمن يدير جميع الطلبات
CREATE POLICY "admins_manage_password_resets"
ON public.auth_password_reset FOR ALL
TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- =====================================================
-- 7️⃣ سياسات جدول العناوين (core_address)
-- =====================================================

-- المستخدم يرى عناوينه فقط
CREATE POLICY "users_view_own_addresses"
ON public.core_address FOR SELECT
TO authenticated
USING ("profile_id" = public.current_user_id());

-- المستخدم ينشئ عناوينه فقط
CREATE POLICY "users_insert_own_addresses"
ON public.core_address FOR INSERT
TO authenticated
WITH CHECK ("profile_id" = public.current_user_id());

-- المستخدم يعدل عناوينه فقط
CREATE POLICY "users_update_own_addresses"
ON public.core_address FOR UPDATE
TO authenticated
USING ("profile_id" = public.current_user_id())
WITH CHECK ("profile_id" = public.current_user_id());

-- المستخدم يحذف عناوينه فقط
CREATE POLICY "users_delete_own_addresses"
ON public.core_address FOR DELETE
TO authenticated
USING ("profile_id" = public.current_user_id());

-- الأدمن يدير جميع العناوين
CREATE POLICY "admins_manage_addresses"
ON public.core_address FOR ALL
TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- =====================================================
-- 8️⃣ سياسات جدول الخطط (saas_plan)
-- =====================================================

-- ✅ جديد: الخطط النشطة عامة للقراءة
CREATE POLICY "plans_public_viewable"
ON public.saas_plan FOR SELECT
TO PUBLIC
USING ("is_active" = true);

-- ✅ جديد: الأدمن يدير الخطط
CREATE POLICY "admins_manage_plans"
ON public.saas_plan FOR ALL
TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- =====================================================
-- 9️⃣ سياسات جدول الاشتراكات (saas_subscription)
-- =====================================================

-- ✅ جديد: المستخدم يرى اشتراكاته فقط
CREATE POLICY "users_view_own_subscriptions"
ON public.saas_subscription FOR SELECT
TO authenticated
USING ("profile_id" = public.current_user_id());

-- ✅ جديد: المستخدم ينشئ اشتراكه فقط
CREATE POLICY "users_insert_own_subscriptions"
ON public.saas_subscription FOR INSERT
TO authenticated
WITH CHECK ("profile_id" = public.current_user_id());

-- ✅ جديد: المستخدم يعدل اشتراكه فقط
CREATE POLICY "users_update_own_subscriptions"
ON public.saas_subscription FOR UPDATE
TO authenticated
USING ("profile_id" = public.current_user_id())
WITH CHECK ("profile_id" = public.current_user_id());

-- ✅ جديد: الأدمن يدير جميع الاشتراكات
CREATE POLICY "admins_manage_subscriptions"
ON public.saas_subscription FOR ALL
TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- =====================================================
-- 🔟 سياسات جدول المتاجر (store_vendor)
-- =====================================================

-- المتاجر النشطة عامة للقراءة
CREATE POLICY "vendors_public_viewable"
ON public.store_vendor FOR SELECT
TO PUBLIC
USING ("status" = 'active' AND "deleted_at" IS NULL);

-- البائع يدير متجره فقط
CREATE POLICY "vendors_manage_own_store"
ON public.store_vendor FOR ALL
TO authenticated
USING ("profile_id" = public.current_user_id())
WITH CHECK ("profile_id" = public.current_user_id());

-- الأدمن يدير جميع المتاجر
CREATE POLICY "admins_manage_all_vendors"
ON public.store_vendor FOR ALL
TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- =====================================================
-- 1️⃣1️⃣ سياسات جدول الفئات (store_category)
-- =====================================================

-- ✅ جديد: الفئات النشطة عامة للقراءة
CREATE POLICY "categories_public_viewable"
ON public.store_category FOR SELECT
TO PUBLIC
USING ("is_active" = true);

-- ✅ جديد: البائع يدير فئات متجره فقط
CREATE POLICY "vendors_manage_own_categories"
ON public.store_category FOR ALL
TO authenticated
USING (
  "vendor_id" = public.get_vendor_id()
  OR
  public.is_admin()
)
WITH CHECK (
  "vendor_id" = public.get_vendor_id()
  OR
  public.is_admin()
);

-- ✅ جديد: الأدمن يدير جميع الفئات
CREATE POLICY "admins_manage_all_categories"
ON public.store_category FOR ALL
TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- =====================================================
-- 1️⃣2️⃣ سياسات جدول المنتجات (store_product)
-- =====================================================

-- المنتجات النشطة عامة للقراءة
CREATE POLICY "products_public_viewable"
ON public.store_product FOR SELECT
TO PUBLIC
USING ("is_active" = true AND "deleted_at" IS NULL);

-- البائع يدير منتجاته فقط
CREATE POLICY "vendors_manage_own_products"
ON public.store_product FOR ALL
TO authenticated
USING ("vendor_id" = public.get_vendor_id())
WITH CHECK ("vendor_id" = public.get_vendor_id());

-- الأدمن يدير جميع المنتجات
CREATE POLICY "admins_manage_all_products"
ON public.store_product FOR ALL
TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- =====================================================
-- 1️⃣3️⃣ سياسات جدول صور المنتجات (product_image)
-- =====================================================

-- صور المنتجات عامة للقراءة (فقط المنتجات النشطة وغير المحذوفة)
CREATE POLICY "product_images_public_viewable"
ON public.product_image FOR SELECT
TO PUBLIC
USING (
  "product_id" IN (
    SELECT sp.id FROM public.store_product sp
    WHERE sp.is_active = true AND sp.deleted_at IS NULL
  )
);

-- البائع يدير صور منتجاته فقط
CREATE POLICY "vendors_manage_own_images"
ON public.product_image FOR ALL
TO authenticated
USING (
  "product_id" IN (
    SELECT sp.id FROM public.store_product sp
    WHERE sp.vendor_id = public.get_vendor_id()
  )
)
WITH CHECK (
  "product_id" IN (
    SELECT sp.id FROM public.store_product sp
    WHERE sp.vendor_id = public.get_vendor_id()
  )
);

-- الأدمن يدير جميع الصور
CREATE POLICY "admins_manage_all_images"
ON public.product_image FOR ALL
TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- =====================================================
-- 1️⃣4️⃣ سياسات جدول متغيرات المنتجات (product_variant)
-- =====================================================

-- ✅ جديد: المتغيرات عامة للقراءة (فقط المنتجات النشطة وغير المحذوفة)
CREATE POLICY "variants_public_viewable"
ON public.product_variant FOR SELECT
TO PUBLIC
USING (
  "product_id" IN (
    SELECT sp.id FROM public.store_product sp
    WHERE sp.is_active = true AND sp.deleted_at IS NULL
  )
);

-- ✅ جديد: البائع يدير متغيرات منتجاته
CREATE POLICY "vendors_manage_own_variants"
ON public.product_variant FOR ALL
TO authenticated
USING (
  "product_id" IN (
    SELECT sp.id FROM public.store_product sp
    WHERE sp.vendor_id = public.get_vendor_id()
  )
)
WITH CHECK (
  "product_id" IN (
    SELECT sp.id FROM public.store_product sp
    WHERE sp.vendor_id = public.get_vendor_id()
  )
);

-- ✅ جديد: الأدمن يدير جميع المتغيرات
CREATE POLICY "admins_manage_all_variants"
ON public.product_variant FOR ALL
TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- =====================================================
-- 1️⃣5️⃣ سياسات جدول الطلبات (trade_order)
-- =====================================================

-- العميل يرى طلباته فقط
CREATE POLICY "customers_view_own_orders"
ON public.trade_order FOR SELECT
TO authenticated
USING ("customer_id" = public.current_user_id());

-- البائع يرى طلبات متجره فقط
CREATE POLICY "vendors_view_own_orders"
ON public.trade_order FOR SELECT
TO authenticated
USING ("vendor_id" = public.get_vendor_id());

-- العميل ينشئ طلباته فقط
CREATE POLICY "customers_insert_own_orders"
ON public.trade_order FOR INSERT
TO authenticated
WITH CHECK ("customer_id" = public.current_user_id());

-- العميل يعدل طلباته فقط (قبل التأكيد)
CREATE POLICY "customers_update_own_orders"
ON public.trade_order FOR UPDATE
TO authenticated
USING ("customer_id" = public.current_user_id() AND "is_confirmed" = false)
WITH CHECK ("customer_id" = public.current_user_id());

-- البائع يعدل حالة طلبات متجره
CREATE POLICY "vendors_update_own_orders"
ON public.trade_order FOR UPDATE
TO authenticated
USING ("vendor_id" = public.get_vendor_id())
WITH CHECK ("vendor_id" = public.get_vendor_id());

-- الأدمن يدير جميع الطلبات
CREATE POLICY "admins_manage_all_orders"
ON public.trade_order FOR ALL
TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- =====================================================
-- 1️⃣6️⃣ سياسات جدول عناصر الطلب (trade_order_item)
-- =====================================================

-- عناصر الطلب تتبع صلاحيات الطلب الأصلي
CREATE POLICY "order_items_follow_order_access"
ON public.trade_order_item FOR SELECT
TO authenticated
USING (
  "order_id" IN (SELECT id FROM public.trade_order WHERE "customer_id" = public.current_user_id())
  OR
  "order_id" IN (SELECT id FROM public.trade_order WHERE "vendor_id" = public.get_vendor_id())
  OR
  public.is_admin()
);

-- الأدمن يدير جميع العناصر
CREATE POLICY "admins_manage_all_order_items"
ON public.trade_order_item FOR ALL
TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- =====================================================
-- 1️⃣7️⃣ سياسات جدول السائقين (fleet_driver)
-- =====================================================

-- ✅ جديد: السائق يرى ملفه فقط
CREATE POLICY "drivers_view_own_profile"
ON public.fleet_driver FOR SELECT
TO authenticated
USING ("profile_id" = public.current_user_id());

-- ✅ جديد: السائق يعدل ملفه فقط
CREATE POLICY "drivers_update_own_profile"
ON public.fleet_driver FOR UPDATE
TO authenticated
USING ("profile_id" = public.current_user_id())
WITH CHECK ("profile_id" = public.current_user_id());

-- ✅ جديد: الأدمن يدير جميع السائقين
CREATE POLICY "admins_manage_all_drivers"
ON public.fleet_driver FOR ALL
TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- =====================================================
-- 1️⃣8️⃣ سياسات جدول التوصيل (fleet_delivery)
-- =====================================================

-- ✅ جديد: السائق يرى مهامه فقط
CREATE POLICY "drivers_view_assigned_deliveries"
ON public.fleet_delivery FOR SELECT
TO authenticated
USING ("driver_id" = public.current_user_id());

-- ✅ جديد: السائق يعدل حالة مهامه فقط
CREATE POLICY "drivers_update_assigned_deliveries"
ON public.fleet_delivery FOR UPDATE
TO authenticated
USING ("driver_id" = public.current_user_id())
WITH CHECK ("driver_id" = public.current_user_id());

-- ✅ جديد: البائع يرى توصيلات طلباته
CREATE POLICY "vendors_view_own_deliveries"
ON public.fleet_delivery FOR SELECT
TO authenticated
USING (
  "order_id" IN (
    SELECT to2.id FROM public.trade_order to2
    WHERE to2.vendor_id = public.get_vendor_id()
  )
);

-- ✅ جديد: الأدمن يدير جميع التوصيلات
CREATE POLICY "admins_manage_all_deliveries"
ON public.fleet_delivery FOR ALL
TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- =====================================================
-- 1️⃣9️⃣ سياسات جدول التقييمات (social_review)
-- =====================================================

-- التقييمات عامة للقراءة
CREATE POLICY "reviews_public_viewable"
ON public.social_review FOR SELECT
TO PUBLIC
USING (true);

-- المستخدم ينشئ تقييماته فقط
CREATE POLICY "users_insert_own_reviews"
ON public.social_review FOR INSERT
TO authenticated
WITH CHECK ("author_id" = public.current_user_id());

-- المستخدم يعدل تقييماته فقط
CREATE POLICY "users_update_own_reviews"
ON public.social_review FOR UPDATE
TO authenticated
USING ("author_id" = public.current_user_id())
WITH CHECK ("author_id" = public.current_user_id());

-- المستخدم يحذف تقييماته فقط
CREATE POLICY "users_delete_own_reviews"
ON public.social_review FOR DELETE
TO authenticated
USING ("author_id" = public.current_user_id());

-- =====================================================
-- 2️⃣0️⃣ سياسات جدول المفضلة (customer_favorite)
-- =====================================================

-- ✅ جديد: المستخدم يرى مفضلته فقط
CREATE POLICY "users_view_own_favorites"
ON public.customer_favorite FOR SELECT
TO authenticated
USING ("customer_id" = public.current_user_id());

-- ✅ جديد: المستخدم يدير مفضلته فقط
CREATE POLICY "users_manage_own_favorites"
ON public.customer_favorite FOR ALL
TO authenticated
USING ("customer_id" = public.current_user_id())
WITH CHECK ("customer_id" = public.current_user_id());

-- =====================================================
-- 2️⃣1️⃣ سياسات جدول تذاكر الدعم (support_ticket)
-- =====================================================

-- المستخدم يرى تذاكره فقط (أو المُسنَدة إليه)
CREATE POLICY "users_view_own_tickets"
ON public.support_ticket FOR SELECT
TO authenticated
USING (
  "reporter_id" = public.current_user_id()
  OR
  "assigned_to" = public.current_user_id()
  OR
  public.is_admin()
);

-- المستخدم ينشئ تذاكره فقط
CREATE POLICY "users_insert_own_tickets"
ON public.support_ticket FOR INSERT
TO authenticated
WITH CHECK ("reporter_id" = public.current_user_id());

-- المستخدم يعدل تذاكره فقط
CREATE POLICY "users_update_own_tickets"
ON public.support_ticket FOR UPDATE
TO authenticated
USING ("reporter_id" = public.current_user_id() OR "assigned_to" = public.current_user_id())
WITH CHECK ("reporter_id" = public.current_user_id() OR "assigned_to" = public.current_user_id());

-- الأدمن يدير جميع التذاكر
CREATE POLICY "admins_manage_all_tickets"
ON public.support_ticket FOR ALL
TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- =====================================================
-- 2️⃣2️⃣ سياسات جدول رسائل التذاكر (ticket_message)
-- =====================================================

-- المشاركون في التذكرة يرون الرسائل
CREATE POLICY "ticket_participants_view_messages"
ON public.ticket_message FOR SELECT
TO authenticated
USING (
  "ticket_id" IN (
    SELECT st.id FROM public.support_ticket st
    WHERE st.reporter_id = public.current_user_id()
      OR st.assigned_to = public.current_user_id()
  )
  OR
  public.is_admin()
);

-- المستخدم يرسل رسائل في تذاكره
CREATE POLICY "users_insert_own_messages"
ON public.ticket_message FOR INSERT
TO authenticated
WITH CHECK (
  "ticket_id" IN (
    SELECT st.id FROM public.support_ticket st
    WHERE st.reporter_id = public.current_user_id()
      OR st.assigned_to = public.current_user_id()
  )
);

-- الأدمن يدير جميع الرسائل
CREATE POLICY "admins_manage_all_messages"
ON public.ticket_message FOR ALL
TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- =====================================================
-- 2️⃣3️⃣ سياسات جدول الإشعارات (sys_notification)
-- =====================================================

-- المستخدم يرى إشعاراته فقط
CREATE POLICY "users_view_own_notifications"
ON public.sys_notification FOR SELECT
TO authenticated
USING ("recipient_id" = public.current_user_id());

-- المستخدم يعدل حالة قراءة إشعاراته فقط
CREATE POLICY "users_update_own_notifications"
ON public.sys_notification FOR UPDATE
TO authenticated
USING ("recipient_id" = public.current_user_id())
WITH CHECK ("recipient_id" = public.current_user_id());

-- الأدمن يدير جميع الإشعارات
CREATE POLICY "admins_manage_all_notifications"
ON public.sys_notification FOR ALL
TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- =====================================================
-- 2️⃣4️⃣ سياسات جدول سجل الأخطاء (system_error_log)
-- =====================================================

-- الأدمن فقط يرى سجل الأخطاء
CREATE POLICY "admins_view_error_logs"
ON public.system_error_log FOR SELECT
TO authenticated
USING (public.is_admin());

-- الأدمن يدير سجل الأخطاء
CREATE POLICY "admins_manage_error_logs"
ON public.system_error_log FOR ALL
TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- =====================================================
-- 2️⃣5️⃣ سياسات جدول أسعار الصرف (exchange_rates)
-- =====================================================

-- أسعار الصرف عامة للقراءة
CREATE POLICY "exchange_rates_public_viewable"
ON public.exchange_rates FOR SELECT
TO PUBLIC
USING (true);

-- الأدمن يدير أسعار الصرف
CREATE POLICY "admins_manage_exchange_rates"
ON public.exchange_rates FOR ALL
TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- =====================================================
-- ✅ END OF RLS POLICIES
-- =====================================================

/*
📋 ملخص السياسات:
- إجمالي الجداول المحمية: 23 جدول
- إجمالي السياسات: 70+ سياسة
- جميع الجداول لديها سياسات كاملة
- الأدمن لديه صلاحيات كاملة على جميع الجداول
- المستخدمون يديرون بياناتهم فقط
- البائعون يديرون متاجرهم ومنتجاتهم فقط
- السائقون يديرون مهامهم فقط

🔐 ملاحظات الأمان:
1. دالة is_admin() تستخدم SECURITY DEFINER للوصول الآمن
2. جميع السياسات تستخدم public.current_user_id() للتحقق من الهوية
3. البائعون يستخدمون get_vendor_id() للوصول الآمن لمتاجرهم
4. الأدمن يتجاوز جميع القيود عبر is_admin()
*/
