-- =====================================================
-- 📸 Supabase Storage Setup - Avatar Uploads
-- =====================================================
-- ⚠️ هذا الملف ينشئ bucket للصور الشخصية
-- =====================================================

-- إنشاء bucket للصور الشخصية
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'avatars',
  'avatars',
  true,
  5242880, -- 5MB
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO UPDATE
SET 
  public = true,
  file_size_limit = 5242880,
  allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

-- سياسة RLS: المستخدم يمكنه رفع صورته الخاصة
CREATE POLICY "Users can upload their own avatar"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'avatars' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- سياسة RLS: المستخدم يمكنه تحديث صورته الخاصة
CREATE POLICY "Users can update their own avatar"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'avatars' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- سياسة RLS: المستخدم يمكنه حذف صورته الخاصة
CREATE POLICY "Users can delete their own avatar"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'avatars' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- سياسة RLS: الجميع يمكنه قراءة الصور (للعرض العام)
CREATE POLICY "Anyone can view avatars"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'avatars');

COMMENT ON TABLE storage.objects IS 'إدارة الصور الشخصية - كل مستخدم يملك مجلد خاص به';
