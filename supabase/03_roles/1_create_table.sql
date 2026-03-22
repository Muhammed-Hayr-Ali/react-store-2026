-- Table Creation File

-- =====================================================
-- Marketna E-Commerce - Roles Definitions
-- File: 03_roles.sql
-- Version: 1.0
-- Date: 2026-03-21
-- Description: Roles definition table - with ENUM type
-- Dependencies: None (Standalone)
-- =====================================================

-- =====================================================
-- 📋 File Contents
-- =====================================================
-- 1. Cleanup before creation
-- 2. Create ENUM for roles
-- 3. Create roles definition table
-- 4. Indexes
-- =====================================================


-- =====================================================
-- 1️⃣ Create ENUM for Roles
-- =====================================================

CREATE TYPE public.role_name AS ENUM (
  'admin',
  'vendor',
  'delivery',
  'customer'
);

COMMENT ON TYPE public.role_name IS 'Available role types in the system';


-- =====================================================
-- 2️⃣ Create Roles Definition Table
-- =====================================================

CREATE TABLE public.roles (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name         role_name NOT NULL UNIQUE,
  description  TEXT,
  permissions  JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at   TIMESTAMPTZ DEFAULT NOW(),
  updated_at   TIMESTAMPTZ DEFAULT NOW()
);

-- Comments
COMMENT ON TABLE public.roles IS 'Roles definition table - permission templates only';
COMMENT ON COLUMN public.roles.id IS 'Unique identifier for the role';
COMMENT ON COLUMN public.roles.name IS 'Role name: admin, vendor, delivery, customer';
COMMENT ON COLUMN public.roles.description IS 'Role description';
COMMENT ON COLUMN public.roles.permissions IS 'Default permissions array for the role';
COMMENT ON COLUMN public.roles.created_at IS 'Role creation timestamp';
COMMENT ON COLUMN public.roles.updated_at IS 'Role last update timestamp';


-- =====================================================
-- 3️⃣ Indexes
-- =====================================================

CREATE INDEX idx_roles_name ON public.roles(name);
CREATE INDEX idx_roles_permissions ON public.roles USING GIN(permissions);
CREATE INDEX idx_roles_created_at ON public.roles(created_at DESC);

COMMENT ON INDEX idx_roles_name IS 'Fast search by role name';
COMMENT ON INDEX idx_roles_permissions IS 'Search inside JSONB permissions array';
COMMENT ON INDEX idx_roles_created_at IS 'Order roles by creation date';


-- =====================================================
-- ✅ End of File
-- =====================================================
