-- ============================================================
-- page_views 테이블에 분석용 컬럼 추가 (없는 것만)
-- ============================================================
ALTER TABLE page_views ADD COLUMN IF NOT EXISTS referrer     TEXT NOT NULL DEFAULT '';
ALTER TABLE page_views ADD COLUMN IF NOT EXISTS page_path    TEXT NOT NULL DEFAULT '';
ALTER TABLE page_views ADD COLUMN IF NOT EXISTS device_type  TEXT NOT NULL DEFAULT 'desktop';

-- ============================================================
-- RLS: SELECT 권한을 관리자 전용으로 변경
-- (기존 "모든 로그인 유저" → "role=admin 유저만")
-- ============================================================
DROP POLICY IF EXISTS "Authenticated users can read page_views" ON page_views;

CREATE POLICY "Admin only can read page_views"
  ON page_views FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
        AND profiles.role = 'admin'
    )
  );

-- ============================================================
-- 확인 쿼리
-- ============================================================
SELECT column_name, data_type, column_default
FROM information_schema.columns
WHERE table_name = 'page_views'
ORDER BY ordinal_position;

SELECT policyname, cmd, roles
FROM pg_policies WHERE tablename = 'page_views';
