-- 수수료 시트 연동 마이그레이션
-- Supabase 대시보드 > SQL Editor 에서 실행하세요

-- 1. products 테이블에 수수료 키 컬럼 추가
ALTER TABLE products ADD COLUMN IF NOT EXISTS commission_key TEXT;
ALTER TABLE products ADD COLUMN IF NOT EXISTS commission_channel TEXT DEFAULT '백메가';

-- 2. 수수료 이력 테이블 생성
CREATE TABLE IF NOT EXISTS commission_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  commission_key TEXT NOT NULL,
  channel TEXT NOT NULL,
  brand TEXT NOT NULL,
  item_type TEXT NOT NULL,
  current_commission INTEGER NOT NULL,
  daily_change TEXT DEFAULT '-',
  max_commission INTEGER DEFAULT 0,
  min_commission INTEGER DEFAULT 0,
  history JSONB DEFAULT '{}',
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(commission_key, channel)
);

CREATE INDEX IF NOT EXISTS idx_commission_history_key ON commission_history(commission_key, channel);
CREATE INDEX IF NOT EXISTS idx_commission_history_updated ON commission_history(updated_at);

-- ── 3. 경쟁사 지원금 비교 테이블 ────────────────────────────────────────────
-- 값: 렌트리 지원금 - 경쟁사 지원금 (양수=렌트리 우위, 음수=경쟁사 우위)
CREATE TABLE IF NOT EXISTS survey_comparisons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  monthly_survey_id UUID REFERENCES monthly_surveys(id) ON DELETE CASCADE,
  category TEXT NOT NULL,
  telecom TEXT,
  brand TEXT,
  product_name TEXT NOT NULL,
  competitor_name TEXT NOT NULL,
  easytask_diff INTEGER,
  realcontact_diff INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_survey_comparisons_survey ON survey_comparisons(monthly_survey_id);
CREATE INDEX IF NOT EXISTS idx_survey_comparisons_product ON survey_comparisons(category, product_name);
