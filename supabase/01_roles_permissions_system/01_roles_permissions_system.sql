-- =====================================================
-- Marketna E-Commerce - Advanced RBAC System (Enhanced)
-- File: 01_roles_permissions_system.sql
-- Description: نظام الأدوار والصلاحيات مع دوال التحقق من الملكية
-- =====================================================

-- 1. تفعيل الإضافات المطلوبة
CREATE EXTENSION IF NOT EXISTS pg_trgm;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- 2. جداول النظام الأساسية (Core Tables)
-- =====================================================

-- جدول الأدوار (Roles)
CREATE TABLE IF NOT EXISTS public.roles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT UNIQUE NOT NULL,
  description TEXT,
  is_system BOOLEAN DEFAULT FALSE, -- أدوار النظام لا يمكن حذفها
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- جدول الصلاحيات (Permissions)
CREATE TABLE IF NOT EXISTS public.permissions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT UNIQUE NOT NULL,
  description TEXT,
  resource TEXT NOT NULL, -- المورد (مثلاً: products, orders)
  action TEXT NOT NULL,   -- الإجراء (مثلاً: create, read, update, delete)
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- جدول ربط المستخدمين بالأدوار (User Roles)
CREATE TABLE IF NOT EXISTS public.user_roles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role_id UUID NOT NULL REFERENCES public.roles(id) ON DELETE CASCADE,
  granted_by UUID REFERENCES auth.users(id),
  granted_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ, -- صلاحية مؤقتة (اختياري)
  UNIQUE(user_id, role_id)
);

-- جدول ربط الأدوار بالصلاحيات (Role Permissions)
CREATE TABLE IF NOT EXISTS public.role_permissions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  role_id UUID NOT NULL REFERENCES public.roles(id) ON DELETE CASCADE,
  permission_id UUID NOT NULL REFERENCES public.permissions(id) ON DELETE CASCADE,
  granted_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(role_id, permission_id)
);

-- =====================================================
-- 3. الفهرسة (Indexing)
-- =====================================================
CREATE INDEX IF NOT EXISTS idx_roles_name ON public.roles(name);
CREATE INDEX IF NOT EXISTS idx_permissions_resource ON public.permissions(resource);
CREATE INDEX IF NOT EXISTS idx_permissions_action ON public.permissions(action);
CREATE INDEX IF NOT EXISTS idx_user_roles_user_id ON public.user_roles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_role_id ON public.user_roles(role_id);
CREATE INDEX IF NOT EXISTS idx_role_permissions_role_id ON public.role_permissions(role_id);
CREATE INDEX IF NOT EXISTS idx_role_permissions_permission_id ON public.role_permissions(permission_id);

-- =====================================================
-- 4. البيانات الافتراضية (Seed Data)
-- =====================================================

-- إدخال الأدوار الأساسية
INSERT INTO public.roles (name, description, is_system) VALUES
  ('admin', 'مدير النظام - صلاحيات كاملة', TRUE),
  ('vendor', 'بائع - إدارة المنتجات والطلبات', TRUE),
  ('customer', 'عميل - تصفح وشراء فقط', TRUE),
  ('support', 'دعم فني - قراءة وتعديل محدود', TRUE)
ON CONFLICT (name) DO NOTHING;

-- إدخال الصلاحيات الأساسية
INSERT INTO public.permissions (name, description, resource, action) VALUES
  -- صلاحيات الملف الشخصي
  ('profile:read', 'قراءة الملف الشخصي', 'profile', 'read'),
  ('profile:update', 'تعديل الملف الشخصي', 'profile', 'update'),
  ('profile:delete', 'حذف الملف الشخصي', 'profile', 'delete'),
  
  -- صلاحيات المنتجات
  ('products:read', 'قراءة المنتجات', 'products', 'read'),
  ('products:create', 'إنشاء منتج', 'products', 'create'),
  ('products:update', 'تعديل منتج', 'products', 'update'),
  ('products:delete', 'حذف منتج', 'products', 'delete'),
  
  -- صلاحيات الطلبات
  ('orders:read', 'قراءة الطلبات', 'orders', 'read'),
  ('orders:create', 'إنشاء طلب', 'orders', 'create'),
  ('orders:update', 'تعديل طلب', 'orders', 'update'),
  ('orders:cancel', 'إلغاء طلب', 'orders', 'cancel'),
  
  -- صلاحيات المستخدمين
  ('users:read', 'قراءة بيانات المستخدمين', 'users', 'read'),
  ('users:update', 'تعديل بيانات المستخدمين', 'users', 'update'),
  ('users:delete', 'حذف المستخدمين', 'users', 'delete'),
  ('users:manage_roles', 'إدارة أدوار المستخدمين', 'users', 'manage_roles')
ON CONFLICT (name) DO NOTHING;

-- ربط الأدوار بالصلاحيات (Admin - صلاحيات كاملة)
INSERT INTO public.role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM public.roles r, public.permissions p
WHERE r.name = 'admin'
ON CONFLICT (role_id, permission_id) DO NOTHING;

-- ربط الأدوار بالصلاحيات (Vendor - صلاحيات المنتجات والطلبات)
INSERT INTO public.role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM public.roles r, public.permissions p
WHERE r.name = 'vendor' 
  AND p.resource IN ('products', 'orders', 'profile')
  AND p.action IN ('read', 'create', 'update', 'delete')
ON CONFLICT (role_id, permission_id) DO NOTHING;

-- ربط الأدوار بالصلاحيات (Customer - صلاحيات أساسية)
INSERT INTO public.role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM public.roles r, public.permissions p
WHERE r.name = 'customer' 
  AND p.name IN ('profile:read', 'profile:update', 'products:read', 'orders:read', 'orders:create')
ON CONFLICT (role_id, permission_id) DO NOTHING;

-- ربط الأدوار بالصلاحيات (Support - قراءة وتعديل محدود)
INSERT INTO public.role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM public.roles r, public.permissions p
WHERE r.name = 'support' 
  AND p.resource IN ('profile', 'users', 'orders')
  AND p.action IN ('read', 'update')
ON CONFLICT (role_id, permission_id) DO NOTHING;

-- =====================================================
-- 5. دوال التحقق من الصلاحيات (Permission Functions)
-- =====================================================

-- دالة 1: التحقق من أن المستخدم يملك دوراً محدداً
CREATE OR REPLACE FUNCTION public.has_role(role_name TEXT)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.user_roles ur
    JOIN public.roles r ON r.id = ur.role_id
    WHERE ur.user_id = auth.uid() AND r.name = role_name
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- دالة 2: التحقق من أن المستخدم يملك صلاحية محددة
CREATE OR REPLACE FUNCTION public.has_permission(permission_name TEXT)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.user_roles ur
    JOIN public.roles r ON r.id = ur.role_id
    JOIN public.role_permissions rp ON rp.role_id = r.id
    JOIN public.permissions p ON p.id = rp.permission_id
    WHERE ur.user_id = auth.uid() AND p.name = permission_name
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- دالة 3: التحقق من صلاحية على مورد وإجراء محددين
CREATE OR REPLACE FUNCTION public.has_permission_on_resource(resource_name TEXT, action_name TEXT)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.user_roles ur
    JOIN public.roles r ON r.id = ur.role_id
    JOIN public.role_permissions rp ON rp.role_id = r.id
    JOIN public.permissions p ON p.id = rp.permission_id
    WHERE ur.user_id = auth.uid() 
      AND p.resource = resource_name 
      AND p.action = action_name
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- دالة 4: الحصول على جميع أدوار المستخدم
CREATE OR REPLACE FUNCTION public.get_user_roles()
RETURNS TABLE(role_name TEXT, granted_at TIMESTAMPTZ) AS $$
BEGIN
  RETURN QUERY
  SELECT r.name, ur.granted_at
  FROM public.user_roles ur
  JOIN public.roles r ON r.id = ur.role_id
  WHERE ur.user_id = auth.uid()
    AND (ur.expires_at IS NULL OR ur.expires_at > NOW());
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- دالة 5: الحصول على جميع صلاحيات المستخدم
CREATE OR REPLACE FUNCTION public.get_user_permissions()
RETURNS TABLE(permission_name TEXT, resource TEXT, action TEXT) AS $$
BEGIN
  RETURN QUERY
  SELECT DISTINCT p.name, p.resource, p.action
  FROM public.user_roles ur
  JOIN public.roles r ON r.id = ur.role_id
  JOIN public.role_permissions rp ON rp.role_id = r.id
  JOIN public.permissions p ON p.id = rp.permission_id
  WHERE ur.user_id = auth.uid()
    AND (ur.expires_at IS NULL OR ur.expires_at > NOW());
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- دالة 6: التحقق مما إذا كان المستخدم مديرًا
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN public.has_role('admin');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION public.has_role IS 'التحقق من دور محدد';
COMMENT ON FUNCTION public.has_permission IS 'التحقق من صلاحية محددة بالاسم';
COMMENT ON FUNCTION public.has_permission_on_resource IS 'التحقق من صلاحية على مورد وإجراء';
COMMENT ON FUNCTION public.get_user_roles IS 'الحصول على جميع أدوار المستخدم';
COMMENT ON FUNCTION public.get_user_permissions IS 'الحصول على جميع صلاحيات المستخدم';
COMMENT ON FUNCTION public.is_admin IS 'التحقق مما إذا كان المستخدم مديرًا';

-- =====================================================
-- 6. دوال التحقق من الملكية (Ownership Functions)
-- =====================================================
-- هذه الدوال مصممة لتكون مرنة وتعمل مع أي جدول في المستقبل

-- دالة 7: التحقق من ملكية سجل في جدول عام
-- الاستخدام: public.owns_record('products', product_id)
CREATE OR REPLACE FUNCTION public.owns_record(table_name TEXT, record_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  is_owner BOOLEAN;
  query TEXT;
BEGIN
  -- بناء استعلام ديناميكي للتحقق من الملكية
  -- ملاحظة: يفترض أن الجدول يحتوي على عمود vendor_id أو user_id
  EXECUTE format(
    'SELECT EXISTS (SELECT 1 FROM public.%I WHERE id = $1 AND (vendor_id = $2 OR user_id = $2))',
    table_name
  )
  USING record_id, auth.uid()
  INTO is_owner;
  
  RETURN is_owner;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- دالة 8: التحقق من الملكية لجدول المنتجات (مُحسّنة للأداء)
CREATE OR REPLACE FUNCTION public.owns_product(product_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.products
    WHERE id = product_id AND vendor_id = auth.uid()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- دالة 9: التحقق من الملكية لجدول الطلبات (مُحسّنة للأداء)
CREATE OR REPLACE FUNCTION public.owns_order(order_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.orders
    WHERE id = order_id AND customer_id = auth.uid()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- دالة 10: التحقق الشامل (الصلاحية + الملكية)
-- هذه هي الدالة الأهم للأمان في الأنظمة متعددة التجار
-- الاستخدام: public.can_manage_record('products', product_id, 'delete')
CREATE OR REPLACE FUNCTION public.can_manage_record(
  table_name TEXT, 
  record_id UUID, 
  action_name TEXT
)
RETURNS BOOLEAN AS $$
DECLARE
  is_owner BOOLEAN;
  has_perm BOOLEAN;
  is_admin BOOLEAN;
  permission_name TEXT;
BEGIN
  -- التحقق من الملكية
  EXECUTE format('SELECT public.owns_record(%L, $1)', table_name)
  USING record_id
  INTO is_owner;
  
  -- التحقق من الصلاحية العامة
  permission_name := CONCAT(table_name, ':', action_name);
  SELECT public.has_permission(permission_name) INTO has_perm;
  
  -- التحقق من الإدارة
  SELECT public.is_admin() INTO is_admin;
  
  -- المدير يملك صلاحية مطلقة، أو (لديه صلاحية + يملك السجل)
  RETURN is_admin OR (has_perm AND is_owner);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- دالة 11: التحقق الشامل للمنتجات (مُحسّنة للأداء)
CREATE OR REPLACE FUNCTION public.can_manage_product(product_id UUID, action_name TEXT)
RETURNS BOOLEAN AS $$
DECLARE
  is_owner BOOLEAN;
  has_perm BOOLEAN;
  is_admin BOOLEAN;
BEGIN
  -- التحقق من الملكية
  SELECT EXISTS (
    SELECT 1 FROM public.products WHERE id = product_id AND vendor_id = auth.uid()
  ) INTO is_owner;
  
  -- التحقق من الصلاحية العامة
  SELECT public.has_permission(CONCAT('products:', action_name)) INTO has_perm;
  
  -- التحقق من الإدارة
  SELECT public.is_admin() INTO is_admin;
  
  RETURN is_admin OR (has_perm AND is_owner);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION public.owns_record IS 'التحقق من ملكية سجل في جدول عام';
COMMENT ON FUNCTION public.owns_product IS 'التحقق من ملكية منتج';
COMMENT ON FUNCTION public.owns_order IS 'التحقق من ملكية طلب';
COMMENT ON FUNCTION public.can_manage_record IS 'التحقق الشامل (الصلاحية + الملكية) لأي جدول';
COMMENT ON FUNCTION public.can_manage_product IS 'التحقق الشامل للمنتجات';

-- =====================================================
-- 7. دوال إدارة الأدوار والصلاحيات (Management Functions)
-- =====================================================

-- دالة منح دور لمستخدم (للمدراء فقط)
CREATE OR REPLACE FUNCTION public.grant_role_to_user(target_user_id UUID, role_name TEXT)
RETURNS BOOLEAN AS $$
DECLARE
  role_record RECORD;
BEGIN
  -- التحقق من أن المستخدم الحالي مدير
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Only admins can grant roles';
  END IF;
  
  -- الحصول على سجل الدور
  SELECT * INTO role_record FROM public.roles WHERE name = role_name;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Role not found: %', role_name;
  END IF;
  
  -- منح الدور
  INSERT INTO public.user_roles (user_id, role_id, granted_by)
  VALUES (target_user_id, role_record.id, auth.uid())
  ON CONFLICT (user_id, role_id) DO UPDATE
  SET granted_at = NOW();
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- دالة سحب دور من مستخدم (للمدراء فقط)
CREATE OR REPLACE FUNCTION public.revoke_role_from_user(target_user_id UUID, role_name TEXT)
RETURNS BOOLEAN AS $$
DECLARE
  role_record RECORD;
BEGIN
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Only admins can revoke roles';
  END IF;
  
  -- منع المستخدم من إزالة دور المدير عن نفسه
  IF target_user_id = auth.uid() AND role_name = 'admin' THEN
    RAISE EXCEPTION 'Cannot remove your own admin role';
  END IF;
  
  SELECT * INTO role_record FROM public.roles WHERE name = role_name;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Role not found: %', role_name;
  END IF;
  
  DELETE FROM public.user_roles
  WHERE user_id = target_user_id AND role_id = role_record.id;
  
  RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- دالة منح صلاحية لدور (للمدراء فقط)
CREATE OR REPLACE FUNCTION public.grant_permission_to_role(role_name TEXT, permission_name TEXT)
RETURNS BOOLEAN AS $$
DECLARE
  role_record RECORD;
  perm_record RECORD;
BEGIN
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Only admins can grant permissions';
  END IF;
  
  SELECT * INTO role_record FROM public.roles WHERE name = role_name;
  SELECT * INTO perm_record FROM public.permissions WHERE name = permission_name;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Role or Permission not found';
  END IF;
  
  INSERT INTO public.role_permissions (role_id, permission_id)
  VALUES (role_record.id, perm_record.id)
  ON CONFLICT (role_id, permission_id) DO NOTHING;
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- دالة سحب صلاحية من دور (للمدراء فقط)
CREATE OR REPLACE FUNCTION public.revoke_permission_from_role(role_name TEXT, permission_name TEXT)
RETURNS BOOLEAN AS $$
DECLARE
  role_record RECORD;
  perm_record RECORD;
BEGIN
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Only admins can revoke permissions';
  END IF;
  
  SELECT * INTO role_record FROM public.roles WHERE name = role_name;
  SELECT * INTO perm_record FROM public.permissions WHERE name = permission_name;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Role or Permission not found';
  END IF;
  
  -- منع سحب الصلاحيات من أدوار النظام
  IF role_record.is_system THEN
    RAISE EXCEPTION 'Cannot modify permissions for system roles';
  END IF;
  
  DELETE FROM public.role_permissions
  WHERE role_id = role_record.id AND permission_id = perm_record.id;
  
  RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION public.grant_role_to_user IS 'منح دور لمستخدم (للمدراء)';
COMMENT ON FUNCTION public.revoke_role_from_user IS 'سحب دور من مستخدم (للمدراء)';
COMMENT ON FUNCTION public.grant_permission_to_role IS 'منح صلاحية لدور (للمدراء)';
COMMENT ON FUNCTION public.revoke_permission_from_role IS 'سحب صلاحية من دور (للمدراء)';

-- =====================================================
-- 8. سياسات الأمان (Row Level Security)
-- =====================================================

-- جدول الأدوار
ALTER TABLE public.roles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "roles_public_read" ON public.roles;
CREATE POLICY "roles_public_read" ON public.roles FOR SELECT
  TO authenticated USING (TRUE);

DROP POLICY IF EXISTS "roles_admin_manage" ON public.roles;
CREATE POLICY "roles_admin_manage" ON public.roles FOR ALL
  TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

-- جدول الصلاحيات
ALTER TABLE public.permissions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "permissions_public_read" ON public.permissions;
CREATE POLICY "permissions_public_read" ON public.permissions FOR SELECT
  TO authenticated USING (TRUE);

DROP POLICY IF EXISTS "permissions_admin_manage" ON public.permissions;
CREATE POLICY "permissions_admin_manage" ON public.permissions FOR ALL
  TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

-- جدول أدوار المستخدمين
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "user_roles_read_own" ON public.user_roles;
CREATE POLICY "user_roles_read_own" ON public.user_roles FOR SELECT
  TO authenticated USING (user_id = auth.uid());

DROP POLICY IF EXISTS "user_roles_admin_read_all" ON public.user_roles;
CREATE POLICY "user_roles_admin_read_all" ON public.user_roles FOR SELECT
  TO authenticated USING (public.is_admin());

DROP POLICY IF EXISTS "user_roles_admin_manage" ON public.user_roles;
CREATE POLICY "user_roles_admin_manage" ON public.user_roles FOR ALL
  TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

-- جدول صلاحيات الأدوار
ALTER TABLE public.role_permissions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "role_permissions_public_read" ON public.role_permissions;
CREATE POLICY "role_permissions_public_read" ON public.role_permissions FOR SELECT
  TO authenticated USING (TRUE);

DROP POLICY IF EXISTS "role_permissions_admin_manage" ON public.role_permissions;
CREATE POLICY "role_permissions_admin_manage" ON public.role_permissions FOR ALL
  TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

-- =====================================================
-- 9. مشغلات التحديث التلقائي (Auto Update Triggers)
-- =====================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_roles_updated_at ON public.roles;
CREATE TRIGGER update_roles_updated_at
  BEFORE UPDATE ON public.roles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();