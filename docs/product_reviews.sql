
-- 1. إنشاء جدول التقييمات
CREATE TABLE public.product_reviews (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  
  -- منع المستخدم من تقييم نفس المنتج أكثر من مرة
  CONSTRAINT unique_user_product_review UNIQUE (product_id, user_id)
);

-- 2. إنشاء فهرس لتسريع عمليات الجلب
CREATE INDEX idx_product_reviews_product_id ON public.product_reviews(product_id);

-- 3. تفعيل أمان مستوى الصف (Row Level Security - RLS)
ALTER TABLE public.product_reviews ENABLE ROW LEVEL SECURITY;

-- 4. سياسات الأمان (Policies)
-- السماح للجميع بقراءة التقييمات
CREATE POLICY "Anyone can read reviews" 
  ON public.product_reviews 
  FOR SELECT 
  USING (true);

-- السماح للمستخدمين المسجلين فقط بإضافة تقييم
CREATE POLICY "Authenticated users can insert reviews" 
  ON public.product_reviews 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- السماح للمستخدم بتحديث أو حذف تقييمه فقط
CREATE POLICY "Users can update their own reviews" 
  ON public.product_reviews 
  FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own reviews" 
  ON public.product_reviews 
  FOR DELETE 
  USING (auth.uid() = user_id);







  