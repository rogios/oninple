-- posts 테이블
CREATE TABLE IF NOT EXISTS posts (
  id          UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  title       TEXT         NOT NULL,
  content     TEXT         NOT NULL DEFAULT '',
  thumbnail   TEXT,
  summary     TEXT         NOT NULL DEFAULT '',
  category    TEXT         NOT NULL DEFAULT '',
  slug        TEXT         NOT NULL UNIQUE,
  published   BOOLEAN      NOT NULL DEFAULT false,
  created_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

-- RLS 활성화
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;

-- 공개된 글은 누구나 읽기 가능
CREATE POLICY "Anyone can read published posts"
  ON posts FOR SELECT TO anon, authenticated USING (published = true);
