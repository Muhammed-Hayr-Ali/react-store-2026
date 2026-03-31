-- =====================================================
-- Marketna E-Commerce - Notifications Schema
-- File: 08_In-App Notifications/1_create_table.sql
-- Version: 1.0
-- Date: 2026-03-24
-- Description: In-app notifications table
-- Dependencies: auth.users (Supabase Auth)
-- =====================================================

-- =====================================================
-- 📋 File Contents
-- =====================================================
-- 1. Cleanup before creation
-- 2. Extensions (pgcrypto for gen_random_uuid)
-- 3. Create notifications table
-- 4. Indexes
-- 5. RLS Policies
-- 6. Trigger for updated_at
-- 7. Verification
-- =====================================================


-- =====================================================
-- 1️⃣ CLEANUP
-- =====================================================

-- Drop policies first
DROP POLICY IF EXISTS "notifications_read_own" ON public.notifications;
DROP POLICY IF EXISTS "notifications_update_own" ON public.notifications;
DROP POLICY IF EXISTS "notifications_insert_own" ON public.notifications;

-- Drop trigger
DROP TRIGGER IF EXISTS notifications_updated_at_trigger ON public.notifications;

-- Drop function
DROP FUNCTION IF EXISTS public.update_notifications_updated_at() CASCADE;

-- Drop indexes
DROP INDEX IF EXISTS notifications_user_id_idx;
DROP INDEX IF EXISTS notifications_created_at_idx;
DROP INDEX IF EXISTS notifications_is_read_idx;
DROP INDEX IF EXISTS notifications_type_idx;

-- Drop table
DROP TABLE IF EXISTS public.notifications CASCADE;


-- =====================================================
-- 2️⃣ EXTENSIONS
-- =====================================================

-- ✅ pgcrypto provides gen_random_uuid() (not uuid-ossp)
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- uuid-ossp is optional (for uuid_generate_v4() if needed)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";


-- =====================================================
-- 3️⃣ CREATE TABLE
-- =====================================================

CREATE TABLE public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT DEFAULT 'info',
  is_read BOOLEAN DEFAULT FALSE,
  link TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Comments
COMMENT ON TABLE public.notifications IS 'In-app notifications table';
COMMENT ON COLUMN public.notifications.id IS 'Unique identifier';
COMMENT ON COLUMN public.notifications.user_id IS 'User ID (from auth.users)';
COMMENT ON COLUMN public.notifications.title IS 'Notification title';
COMMENT ON COLUMN public.notifications.message IS 'Notification message content';
COMMENT ON COLUMN public.notifications.type IS 'Notification type: info, order, promo';
COMMENT ON COLUMN public.notifications.is_read IS 'Whether notification has been read';
COMMENT ON COLUMN public.notifications.link IS 'Optional link when clicking notification';
COMMENT ON COLUMN public.notifications.created_at IS 'Notification creation timestamp';
COMMENT ON COLUMN public.notifications.updated_at IS 'Notification last update timestamp';


-- =====================================================
-- 4️⃣ INDEXES
-- =====================================================

CREATE INDEX notifications_user_id_idx ON public.notifications(user_id);
CREATE INDEX notifications_created_at_idx ON public.notifications(created_at DESC);
CREATE INDEX notifications_is_read_idx ON public.notifications(is_read);
CREATE INDEX notifications_type_idx ON public.notifications(type);

COMMENT ON INDEX notifications_user_id_idx IS 'Search by user ID';
COMMENT ON INDEX notifications_created_at_idx IS 'Order by creation date';
COMMENT ON INDEX notifications_is_read_idx IS 'Filter by read status';
COMMENT ON INDEX notifications_type_idx IS 'Filter by notification type';


-- =====================================================
-- 5️⃣ ROW LEVEL SECURITY (RLS)
-- =====================================================

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- Policy 1: Users can read their own notifications
-- =====================================================
CREATE POLICY "notifications_read_own"
  ON public.notifications FOR SELECT TO authenticated
  USING (user_id = auth.uid());

-- =====================================================
-- Policy 2: Users can update their own notifications
-- =====================================================
CREATE POLICY "notifications_update_own"
  ON public.notifications FOR UPDATE TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- =====================================================
-- Policy 3: Users can insert their own notifications
-- =====================================================
CREATE POLICY "notifications_insert_own"
  ON public.notifications FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());


-- =====================================================
-- 6️⃣ TRIGGER: Auto-update updated_at
-- =====================================================

CREATE OR REPLACE FUNCTION public.update_notifications_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER notifications_updated_at_trigger
  BEFORE UPDATE ON public.notifications
  FOR EACH ROW
  EXECUTE FUNCTION public.update_notifications_updated_at();


-- =====================================================
-- 7️⃣ VERIFICATION
-- =====================================================

SELECT
  '✅ Notifications table created successfully!' AS status,
  (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = 'notifications') AS columns,
  (SELECT COUNT(*) FROM pg_indexes WHERE tablename = 'notifications') AS indexes,
  (SELECT COUNT(*) FROM pg_policies WHERE tablename = 'notifications') AS policies,
  (SELECT COUNT(*) FROM information_schema.triggers WHERE trigger_name = 'notifications_updated_at_trigger') AS triggers;
