-- Table Creation File

-- =====================================================
-- Marketna E-Commerce - Profiles Schema
-- File: 02_profiles.sql
-- Version: 1.0
-- Date: 2026-03-21
-- Description: Profiles table - basic data only
-- Dependencies: None (Standalone)
-- =====================================================

-- =====================================================
-- 📋 File Contents
-- =====================================================
-- 1. Extensions
-- 2. Create profiles table
-- 3. Indexes
-- =====================================================


-- =====================================================
-- 1️⃣ Extensions
-- =====================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";


-- =====================================================
-- 2️⃣ Create Profiles Table
-- =====================================================

CREATE TABLE IF NOT EXISTS public.profiles (
  -- === Identity and Linking ===
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,

  -- === Authentication Provider ===
  provider TEXT DEFAULT 'email',

  -- === Basic Information ===
  first_name TEXT,
  last_name TEXT,
  full_name TEXT GENERATED ALWAYS AS (
    NULLIF(TRIM(COALESCE(first_name, '') || ' ' || COALESCE(last_name, '')), '')
  ) STORED,

  -- === Contact Information ===
  phone TEXT,
  phone_verified BOOLEAN DEFAULT FALSE,
  avatar_url TEXT,
  bio TEXT,

  -- === Status and Dates ===
  email_verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  last_sign_in_at TIMESTAMPTZ DEFAULT NOW()
);

-- Comments
COMMENT ON TABLE public.profiles IS 'Profiles table - basic user information';
COMMENT ON COLUMN public.profiles.id IS 'Unique identifier (from auth.users)';
COMMENT ON COLUMN public.profiles.email IS 'User email address';
COMMENT ON COLUMN public.profiles.provider IS 'Authentication provider: email, google, github, etc.';
COMMENT ON COLUMN public.profiles.first_name IS 'First name';
COMMENT ON COLUMN public.profiles.last_name IS 'Last name';
COMMENT ON COLUMN public.profiles.full_name IS 'Full name (auto-generated)';
COMMENT ON COLUMN public.profiles.phone IS 'Phone number';
COMMENT ON COLUMN public.profiles.phone_verified IS 'Whether phone is verified';
COMMENT ON COLUMN public.profiles.avatar_url IS 'Profile picture URL';
COMMENT ON COLUMN public.profiles.bio IS 'Biography';
COMMENT ON COLUMN public.profiles.email_verified IS 'Whether email is verified';
COMMENT ON COLUMN public.profiles.created_at IS 'Profile creation timestamp';
COMMENT ON COLUMN public.profiles.updated_at IS 'Profile last update timestamp';
COMMENT ON COLUMN public.profiles.last_sign_in_at IS 'Last sign-in timestamp';


-- =====================================================
-- 3️⃣ Indexes
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_provider ON public.profiles(provider);
CREATE INDEX IF NOT EXISTS idx_profiles_created_at ON public.profiles(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_profiles_last_sign_in ON public.profiles(last_sign_in_at DESC);

COMMENT ON INDEX idx_profiles_email IS 'Search by email';
COMMENT ON INDEX idx_profiles_provider IS 'Search by authentication provider';
COMMENT ON INDEX idx_profiles_created_at IS 'Order by creation date';
COMMENT ON INDEX idx_profiles_last_sign_in IS 'Order by last sign-in';


-- =====================================================
-- ✅ End of File
-- =====================================================
