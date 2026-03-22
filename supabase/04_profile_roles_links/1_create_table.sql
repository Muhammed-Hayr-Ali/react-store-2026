-- Table Creation File

-- =====================================================
-- Marketna E-Commerce - Profile Roles Link Table
-- File: 04_profile_roles_links.sql
-- Version: 1.0
-- Date: 2026-03-21
-- Description: Profile roles linking table
-- Dependencies: public.profiles, public.roles
-- =====================================================

-- =====================================================
-- 📋 File Contents
-- =====================================================
-- 1. Cleanup before creation
-- 2. Create profile roles link table
-- 3. Indexes
-- =====================================================


-- =====================================================
-- 1️⃣ Create Profile Roles Link Table
-- =====================================================

CREATE TABLE public.profile_roles (
  user_id      UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  role_id      UUID NOT NULL REFERENCES public.roles(id) ON DELETE CASCADE,
  is_active    BOOLEAN DEFAULT true,
  granted_at   TIMESTAMPTZ DEFAULT NOW(),
  granted_by   UUID REFERENCES auth.profiles(id),

  PRIMARY KEY (user_id, role_id)
);

-- Comments
COMMENT ON TABLE public.profile_roles IS 'Profile roles linking table';
COMMENT ON COLUMN public.profile_roles.user_id IS 'User ID (from profiles.id)';
COMMENT ON COLUMN public.profile_roles.role_id IS 'Role ID (from roles.id)';
COMMENT ON COLUMN public.profile_roles.is_active IS 'Whether role is currently active';
COMMENT ON COLUMN public.profile_roles.granted_at IS 'Role grant timestamp';
COMMENT ON COLUMN public.profile_roles.granted_by IS 'Who granted the role';


-- =====================================================
-- 2️⃣ Indexes
-- =====================================================

CREATE INDEX idx_profile_roles_user ON public.profile_roles(user_id);
CREATE INDEX idx_profile_roles_role ON public.profile_roles(role_id);
CREATE INDEX idx_profile_roles_active ON public.profile_roles(is_active);

COMMENT ON INDEX idx_profile_roles_user IS 'Fast search by user ID';
COMMENT ON INDEX idx_profile_roles_role IS 'Fast search by role ID';
COMMENT ON INDEX idx_profile_roles_active IS 'Filter active roles';


-- =====================================================
-- ✅ End of File
-- =====================================================
