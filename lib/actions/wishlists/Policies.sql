-- =========================================================
-- جدول wishlists (قائمة المفضلة)
-- =========================================================

-- 1. تفعيل الحماية وتعيين القيمة الافتراضية للمستخدم تلقائياً
ALTER TABLE public.wishlists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wishlists ALTER COLUMN user_id SET DEFAULT auth.uid();

-- 2. تنظيف كافة السياسات القديمة لتجنب أي تضارب
DROP POLICY IF EXISTS "wishlists_owner_policy" ON public.wishlists;
DROP POLICY IF EXISTS "wishlists_policy" ON public.wishlists;
DROP POLICY IF EXISTS "wishlists_all_policy" ON public.wishlists;
DROP POLICY IF EXISTS "wishlists_select_policy" ON public.wishlists;
DROP POLICY IF EXISTS "wishlists_insert_policy" ON public.wishlists;
DROP POLICY IF EXISTS "wishlists_update_policy" ON public.wishlists;
DROP POLICY IF EXISTS "wishlists_delete_policy" ON public.wishlists;
DROP POLICY IF EXISTS "Enable read access for own wishlist" ON public.wishlists;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON public.wishlists;
DROP POLICY IF EXISTS "Enable delete for users based on user_id" ON public.wishlists;

-- 3. السياسات المفصلة كل واحدة على حدة:

-- سياسة القراءة (SELECT): المستخدم يرى مفضلته فقط
CREATE POLICY "wishlists_select_policy"
ON public.wishlists
FOR SELECT
TO authenticated
USING (user_id = auth.uid());

-- سياسة الإدخال (INSERT): مفتوحة للمسجلين وتعتمد على DEFAULT auth.uid()
CREATE POLICY "wishlists_insert_policy"
ON public.wishlists
FOR INSERT
TO authenticated
WITH CHECK (true);

-- سياسة التحديث (UPDATE): المستخدم يحدث سجلات مفضلته فقط
CREATE POLICY "wishlists_update_policy"
ON public.wishlists
FOR UPDATE
TO authenticated
USING (user_id = auth.uid());

-- سياسة الحذف (DELETE): المستخدم يحذف المنتجات من مفضلته فقط
CREATE POLICY "wishlists_delete_policy"
ON public.wishlists
FOR DELETE
TO authenticated
USING (user_id = auth.uid());






-- منع تكرار نفس المنتج لنفس المستخدم في المفضلة
ALTER TABLE public.wishlists 
DROP CONSTRAINT IF EXISTS wishlists_user_product_unique;

ALTER TABLE public.wishlists 
ADD CONSTRAINT wishlists_user_product_unique UNIQUE (user_id, product_id);