-- =====================================================
-- Marketna E-Commerce - Exchange Rates Schema
-- File: 07_exchange_rates.sql
-- Version: 2.0 (Final)
-- Date: 2026-03-22
-- Description: Exchange rates table - auto-updated via Cron Job
-- Source: https://v6.exchangerate-api.com/v6/{KEY}/latest/USD
-- Dependencies: pgcrypto extension
-- =====================================================

-- =====================================================
-- 📋 File Contents
-- =====================================================
-- 1. Cleanup before creation
-- 2. Create extension (pgcrypto for gen_random_uuid)
-- 3. Create exchange rates table
-- 4. Indexes
-- 5. Comments
-- 6. Row Level Security (RLS)
-- 7. Helper function
-- 8. Summary view
-- 9. Sample data (commented)
-- 10. Verification
-- =====================================================


-- =====================================================
-- 1️⃣ CLEANUP
-- =====================================================

-- Drop view first (depends on table)
DROP VIEW IF EXISTS public.exchange_rates_summary CASCADE;

-- Drop function
DROP FUNCTION IF EXISTS public.get_exchange_rate(TEXT) CASCADE;

-- Drop policies
DROP POLICY IF EXISTS "exchange_rates_public_read" ON public.exchange_rates;
DROP POLICY IF EXISTS "exchange_rates_service_write" ON public.exchange_rates;

-- Drop indexes
DROP INDEX IF EXISTS idx_exchange_rates_currency_code;
DROP INDEX IF EXISTS idx_exchange_rates_last_updated;

-- Drop table
DROP TABLE IF EXISTS public.exchange_rates CASCADE;


-- =====================================================
-- 2️⃣ EXTENSIONS
-- =====================================================

-- ✅ pgcrypto provides gen_random_uuid()
CREATE EXTENSION IF NOT EXISTS "pgcrypto";


-- =====================================================
-- 3️⃣ CREATE TABLE
-- =====================================================

CREATE TABLE public.exchange_rates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- ISO 4217 currency code (3 uppercase letters)
  currency_code TEXT NOT NULL CHECK (currency_code ~ '^[A-Z]{3}$'),
  
  -- Exchange rate with 6 decimal precision
  rate_from_usd NUMERIC(18, 6) NOT NULL CHECK (rate_from_usd > 0),
  
  -- Timestamps
  last_updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Constraints
  CONSTRAINT currency_code_unique UNIQUE (currency_code),
  CONSTRAINT rate_from_usd_positive CHECK (rate_from_usd > 0),
  CONSTRAINT currency_code_format CHECK (currency_code ~ '^[A-Z]{3}$')
);

-- Comments
COMMENT ON TABLE public.exchange_rates IS 'أسعار صرف العملات محدثة تلقائياً كل ساعة عبر Cron Job';
COMMENT ON COLUMN public.exchange_rates.id IS 'Unique identifier for the rate record';
COMMENT ON COLUMN public.exchange_rates.currency_code IS 'رمز العملة (ISO 4217) مثل USD, SAR, EGP';
COMMENT ON COLUMN public.exchange_rates.rate_from_usd IS 'سعر الصرف مقابل الدولار الأمريكي (1 USD = X currency)';
COMMENT ON COLUMN public.exchange_rates.last_updated_at IS 'آخر مرة تم فيها تحديث سعر الصرف';
COMMENT ON COLUMN public.exchange_rates.created_at IS 'تاريخ إنشاء سجل سعر الصرف';


-- =====================================================
-- 4️⃣ INDEXES
-- =====================================================

CREATE INDEX idx_exchange_rates_currency_code ON public.exchange_rates(currency_code);
CREATE INDEX idx_exchange_rates_last_updated ON public.exchange_rates(last_updated_at DESC);
CREATE INDEX idx_exchange_rates_currency_updated ON public.exchange_rates(currency_code, last_updated_at DESC);

COMMENT ON INDEX idx_exchange_rates_currency_code IS 'Fast lookup by currency code';
COMMENT ON INDEX idx_exchange_rates_last_updated IS 'Sort/filter by update time';
COMMENT ON INDEX idx_exchange_rates_currency_updated IS 'Composite index for currency + freshness queries';


-- =====================================================
-- 5️⃣ ROW LEVEL SECURITY (RLS)
-- =====================================================

ALTER TABLE public.exchange_rates ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- Policy 1: Public read access (everyone can view rates)
-- =====================================================
DROP POLICY IF EXISTS "exchange_rates_public_read" ON public.exchange_rates;
CREATE POLICY "exchange_rates_public_read"
  ON public.exchange_rates FOR SELECT
  TO authenticated, anon
  USING (true);

COMMENT ON POLICY "exchange_rates_public_read" ON public.exchange_rates 
  IS 'Allow public read access to exchange rates';

-- =====================================================
-- Policy 2: Service role write access (Cron Job only)
-- =====================================================
DROP POLICY IF EXISTS "exchange_rates_service_write" ON public.exchange_rates;
CREATE POLICY "exchange_rates_service_write"
  ON public.exchange_rates FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

COMMENT ON POLICY "exchange_rates_service_write" ON public.exchange_rates 
  IS 'Allow service role (Cron Job) full access to update rates';


-- =====================================================
-- 6️⃣ HELPER FUNCTION (Secure & Robust)
-- =====================================================

CREATE OR REPLACE FUNCTION public.get_exchange_rate(target_currency TEXT)
RETURNS NUMERIC(18, 6) AS $$
DECLARE
  v_rate NUMERIC(18, 6);
BEGIN
  -- Input validation
  IF target_currency !~ '^[A-Z]{3}$' THEN
    RAISE EXCEPTION 'Invalid currency code format: %', target_currency;
  END IF;

  SELECT rate_from_usd INTO v_rate
  FROM public.exchange_rates
  WHERE currency_code = target_currency
    AND last_updated_at > NOW() - INTERVAL '24 hours'  -- Only use recent rates
  LIMIT 1;

  -- Return NULL if not found or stale
  RETURN v_rate;
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public;

COMMENT ON FUNCTION public.get_exchange_rate IS 'جلب سعر صرف عملة معينة (يعيد NULL إذا لم يوجد أو قديم)';


-- =====================================================
-- 7️⃣ SUMMARY VIEW (With Enhanced Status Logic)
-- =====================================================

CREATE OR REPLACE VIEW public.exchange_rates_summary AS
SELECT
  currency_code,
  rate_from_usd,
  last_updated_at,
  created_at,
  -- Enhanced status logic with time buckets
  CASE
    WHEN last_updated_at > NOW() - INTERVAL '30 minutes' THEN 'current'
    WHEN last_updated_at > NOW() - INTERVAL '2 hours' THEN 'recent'
    WHEN last_updated_at > NOW() - INTERVAL '24 hours' THEN 'stale'
    ELSE 'expired'
  END AS status,
  -- Minutes since last update (for debugging)
  ROUND(EXTRACT(EPOCH FROM (NOW() - last_updated_at)) / 60) AS minutes_ago
FROM public.exchange_rates
ORDER BY currency_code;

COMMENT ON VIEW public.exchange_rates_summary IS 'عرض مبسط لأسعار العملات مع حالة التحديث ووقت آخر تحديث';

-- Grant read access to the view
GRANT SELECT ON public.exchange_rates_summary TO authenticated, anon;


-- =====================================================
-- 8️⃣ UPSERT FUNCTION (For Cron Job Updates)
-- =====================================================

CREATE OR REPLACE FUNCTION public.upsert_exchange_rate(
  p_currency_code TEXT,
  p_rate_from_usd NUMERIC(18, 6),
  p_updated_at TIMESTAMPTZ DEFAULT NOW()
)
RETURNS VOID AS $$
BEGIN
  -- Input validation
  IF p_currency_code !~ '^[A-Z]{3}$' THEN
    RAISE EXCEPTION 'Invalid currency code: %', p_currency_code;
  END IF;
  
  IF p_rate_from_usd <= 0 THEN
    RAISE EXCEPTION 'Rate must be positive: %', p_rate_from_usd;
  END IF;

  -- Upsert: insert or update existing rate
  INSERT INTO public.exchange_rates (currency_code, rate_from_usd, last_updated_at)
  VALUES (p_currency_code, p_rate_from_usd, p_updated_at)
  ON CONFLICT (currency_code) DO UPDATE
  SET 
    rate_from_usd = EXCLUDED.rate_from_usd,
    last_updated_at = EXCLUDED.last_updated_at
  WHERE 
    -- Only update if new rate is more recent
    exchange_rates.last_updated_at < EXCLUDED.last_updated_at;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

COMMENT ON FUNCTION public.upsert_exchange_rate IS 'تحديث أو إضافة سعر صرف (للاستخدام عبر Cron Job)';


-- =====================================================
-- 9️⃣ SAMPLE DATA (Commented - For Testing Only)
-- =====================================================

/*
-- اختبار البيانات (أزل التعليق للتجربة)
INSERT INTO public.exchange_rates (currency_code, rate_from_usd, last_updated_at) VALUES
  ('USD', 1.000000, NOW()),
  ('SAR', 3.750000, NOW()),
 