-- 1. إنشاء جدول التعليقات والتقييمات
CREATE TABLE IF NOT EXISTS product_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL, 
  
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5), -- التقييم من 1 إلى 5
  content TEXT NOT NULL, -- إزالة title والاحتفاظ بالنص فقط
  
  is_approved BOOLEAN NOT NULL DEFAULT false, -- يحتاج لموافقة المشرف
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);


-- 3. تفعيل سياسات الأمان (RLS)
SELECT public.apply_table_rls('product_reviews', 'product_review', true, false);