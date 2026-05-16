-- ============================================================
-- 1. profiles 테이블에 created_at 컬럼 추가 (없으면)
-- ============================================================
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW();

-- ============================================================
-- 2. channels 테이블에 created_at 컬럼 추가 (없으면)
-- ============================================================
ALTER TABLE channels ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW();

-- ============================================================
-- 3. campingnlbo@gmail.com 계정을 admin으로 설정
-- ============================================================
UPDATE profiles
SET role = 'admin', role_selected = true
WHERE email = 'campingnlbo@gmail.com';

-- 적용 확인
SELECT id, email, role, role_selected FROM profiles WHERE email = 'campingnlbo@gmail.com';

-- ============================================================
-- 4. page_views 테이블 생성
-- ============================================================
CREATE TABLE IF NOT EXISTS page_views (
  id        BIGSERIAL    PRIMARY KEY,
  page      TEXT         NOT NULL DEFAULT '/',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- RLS 활성화
ALTER TABLE page_views ENABLE ROW LEVEL SECURITY;

-- 비로그인 포함 누구나 INSERT 가능 (방문자 추적)
CREATE POLICY "Anyone can insert page views"
  ON page_views FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- 로그인 유저만 SELECT 가능
CREATE POLICY "Authenticated users can read page_views"
  ON page_views FOR SELECT
  TO authenticated
  USING (true);
