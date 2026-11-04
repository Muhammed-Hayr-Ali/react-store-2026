-- ==========================================
-- جدول رموز التحقق للهاتف (Phone OTPs)
-- ==========================================
CREATE TABLE IF NOT EXISTS public.phone_otps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  phone_number TEXT NOT NULL,
  code TEXT NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  used BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);


-- إذا لم يكن phone_number فريداً، قم بإضافة قيد فريد (أو اجعله مفتاحاً فريداً حسب تصميم جدولك)
ALTER TABLE public.phone_otps ADD CONSTRAINT phone_otps_phone_number_key UNIQUE (phone_number);



-- 1. Ensure RLS is enabled on the table
ALTER TABLE public.phone_otps ENABLE ROW LEVEL SECURITY;

-- 2. Allow anonymous and authenticated users to insert or upsert OTPs
CREATE POLICY "Allow public insert and update on phone_otps" 
ON public.phone_otps 
FOR ALL 
USING (true) 
WITH CHECK (true);