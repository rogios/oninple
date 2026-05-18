-- ============================================================
-- channels 테이블에 is_verified 컬럼 추가
-- ============================================================
ALTER TABLE channels
  ADD COLUMN IF NOT EXISTS is_verified BOOLEAN NOT NULL DEFAULT false;

-- 적용 확인
SELECT column_name, data_type, column_default, is_nullable
FROM information_schema.columns
WHERE table_name = 'channels' AND column_name = 'is_verified';
