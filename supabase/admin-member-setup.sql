-- ============================================================
-- profiles 테이블에 warning_count 컬럼 추가
-- ============================================================
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS warning_count INT NOT NULL DEFAULT 0;

-- 적용 확인
SELECT id, email, role, warning_count FROM profiles LIMIT 5;
