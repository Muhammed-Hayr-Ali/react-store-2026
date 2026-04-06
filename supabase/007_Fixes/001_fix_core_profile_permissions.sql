-- =====================================================
-- 🔧 Fix core_profile UPDATE permissions
-- =====================================================
-- ⚠️ هذا الملف يحل مشكلة "permission denied for table core_profile"
-- =====================================================

-- Grant UPDATE permission on core_profile to authenticated users
GRANT UPDATE ON public.core_profile TO authenticated;

-- Ensure RLS is enabled
ALTER TABLE public.core_profile ENABLE ROW LEVEL SECURITY;

-- Recreate the policy to ensure it works correctly
DROP POLICY IF EXISTS "users_update_own_profile" ON public.core_profile;

CREATE POLICY "users_update_own_profile"
ON public.core_profile FOR UPDATE
TO authenticated
USING (id = auth.uid())
WITH CHECK (id = auth.uid());

-- Verify the policy
COMMENT ON POLICY "users_update_own_profile" ON public.core_profile IS 'السماح للمستخدم بتحديث ملفه الشخصي فقط';
