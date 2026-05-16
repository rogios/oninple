-- ============================================================
-- notices 테이블 생성
-- ============================================================
CREATE TABLE IF NOT EXISTS notices (
  id         BIGSERIAL    PRIMARY KEY,
  title      TEXT         NOT NULL,
  content    TEXT         NOT NULL,
  is_pinned  BOOLEAN      NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

-- RLS 활성화
ALTER TABLE notices ENABLE ROW LEVEL SECURITY;

-- 누구나 읽기 가능 (공개 공지사항)
CREATE POLICY "Anyone can read notices"
  ON notices FOR SELECT
  TO anon, authenticated
  USING (true);

-- INSERT / UPDATE / DELETE 는 service_role 키(서버 액션)에서만 수행
-- (anon / authenticated 에게 별도 정책 없음 → 서버 액션이 service client 사용)
