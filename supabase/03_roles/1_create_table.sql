-- =====================================================
-- Marketna E-Commerce - Roles Definitions
-- File: 03_roles.sql
-- Version: 3.1 (Final with minor improvements)
-- =====================================================

-- =====================================================
-- 1️⃣ Cleanup
-- =====================================================
DROP POLICY IF EXISTS "roles_public_read" ON public.roles;
DROP POLICY IF EXISTS "roles_admin_manage" ON public.roles;
DROP POLICY IF EXISTS "roles_admin_read_all" ON public.roles;
DROP INDEX IF EXISTS idx_roles_name;
DROP INDEX IF EXISTS idx_roles_permissions;
DROP INDEX IF EXISTS idx_roles_created_at;
DROP TABLE IF EXISTS public.roles CASCADE;
DROP TYPE IF EXISTS public.role_name CASCADE;

-- =====================================================
-- 2️⃣ Create ENUM
-- =====================================================
CREATE TYPE public.role_name AS ENUM (
  'admin',
  'vendor',
  'delivery',
  'customer'
);

COMMENT ON TYPE public.role_name IS 'Available role types in the system';

-- =====================================================
-- 3️⃣ Create Table
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
-- 4️⃣ Indexes
-- =====================================================
CREATE INDEX idx_roles_name ON public.roles(name);
CREATE INDEX idx_roles_permissions ON public.roles USING GIN(permissions);
CREATE INDEX idx_roles_created_at ON public.roles(created_at DESC);

COMMENT ON INDEX idx_roles_name IS 'Fast search by role name';
COMMENT ON INDEX idx_roles_permissions IS 'Search inside JSONB permissions array';
COMMENT ON INDEX idx_roles_created_at IS 'Order roles by creation date';

-- =====================================================
-- 5️⃣ RLS Policies
-- =====================================================
ALTER TABLE public.roles ENABLE ROW LEVEL SECURITY;

-- Policy 1: Public read (safe - no dependencies)
CREATE POLICY "roles_public_read"
  ON public.roles FOR SELECT TO authenticated, anon
  USING (true);

-- ⚠️ Policy 2 & 3: Admin policies created in 03b_roles_rls_policies.sql
-- (after profile_roles table exists)

-- =====================================================
-- 6️⃣ Default Data
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
-- 7️⃣ Verification
-- =====================================================
SELECT 
  '✅ Roles table created successfully!' AS status,
  COUNT(*) AS role_count,
  COUNT(*) FILTER (WHERE name = 'admin') AS admin_count,
  COUNT(*) FILTER (WHERE name = 'vendor') AS vendor_count,
  COUNT(*) FILTER (WHERE name = 'delivery') AS delivery_count,
  COUNT(*) FILTER (WHERE name = 'customer') AS customer_count
FROM public.roles;
