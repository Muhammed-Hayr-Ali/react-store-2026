-- =====================================================
-- Marketna E-Commerce - Roles Definitions
-- File: 03_roles/1_create_table.sql
-- Version: 3.3 (Final Audited - Phase 1 Table Only)
-- Date: 2026-03-22
-- Description: Roles definition table with category ENUM
-- Dependencies: None (Standalone)
-- =====================================================

-- ⚠️ NOTE: check_user_has_role() function moved to 03b_roles_functions.sql
-- to avoid dependency on profile_roles table (created in 04_)

-- =====================================================
-- 📋 File Contents
-- =====================================================
-- 1. Cleanup
-- 2. Create ENUM
-- 3. Create Table
-- 4. Indexes
-- 5. RLS Policies (Phase 1 only)
-- 6. Trigger for updated_at
-- 7. Default Data
-- 8. Verification
-- =====================================================


-- =====================================================
-- 1️⃣ CLEANUP
-- =====================================================
DROP POLICY IF EXISTS "roles_public_read" ON public.roles;
DROP POLICY IF EXISTS "roles_admin_manage" ON public.roles;
DROP POLICY IF EXISTS "roles_admin_read_all" ON public.roles;

DROP TRIGGER IF EXISTS roles_updated_at_trigger ON public.roles;
DROP FUNCTION IF EXISTS public.update_roles_updated_at() CASCADE;
-- 🔹 تم إزالة check_user_has_role من هنا (ستُنشأ في 03b_roles_functions.sql)
DROP FUNCTION IF EXISTS public.check_user_has_role(TEXT) CASCADE;

DROP INDEX IF EXISTS idx_roles_name;
DROP INDEX IF EXISTS idx_roles_permissions;
DROP INDEX IF EXISTS idx_roles_created_at;

DROP TABLE IF EXISTS public.roles CASCADE;
DROP TYPE IF EXISTS public.role_name CASCADE;


-- =====================================================
-- 2️⃣ CREATE ENUM
-- =====================================================
CREATE TYPE public.role_name AS ENUM (
  'admin',
  'vendor',
  'delivery',
  'customer'
);

COMMENT ON TYPE public.role_name IS 'Available role types in the system';


-- =====================================================
-- 3️⃣ CREATE TABLE
-- =====================================================
CREATE TABLE public.roles (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name         role_name NOT NULL UNIQUE,
  description  TEXT,
  permissions  JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at   TIMESTAMPTZ DEFAULT NOW(),
  updated_at   TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE public.roles IS 'Roles definition table - permission templates only';
COMMENT ON COLUMN public.roles.id IS 'Unique identifier for the role';
COMMENT ON COLUMN public.roles.name IS 'Role name: admin, vendor, delivery, customer';
COMMENT ON COLUMN public.roles.description IS 'Role description';
COMMENT ON COLUMN public.roles.permissions IS 'Default permissions array for the role';
COMMENT ON COLUMN public.roles.created_at IS 'Role creation timestamp';
COMMENT ON COLUMN public.roles.updated_at IS 'Role last update timestamp';


-- =====================================================
-- 4️⃣ INDEXES
-- =====================================================
CREATE INDEX idx_roles_name ON public.roles(name);
CREATE INDEX idx_roles_permissions ON public.roles USING GIN(permissions);
CREATE INDEX idx_roles_created_at ON public.roles(created_at DESC);

COMMENT ON INDEX idx_roles_name IS 'Fast search by role name';
COMMENT ON INDEX idx_roles_permissions IS 'Search inside JSONB permissions array';
COMMENT ON INDEX idx_roles_created_at IS 'Order roles by creation date';


-- =====================================================
-- 5️⃣ RLS Policies (Phase 1 Only)
-- =====================================================
ALTER TABLE public.roles ENABLE ROW LEVEL SECURITY;

-- Policy 1: Authenticated users can read roles
CREATE POLICY "roles_public_read"
  ON public.roles FOR SELECT TO authenticated
  USING (true);

COMMENT ON POLICY "roles_public_read" ON public.roles 
  IS 'Authenticated users can read all roles (needed for permission checks)';

-- 🔹 سياسات Admin مؤجلة لـ Phase 2 (10_profiles_admin_policies.sql)


-- =====================================================
-- 6️⃣ TRIGGER: Auto-update updated_at
-- =====================================================
CREATE OR REPLACE FUNCTION public.update_roles_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER roles_updated_at_trigger
  BEFORE UPDATE ON public.roles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_roles_updated_at();


-- =====================================================
-- 7️⃣ DEFAULT DATA
-- =====================================================
INSERT INTO public.roles (name, description, permissions)
VALUES
  ('admin'::role_name, 'Full access to all system parts',
   '["*:*", "users:manage", "system:config", "reports:all", "analytics:full", "roles:manage"]'::jsonb),

  ('vendor'::role_name, 'Manage products and orders for the store',
   '["products:create", "products:update", "products:delete", "products:read", "orders:read_own", "orders:update_status", "profile:update", "inventory:manage", "analytics:own"]'::jsonb),

  ('delivery'::role_name, 'Manage delivery tasks and update order statuses',
   '["deliveries:accept", "deliveries:update", "deliveries:complete", "deliveries:read", "orders:read_assigned", "orders:update_delivery", "profile:update", "earnings:view"]'::jsonb),

  ('customer'::role_name, 'Browse products and create orders',
   '["products:read", "orders:create", "orders:read_own", "profile:update", "reviews:create", "wishlist:manage"]'::jsonb)
ON CONFLICT (name) DO UPDATE
SET description = EXCLUDED.description,
    permissions = EXCLUDED.permissions,
    updated_at = NOW();


-- =====================================================
-- 8️⃣ VERIFICATION
-- =====================================================
SELECT 
  '✅ Roles table created successfully!' AS status,
  COUNT(*) AS role_count,
  COUNT(*) FILTER (WHERE name = 'admin') AS admin_count,
  COUNT(*) FILTER (WHERE name = 'vendor') AS vendor_count,
  COUNT(*) FILTER (WHERE name = 'delivery') AS delivery_count,
  COUNT(*) FILTER (WHERE name = 'customer') AS customer_count
FROM public.roles;


-- =====================================================
-- 9️⃣ NEXT STEP: Create check_user_has_role() function
-- =====================================================
/*
📋 IMPORTANT: After running 04_profile_roles_links.sql, create the function:

File: (Merged into 01_profiles/2_create_function.sql)

CREATE OR REPLACE FUNCTION public.check_user_has_role(required_role TEXT)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 
    FROM public.profile_roles pr
    JOIN public.roles r ON r.id = pr.role_id
    WHERE pr.user_id = auth.uid() 
      AND r.name = required_role::public.role_name
      AND pr.is_active = TRUE
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;
*/